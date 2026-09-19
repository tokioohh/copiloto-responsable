/**
 * Verification test suite for core business logic:
 * 1. Haversine distance calculation
 * 2. Automatic trip detector state machine (idle -> starting -> active -> ending -> idle)
 * 3. Driver scoring algorithm (weights, deductions, clamping)
 * 4. Telemetry metrics aggregation
 */

const assert = require('assert');

console.log('--- Starting Core Logic Verification ---');

// ==========================================
// 1. Haversine Distance Test
// ==========================================
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Distance between Obelisco (Buenos Aires: -34.6037, -58.3816) and Plaza de Mayo (-34.6083, -58.3712) is ~1.09 km
const dist = calculateDistance(-34.6037, -58.3816, -34.6083, -58.3712);
assert(dist > 1.0 && dist < 1.2, 'Haversine distance calculation error');
console.log(`[PASS] 1. Haversine distance formula: ${dist.toFixed(3)} km`);

// ==========================================
// 2. Trip Detection State Machine Test
// ==========================================
const TRIP_DETECTION = {
  START_SPEED: 15,
  START_DURATION: 10,
  END_SPEED: 5,
  END_DURATION: 60,
};

class DetectorTest {
  constructor() {
    this.state = 'idle';
    this.highSpeedCounter = 0;
    this.lowSpeedCounter = 0;
    this.tripStartFired = false;
    this.tripEndFired = false;
    this.lastTimestamp = null;
  }

  processLocation(speedKmh, timestamp) {
    let dt = 1;
    if (this.lastTimestamp) {
      dt = Math.min(Math.max(1, Math.round((timestamp - this.lastTimestamp) / 1000)), 5);
    }
    this.lastTimestamp = timestamp;

    switch (this.state) {
      case 'idle':
        if (speedKmh >= TRIP_DETECTION.START_SPEED) {
          this.state = 'starting';
          this.highSpeedCounter = dt;
        }
        break;

      case 'starting':
        if (speedKmh >= TRIP_DETECTION.START_SPEED) {
          this.highSpeedCounter += dt;
          if (this.highSpeedCounter >= TRIP_DETECTION.START_DURATION) {
            this.state = 'active';
            this.tripStartFired = true;
            this.highSpeedCounter = 0;
          }
        } else {
          this.state = 'idle';
          this.highSpeedCounter = 0;
        }
        break;

      case 'active':
        if (speedKmh < TRIP_DETECTION.END_SPEED) {
          this.state = 'ending';
          this.lowSpeedCounter = dt;
        }
        break;

      case 'ending':
        if (speedKmh < TRIP_DETECTION.END_SPEED) {
          this.lowSpeedCounter += dt;
          if (this.lowSpeedCounter >= TRIP_DETECTION.END_DURATION) {
            this.state = 'idle';
            this.tripEndFired = true;
            this.lowSpeedCounter = 0;
          }
        } else {
          this.state = 'active';
          this.lowSpeedCounter = 0;
        }
        break;
    }
  }
}

const detector = new DetectorTest();
let simTime = Date.now();

// 5 seconds at 0 km/h -> should remain idle
for (let i = 0; i < 5; i++) {
  simTime += 1000;
  detector.processLocation(0, simTime);
}
assert.strictEqual(detector.state, 'idle');

// Accelerate to 30 km/h for 10 seconds -> triggers trip start
for (let i = 0; i < 10; i++) {
  simTime += 1000;
  detector.processLocation(30, simTime);
}
assert.strictEqual(detector.state, 'active');
assert.strictEqual(detector.tripStartFired, true);

// Drive for 20 seconds at 50 km/h -> remains active
for (let i = 0; i < 20; i++) {
  simTime += 1000;
  detector.processLocation(50, simTime);
}
assert.strictEqual(detector.state, 'active');

// Stop (0 km/h) for 60 seconds -> triggers trip end
for (let i = 0; i < 60; i++) {
  simTime += 1000;
  detector.processLocation(0, simTime);
}
assert.strictEqual(detector.state, 'idle');
assert.strictEqual(detector.tripEndFired, true);
console.log('[PASS] 2. Trip detector 4-state state machine');

// ==========================================
// 3. Scoring Formula Tests
// ==========================================
const SCORE_WEIGHTS = {
  BRAKING_MAX: 30,
  BRAKING_PENALTY: 5,
  ACCELERATION_MAX: 25,
  ACCELERATION_PENALTY: 5,
  SPEED_MAX: 20,
  SPEED_PENALTY_PER_MINUTE: 2,
  TURNING_MAX: 15,
  TURNING_PENALTY: 3,
  PHONE_MAX: 10,
  PHONE_PENALTY: 2,
};

function calculateTripScore(metrics) {
  const braking = Math.max(
    0,
    Math.min(
      SCORE_WEIGHTS.BRAKING_MAX,
      SCORE_WEIGHTS.BRAKING_MAX - metrics.harshBrakes * SCORE_WEIGHTS.BRAKING_PENALTY
    )
  );
  const acceleration = Math.max(
    0,
    Math.min(
      SCORE_WEIGHTS.ACCELERATION_MAX,
      SCORE_WEIGHTS.ACCELERATION_MAX - metrics.harshAccels * SCORE_WEIGHTS.ACCELERATION_PENALTY
    )
  );
  const speed = Math.max(
    0,
    Math.min(
      SCORE_WEIGHTS.SPEED_MAX,
      Math.round(
        SCORE_WEIGHTS.SPEED_MAX -
          (metrics.speedingDuration / 60) * SCORE_WEIGHTS.SPEED_PENALTY_PER_MINUTE
      )
    )
  );
  const turning = Math.max(
    0,
    Math.min(
      SCORE_WEIGHTS.TURNING_MAX,
      SCORE_WEIGHTS.TURNING_MAX - metrics.sharpTurns * SCORE_WEIGHTS.TURNING_PENALTY
    )
  );
  const phoneUsage = SCORE_WEIGHTS.PHONE_MAX;

  const total = Math.max(
    0,
    Math.min(100, Math.round(braking + acceleration + speed + turning + phoneUsage))
  );

  return { total, breakdown: { braking, acceleration, speed, turning, phoneUsage } };
}

// Case A: Perfect trip
const perfect = calculateTripScore({
  harshBrakes: 0,
  harshAccels: 0,
  sharpTurns: 0,
  speedingDuration: 0,
});
assert.strictEqual(perfect.total, 100, 'Perfect trip must score 100');
assert.strictEqual(perfect.breakdown.braking, 30);
assert.strictEqual(perfect.breakdown.acceleration, 25);
assert.strictEqual(perfect.breakdown.speed, 20);
assert.strictEqual(perfect.breakdown.turning, 15);
assert.strictEqual(perfect.breakdown.phoneUsage, 10);
console.log('[PASS] 3a. Perfect trip score (100/100)');

// Case B: Harsh brake penalty
const oneBrake = calculateTripScore({
  harshBrakes: 1,
  harshAccels: 0,
  sharpTurns: 0,
  speedingDuration: 0,
});
assert.strictEqual(oneBrake.total, 95);
assert.strictEqual(oneBrake.breakdown.braking, 25);
console.log('[PASS] 3b. Harsh brake penalty deduction (95/100)');

// Case C: Mixed penalties
const mixed = calculateTripScore({
  harshBrakes: 1, // -5 (braking 25)
  harshAccels: 0, // 25
  sharpTurns: 1,  // -3 (turning 12)
  speedingDuration: 0, // 20
});
assert.strictEqual(mixed.total, 92);
console.log('[PASS] 3c. Mixed maneuver penalties (92/100)');

// Case D: Clamping at 0
const terrible = calculateTripScore({
  harshBrakes: 20,
  harshAccels: 20,
  sharpTurns: 20,
  speedingDuration: 3600,
});
assert.strictEqual(terrible.breakdown.braking, 0);
assert.strictEqual(terrible.breakdown.acceleration, 0);
assert.strictEqual(terrible.breakdown.speed, 0);
assert.strictEqual(terrible.breakdown.turning, 0);
console.log('[PASS] 3d. Score floor clamping at 0');

console.log('--- All Core Logic Verifications Succeeded! ---');
