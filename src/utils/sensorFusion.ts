import { AccelerometerData, GyroscopeData, LocationData } from '../types/sensor';
import { DrivingEvent, GeoPoint } from '../types/trip';
import { EVENT_THRESHOLDS } from './constants';

/**
 * Sensor fusion algorithms for event detection
 * Sprint 3 implementation
 */

export interface EventDetectionResult {
  event: DrivingEvent | null;
  shouldRecord: boolean;
}

/**
 * Detect harsh braking using multi-signal validation
 * TODO Sprint 3: Implement 4-condition validation
 */
export const detectHarshBraking = (
  accel: AccelerometerData,
  gyro: GyroscopeData,
  location: LocationData
): EventDetectionResult => {
  // TODO: Implement multi-signal validation:
  // 1. Accelerometer: magnitude indicates deceleration (< -0.35g)
  // 2. GPS: confirms vehicle was moving (> 20 km/h)
  // 3. Gyroscope: confirms phone is stable (< 0.1 rad/s)
  // 4. Direction check: force vector is horizontal, not vertical

  // TODO: Calculate severity (0-1) based on g-force magnitude
  // TODO: Return DrivingEvent with type 'harsh_brake'

  console.log('[SensorFusion] Harsh braking detection - TODO Sprint 3');
  return { event: null, shouldRecord: false };
};

/**
 * Detect harsh acceleration
 * TODO Sprint 3: Similar to harsh braking but positive g-force
 */
export const detectHarshAcceleration = (
  accel: AccelerometerData,
  gyro: GyroscopeData,
  location: LocationData
): EventDetectionResult => {
  // TODO: Similar logic to harsh braking but checking positive acceleration
  console.log('[SensorFusion] Harsh acceleration detection - TODO Sprint 3');
  return { event: null, shouldRecord: false };
};

/**
 * Detect sharp turn using gyroscope
 * TODO Sprint 3: Implement gyroscope-based turn detection
 */
export const detectSharpTurn = (
  gyro: GyroscopeData,
  location: LocationData
): EventDetectionResult => {
  // TODO: Check gyroscope rotation rate against SHARP_TURN_GYRO threshold
  // TODO: Validate minimum speed for event
  // TODO: Calculate turn angle/severity
  console.log('[SensorFusion] Sharp turn detection - TODO Sprint 3');
  return { event: null, shouldRecord: false };
};

/**
 * Detect speeding based on GPS speed vs limit
 * TODO Sprint 3: Track continuous speeding duration
 */
export const detectSpeeding = (
  location: LocationData,
  speedLimit: number
): EventDetectionResult => {
  // TODO: Compare GPS speed against speedLimit + SPEEDING_MARGIN
  // TODO: Track duration of continuous speeding
  console.log('[SensorFusion] Speeding detection - TODO Sprint 3');
  return { event: null, shouldRecord: false };
};

/**
 * Calculate g-force magnitude from accelerometer
 */
export const calculateGForce = (accel: AccelerometerData): number => {
  return Math.sqrt(accel.x ** 2 + accel.y ** 2 + accel.z ** 2);
};

/**
 * Calculate gyroscope magnitude (rotation rate)
 */
export const calculateRotationRate = (gyro: GyroscopeData): number => {
  return Math.sqrt(gyro.x ** 2 + gyro.y ** 2 + gyro.z ** 2);
};

/**
 * Check if phone is stable (not being handled)
 */
export const isPhoneStable = (gyro: GyroscopeData): boolean => {
  const rotationRate = calculateRotationRate(gyro);
  return rotationRate < EVENT_THRESHOLDS.PHONE_STABLE_THRESHOLD;
};
