import { TripMetrics, TripScore, ScoreBreakdown } from '../types/trip';
import { SCORE_WEIGHTS } from './constants';

/**
 * Trip scoring algorithm
 * Sprint 3 implementation
 */

/**
 * Calculate trip score from metrics
 * TODO Sprint 3: Implement complete scoring algorithm
 */
export const calculateTripScore = (metrics: TripMetrics): TripScore => {
  // TODO: Implement scoring formula:
  // braking (max 30):     30 - (harshBrakes * 5)
  // acceleration (max 25): 25 - (harshAccels * 5)
  // speed (max 20):       20 - (speedingMinutes * 2)
  // turning (max 15):     15 - (sharpTurns * 3)
  // phoneUsage (max 10):  10 - (phonePickups * 2) [MVP: always 10]
  //
  // All sub-scores clamped to [0, max_weight]
  // Total clamped to [0, 100]

  console.log('[Scoring] Calculate score - TODO Sprint 3');

  // Placeholder implementation
  const breakdown: ScoreBreakdown = {
    braking: SCORE_WEIGHTS.BRAKING_MAX,
    acceleration: SCORE_WEIGHTS.ACCELERATION_MAX,
    speed: SCORE_WEIGHTS.SPEED_MAX,
    turning: SCORE_WEIGHTS.TURNING_MAX,
    phoneUsage: SCORE_WEIGHTS.PHONE_MAX,
  };

  return {
    total: 100,
    breakdown,
  };
};

/**
 * Calculate braking score component
 */
export const calculateBrakingScore = (harshBrakes: number): number => {
  const score =
    SCORE_WEIGHTS.BRAKING_MAX - harshBrakes * SCORE_WEIGHTS.BRAKING_PENALTY;
  return Math.max(0, Math.min(SCORE_WEIGHTS.BRAKING_MAX, score));
};

/**
 * Calculate acceleration score component
 */
export const calculateAccelerationScore = (harshAccels: number): number => {
  const score =
    SCORE_WEIGHTS.ACCELERATION_MAX -
    harshAccels * SCORE_WEIGHTS.ACCELERATION_PENALTY;
  return Math.max(0, Math.min(SCORE_WEIGHTS.ACCELERATION_MAX, score));
};

/**
 * Calculate speed score component
 */
export const calculateSpeedScore = (speedingSeconds: number): number => {
  const speedingMinutes = speedingSeconds / 60;
  const score =
    SCORE_WEIGHTS.SPEED_MAX -
    speedingMinutes * SCORE_WEIGHTS.SPEED_PENALTY_PER_MINUTE;
  return Math.max(0, Math.min(SCORE_WEIGHTS.SPEED_MAX, score));
};

/**
 * Calculate turning score component
 */
export const calculateTurningScore = (sharpTurns: number): number => {
  const score =
    SCORE_WEIGHTS.TURNING_MAX - sharpTurns * SCORE_WEIGHTS.TURNING_PENALTY;
  return Math.max(0, Math.min(SCORE_WEIGHTS.TURNING_MAX, score));
};

/**
 * Calculate phone usage score component
 */
export const calculatePhoneScore = (phonePickups: number): number => {
  const score =
    SCORE_WEIGHTS.PHONE_MAX - phonePickups * SCORE_WEIGHTS.PHONE_PENALTY;
  return Math.max(0, Math.min(SCORE_WEIGHTS.PHONE_MAX, score));
};

/**
 * Convert score (0-100) to star rating (1-5)
 */
export const scoreToStars = (score: number): number => {
  if (score >= 90) return 5;
  if (score >= 75) return 4;
  if (score >= 60) return 3;
  if (score >= 40) return 2;
  return 1;
};

/**
 * Get score color based on value
 */
export const getScoreColor = (score: number): string => {
  if (score >= 80) return '#4CAF50'; // green
  if (score >= 60) return '#FFC107'; // yellow
  return '#F44336'; // red
};
