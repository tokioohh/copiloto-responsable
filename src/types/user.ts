import { Timestamp } from 'firebase/firestore';

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  createdAt: Timestamp;
  settings: UserSettings;
  stats: UserStats;
}

export interface UserSettings {
  notifications: boolean;
  autoDetection: boolean;
  speedLimit: number; // km/h
}

export interface UserStats {
  totalTrips: number;
  averageScore: number;
  totalDistance: number; // km
  totalDuration: number; // minutes
}
