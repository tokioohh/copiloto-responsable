import { create } from 'zustand';
import { Trip, ActiveTrip, RoutePoint, DrivingEvent } from '../types/trip';
import { LocationData } from '../types/sensor';
import { TripState } from '../services/tripDetector';
import { locationService } from '../services/locationService';
import { tripProcessor } from '../services/tripProcessor';
import { firebaseService } from '../services/firebaseService';
import { useAuthStore } from './authStore';
import { auth } from '../config/firebase';
import { PROCESSING } from '../utils/constants';

interface TripStoreState {
  activeTrip: ActiveTrip | null;
  trips: Trip[];
  loading: boolean;
  error: string | null;

  // Real-time tracking telemetry
  isTracking: boolean;
  detectorState: TripState;
  countdown: number;
  currentSpeed: number; // km/h

  // Actions
  startTrip: () => void;
  endTrip: () => Promise<Trip | null>;
  tickDuration: () => void;
  updateLocation: (location: LocationData) => void;
  recordEvent: (event: DrivingEvent) => void;
  setDetectorState: (state: TripState, countdown: number) => void;
  setCurrentSpeed: (speed: number) => void;
  setTracking: (isTracking: boolean) => void;

  // Persistence actions
  dismissTrip: (tripId: string) => Promise<void>;
  loadTrips: (userId: string) => Promise<void>;
  syncTrip: (trip: Trip) => Promise<void>;
}

export const useTripStore = create<TripStoreState>((set, get) => ({
  activeTrip: null,
  trips: [],
  loading: false,
  error: null,

  isTracking: false,
  detectorState: 'idle',
  countdown: 0,
  currentSpeed: 0,

  startTrip: () => {
    const existing = get().activeTrip;
    if (existing) return;

    const newTrip: ActiveTrip = {
      id: `trip_${Date.now()}`,
      startTime: Date.now(),
      currentDistance: 0,
      currentDuration: 0,
      eventBuffer: [],
      routeBuffer: [],
    };

    set({
      activeTrip: newTrip,
      detectorState: 'active',
      isTracking: true,
      countdown: 0,
    });
  },

  endTrip: async (): Promise<Trip | null> => {
    const active = get().activeTrip;
    if (!active) return null;

    const currentUid = auth.currentUser?.uid || useAuthStore.getState().user?.uid;
    const userId = currentUid || 'guest_user';

    console.log(
      `[TripStore] Finalizing trip ${active.id}. Duration: ${active.currentDuration}s, Distance: ${active.currentDistance.toFixed(
        2
      )}km`
    );

    // Reset tracking telemetry state immediately
    set({
      activeTrip: null,
      detectorState: 'idle',
      countdown: 0,
      currentSpeed: 0,
      isTracking: false,
    });

    // Discard 0-second accidental micro-clicks
    if (active.currentDuration < 3 && active.currentDistance < 0.01) {
      console.log('[TripStore] Trip too short, discarded.');
      return null;
    }

    try {
      // 1. Process metrics and scoring through the pipeline
      const finalizedTrip = tripProcessor.finalizeTrip(active, userId);

      // 2. Optimistically add to local store so UI displays it immediately
      set((state) => ({
        trips: [finalizedTrip, ...state.trips.filter((t) => t.id !== finalizedTrip.id)],
      }));

      // 3. Upload to Firestore (if authenticated user exists)
      if (currentUid && currentUid !== 'guest_user') {
        await firebaseService.uploadTrip(finalizedTrip);
        // Refresh user statistics in authStore
        await useAuthStore.getState().loadUserData(currentUid);
      }

      return finalizedTrip;
    } catch (err) {
      console.error('[TripStore] Error finalizing and uploading trip:', err);
      return null;
    }
  },

  tickDuration: () => {
    const { activeTrip } = get();
    if (!activeTrip) return;

    const currentDuration = Math.max(
      1,
      Math.floor((Date.now() - activeTrip.startTime) / 1000)
    );

    set({
      activeTrip: {
        ...activeTrip,
        currentDuration,
      },
    });
  },

  updateLocation: (location: LocationData) => {
    const speedKmh = location.speed
      ? locationService.msToKmh(location.speed)
      : 0;
    const { activeTrip } = get();

    if (!activeTrip) {
      set({ currentSpeed: speedKmh });
      return;
    }

    const newPoint: RoutePoint = {
      lat: location.latitude,
      lng: location.longitude,
      speed: speedKmh,
      timestamp: location.timestamp || Date.now(),
    };

    let distanceDelta = 0;
    const lastPoint =
      activeTrip.routeBuffer.length > 0
        ? activeTrip.routeBuffer[activeTrip.routeBuffer.length - 1]
        : null;

    if (lastPoint) {
      distanceDelta = locationService.calculateDistance(
        lastPoint.lat,
        lastPoint.lng,
        newPoint.lat,
        newPoint.lng
      );
    }

    const updatedBuffer =
      activeTrip.routeBuffer.length >= PROCESSING.ROUTE_BUFFER_SIZE
        ? [...activeTrip.routeBuffer.slice(1), newPoint]
        : [...activeTrip.routeBuffer, newPoint];

    const currentDuration = Math.max(
      1,
      Math.floor((Date.now() - activeTrip.startTime) / 1000)
    );

    set({
      currentSpeed: speedKmh,
      activeTrip: {
        ...activeTrip,
        currentDistance: activeTrip.currentDistance + distanceDelta,
        currentDuration,
        routeBuffer: updatedBuffer,
      },
    });
  },

  recordEvent: (event: DrivingEvent) => {
    const { activeTrip } = get();
    if (!activeTrip) return;

    set({
      activeTrip: {
        ...activeTrip,
        eventBuffer: [...activeTrip.eventBuffer, event].slice(
          -PROCESSING.EVENT_BUFFER_SIZE
        ),
      },
    });
  },

  setDetectorState: (detectorState: TripState, countdown: number) => {
    set({ detectorState, countdown });
  },

  setCurrentSpeed: (currentSpeed: number) => {
    set({ currentSpeed });
  },

  setTracking: (isTracking: boolean) => {
    set({ isTracking });
  },

  loadTrips: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const trips = await firebaseService.loadUserTrips(userId);
      set({ trips, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  dismissTrip: async (tripId: string) => {
    set({ loading: true, error: null });
    try {
      await firebaseService.dismissTrip(tripId);
      // Update local state
      set((state) => ({
        trips: state.trips.map((t) =>
          t.id === tripId ? { ...t, dismissed: true } : t
        ),
        loading: false,
      }));

      // Refresh user stats
      const authUser = useAuthStore.getState().user;
      if (authUser?.uid) {
        await useAuthStore.getState().loadUserData(authUser.uid);
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  syncTrip: async (trip: Trip) => {
    set({ loading: true });
    try {
      await firebaseService.uploadTrip(trip);
      set({ loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
}));
