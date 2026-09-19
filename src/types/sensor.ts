export interface AccelerometerData {
  x: number;
  y: number;
  z: number;
  timestamp: number;
}

export interface GyroscopeData {
  x: number;
  y: number;
  z: number;
  timestamp: number;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  altitude: number | null;
  accuracy: number | null;
  speed: number | null; // m/s
  heading: number | null;
  timestamp: number;
}

export interface SensorReading {
  accelerometer: AccelerometerData | null;
  gyroscope: GyroscopeData | null;
  location: LocationData | null;
  timestamp: number;
}
