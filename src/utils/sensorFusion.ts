import { AccelerometerData, GyroscopeData, LocationData } from '../types/sensor';
import { DrivingEvent, DrivingEventType } from '../types/trip';
import { EVENT_THRESHOLDS, SPEED_LIMITS } from './constants';
import { locationService } from '../services/locationService';

/**
 * Sensor fusion algorithms for event detection
 */

export interface EventDetectionResult {
  event: DrivingEvent | null;
  shouldRecord: boolean;
}

/**
 * Calculate total g-force magnitude from accelerometer
 */
export const calculateGForce = (accel: AccelerometerData): number => {
  return Math.sqrt(accel.x ** 2 + accel.y ** 2 + accel.z ** 2);
};

/**
 * Calculate gyroscope rotation rate magnitude (rad/s)
 */
export const calculateRotationRate = (gyro: GyroscopeData): number => {
  return Math.sqrt(gyro.x ** 2 + gyro.y ** 2 + gyro.z ** 2);
};

/**
 * Check if phone is stable (e.g. mounted, not being handheld or dropped)
 */
export const isPhoneStable = (gyro: GyroscopeData): boolean => {
  const rotationRate = calculateRotationRate(gyro);
  return rotationRate <= EVENT_THRESHOLDS.PHONE_STABLE_THRESHOLD;
};

/**
 * Detect harsh braking using multi-signal validation
 * 1. Accelerometer indicates deceleration magnitude >= 0.35g
 * 2. GPS confirms vehicle was moving >= 20 km/h
 * 3. Gyroscope confirms phone is mounted/stable (< 0.2 rad/s)
 */
export const detectHarshBraking = (
  accel: AccelerometerData,
  gyro: GyroscopeData,
  location: LocationData
): EventDetectionResult => {
  const speedKmh = location.speed ? locationService.msToKmh(location.speed) : 0;
  if (speedKmh < EVENT_THRESHOLDS.MIN_SPEED_FOR_EVENT) {
    return { event: null, shouldRecord: false };
  }

  // Dynamic g-force above gravity or directional deceleration
  const totalG = calculateGForce(accel);
  const dynamicG = Math.abs(totalG - 1.0);
  const isDecel = accel.y <= EVENT_THRESHOLDS.HARSH_BRAKE_G || dynamicG >= 0.35;

  // Phone should be relatively stable (not wildly rotating / tumbling)
  const rotationRate = calculateRotationRate(gyro);
  const stable = rotationRate < 0.3;

  if (isDecel && stable) {
    // Severity from 0 (at threshold 0.35g) to 1.0 (at 0.85g)
    const effectiveG = Math.max(Math.abs(accel.y), dynamicG);
    const severity = Math.min(1, Math.max(0, (effectiveG - 0.35) / 0.5));

    const event: DrivingEvent = {
      type: 'harsh_brake',
      timestamp: accel.timestamp || Date.now(),
      severity: Number(severity.toFixed(2)),
      location: {
        lat: location.latitude,
        lng: location.longitude,
      },
      metadata: {
        gForce: Number(effectiveG.toFixed(2)),
        speed: Number(speedKmh.toFixed(1)),
      },
    };

    return { event, shouldRecord: true };
  }

  return { event: null, shouldRecord: false };
};

/**
 * Detect harsh acceleration
 * 1. Accelerometer indicates acceleration magnitude >= 0.35g
 * 2. GPS confirms vehicle speed >= 20 km/h
 * 3. Gyroscope confirms stability
 */
export const detectHarshAcceleration = (
  accel: AccelerometerData,
  gyro: GyroscopeData,
  location: LocationData
): EventDetectionResult => {
  const speedKmh = location.speed ? locationService.msToKmh(location.speed) : 0;
  if (speedKmh < EVENT_THRESHOLDS.MIN_SPEED_FOR_EVENT) {
    return { event: null, shouldRecord: false };
  }

  const totalG = calculateGForce(accel);
  const dynamicG = Math.abs(totalG - 1.0);
  const isAccel = accel.y >= EVENT_THRESHOLDS.HARSH_ACCEL_G || dynamicG >= 0.35;

  const rotationRate = calculateRotationRate(gyro);
  const stable = rotationRate < 0.3;

  if (isAccel && stable) {
    const effectiveG = Math.max(Math.abs(accel.y), dynamicG);
    const severity = Math.min(1, Math.max(0, (effectiveG - 0.35) / 0.5));

    const event: DrivingEvent = {
      type: 'harsh_accel',
      timestamp: accel.timestamp || Date.now(),
      severity: Number(severity.toFixed(2)),
      location: {
        lat: location.latitude,
        lng: location.longitude,
      },
      metadata: {
        gForce: Number(effectiveG.toFixed(2)),
        speed: Number(speedKmh.toFixed(1)),
      },
    };

    return { event, shouldRecord: true };
  }

  return { event: null, shouldRecord: false };
};

/**
 * Detect sharp turn using gyroscope
 * 1. Rotation rate >= 0.8 rad/s
 * 2. Vehicle speed >= 20 km/h
 */
export const detectSharpTurn = (
  gyro: GyroscopeData,
  location: LocationData
): EventDetectionResult => {
  const speedKmh = location.speed ? locationService.msToKmh(location.speed) : 0;
  if (speedKmh < EVENT_THRESHOLDS.MIN_SPEED_FOR_EVENT) {
    return { event: null, shouldRecord: false };
  }

  const rotationRate = calculateRotationRate(gyro);
  if (rotationRate >= EVENT_THRESHOLDS.SHARP_TURN_GYRO) {
    // Severity from 0 (at 0.8 rad/s) to 1.0 (at 2.0 rad/s)
    const severity = Math.min(
      1,
      Math.max(0, (rotationRate - EVENT_THRESHOLDS.SHARP_TURN_GYRO) / 1.2)
    );

    const event: DrivingEvent = {
      type: 'sharp_turn',
      timestamp: gyro.timestamp || Date.now(),
      severity: Number(severity.toFixed(2)),
      location: {
        lat: location.latitude,
        lng: location.longitude,
      },
      metadata: {
        angle: Number(rotationRate.toFixed(2)),
        speed: Number(speedKmh.toFixed(1)),
      },
    };

    return { event, shouldRecord: true };
  }

  return { event: null, shouldRecord: false };
};

/**
 * Detect speeding based on GPS speed vs speed limit + margin
 */
export const detectSpeeding = (
  location: LocationData,
  speedLimit: number = SPEED_LIMITS.DEFAULT
): EventDetectionResult => {
  const speedKmh = location.speed ? locationService.msToKmh(location.speed) : 0;
  const threshold = speedLimit + SPEEDING_MARGIN;

  if (speedKmh > threshold) {
    const excess = speedKmh - threshold;
    const severity = Math.min(1, Math.max(0, excess / 30));

    const event: DrivingEvent = {
      type: 'speeding',
      timestamp: location.timestamp || Date.now(),
      severity: Number(severity.toFixed(2)),
      location: {
        lat: location.latitude,
        lng: location.longitude,
      },
      metadata: {
        speed: Number(speedKmh.toFixed(1)),
      },
    };

    return { event, shouldRecord: true };
  }

  return { event: null, shouldRecord: false };
};

const SPEEDING_MARGIN = SPEED_LIMITS.SPEEDING_MARGIN;
