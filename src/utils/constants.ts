// Trip Detection Thresholds
export const TRIP_DETECTION = {
  START_SPEED: 15, // km/h
  START_DURATION: 10, // consecutive seconds
  END_SPEED: 5, // km/h
  END_DURATION: 60, // consecutive seconds
  MIN_TRIP_DISTANCE: 0.5, // km (discard micro-trips)
  GPS_ACCURACY_THRESHOLD: 20, // meters
} as const;

// Sensor Sampling Rates
export const SAMPLING_RATES = {
  ACCELEROMETER: 200, // ms (5 Hz)
  GYROSCOPE: 200, // ms (5 Hz)
  GPS: 1000, // ms (1 Hz)
  ADAPTIVE_SLOW: 500, // ms (2 Hz) - used after 60s with no events
} as const;

// Event Detection Thresholds
export const EVENT_THRESHOLDS = {
  HARSH_BRAKE_G: -0.35, // g-force threshold for harsh braking
  HARSH_ACCEL_G: 0.35, // g-force threshold for harsh acceleration
  SHARP_TURN_GYRO: 0.8, // rad/s threshold for sharp turn
  PHONE_STABLE_THRESHOLD: 0.1, // rad/s - phone is stable (not being handled)
  MIN_SPEED_FOR_EVENT: 20, // km/h - minimum speed to register driving events
} as const;

// Speed Limits
export const SPEED_LIMITS = {
  DEFAULT: 80, // km/h - urban default
  SPEEDING_MARGIN: 10, // km/h over limit to trigger event
} as const;

// Score Weights
export const SCORE_WEIGHTS = {
  BRAKING_MAX: 30,
  BRAKING_PENALTY: 5,
  ACCELERATION_MAX: 25,
  ACCELERATION_PENALTY: 5,
  SPEED_MAX: 20,
  SPEED_PENALTY_PER_MINUTE: 2,
  TURNING_MAX: 15,
  TURNING_PENALTY: 3,
  PHONE_MAX: 10,
  PHONE_PENALTY: 2,
} as const;

// Processing
export const PROCESSING = {
  VERSION: '1.0.0',
  EVENT_BUFFER_SIZE: 100,
  ROUTE_BUFFER_SIZE: 1000,
} as const;
