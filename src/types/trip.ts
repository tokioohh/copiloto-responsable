import { Timestamp } from 'firebase/firestore';

export type DrivingEventType = 'harsh_brake' | 'harsh_accel' | 'sharp_turn' | 'speeding';

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface RoutePoint extends GeoPoint {
  timestamp: number;
  speed: number; // km/h
}

export interface DrivingEvent {
  type: DrivingEventType;
  timestamp: number;
  severity: number; // 0-1
  location: GeoPoint;
  metadata: {
    gForce?: number;
    speed?: number;
    angle?: number;
  };
}

export interface TripMetrics {
  harshBrakes: number;
  harshAccels: number;
  sharpTurns: number;
  speedingDuration: number; // seconds over limit
  averageSpeed: number; // km/h
  maxSpeed: number; // km/h
}

export interface ScoreBreakdown {
  braking: number; // 0-30
  acceleration: number; // 0-25
  speed: number; // 0-20
  turning: number; // 0-15
  phoneUsage: number; // 0-10
}

export interface TripScore {
  total: number; // 0-100
  breakdown: ScoreBreakdown;
}

export interface Trip {
  id: string;
  userId: string;
  startTime: Timestamp;
  endTime: Timestamp;
  duration: number; // seconds
  distance: number; // km
  dismissed: boolean; // true if user marked "not driving"
  route: RoutePoint[];
  events: DrivingEvent[];
  metrics: TripMetrics;
  score: TripScore;
  processingVersion: string;
  syncedAt: Timestamp;
}

export interface ActiveTrip {
  id: string;
  startTime: number;
  currentDistance: number;
  currentDuration: number;
  eventBuffer: DrivingEvent[];
  routeBuffer: RoutePoint[];
}
