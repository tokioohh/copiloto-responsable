import { LocationData } from '../types/sensor';
import { TRIP_DETECTION } from '../utils/constants';
import { locationService } from './locationService';

/**
 * Automatic trip start/end detection based on GPS speed
 * Sprint 2 implementation
 */

type TripState = 'idle' | 'starting' | 'active' | 'ending';

interface DetectorState {
  state: TripState;
  highSpeedCounter: number; // seconds at high speed
  lowSpeedCounter: number; // seconds at low speed
  lastLocation: LocationData | null;
}

export type TripCallback = () => void;

export const tripDetector = {
  state: {
    state: 'idle' as TripState,
    highSpeedCounter: 0,
    lowSpeedCounter: 0,
    lastLocation: null,
  } as DetectorState,

  onTripStart: null as TripCallback | null,
  onTripEnd: null as TripCallback | null,

  /**
   * Initialize trip detector with callbacks
   */
  initialize: (onTripStart: TripCallback, onTripEnd: TripCallback) => {
    tripDetector.onTripStart = onTripStart;
    tripDetector.onTripEnd = onTripEnd;
  },

  /**
   * Process GPS location update
   * TODO Sprint 2: Implement state machine for trip detection
   */
  processLocation: (location: LocationData) => {
    // TODO: Convert speed from m/s to km/h if needed
    // TODO: Implement state machine:
    // - idle -> starting: speed > START_SPEED for START_DURATION seconds
    // - starting -> active: threshold reached, fire onTripStart
    // - active -> ending: speed < END_SPEED for END_DURATION seconds
    // - ending -> idle: threshold reached, fire onTripEnd
    // TODO: Update highSpeedCounter and lowSpeedCounter
    // TODO: Store lastLocation for distance calculation

    const speedKmh = location.speed
      ? locationService.msToKmh(location.speed)
      : 0;

    console.log(
      `[TripDetector] Location update: ${speedKmh.toFixed(1)} km/h - TODO Sprint 2`
    );
  },

  /**
   * Reset detector state
   */
  reset: () => {
    tripDetector.state = {
      state: 'idle',
      highSpeedCounter: 0,
      lowSpeedCounter: 0,
      lastLocation: null,
    };
  },

  /**
   * Get current detector state
   */
  getState: (): DetectorState => {
    return { ...tripDetector.state };
  },
};
