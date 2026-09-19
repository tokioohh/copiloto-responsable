import { create } from 'zustand';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User } from '../types/user';

interface AuthState {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;

  // Actions
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  initializeAuth: () => void;
  loadUserData: (uid: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  firebaseUser: null,
  loading: true,
  error: null,

  initializeAuth: () => {
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        set({ firebaseUser, loading: true });
        await get().loadUserData(firebaseUser.uid);
      } else {
        set({ user: null, firebaseUser: null, loading: false });
      }
    });
  },

  loadUserData: async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        set({ user: userDoc.data() as User, loading: false, error: null });
      } else {
        set({ error: 'Usuario no encontrado', loading: false });
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  signUp: async (email: string, password: string, displayName?: string) => {
    try {
      set({ loading: true, error: null });

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { uid } = userCredential.user;

      // Create user document in Firestore
      const newUser: User = {
        uid,
        email,
        displayName: displayName || email.split('@')[0],
        createdAt: Timestamp.now(),
        settings: {
          notifications: true,
          autoDetection: true,
          speedLimit: 80,
        },
        stats: {
          totalTrips: 0,
          averageScore: 0,
          totalDistance: 0,
          totalDuration: 0,
        },
      };

      await setDoc(doc(db, 'users', uid), newUser);
      set({ user: newUser, firebaseUser: userCredential.user, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      set({ loading: true, error: null });

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      set({ firebaseUser: userCredential.user });

      await get().loadUserData(userCredential.user.uid);
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  signOut: async () => {
    try {
      await firebaseSignOut(auth);
      set({ user: null, firebaseUser: null, loading: false, error: null });
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },
}));
