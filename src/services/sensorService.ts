import { Accelerometer, Gyroscope } from 'expo-sensors';
import { AccelerometerData, GyroscopeData } from '../types/sensor';
import { SAMPLING_RATES } from '../utils/constants';

/**
 * Service for managing accelerometer and gyroscope sensors
 * Sprint 2 implementation
 */

export interface SensorSubscription {
  unsubscribe: () => void;
}

export const sensorService = {
  /**
   * Start accelerometer monitoring
   * TODO Sprint 2: Implement accelerometer subscription with adaptive sampling
   */
  startAccelerometer: (
    callback: (data: AccelerometerData) => void
  ): SensorSubscription => {
    // TODO: Set update interval based on SAMPLING_RATES.ACCELEROMETER
    // TODO: Subscribe to accelerometer updates
    // TODO: Transform data to AccelerometerData format
    // TODO: Return subscription object with unsubscribe method

    console.log('[SensorService] Accelerometer start - TODO Sprint 2');
    return {
      unsubscribe: () => {
        console.log('[SensorService] Accelerometer stop');
      },
    };
  },

  /**
   * Start gyroscope monitoring
   * TODO Sprint 2: Implement gyroscope subscription
   */
  startGyroscope: (callback: (data: GyroscopeData) => void): SensorSubscription => {
    // TODO: Set update interval based on SAMPLING_RATES.GYROSCOPE
    // TODO: Subscribe to gyroscope updates
    // TODO: Transform data to GyroscopeData format
    // TODO: Return subscription object with unsubscribe method

    console.log('[SensorService] Gyroscope start - TODO Sprint 2');
    return {
      unsubscribe: () => {
        console.log('[SensorService] Gyroscope stop');
      },
    };
  },

  /**
   * Check if sensors are available on device
   */
  checkAvailability: async (): Promise<{
    accelerometer: boolean;
    gyroscope: boolean;
  }> => {
    const [accelAvailable, gyroAvailable] = await Promise.all([
      Accelerometer.isAvailableAsync(),
      Gyroscope.isAvailableAsync(),
    ]);

    return {
      accelerometer: accelAvailable,
      gyroscope: gyroAvailable,
    };
  },

  /**
   * Adjust sampling rate (adaptive mode)
   * TODO Sprint 2: Implement adaptive sampling rate adjustment
   */
  setSamplingRate: (rateMs: number) => {
    // TODO: Update Accelerometer.setUpdateInterval
    // TODO: Update Gyroscope.setUpdateInterval
    console.log(`[SensorService] Set sampling rate: ${rateMs}ms - TODO Sprint 2`);
  },
};
