import { Accelerometer, Gyroscope } from 'expo-sensors';
import { AccelerometerData, GyroscopeData } from '../types/sensor';
import { SAMPLING_RATES } from '../utils/constants';

/**
 * Service for managing accelerometer and gyroscope sensors
 * Supports adaptive sampling (5Hz active / 2Hz relaxed)
 */

export interface SensorSubscription {
  unsubscribe: () => void;
}

// Track active subscriptions internally to allow dynamic sampling rate adjustments
let activeAccelSubscription: { remove: () => void } | null = null;
let activeGyroSubscription: { remove: () => void } | null = null;
let currentSamplingRate: number = SAMPLING_RATES.ACCELEROMETER;

export const sensorService = {
  /**
   * Start accelerometer monitoring
   */
  startAccelerometer: (
    callback: (data: AccelerometerData) => void
  ): SensorSubscription => {
    Accelerometer.setUpdateInterval(currentSamplingRate);

    const subscription = Accelerometer.addListener((data) => {
      callback({
        x: data.x,
        y: data.y,
        z: data.z,
        timestamp: Date.now(),
      });
    });

    activeAccelSubscription = subscription;

    return {
      unsubscribe: () => {
        if (activeAccelSubscription === subscription) {
          activeAccelSubscription = null;
        }
        subscription.remove();
      },
    };
  },

  /**
   * Start gyroscope monitoring
   */
  startGyroscope: (callback: (data: GyroscopeData) => void): SensorSubscription => {
    Gyroscope.setUpdateInterval(currentSamplingRate);

    const subscription = Gyroscope.addListener((data) => {
      callback({
        x: data.x,
        y: data.y,
        z: data.z,
        timestamp: Date.now(),
      });
    });

    activeGyroSubscription = subscription;

    return {
      unsubscribe: () => {
        if (activeGyroSubscription === subscription) {
          activeGyroSubscription = null;
        }
        subscription.remove();
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
    try {
      const [accelAvailable, gyroAvailable] = await Promise.all([
        Accelerometer.isAvailableAsync(),
        Gyroscope.isAvailableAsync(),
      ]);

      return {
        accelerometer: !!accelAvailable,
        gyroscope: !!gyroAvailable,
      };
    } catch (error) {
      console.warn('[SensorService] Error checking sensor availability:', error);
      return {
        accelerometer: false,
        gyroscope: false,
      };
    }
  },

  /**
   * Adjust sampling rate dynamically (adaptive mode: e.g. 200ms during events, 500ms when calm)
   */
  setSamplingRate: (rateMs: number) => {
    currentSamplingRate = rateMs;
    try {
      Accelerometer.setUpdateInterval(rateMs);
      Gyroscope.setUpdateInterval(rateMs);
    } catch (error) {
      console.warn('[SensorService] Error updating sampling rate:', error);
    }
  },

  /**
   * Stop all active sensor listeners
   */
  stopAll: () => {
    if (activeAccelSubscription) {
      activeAccelSubscription.remove();
      activeAccelSubscription = null;
    }
    if (activeGyroSubscription) {
      activeGyroSubscription.remove();
      activeGyroSubscription = null;
    }
  },

  /**
   * Get current sampling rate in milliseconds
   */
  getCurrentSamplingRate: (): number => {
    return currentSamplingRate;
  },
};
