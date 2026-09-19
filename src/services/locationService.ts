import * as Location from 'expo-location';
import { LocationData } from '../types/sensor';
import { SAMPLING_RATES, TRIP_DETECTION } from '../utils/constants';

/**
 * Service for GPS location tracking
 */

export interface LocationSubscription {
  unsubscribe: () => void;
}

export const locationService = {
  /**
   * Request location permissions (foreground and optional background)
   */
  requestPermissions: async (): Promise<boolean> => {
    try {
      const { status: foregroundStatus } =
        await Location.requestForegroundPermissionsAsync();

      if (foregroundStatus !== 'granted') {
        return false;
      }

      // In development / Expo Go, background permissions may fail or not be supported.
      // We attempt it safely without blocking foreground tracking.
      try {
        await Location.requestBackgroundPermissionsAsync();
      } catch (e) {
        console.log(
          '[LocationService] Background permission skipped or not supported in this environment'
        );
      }

      return true;
    } catch (error) {
      console.error('[LocationService] Error requesting permissions:', error);
      return false;
    }
  },

  /**
   * Check current permission status
   */
  checkPermissions: async (): Promise<{
    foreground: boolean;
    background: boolean;
  }> => {
    try {
      const foreground = await Location.getForegroundPermissionsAsync();
      let backgroundGranted = false;

      try {
        const background = await Location.getBackgroundPermissionsAsync();
        backgroundGranted = background.status === 'granted';
      } catch {
        backgroundGranted = false;
      }

      return {
        foreground: foreground.status === 'granted',
        background: backgroundGranted,
      };
    } catch (error) {
      console.error('[LocationService] Error checking permissions:', error);
      return { foreground: false, background: false };
    }
  },

  /**
   * Start GPS tracking
   */
  startTracking: (
    callback: (data: LocationData) => void
  ): LocationSubscription => {
    let isCancelled = false;
    let locationSubscription: { remove: () => void } | null = null;

    Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: SAMPLING_RATES.GPS,
        distanceInterval: 0, // 0 allows stationary updates
      },
      (location) => {
        if (isCancelled) return;

        // Discard points with accuracy worse than threshold if accuracy is reported
        if (
          location.coords.accuracy != null &&
          location.coords.accuracy > TRIP_DETECTION.GPS_ACCURACY_THRESHOLD
        ) {
          return;
        }

        const rawSpeed = location.coords.speed;
        const normalizedSpeed =
          rawSpeed !== null && rawSpeed >= 0 ? rawSpeed : 0;

        const locationData: LocationData = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          altitude: location.coords.altitude,
          accuracy: location.coords.accuracy,
          speed: normalizedSpeed,
          heading: location.coords.heading,
          timestamp: location.timestamp,
        };

        callback(locationData);
      }
    )
      .then((sub) => {
        if (isCancelled) {
          sub.remove();
        } else {
          locationSubscription = sub;
        }
      })
      .catch((err) => {
        console.error('[LocationService] Failed to watch position:', err);
      });

    return {
      unsubscribe: () => {
        isCancelled = true;
        if (locationSubscription) {
          locationSubscription.remove();
          locationSubscription = null;
        }
      },
    };
  },

  /**
   * Get current location once
   */
  getCurrentLocation: async (): Promise<LocationData | null> => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });

      const rawSpeed = location.coords.speed;
      const normalizedSpeed =
        rawSpeed !== null && rawSpeed >= 0 ? rawSpeed : 0;

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        altitude: location.coords.altitude,
        accuracy: location.coords.accuracy,
        speed: normalizedSpeed,
        heading: location.coords.heading,
        timestamp: location.timestamp,
      };
    } catch (error) {
      console.error('[LocationService] Error getting current location:', error);
      return null;
    }
  },

  /**
   * Calculate distance between two points (Haversine formula in km)
   */
  calculateDistance: (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },

  /**
   * Convert m/s to km/h
   */
  msToKmh: (speedMs: number): number => {
    return speedMs * 3.6;
  },
};
