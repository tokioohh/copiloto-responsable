import { useEffect, useRef, useCallback, useState } from 'react';
import { useTripStore } from '../stores/tripStore';
import { useSettingsStore } from '../stores/settingsStore';
import { locationService, LocationSubscription } from '../services/locationService';
import { sensorService, SensorSubscription } from '../services/sensorService';
import { tripDetector, DetectorState } from '../services/tripDetector';
import { tripProcessor } from '../services/tripProcessor';
import { LocationData, AccelerometerData, GyroscopeData } from '../types/sensor';
import { DrivingEventType, DrivingEvent } from '../types/trip';
import { SAMPLING_RATES, TRIP_DETECTION } from '../utils/constants';

/**
 * Main hook for trip tracking, sensor management, continuous simulation, and automatic detection
 */
export function useTripTracking() {
  const activeTrip = useTripStore((state) => state.activeTrip);
  const isTracking = useTripStore((state) => state.isTracking);
  const detectorState = useTripStore((state) => state.detectorState);
  const countdown = useTripStore((state) => state.countdown);
  const currentSpeed = useTripStore((state) => state.currentSpeed);

  const startTrip = useTripStore((state) => state.startTrip);
  const endTrip = useTripStore((state) => state.endTrip);
  const recordEvent = useTripStore((state) => state.recordEvent);
  const setDetectorState = useTripStore((state) => state.setDetectorState);
  const setTracking = useTripStore((state) => state.setTracking);

  const autoDetection = useSettingsStore((state) => state.autoDetection);

  // Simulation state
  const [simulationSpeed, setSimulationSpeed] = useState<number | null>(null);
  const isSimulatingRef = useRef<boolean>(false);

  // Subscriptions & Telemetry references
  const locationSubRef = useRef<LocationSubscription | null>(null);
  const accelSubRef = useRef<SensorSubscription | null>(null);
  const gyroSubRef = useRef<SensorSubscription | null>(null);
  const detectorUnsubRef = useRef<(() => void) | null>(null);
  const simIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const simLatRef = useRef<number>(-34.6037);
  const simLngRef = useRef<number>(-58.3816);

  const lastAccelRef = useRef<AccelerometerData | null>(null);
  const lastGyroRef = useRef<GyroscopeData | null>(null);

  /**
   * Start sensor listeners (accelerometer and gyroscope)
   */
  const startSensors = useCallback(() => {
    if (!accelSubRef.current) {
      accelSubRef.current = sensorService.startAccelerometer((data) => {
        lastAccelRef.current = data;
      });
    }

    if (!gyroSubRef.current) {
      gyroSubRef.current = sensorService.startGyroscope((data) => {
        lastGyroRef.current = data;
      });
    }
  }, []);

  /**
   * Stop sensor listeners
   */
  const stopSensors = useCallback(() => {
    if (accelSubRef.current) {
      accelSubRef.current.unsubscribe();
      accelSubRef.current = null;
    }
    if (gyroSubRef.current) {
      gyroSubRef.current.unsubscribe();
      gyroSubRef.current = null;
    }
  }, []);

  /**
   * Stop the simulation
   */
  const stopSimulation = useCallback(() => {
    isSimulatingRef.current = false;
    if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current);
      simIntervalRef.current = null;
    }
    setSimulationSpeed(null);
  }, []);

  /**
   * Stop all tracking (GPS, sensors, and simulation)
   */
  const stopTracking = useCallback(() => {
    if (locationSubRef.current) {
      locationSubRef.current.unsubscribe();
      locationSubRef.current = null;
    }
    stopSensors();
    stopSimulation();
    tripDetector.reset();
    setTracking(false);
  }, [setTracking, stopSensors, stopSimulation]);

  /**
   * Start real GPS location tracking & automatic detection
   */
  const startTracking = useCallback(async () => {
    const hasPermission = await locationService.requestPermissions();
    if (!hasPermission) {
      console.log('[useTripTracking] Location permission not granted or pending');
      return;
    }

    if (!locationSubRef.current) {
      locationSubRef.current = locationService.startTracking((location: LocationData) => {
        // While simulation is active, ignore real stationary GPS so it doesn't fight the simulation!
        if (isSimulatingRef.current) {
          return;
        }

        tripDetector.processLocation(location);
        useTripStore.getState().updateLocation(location);

        // Process live event detection during active trips
        const currentActive = useTripStore.getState().activeTrip;
        if (currentActive) {
          const updatedActive = tripProcessor.processSensorData(
            currentActive,
            lastAccelRef.current,
            lastGyroRef.current,
            location
          );
          if (updatedActive.eventBuffer.length !== currentActive.eventBuffer.length) {
            useTripStore.setState({ activeTrip: updatedActive });
          }
        }
      });
    }

    setTracking(true);
  }, [setTracking]);

  /**
   * Manual trip start
   */
  const startManualTrip = useCallback(() => {
    stopSimulation();
    tripDetector.forceStart();
    startTrip();
    startSensors();
    sensorService.setSamplingRate(SAMPLING_RATES.ACCELEROMETER);
    startTracking();
  }, [startTrip, startSensors, startTracking, stopSimulation]);

  /**
   * Manual trip end
   */
  const endCurrentTrip = useCallback(() => {
    stopSimulation();
    tripDetector.forceEnd();
    endTrip();
    stopSensors();
  }, [endTrip, stopSensors, stopSimulation]);

  /**
   * Continuous simulation engine: feeds GPS points every 1 second
   */
  const startSimulation = useCallback(
    (speedKmh: number) => {
      if (simIntervalRef.current) {
        clearInterval(simIntervalRef.current);
      }

      isSimulatingRef.current = true;
      setSimulationSpeed(speedKmh);
      startSensors();

      const tick = () => {
        const speedMs = speedKmh / 3.6;
        // Advance lat forward proportionally to simulated speed
        simLatRef.current += (speedMs * 1) / 111139;

        const mockLocation: LocationData = {
          latitude: simLatRef.current,
          longitude: simLngRef.current,
          altitude: 15,
          accuracy: 4,
          speed: speedMs,
          heading: 0,
          timestamp: Date.now(),
        };

        tripDetector.processLocation(mockLocation);
        useTripStore.getState().updateLocation(mockLocation);

        // Process live event detection during active trips
        const currentActive = useTripStore.getState().activeTrip;
        if (currentActive) {
          const updatedActive = tripProcessor.processSensorData(
            currentActive,
            lastAccelRef.current,
            lastGyroRef.current,
            mockLocation
          );
          if (updatedActive.eventBuffer.length !== currentActive.eventBuffer.length) {
            useTripStore.setState({ activeTrip: updatedActive });
          }
        }
      };

      tick();
      simIntervalRef.current = setInterval(tick, 1000);
    },
    [startSensors]
  );

  /**
   * Inject a test event into active trip (for verifying scoring deductions)
   */
  const injectTestEvent = useCallback(
    (type: DrivingEventType) => {
      const active = useTripStore.getState().activeTrip;
      if (!active) return;

      const metadata: { gForce?: number; angle?: number; speed?: number } = {
        speed: 45,
      };
      if (type === 'harsh_brake') metadata.gForce = 0.65;
      if (type === 'harsh_accel') metadata.gForce = 0.6;
      if (type === 'sharp_turn') metadata.angle = 1.2;

      const event: DrivingEvent = {
        type,
        timestamp: Date.now(),
        severity: 0.75,
        location: {
          lat: simLatRef.current,
          lng: simLngRef.current,
        },
        metadata,
      };

      recordEvent(event);
    },
    [recordEvent]
  );

  // 1. Initialize detector lifecycle listeners on mount
  useEffect(() => {
    tripDetector.initialize(
      () => {
        console.log('[useTripTracking] Detection triggered: onTripStart');
        startTrip();
        startSensors();
        sensorService.setSamplingRate(SAMPLING_RATES.ACCELEROMETER);
      },
      () => {
        console.log('[useTripTracking] Detection triggered: onTripEnd');
        endTrip();
        stopSensors();
      }
    );

    detectorUnsubRef.current = tripDetector.subscribeStateChange(
      (state: DetectorState) => {
        let displayCountdown = 0;
        if (state.state === 'starting') {
          displayCountdown = Math.max(
            0,
            TRIP_DETECTION.START_DURATION - state.highSpeedCounter
          );
        } else if (state.state === 'ending') {
          displayCountdown = Math.max(
            0,
            TRIP_DETECTION.END_DURATION - state.lowSpeedCounter
          );
        }
        setDetectorState(state.state, displayCountdown);
      }
    );

    return () => {
      if (detectorUnsubRef.current) {
        detectorUnsubRef.current();
        detectorUnsubRef.current = null;
      }
    };
  }, [endTrip, setDetectorState, startSensors, startTrip, stopSensors]);

  // 2. Stable clock ticker: advances trip duration every 1 second when active
  const hasActiveTrip = activeTrip !== null;
  useEffect(() => {
    if (!hasActiveTrip) return;

    const interval = setInterval(() => {
      useTripStore.getState().tickDuration();
    }, 1000);

    return () => clearInterval(interval);
  }, [hasActiveTrip]);

  // 3. Auto-start GPS tracking on mount if enabled in settings
  useEffect(() => {
    if (autoDetection && !isTracking) {
      startTracking();
    }

    return () => {
      stopTracking();
    };
  }, [autoDetection]);

  return {
    activeTrip,
    isTracking,
    detectorState,
    countdown,
    currentSpeed,
    simulationSpeed,
    startTracking,
    stopTracking,
    startManualTrip,
    endCurrentTrip,
    startSimulation,
    stopSimulation,
    injectTestEvent,
  };
}
