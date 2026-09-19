import * as Location from 'expo-location';
import { LocationData } from '../types/sensor';
import { SAMPLING_RATES, TRIP_DETECTION } from '../utils/constants';

/**
 * Service for GPS location tracking
 * Sprint 2 implementation
 */

export interface LocationSubscription {
  unsubscribe: () => void;
}

export const locationService = {
  /**
   * Request location permissions
   */
  requestPermissions: async (): Promise<boolean> => {
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();

    if (foregroundStatus !== 'granted') {
      return false;
    }

    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    return backgroundStatus === 'granted';
  },

  /**
   * Check current permission status
   */
  checkPermissions: async (): Promise<{
    foreground: boolean;
    background: boolean;
  }> => {
    const foreground = await Location.getForegroundPermissionsAsync();
    const background = await Location.getBackgroundPermissionsAsync();

    return {
      foreground: foreground.status === 'granted',
      background: background.status === 'granted',
    };
  },

  /**
   * Start GPS tracking
   * TODO Sprint 2: Implement continuous location tracking with background support
   */
  startTracking: (callback: (data: LocationData) => void): LocationSubscription => {
    // TODO: Use Location.watchPositionAsync with settings:
    // - accuracy: Location.Accuracy.BestForNavigation
    // - timeInterval: SAMPLING_RATES.GPS
    // - distanceInterval: 5 (meters)
    // TODO: Transform Location.LocationObject to LocationData
    // TODO: Convert speed from m/s if needed
    // TODO: Check accuracy against GPS_ACCURACY_THRESHOLD

    console.log('[LocationService] GPS tracking start - TODO Sprint 2');
    return {
      unsubscribe: () => {
        console.log('[LocationService] GPS tracking stop');
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

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        altitude: location.coords.altitude,
        accuracy: location.coords.accuracy,
        speed: location.coords.speed,
        heading: location.coords.heading,
        timestamp: location.timestamp,
      };
    } catch (error) {
      console.error('[LocationService] Error getting current location:', error);
      return null;
    }
  },

  /**
   * Calculate distance between two points (Haversine formula)
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
