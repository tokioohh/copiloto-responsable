import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Trip } from '../types/trip';
import { User, UserStats } from '../types/user';

/**
 * Firebase Firestore CRUD operations
 * Sprint 3 implementation
 */

export const firebaseService = {
  /**
   * Upload completed trip to Firestore
   * TODO Sprint 3: Implement trip upload
   */
  uploadTrip: async (trip: Trip): Promise<void> => {
    // TODO: Save trip document to trips collection
    // TODO: Update user stats (totalTrips, totalDistance, totalDuration, averageScore)
    console.log('[FirebaseService] Upload trip - TODO Sprint 3');
  },

  /**
   * Load user trips
   * TODO Sprint 3: Implement paginated trip loading
   */
  loadUserTrips: async (
    userId: string,
    limitCount: number = 20
  ): Promise<Trip[]> => {
    // TODO: Query trips collection filtered by userId
    // TODO: Order by startTime descending
    // TODO: Apply limit
    // TODO: Exclude dismissed trips or add flag
    console.log('[FirebaseService] Load trips - TODO Sprint 3');
    return [];
  },

  /**
   * Mark trip as dismissed
   * TODO Sprint 3: Update trip dismissed flag
   */
  dismissTrip: async (tripId: string): Promise<void> => {
    // TODO: Update trip document dismissed field to true
    // TODO: Recalculate user stats excluding this trip
    console.log('[FirebaseService] Dismiss trip - TODO Sprint 3');
  },

  /**
   * Get single trip by ID
   */
  getTrip: async (tripId: string): Promise<Trip | null> => {
    try {
      const tripDoc = await getDoc(doc(db, 'trips', tripId));
      if (tripDoc.exists()) {
        return tripDoc.data() as Trip;
      }
      return null;
    } catch (error) {
      console.error('[FirebaseService] Error getting trip:', error);
      return null;
    }
  },

  /**
   * Update user stats
   * TODO Sprint 3: Recalculate and update user stats
   */
  updateUserStats: async (userId: string, stats: UserStats): Promise<void> => {
    // TODO: Update user document stats field
    console.log('[FirebaseService] Update user stats - TODO Sprint 3');
  },

  /**
   * Calculate user stats from all trips
   * TODO Sprint 3: Aggregate stats from trips collection
   */
  calculateUserStats: async (userId: string): Promise<UserStats> => {
    // TODO: Query all non-dismissed trips for user
    // TODO: Aggregate totalTrips, totalDistance, totalDuration
    // TODO: Calculate average score
    console.log('[FirebaseService] Calculate user stats - TODO Sprint 3');

    return {
      totalTrips: 0,
      averageScore: 0,
      totalDistance: 0,
      totalDuration: 0,
    };
  },
};
