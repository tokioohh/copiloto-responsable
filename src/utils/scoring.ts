import { TripMetrics, TripScore, ScoreBreakdown } from '../types/trip';
import { SCORE_WEIGHTS } from './constants';

/**
 * Trip scoring algorithm
 */

/**
 * Calculate braking score component (max 30)
 * 5 point deduction per harsh brake
 */
export const calculateBrakingScore = (harshBrakes: number): number => {
  const score =
    SCORE_WEIGHTS.BRAKING_MAX - harshBrakes * SCORE_WEIGHTS.BRAKING_PENALTY;
  return Math.max(0, Math.min(SCORE_WEIGHTS.BRAKING_MAX, score));
};

/**
 * Calculate acceleration score component (max 25)
 * 5 point deduction per harsh acceleration
 */
export const calculateAccelerationScore = (harshAccels: number): number => {
  const score =
    SCORE_WEIGHTS.ACCELERATION_MAX -
    harshAccels * SCORE_WEIGHTS.ACCELERATION_PENALTY;
  return Math.max(0, Math.min(SCORE_WEIGHTS.ACCELERATION_MAX, score));
};

/**
 * Calculate speed score component (max 20)
 * 2 point deduction per minute of speeding
 */
export const calculateSpeedScore = (speedingSeconds: number): number => {
  const speedingMinutes = speedingSeconds / 60;
  const score =
    SCORE_WEIGHTS.SPEED_MAX -
    speedingMinutes * SCORE_WEIGHTS.SPEED_PENALTY_PER_MINUTE;
  return Math.max(0, Math.min(SCORE_WEIGHTS.SPEED_MAX, Math.round(score)));
};

/**
 * Calculate turning score component (max 15)
 * 3 point deduction per sharp turn
 */
export const calculateTurningScore = (sharpTurns: number): number => {
  const score =
    SCORE_WEIGHTS.TURNING_MAX - sharpTurns * SCORE_WEIGHTS.TURNING_PENALTY;
  return Math.max(0, Math.min(SCORE_WEIGHTS.TURNING_MAX, score));
};

/**
 * Calculate phone usage score component (max 10)
 */
export const calculatePhoneScore = (phonePickups: number = 0): number => {
  const score =
    SCORE_WEIGHTS.PHONE_MAX - phonePickups * SCORE_WEIGHTS.PHONE_PENALTY;
  return Math.max(0, Math.min(SCORE_WEIGHTS.PHONE_MAX, score));
};

/**
 * Calculate trip score from metrics
 */
export const calculateTripScore = (metrics: TripMetrics): TripScore => {
  const braking = calculateBrakingScore(metrics.harshBrakes);
  const acceleration = calculateAccelerationScore(metrics.harshAccels);
  const speed = calculateSpeedScore(metrics.speedingDuration);
  const turning = calculateTurningScore(metrics.sharpTurns);
  const phoneUsage = calculatePhoneScore(0); // MVP default

  const total = Math.max(
    0,
    Math.min(100, Math.round(braking + acceleration + speed + turning + phoneUsage))
  );

  const breakdown: ScoreBreakdown = {
    braking,
    acceleration,
    speed,
    turning,
    phoneUsage,
  };

  return {
    total,
    breakdown,
  };
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
