import { create } from 'zustand';
import { Trip, ActiveTrip } from '../types/trip';

interface TripState {
  activeTrip: ActiveTrip | null;
  trips: Trip[];
  loading: boolean;
  error: string | null;

  // Actions
  startTrip: () => void;
  endTrip: () => void;
  dismissTrip: (tripId: string) => Promise<void>;
  loadTrips: (userId: string) => Promise<void>;
  syncTrip: (trip: Trip) => Promise<void>;
}

export const useTripStore = create<TripState>((set, get) => ({
  activeTrip: null,
  trips: [],
  loading: false,
  error: null,

  startTrip: () => {
    const newTrip: ActiveTrip = {
      id: `trip_${Date.now()}`,
      startTime: Date.now(),
      currentDistance: 0,
      currentDuration: 0,
      eventBuffer: [],
      routeBuffer: [],
    };
    set({ activeTrip: newTrip });
  },

  endTrip: () => {
    // TODO: Process activeTrip, calculate score, sync to Firestore
    set({ activeTrip: null });
  },

  dismissTrip: async (tripId: string) => {
    // TODO: Mark trip as dismissed in Firestore
    set({ loading: true });
    try {
      // Implementation will be in Sprint 3
      set({ loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  loadTrips: async (userId: string) => {
    // TODO: Load trips from Firestore
    set({ loading: true });
    try {
      // Implementation will be in Sprint 3
      set({ loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  syncTrip: async (trip: Trip) => {
    // TODO: Upload trip to Firestore
    set({ loading: true });
    try {
      // Implementation will be in Sprint 3
      set({ loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
}));
