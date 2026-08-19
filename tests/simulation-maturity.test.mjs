import assert from "node:assert/strict";
import test from "node:test";

import { generateScenarioPack } from "../app/scenario-generator.ts";
import {
  advanceNightTo,
  createNightState,
  sceneArrivalOffset,
  validateNightState,
} from "../app/night-engine.ts";
import { runSimulationEvidence } from "../scripts/run-simulation-evidence.mjs";

const QUICK_CONFIG = Object.freeze({
  coherenceSeedCount: 24,
  playedSeedCount: 8,
  autonomousSeedCount: 8,
  determinismSeedCount: 8,
  invalidStateSeedCount: 2,
  invalidActionSeedCount: 8,
});
const reportPromise = runSimulationEvidence(QUICK_CONFIG);

test("the maturity harness is deterministic and content-addressed", async () => {
  const first = await reportPromise;
  const second = await runSimulationEvidence(QUICK_CONFIG);
  assert.deepEqual(second, first);
  assert.equal(first.results.status, "pass");
  assert.match(first.evidenceSha256, /^[a-f0-9]{64}$/);
  assert.match(first.source.sha256, /^[a-f0-9]{64}$/);
  assert.equal(first.executionContract.wallClockDataCommitted, false);
});

test("unentered rooms evolve only when autonomous scenes become due", () => {
  const pack = generateScenarioPack(0x43484f52);
  const initial = createNightState(pack);
  const arrivals = pack.scenarios.flatMap((scenario) => scenario.scenes.map((_, index) => sceneArrivalOffset(pack, scenario.id, index)));
  const unique = [...new Set(arrivals)].sort((left, right) => left - right);
  const next = unique.find((minute) => minute > initial.elapsedMinutes);
  assert.ok(next);
  const before = advanceNightTo(pack, initial, next - 1);
  const due = advanceNightTo(pack, before, next);
  assert.equal(before.ambientEvents.length, arrivals.filter((minute) => minute < next).length);
  assert.equal(due.ambientEvents.length, arrivals.filter((minute) => minute <= next).length);
  assert.ok(Object.values(due.rooms).every((room) => !room.entered));

  const last = unique.at(-1);
  const direct = advanceNightTo(pack, initial, last);
  let stepped = initial;
  for (const minute of unique.filter((minute) => minute > 0)) stepped = advanceNightTo(pack, stepped, minute);
  assert.deepEqual(stepped, direct);
  assert.equal(direct.ambientEvents.length, 24);
  assert.ok(Object.values(direct.rooms).every((room) => room.inboundEventIds.length === 20));
  assert.deepEqual(validateNightState(pack, direct), []);
});

test("randomized interleavings produce exactly-once local and remote causality", async () => {
  const report = await reportPromise;
  const played = QUICK_CONFIG.playedSeedCount;
  assert.equal(report.results.completedNights, played);
  assert.equal(report.results.replayedNights, played);
  assert.equal(report.results.randomizedInterleavings, played);
  assert.equal(report.results.decisions, played * 24);
  assert.equal(report.results.decisionEffects, played * 24 * 6);
  assert.equal(report.results.localDecisionEffects, played * 24);
  assert.equal(report.results.remoteDecisionEffects, played * 24 * 5);
  assert.equal(report.results.autonomousPulses, played * 24);
  assert.equal(report.results.autonomousEffects, played * 24 * 6);
  assert.equal(report.results.localAutonomousEffects, played * 24);
  assert.equal(report.results.remoteAutonomousEffects, played * 24 * 5);
  assert.equal(report.results.stateValidationFailures, 0);
  assert.equal(report.results.replayFailures, 0);
});

test("invalid-state probes and invalid actions are rejected without corrupting play", async () => {
  const report = await reportPromise;
  assert.equal(report.results.invalidStateMutationsRejected, QUICK_CONFIG.invalidStateSeedCount * report.samples.invalidStateMutationsPerSeed);
  assert.equal(report.results.invalidActionNoOps, QUICK_CONFIG.invalidActionSeedCount * report.samples.invalidActionAttemptsPerSeed);
  assert.equal(report.results.invariantFailures, 0);
});

test("large-run bounds preserve cumulative reach and normalized 0–100 domains", async () => {
  const report = await reportPromise;
  const bounds = report.results.bounds;
  assert.ok(bounds.stateObservations > 0);
  assert.ok(bounds.roomObservations >= bounds.stateObservations * 6);
  assert.ok(Number.isSafeInteger(bounds.reach.minimum) && bounds.reach.minimum >= 0);
  assert.ok(Number.isSafeInteger(bounds.reach.maximum) && bounds.reach.maximum >= bounds.reach.minimum);
  for (const range of Object.values(bounds.normalizedMetrics)) {
    assert.ok(range.minimum >= 0);
    assert.ok(range.maximum <= 100);
  }
  for (const range of Object.values(bounds.fatigue)) {
    assert.ok(range.minimum >= 0);
    assert.ok(range.maximum <= 100);
  }
  assert.equal(report.results.choiceExhaustionFailures, 0);
});
