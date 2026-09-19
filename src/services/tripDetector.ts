import { LocationData } from '../types/sensor';
import { TRIP_DETECTION } from '../utils/constants';
import { locationService } from './locationService';

/**
 * Automatic trip start/end detection based on GPS speed
 * 4-state state machine: idle -> starting -> active -> ending
 */

export type TripState = 'idle' | 'starting' | 'active' | 'ending';

export interface DetectorState {
  state: TripState;
  highSpeedCounter: number; // seconds at high speed
  lowSpeedCounter: number; // seconds at low speed
  lastLocation: LocationData | null;
  lastTimestamp: number | null;
}

export type TripCallback = () => void;
export type StateChangeCallback = (state: DetectorState) => void;

export const tripDetector = {
  state: {
    state: 'idle',
    highSpeedCounter: 0,
    lowSpeedCounter: 0,
    lastLocation: null,
    lastTimestamp: null,
  } as DetectorState,

  onTripStart: null as TripCallback | null,
  onTripEnd: null as TripCallback | null,
  stateListeners: new Set<StateChangeCallback>(),

  /**
   * Initialize trip detector with lifecycle callbacks
   */
  initialize: (onTripStart: TripCallback, onTripEnd: TripCallback) => {
    tripDetector.onTripStart = onTripStart;
    tripDetector.onTripEnd = onTripEnd;
  },

  /**
   * Subscribe to detector state changes (for UI countdowns and badges)
   */
  subscribeStateChange: (listener: StateChangeCallback): (() => void) => {
    tripDetector.stateListeners.add(listener);
    // Send immediate initial state
    listener({ ...tripDetector.state });
    return () => {
      tripDetector.stateListeners.delete(listener);
    };
  },

  notifyListeners: () => {
    const snapshot = { ...tripDetector.state };
    tripDetector.stateListeners.forEach((listener) => {
      try {
        listener(snapshot);
      } catch (err) {
        console.error('[TripDetector] Error in state listener:', err);
      }
    });
  },

  /**
   * Process GPS location update through the state machine
   */
  processLocation: (location: LocationData) => {
    const speedKmh = location.speed
      ? locationService.msToKmh(location.speed)
      : 0;

    const prevTimestamp = tripDetector.state.lastTimestamp;
    const currentTimestamp = location.timestamp || Date.now();

    // Calculate elapsed time in seconds since previous reading
    let dt = 1;
    if (prevTimestamp) {
      const diffSec = Math.round((currentTimestamp - prevTimestamp) / 1000);
      if (diffSec > 0 && diffSec < 10) {
        dt = diffSec;
      }
    }

    tripDetector.state.lastTimestamp = currentTimestamp;
    const previousLocation = tripDetector.state.lastLocation;
    tripDetector.state.lastLocation = location;

    switch (tripDetector.state.state) {
      case 'idle': {
        if (speedKmh >= TRIP_DETECTION.START_SPEED) {
          tripDetector.state.state = 'starting';
          tripDetector.state.highSpeedCounter = dt;
          tripDetector.notifyListeners();
        }
        break;
      }

      case 'starting': {
        if (speedKmh >= TRIP_DETECTION.START_SPEED) {
          tripDetector.state.highSpeedCounter += dt;
          if (
            tripDetector.state.highSpeedCounter >= TRIP_DETECTION.START_DURATION
          ) {
            // Vehicle maintained speed threshold: Trip Started!
            tripDetector.state.state = 'active';
            tripDetector.state.highSpeedCounter = 0;
            tripDetector.state.lowSpeedCounter = 0;
            tripDetector.notifyListeners();
            if (tripDetector.onTripStart) {
              tripDetector.onTripStart();
            }
          } else {
            tripDetector.notifyListeners();
          }
        } else {
          // Speed dropped before 10s: false alarm, back to idle
          tripDetector.state.state = 'idle';
          tripDetector.state.highSpeedCounter = 0;
          tripDetector.notifyListeners();
        }
        break;
      }

      case 'active': {
        if (speedKmh < TRIP_DETECTION.END_SPEED) {
          // Vehicle came to a stop/slowdown: enter ending state
          tripDetector.state.state = 'ending';
          tripDetector.state.lowSpeedCounter = dt;
          tripDetector.notifyListeners();
        }
        break;
      }

      case 'ending': {
        if (speedKmh >= TRIP_DETECTION.END_SPEED) {
          // Vehicle resumed driving: cancel ending, back to active
          tripDetector.state.state = 'active';
          tripDetector.state.lowSpeedCounter = 0;
          tripDetector.notifyListeners();
        } else {
          tripDetector.state.lowSpeedCounter += dt;
          if (
            tripDetector.state.lowSpeedCounter >= TRIP_DETECTION.END_DURATION
          ) {
            // Stationary for 60s: Trip Completed!
            tripDetector.state.state = 'idle';
            tripDetector.state.highSpeedCounter = 0;
            tripDetector.state.lowSpeedCounter = 0;
            tripDetector.notifyListeners();
            if (tripDetector.onTripEnd) {
              tripDetector.onTripEnd();
            }
          } else {
            tripDetector.notifyListeners();
          }
        }
        break;
      }
    }
  },

  /**
   * Manual override: force trip start
   */
  forceStart: () => {
    tripDetector.state.state = 'active';
    tripDetector.state.highSpeedCounter = 0;
    tripDetector.state.lowSpeedCounter = 0;
    tripDetector.notifyListeners();
    if (tripDetector.onTripStart) {
      tripDetector.onTripStart();
    }
  },

  /**
   * Manual override: force trip end
   */
  forceEnd: () => {
    tripDetector.state.state = 'idle';
    tripDetector.state.highSpeedCounter = 0;
    tripDetector.state.lowSpeedCounter = 0;
    tripDetector.notifyListeners();
    if (tripDetector.onTripEnd) {
      tripDetector.onTripEnd();
    }
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
      lastTimestamp: null,
    };
    tripDetector.notifyListeners();
  },

  /**
   * Get current detector state snapshot
   */
  getState: (): DetectorState => {
    return { ...tripDetector.state };
  },
};
