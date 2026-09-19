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
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Trip } from '../types/trip';
import { UserStats } from '../types/user';
import { Timestamp } from 'firebase/firestore';

/**
 * Recursively removes undefined fields from objects/arrays to satisfy Firestore rules
 */
export const sanitizeForFirestore = <T>(obj: T): T => {
  if (obj === null || obj === undefined) {
    return null as unknown as T;
  }
  if (obj instanceof Timestamp) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeForFirestore) as unknown as T;
  }
  if (typeof obj === 'object') {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        result[key] = sanitizeForFirestore(value);
      }
    }
    return result as T;
  }
  return obj;
};

export const firebaseService = {
  /**
   * Upload completed trip to Firestore and update cumulative user stats
   */
  uploadTrip: async (trip: Trip): Promise<void> => {
    try {
      const sanitized = sanitizeForFirestore(trip);

      // 1. Save trip document in 'trips' collection
      await setDoc(doc(db, 'trips', trip.id), sanitized);

      // 2. Recalculate and update cumulative user stats
      const newStats = await firebaseService.calculateUserStats(trip.userId);
      await firebaseService.updateUserStats(trip.userId, newStats);

      console.log(`[FirebaseService] Trip ${trip.id} successfully uploaded.`);
    } catch (error) {
      console.error('[FirebaseService] Error uploading trip to Firestore:', error);
      throw error;
    }
  },

  /**
   * Load user trips with client-side sorting (avoids composite index requirement)
   */
  loadUserTrips: async (
    userId: string,
    limitCount: number = 30
  ): Promise<Trip[]> => {
    try {
      const tripsRef = collection(db, 'trips');
      const q = query(tripsRef, where('userId', '==', userId));

      const querySnapshot = await getDocs(q);
      const trips: Trip[] = [];

      querySnapshot.forEach((docSnap) => {
        trips.push(docSnap.data() as Trip);
      });

      // Sort by startTime descending in memory (avoids requiring composite indexes)
      trips.sort((a, b) => {
        const timeA = a.startTime?.toMillis ? a.startTime.toMillis() : 0;
        const timeB = b.startTime?.toMillis ? b.startTime.toMillis() : 0;
        return timeB - timeA;
      });

      return trips.slice(0, limitCount);
    } catch (error) {
      console.warn('[FirebaseService] Error loading user trips:', error);
      return [];
    }
  },

  /**
   * Mark trip as dismissed ("No era el conductor") and recalculate user stats
   */
  dismissTrip: async (tripId: string): Promise<void> => {
    try {
      const tripRef = doc(db, 'trips', tripId);
      const tripSnap = await getDoc(tripRef);

      if (!tripSnap.exists()) {
        throw new Error('Trip not found');
      }

      const trip = tripSnap.data() as Trip;
      await updateDoc(tripRef, { dismissed: true });

      // Recalculate stats excluding dismissed trip
      const updatedStats = await firebaseService.calculateUserStats(trip.userId);
      await firebaseService.updateUserStats(trip.userId, updatedStats);

      console.log(`[FirebaseService] Trip ${tripId} marked as dismissed.`);
    } catch (error) {
      console.error('[FirebaseService] Error dismissing trip:', error);
      throw error;
    }
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
   * Calculate user stats from all non-dismissed trips in Firestore
   */
  calculateUserStats: async (userId: string): Promise<UserStats> => {
    try {
      const q = query(collection(db, 'trips'), where('userId', '==', userId));
      const snapshot = await getDocs(q);

      const validTrips: Trip[] = [];
      snapshot.forEach((d) => {
        const t = d.data() as Trip;
        if (!t.dismissed) {
          validTrips.push(t);
        }
      });

      const totalTrips = validTrips.length;
      if (totalTrips === 0) {
        return {
          totalTrips: 0,
          averageScore: 0,
          totalDistance: 0,
          totalDuration: 0,
        };
      }

      const totalDistance = Number(
        validTrips.reduce((acc, t) => acc + (t.distance || 0), 0).toFixed(1)
      );
      const totalDuration = validTrips.reduce(
        (acc, t) => acc + (t.duration || 0),
        0
      );
      const totalScoreSum = validTrips.reduce(
        (acc, t) => acc + (t.score?.total || 0),
        0
      );
      const averageScore = Math.round(totalScoreSum / totalTrips);

      return {
        totalTrips,
        averageScore,
        totalDistance,
        totalDuration,
      };
    } catch (error) {
      console.error('[FirebaseService] Error calculating user stats:', error);
      return {
        totalTrips: 0,
        averageScore: 0,
        totalDistance: 0,
        totalDuration: 0,
      };
    }
  },

  /**
   * Update user document stats field in Firestore
   */
  updateUserStats: async (userId: string, stats: UserStats): Promise<void> => {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, { stats }, { merge: true });
    } catch (error) {
      console.error('[FirebaseService] Error updating user stats in Firestore:', error);
    }
  },
};
