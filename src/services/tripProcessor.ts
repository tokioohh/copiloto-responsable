import { AccelerometerData, GyroscopeData, LocationData } from '../types/sensor';
import { Trip, ActiveTrip, TripMetrics, RoutePoint, DrivingEvent } from '../types/trip';
import { Timestamp } from 'firebase/firestore';
import { calculateTripScore } from '../utils/scoring';
import { PROCESSING, SPEED_LIMITS } from '../utils/constants';
import * as sensorFusion from '../utils/sensorFusion';

/**
 * Trip processing pipeline: event detection + scoring
 */

// Debounce trackers to avoid re-triggering the same physical event within 2.5s
let lastEventTimestamps: Record<string, number> = {};

export const tripProcessor = {
  /**
   * Process sensor reading during active trip and detect events
   */
  processSensorData: (
    activeTrip: ActiveTrip,
    accel: AccelerometerData | null,
    gyro: GyroscopeData | null,
    location: LocationData | null
  ): ActiveTrip => {
    if (!location) return activeTrip;

    const now = Date.now();
    const newEvents: DrivingEvent[] = [];

    const canTrigger = (type: string, debounceMs: number = 2500) => {
      const last = lastEventTimestamps[type] || 0;
      if (now - last > debounceMs) {
        lastEventTimestamps[type] = now;
        return true;
      }
      return false;
    };

    // 1. Accelerometer & Gyroscope Maneuvers
    if (accel && gyro) {
      // Harsh Brake
      const brakeRes = sensorFusion.detectHarshBraking(accel, gyro, location);
      if (brakeRes.shouldRecord && brakeRes.event && canTrigger('harsh_brake')) {
        newEvents.push(brakeRes.event);
      }

      // Harsh Acceleration
      const accelRes = sensorFusion.detectHarshAcceleration(accel, gyro, location);
      if (accelRes.shouldRecord && accelRes.event && canTrigger('harsh_accel')) {
        newEvents.push(accelRes.event);
      }

      // Sharp Turn
      const turnRes = sensorFusion.detectSharpTurn(gyro, location);
      if (turnRes.shouldRecord && turnRes.event && canTrigger('sharp_turn')) {
        newEvents.push(turnRes.event);
      }
    }

    // 2. Speeding Detection
    const speedRes = sensorFusion.detectSpeeding(location, SPEED_LIMITS.DEFAULT);
    if (speedRes.shouldRecord && speedRes.event && canTrigger('speeding', 5000)) {
      newEvents.push(speedRes.event);
    }

    if (newEvents.length === 0) {
      return activeTrip;
    }

    const updatedEvents = [...activeTrip.eventBuffer, ...newEvents].slice(
      -PROCESSING.EVENT_BUFFER_SIZE
    );

    return {
      ...activeTrip,
      eventBuffer: updatedEvents,
    };
  },

  /**
   * Calculate metrics from event buffer and route buffer
   */
  calculateMetrics: (activeTrip: ActiveTrip): TripMetrics => {
    const events = activeTrip.eventBuffer;
    const route = activeTrip.routeBuffer;

    const harshBrakes = events.filter((e) => e.type === 'harsh_brake').length;
    const harshAccels = events.filter((e) => e.type === 'harsh_accel').length;
    const sharpTurns = events.filter((e) => e.type === 'sharp_turn').length;

    // Speeding duration: count route points where speed exceeded limit (each point ~ 1s)
    let speedingDuration = 0;
    let maxSpeed = 0;
    let speedSum = 0;

    if (route.length > 0) {
      for (const pt of route) {
        if (pt.speed > maxSpeed) {
          maxSpeed = pt.speed;
        }
        speedSum += pt.speed;
        if (pt.speed > SPEED_LIMITS.DEFAULT + SPEED_LIMITS.SPEEDING_MARGIN) {
          speedingDuration += 1;
        }
      }
    }

    // Include any speeding event counts as additional duration estimate if route is sparse
    const speedingEventCount = events.filter((e) => e.type === 'speeding').length;
    speedingDuration = Math.max(speedingDuration, speedingEventCount * 5);

    const averageSpeed =
      route.length > 0 ? Number((speedSum / route.length).toFixed(1)) : 0;

    return {
      harshBrakes,
      harshAccels,
      sharpTurns,
      speedingDuration,
      averageSpeed,
      maxSpeed: Number(maxSpeed.toFixed(1)),
    };
  },

  /**
   * Finalize trip: calculate metrics, compute score, and produce complete Trip entity
   */
  finalizeTrip: (activeTrip: ActiveTrip, userId: string): Trip => {
    const metrics = tripProcessor.calculateMetrics(activeTrip);
    const score = calculateTripScore(metrics);
    const now = Date.now();
    const duration = Math.max(1, Math.floor((now - activeTrip.startTime) / 1000));

    // Reset debounce cache
    lastEventTimestamps = {};

    return {
      id: activeTrip.id,
      userId,
      startTime: Timestamp.fromMillis(activeTrip.startTime),
      endTime: Timestamp.fromMillis(now),
      duration,
      distance: Number(activeTrip.currentDistance.toFixed(2)),
      dismissed: false,
      route: activeTrip.routeBuffer,
      events: activeTrip.eventBuffer,
      metrics,
      score,
      processingVersion: PROCESSING.VERSION,
      syncedAt: Timestamp.now(),
    };
  },
};
