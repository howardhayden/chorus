import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { generateScenarioPack } from "../app/scenario-generator.ts";
import {
  advanceNightTo,
  applyNightChoice,
  choiceAccess,
  createNightState,
  enterNightRoom,
  isNightComplete,
  isRoomOpen,
  isSceneDue,
  roomStartOffset,
  sceneArrivalOffset,
  validateNightState,
} from "../app/night-engine.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_OUTPUT = path.join(ROOT, "evidence/runs/simulation-maturity.v1.json");
const SOURCE_FILES = [
  "app/night-engine.ts",
  "app/scenario-generator.ts",
  "scripts/run-simulation-evidence.mjs",
  "tests/simulation-maturity.test.mjs",
];
const METRIC_NAMES = [
  "heat",
  "crossover",
  "belief",
  "consensus",
  "provenance",
  "verification",
  "trust",
  "coordination",
  "blame",
  "interpretiveGap",
  "commonGround",
  "threadFocus",
  "discernment",
  "enactment",
];
const FATIGUE_KINDS = ["attentional", "affective", "relational", "verification", "efficacy"];
const CHOICE_POLICIES = ["seeded-mixed", "last-available", "repair-preferring", "refusal-floor"];

export const DEFAULT_SIMULATION_CONFIG = Object.freeze({
  coherenceSeedStart: 0,
  coherenceSeedCount: 4_096,
  playedSeedCount: 512,
  autonomousSeedCount: 128,
  determinismSeedCount: 64,
  invalidStateSeedCount: 16,
  invalidActionSeedCount: 64,
});

export async function runSimulationEvidence(overrides = {}) {
  const config = { ...DEFAULT_SIMULATION_CONFIG, ...overrides };
  validateConfig(config);

  const failures = [];
  let assertionCount = 0;
  const assertInvariant = (name, condition, context = undefined) => {
    assertionCount += 1;
    if (!condition) failures.push({ name, ...(context === undefined ? {} : { context }) });
  };

  const generationDigest = createHash("sha256");
  const finalStateDigest = createHash("sha256");
  const actionOrderDigest = createHash("sha256");
  const policyCounts = Object.fromEntries(CHOICE_POLICIES.map((policy) => [policy, 0]));
  const totals = {
    coherentNights: 0,
    generatedRooms: 0,
    generatedScenes: 0,
    generatedDirectedLinks: 0,
    completedNights: 0,
    replayedNights: 0,
    randomizedInterleavings: 0,
    roomSwitches: 0,
    decisions: 0,
    decisionEffects: 0,
    localDecisionEffects: 0,
    remoteDecisionEffects: 0,
    autonomousPulses: 0,
    autonomousEffects: 0,
    localAutonomousEffects: 0,
    remoteAutonomousEffects: 0,
    dueBoundaryChecks: 0,
    steppedClockEquivalenceChecks: 0,
    waitingRoomEvolutionChecks: 0,
    deterministicRegenerations: 0,
    invalidStateMutationsRejected: 0,
    invalidActionNoOps: 0,
    choiceExhaustionFailures: 0,
    stateValidationFailures: 0,
    replayFailures: 0,
  };
  const bounds = createBounds();

  for (let offset = 0; offset < config.coherenceSeedCount; offset += 1) {
    const seed = config.coherenceSeedStart + offset;
    let pack;
    try {
      pack = generateScenarioPack(seed);
    } catch (error) {
      assertInvariant("generation-does-not-throw", false, { seed, error: error instanceof Error ? error.message : String(error) });
      continue;
    }

    const scenes = pack.scenarios.flatMap((scenario) => scenario.scenes);
    assertInvariant("pack-generator-version", pack.generatorVersion === 15, { seed });
    assertInvariant("six-room-pack", pack.scenarios.length === 6, { seed, actual: pack.scenarios.length });
    assertInvariant("four-scenes-per-room", scenes.length === 24 && pack.scenarios.every((scenario) => scenario.scenes.length === 4), { seed, actual: scenes.length });
    assertInvariant("complete-directed-link-graph", pack.night.links.length === 30 && new Set(pack.night.links.map((link) => `${link.sourceScenarioId}->${link.targetScenarioId}`)).size === 30, { seed });
    assertInvariant("coherence-reports-pass", pack.nightReport.passed && pack.reports.length === 6 && pack.reports.every((report) => report.passed), { seed });
    totals.coherentNights += 1;
    totals.generatedRooms += pack.scenarios.length;
    totals.generatedScenes += scenes.length;
    totals.generatedDirectedLinks += pack.night.links.length;
    generationDigest.update(`${canonicalStringify(packSignature(pack))}\n`);

    if (offset < config.determinismSeedCount) {
      const regenerated = generateScenarioPack(seed);
      assertInvariant("same-seed-generation", canonicalStringify(packSignature(regenerated)) === canonicalStringify(packSignature(pack)), { seed });
      totals.deterministicRegenerations += 1;
    }

    if (offset < config.autonomousSeedCount) {
      exerciseAutonomousClock(pack, assertInvariant, totals, bounds);
    }

    if (offset < config.playedSeedCount) {
      const policy = CHOICE_POLICIES[offset % CHOICE_POLICIES.length];
      policyCounts[policy] += 1;
      const play = playInterleavedNight(pack, seed, policy, assertInvariant, bounds);
      if (play.exhausted) totals.choiceExhaustionFailures += 1;
      totals.randomizedInterleavings += 1;
      totals.roomSwitches += play.roomSwitches;
      assertInvariant("night-completes", isNightComplete(play.state), { seed, policy, turns: play.state.turn });
      assertInvariant("twenty-four-decisions", play.state.decisions.length === 24, { seed, policy, actual: play.state.decisions.length });
      assertInvariant("twenty-four-autonomous-pulses", play.state.ambientEvents.length === 24, { seed, policy, actual: play.state.ambientEvents.length });
      assertInvariant("interleaving-switches-rooms", play.roomSwitches >= 12, { seed, policy, actual: play.roomSwitches });
      const issues = validateNightState(pack, play.state);
      assertInvariant("played-state-validates", issues.length === 0, { seed, policy, issues });
      totals.stateValidationFailures += issues.length > 0 ? 1 : 0;
      const causal = inspectCausality(pack, play.state);
      assertInvariant("decision-causality-exactly-once", causal.decisionRoutesValid, { seed, policy });
      assertInvariant("autonomous-causality-exactly-once", causal.ambientRoutesValid, { seed, policy });
      assertInvariant("inbound-ledgers-exactly-once", causal.inboundLedgersValid, { seed, policy });

      const replay = replayActions(pack, play.actions, play.state.elapsedMinutes);
      const originalJson = canonicalStringify(play.state);
      const replayJson = canonicalStringify(replay);
      const replayMatches = replayJson === originalJson;
      assertInvariant("action-ledger-replays-exactly", replayMatches, { seed, policy });
      assertInvariant("replay-state-validates", validateNightState(pack, replay).length === 0, { seed, policy });
      totals.replayFailures += replayMatches ? 0 : 1;
      totals.replayedNights += replayMatches ? 1 : 0;
      totals.completedNights += isNightComplete(play.state) ? 1 : 0;
      totals.decisions += play.state.decisions.length;
      totals.decisionEffects += causal.decisionEffects;
      totals.localDecisionEffects += causal.localDecisionEffects;
      totals.remoteDecisionEffects += causal.remoteDecisionEffects;
      totals.autonomousPulses += play.state.ambientEvents.length;
      totals.autonomousEffects += causal.ambientEffects;
      totals.localAutonomousEffects += causal.localAmbientEffects;
      totals.remoteAutonomousEffects += causal.remoteAmbientEffects;
      finalStateDigest.update(`${originalJson}\n`);
      actionOrderDigest.update(`${canonicalStringify(play.actions)}\n`);

      if (offset < config.invalidStateSeedCount) {
        exerciseInvalidStates(pack, play.state, assertInvariant, totals);
      }
      if (offset < config.invalidActionSeedCount) {
        exerciseInvalidActions(pack, play.state, assertInvariant, totals);
      }
    }
  }

  assertInvariant("all-coherence-seeds-generated", totals.coherentNights === config.coherenceSeedCount, { actual: totals.coherentNights });
  assertInvariant("all-played-nights-completed", totals.completedNights === config.playedSeedCount, { actual: totals.completedNights });
  assertInvariant("all-played-nights-replayed", totals.replayedNights === config.playedSeedCount, { actual: totals.replayedNights });
  assertInvariant("no-choice-exhaustion", totals.choiceExhaustionFailures === 0, { actual: totals.choiceExhaustionFailures });
  assertInvariant("no-state-validation-failures", totals.stateValidationFailures === 0, { actual: totals.stateValidationFailures });
  assertInvariant("no-replay-failures", totals.replayFailures === 0, { actual: totals.replayFailures });

  const implementation = await implementationDigest();
  const reportWithoutDigest = {
    schema: "chorus.simulation-maturity-evidence.v1",
    releaseCandidate: "1.0.0-rc.1",
    deterministic: true,
    command: "node --experimental-strip-types --experimental-specifier-resolution=node scripts/run-simulation-evidence.mjs --write",
    executionContract: {
      runtime: "Node.js",
      minimumVersion: "22.13.0",
      networkRequired: false,
      wallClockDataCommitted: false,
    },
    source: {
      identity: "content-addressed",
      files: implementation.files,
      sha256: implementation.sha256,
    },
    seedDomain: {
      startInclusive: config.coherenceSeedStart,
      endExclusive: config.coherenceSeedStart + config.coherenceSeedCount,
      count: config.coherenceSeedCount,
      playedStartInclusive: config.coherenceSeedStart,
      playedEndExclusive: config.coherenceSeedStart + config.playedSeedCount,
      playedCount: config.playedSeedCount,
    },
    samples: {
      autonomousClockSeeds: config.autonomousSeedCount,
      deterministicRegenerationSeeds: config.determinismSeedCount,
      invalidStateSeeds: config.invalidStateSeedCount,
      invalidStateMutationsPerSeed: INVALID_STATE_MUTATIONS.length,
      invalidActionSeeds: config.invalidActionSeedCount,
      invalidActionAttemptsPerSeed: INVALID_ACTION_ATTEMPTS,
      choicePolicies: policyCounts,
    },
    results: {
      status: failures.length === 0 ? "pass" : "fail",
      assertions: assertionCount,
      invariantFailures: failures.length,
      validationFailures: totals.stateValidationFailures,
      ...totals,
      bounds: finalizeBounds(bounds),
      digests: {
        generatedPackSignaturesSha256: generationDigest.digest("hex"),
        completedStatesSha256: finalStateDigest.digest("hex"),
        actionOrdersSha256: actionOrderDigest.digest("hex"),
      },
      failures,
    },
    limitations: [
      "The run covers a deterministic finite seed domain; it is not a proof over every possible integer seed.",
      "Replay invariance means identical initial seed plus identical ordered action ledger; different action orders are intentionally allowed to produce different consequences.",
      "Normalized state metrics and fatigue are bounded to 0–100; reach is a non-negative safe integer because it is a cumulative audience count.",
      "The harness exercises four deterministic choice policies, not the combinatorial total of every possible 24-choice path.",
    ],
  };
  return {
    ...reportWithoutDigest,
    evidenceSha256: sha256(canonicalStringify(reportWithoutDigest)),
  };
}

function exerciseAutonomousClock(pack, assertInvariant, totals, bounds) {
  const initial = createNightState(pack);
  const arrivals = pack.scenarios.flatMap((scenario) => scenario.scenes.map((_, index) => sceneArrivalOffset(pack, scenario.id, index)));
  const uniqueArrivals = [...new Set(arrivals)].sort((left, right) => left - right);
  const lastArrival = uniqueArrivals.at(-1);
  const direct = advanceNightTo(pack, initial, lastArrival);
  let stepped = initial;
  for (const minute of uniqueArrivals.filter((minute) => minute > 0)) stepped = advanceNightTo(pack, stepped, minute);
  assertInvariant("stepped-and-direct-clock-equivalence", canonicalStringify(stepped) === canonicalStringify(direct), { seed: pack.seed });
  totals.steppedClockEquivalenceChecks += 1;
  assertInvariant("autonomous-clock-leaves-waiting-rooms-unentered", Object.values(direct.rooms).every((room) => !room.entered), { seed: pack.seed });
  assertInvariant("all-due-pulses-run-without-user-choice", direct.ambientEvents.length === 24 && direct.decisions.length === 0, { seed: pack.seed });
  assertInvariant("every-waiting-room-receives-twenty-remote-pulses", Object.values(direct.rooms).every((room) => room.inboundEventIds.length === 20 && new Set(room.inboundEventIds).size === 20), { seed: pack.seed });
  assertInvariant("waiting-room-state-evolves", pack.scenarios.every((scenario) => canonicalStringify(initial.rooms[scenario.id].metrics) !== canonicalStringify(direct.rooms[scenario.id].metrics)), { seed: pack.seed });
  assertInvariant("same-minute-read-is-idempotent", canonicalStringify(advanceNightTo(pack, direct, lastArrival)) === canonicalStringify(direct), { seed: pack.seed });
  totals.waitingRoomEvolutionChecks += pack.scenarios.length;

  const nextArrival = uniqueArrivals.find((minute) => minute > initial.elapsedMinutes);
  if (nextArrival !== undefined) {
    const before = advanceNightTo(pack, initial, nextArrival - 1);
    const atBoundary = advanceNightTo(pack, before, nextArrival);
    const expectedBefore = arrivals.filter((minute) => minute <= nextArrival - 1).length;
    const expectedAt = arrivals.filter((minute) => minute <= nextArrival).length;
    assertInvariant("pulse-waits-before-due-minute", before.ambientEvents.length === expectedBefore, { seed: pack.seed, expectedBefore, actual: before.ambientEvents.length });
    assertInvariant("pulse-fires-at-due-minute", atBoundary.ambientEvents.length === expectedAt, { seed: pack.seed, expectedAt, actual: atBoundary.ambientEvents.length });
    totals.dueBoundaryChecks += 2;
  }
  observeBounds(direct, bounds, assertInvariant, { seed: pack.seed, phase: "autonomous" });
}

function playInterleavedNight(pack, seed, policy, assertInvariant, bounds) {
  const random = createRandom((seed ^ 0x9e3779b9) >>> 0);
  let state = createNightState(pack);
  const actions = [];
  let exhausted = false;
  let iterations = 0;
  let previousRoom = null;
  let roomSwitches = 0;
  observeBounds(state, bounds, assertInvariant, { seed, phase: "initial" });

  while (!isNightComplete(state) && iterations < 200) {
    iterations += 1;
    const openUnentered = pack.scenarios
      .filter((scenario) => !state.rooms[scenario.id].entered && isRoomOpen(pack, state, scenario.id))
      .map((scenario) => scenario.id);
    for (const id of shuffled(openUnentered, random)) state = enterNightRoom(state, id);

    const actionable = pack.scenarios.filter((scenario) =>
      state.rooms[scenario.id].entered
      && !state.rooms[scenario.id].completed
      && isSceneDue(pack, state, scenario.id),
    );
    if (actionable.length === 0) {
      const nextMinute = nextRelevantMinute(pack, state);
      if (nextMinute === undefined) {
        exhausted = true;
        break;
      }
      state = advanceNightTo(pack, state, nextMinute);
      observeBounds(state, bounds, assertInvariant, { seed, phase: "clock", minute: nextMinute });
      continue;
    }

    const scenario = actionable[Math.floor(random() * actionable.length)];
    const room = state.rooms[scenario.id];
    const scene = scenario.scenes[room.sceneIndex];
    const available = scene.choices.filter((choice) => !choiceAccess(choice, room).locked);
    if (available.length === 0) {
      exhausted = true;
      assertInvariant("at-least-one-choice-remains-available", false, { seed, scenarioId: scenario.id, sceneId: scene.id, policy });
      break;
    }
    const choice = chooseChoice(available, policy, random);
    const startMinute = state.elapsedMinutes;
    const beforeTurn = state.turn;
    const next = applyNightChoice(pack, state, scenario.id, scene.id, choice.id);
    assertInvariant("playable-choice-advances-one-turn", next.turn === beforeTurn + 1, { seed, scenarioId: scenario.id, sceneId: scene.id, choiceId: choice.id });
    if (next.turn !== beforeTurn + 1) {
      exhausted = true;
      break;
    }
    actions.push({ sourceScenarioId: scenario.id, sourceSceneId: scene.id, choiceId: choice.id, startMinute });
    if (previousRoom && previousRoom !== scenario.id) roomSwitches += 1;
    previousRoom = scenario.id;
    state = next;
    observeBounds(state, bounds, assertInvariant, { seed, phase: "choice", turn: state.turn });
  }
  assertInvariant("play-loop-is-bounded", iterations < 200, { seed, policy, iterations });
  return { state, actions, exhausted, roomSwitches };
}

function replayActions(pack, actions, finalMinute) {
  let state = createNightState(pack);
  for (const action of actions) {
    state = advanceNightTo(pack, state, action.startMinute);
    state = enterNightRoom(state, action.sourceScenarioId);
    state = applyNightChoice(pack, state, action.sourceScenarioId, action.sourceSceneId, action.choiceId);
  }
  state = advanceNightTo(pack, state, finalMinute);
  for (const scenario of pack.scenarios) state = enterNightRoom(state, scenario.id);
  return state;
}

function inspectCausality(pack, state) {
  const inspectEvents = (events) => events.every((event) => {
    if (event.effects.length !== 6) return false;
    const local = event.effects.filter((effect) => effect.scope === "local");
    const remote = event.effects.filter((effect) => effect.scope === "cross-room");
    if (local.length !== 1 || local[0].targetScenarioId !== event.sourceScenarioId || remote.length !== 5) return false;
    if (new Set(event.effects.map((effect) => effect.targetScenarioId)).size !== 6) return false;
    return remote.every((effect) => {
      const link = pack.night.links.find((candidate) => candidate.sourceScenarioId === event.sourceScenarioId && candidate.targetScenarioId === effect.targetScenarioId);
      return link && effect.linkId === link.id && effect.layer === link.layer && effect.mechanism === link.mechanism;
    });
  });
  const allEvents = [...state.decisions, ...state.ambientEvents];
  const inboundLedgersValid = pack.scenarios.every((scenario) => {
    const expected = allEvents.flatMap((event) => event.effects.some((effect) => effect.scope === "cross-room" && effect.targetScenarioId === scenario.id) ? [event.id] : []);
    const actual = state.rooms[scenario.id].inboundEventIds;
    return sameSet(expected, actual) && new Set(actual).size === actual.length;
  });
  return {
    decisionRoutesValid: inspectEvents(state.decisions),
    ambientRoutesValid: inspectEvents(state.ambientEvents),
    inboundLedgersValid,
    decisionEffects: state.decisions.reduce((sum, event) => sum + event.effects.length, 0),
    localDecisionEffects: state.decisions.reduce((sum, event) => sum + event.effects.filter((effect) => effect.scope === "local").length, 0),
    remoteDecisionEffects: state.decisions.reduce((sum, event) => sum + event.effects.filter((effect) => effect.scope === "cross-room").length, 0),
    ambientEffects: state.ambientEvents.reduce((sum, event) => sum + event.effects.length, 0),
    localAmbientEffects: state.ambientEvents.reduce((sum, event) => sum + event.effects.filter((effect) => effect.scope === "local").length, 0),
    remoteAmbientEffects: state.ambientEvents.reduce((sum, event) => sum + event.effects.filter((effect) => effect.scope === "cross-room").length, 0),
  };
}

const INVALID_STATE_MUTATIONS = [
  ["seed-mismatch", (state) => { state.seed += 1; }, "STATE_SEED_MISMATCH"],
  ["turn-ledger-mismatch", (state) => { state.turn += 1; }, "TURN_LEDGER_MISMATCH"],
  ["fractional-clock", (state) => { state.elapsedMinutes += 0.5; }, "ELAPSED_MINUTE_RANGE"],
  ["missing-room", (state) => { delete state.rooms[Object.keys(state.rooms)[0]]; }, "ROOM_MISSING:"],
  ["duplicate-decision-id", (state) => { state.decisions[1].id = state.decisions[0].id; }, "DECISION_ID_DUPLICATE"],
  ["duplicate-processed-pulse", (state) => { state.processedPulseIds.push(state.processedPulseIds[0]); }, "PROCESSED_PULSE_ID_DUPLICATE"],
  ["ambient-ledger-gap", (state) => { state.ambientEvents.pop(); }, "PROCESSED_AMBIENT_LEDGER_MISMATCH"],
  ["ambient-from-future", (state) => { state.ambientEvents[0].atMinute = state.elapsedMinutes + 1; }, "AMBIENT_IDENTITY_MISMATCH:"],
  ["duplicate-effect-target", (state) => { state.decisions[0].effects[1].targetScenarioId = state.decisions[0].effects[0].targetScenarioId; }, "TARGET_DUPLICATE:"],
  ["normalized-metric-overflow", (state) => { state.rooms[Object.keys(state.rooms)[0]].metrics.heat = 101; }, "METRIC_RANGE:"],
  ["fractional-reach", (state) => { state.rooms[Object.keys(state.rooms)[0]].metrics.reach += 0.5; }, "METRIC_RANGE:"],
  ["fatigue-overflow", (state) => { state.rooms[Object.keys(state.rooms)[0]].fatigue.attentional = 101; }, "FATIGUE_RANGE:"],
  ["scene-completion-mismatch", (state) => { state.rooms[Object.keys(state.rooms)[0]].completed = false; }, "PREMATURE_COMPLETION_SNAPSHOT:"],
  ["inbound-event-duplicate", (state) => { const room = state.rooms[Object.keys(state.rooms)[0]]; room.inboundEventIds.push(room.inboundEventIds[0]); }, "INBOUND_EVENT_DUPLICATE:"],
  ["unknown-choice", (state) => { state.decisions[0].choiceId = "not-a-generated-choice"; }, "DECISION_CHOICE_UNKNOWN:"],
  ["fractional-decision-minute", (state) => { state.decisions[0].atMinute += 0.5; }, "DECISION_MINUTE_RANGE:"],
  ["forged-effect-metric", (state) => { state.decisions[0].effects[0].metrics.heat = 9.75; }, "STATE_REPLAY_MISMATCH"],
  ["forged-applied-reach", (state) => { state.decisions[0].effects[0].appliedReach += 1; }, "STATE_REPLAY_MISMATCH"],
  ["fabricated-support", (state) => { state.rooms[Object.keys(state.rooms)[0]].support.source = ["fabricated-event"]; }, "STATE_REPLAY_MISMATCH"],
  ["forged-choice-label", (state) => { state.decisions[0].choiceLabel = "A different retained label"; }, "STATE_REPLAY_MISMATCH"],
  ["consistently-renamed-event", (state) => {
    const original = state.decisions[0].id;
    const renamed = `${original}-renamed`;
    state.decisions[0].id = renamed;
    for (const room of Object.values(state.rooms)) {
      room.localDecisionIds = room.localDecisionIds.map((id) => id === original ? renamed : id);
      room.inboundEventIds = room.inboundEventIds.map((id) => id === original ? renamed : id);
      for (const system of Object.keys(room.support)) {
        room.support[system] = room.support[system]?.map((id) => id === original ? renamed : id);
      }
    }
  }, "STATE_REPLAY_MISMATCH"],
  ["null-room-metrics", (state) => { state.rooms[Object.keys(state.rooms)[0]].metrics = null; }, "STATE_STRUCTURE"],
  ["missing-room-fatigue", (state) => { delete state.rooms[Object.keys(state.rooms)[0]].fatigue; }, "STATE_STRUCTURE"],
  ["missing-decision-effects", (state) => { delete state.decisions[0].effects; }, "STATE_STRUCTURE"],
  ["null-decision", (state) => { state.decisions[0] = null; }, "STATE_STRUCTURE"],
  ["null-decision-effect", (state) => { state.decisions[0].effects[0] = null; }, "STATE_STRUCTURE"],
  ["null-ambient-event", (state) => { state.ambientEvents[0] = null; }, "STATE_STRUCTURE"],
];

function exerciseInvalidStates(pack, validState, assertInvariant, totals) {
  for (const [name, mutate, expectedIssue] of INVALID_STATE_MUTATIONS) {
    const state = structuredClone(validState);
    mutate(state);
    let issues;
    try {
      issues = validateNightState(pack, state);
    } catch (error) {
      assertInvariant("invalid-state-validation-does-not-throw", false, { seed: pack.seed, mutation: name, error: error instanceof Error ? error.message : String(error) });
      continue;
    }
    const rejected = issues.some((issue) => issue.startsWith(expectedIssue));
    assertInvariant("invalid-state-is-rejected", rejected, { seed: pack.seed, mutation: name, expectedIssue, issues });
    if (rejected) totals.invalidStateMutationsRejected += 1;
  }
}

const INVALID_ACTION_ATTEMPTS = 10;

function exerciseInvalidActions(pack, completedState, assertInvariant, totals) {
  const initial = createNightState(pack);
  const candidate = pack.scenarios.find((scenario) => sceneArrivalOffset(pack, scenario.id, 0) > initial.elapsedMinutes) ?? pack.scenarios[0];
  const room = initial.rooms[candidate.id];
  const scene = candidate.scenes[0];
  const available = scene.choices.find((choice) => !choiceAccess(choice, room).locked);
  const locked = scene.choices.find((choice) => choiceAccess(choice, room).locked);
  const entered = enterNightRoom(initial, candidate.id);
  const attempts = [
    ["negative-clock", advanceNightTo(pack, initial, -1), initial],
    ["nonfinite-clock", advanceNightTo(pack, initial, Number.NaN), initial],
    ["fractional-clock", advanceNightTo(pack, initial, 0.5), initial],
    ["backward-clock", advanceNightTo(pack, advanceNightTo(pack, initial, 10), 9), advanceNightTo(pack, initial, 10)],
    ["unknown-room-entry", enterNightRoom(initial, "unknown-room"), initial],
    ["unentered-choice", applyNightChoice(pack, initial, candidate.id, scene.id, available.id), initial],
    ["choice-before-artifact", applyNightChoice(pack, entered, candidate.id, scene.id, available.id), entered],
    ["stale-scene", applyNightChoice(pack, advanceNightTo(pack, entered, sceneArrivalOffset(pack, candidate.id, 0)), candidate.id, "stale-scene", available.id), advanceNightTo(pack, entered, sceneArrivalOffset(pack, candidate.id, 0))],
    ["locked-choice", locked ? applyNightChoice(pack, advanceNightTo(pack, entered, sceneArrivalOffset(pack, candidate.id, 0)), candidate.id, scene.id, locked.id) : entered, locked ? advanceNightTo(pack, entered, sceneArrivalOffset(pack, candidate.id, 0)) : entered],
    ["completed-room-choice", applyNightChoice(pack, completedState, candidate.id, scene.id, available.id), completedState],
  ];
  for (const [name, actual, expected] of attempts) {
    const noOp = canonicalStringify(actual) === canonicalStringify(expected);
    assertInvariant("invalid-action-is-no-op", noOp, { seed: pack.seed, action: name });
    if (noOp) totals.invalidActionNoOps += 1;
  }
}

function nextRelevantMinute(pack, state) {
  const openings = pack.scenarios
    .filter((scenario) => !state.rooms[scenario.id].entered)
    .map((scenario) => roomStartOffset(pack, scenario.id));
  const sceneArrivals = pack.scenarios
    .filter((scenario) => state.rooms[scenario.id].entered && !state.rooms[scenario.id].completed)
    .map((scenario) => sceneArrivalOffset(pack, scenario.id, state.rooms[scenario.id].sceneIndex));
  return [...openings, ...sceneArrivals]
    .filter((minute) => Number.isFinite(minute) && minute > state.elapsedMinutes)
    .sort((left, right) => left - right)[0];
}

function chooseChoice(available, policy, random) {
  if (policy === "last-available") return available.at(-1);
  if (policy === "repair-preferring") {
    return [...available].sort((left, right) => repairScore(right) - repairScore(left) || left.id.localeCompare(right.id))[0];
  }
  if (policy === "refusal-floor") return available.find((choice) => choice.ethicsTags.includes("non-amplification-floor")) ?? available[0];
  return available[Math.floor(random() * available.length)];
}

function repairScore(choice) {
  return (choice.ideal ? 100 : 0)
    + (choice.ethicsTags.includes("distributed-unlock") ? 60 : 0)
    + Math.max(0, choice.effects.provenance ?? 0)
    + Math.max(0, choice.effects.verification ?? 0)
    + Math.max(0, choice.effects.trust ?? 0);
}

function createBounds() {
  return {
    stateObservations: 0,
    roomObservations: 0,
    reach: { minimum: Number.POSITIVE_INFINITY, maximum: Number.NEGATIVE_INFINITY },
    normalizedMetrics: Object.fromEntries(METRIC_NAMES.map((metric) => [metric, { minimum: Number.POSITIVE_INFINITY, maximum: Number.NEGATIVE_INFINITY }])),
    fatigue: Object.fromEntries(FATIGUE_KINDS.map((kind) => [kind, { minimum: Number.POSITIVE_INFINITY, maximum: Number.NEGATIVE_INFINITY }])),
  };
}

function observeBounds(state, bounds, assertInvariant, context) {
  bounds.stateObservations += 1;
  for (const room of Object.values(state.rooms)) {
    bounds.roomObservations += 1;
    bounds.reach.minimum = Math.min(bounds.reach.minimum, room.metrics.reach);
    bounds.reach.maximum = Math.max(bounds.reach.maximum, room.metrics.reach);
    let bounded = Number.isSafeInteger(room.metrics.reach) && room.metrics.reach >= 0;
    for (const metric of METRIC_NAMES) {
      const value = room.metrics[metric];
      bounds.normalizedMetrics[metric].minimum = Math.min(bounds.normalizedMetrics[metric].minimum, value);
      bounds.normalizedMetrics[metric].maximum = Math.max(bounds.normalizedMetrics[metric].maximum, value);
      bounded &&= Number.isFinite(value) && value >= 0 && value <= 100;
    }
    for (const kind of FATIGUE_KINDS) {
      const value = room.fatigue[kind];
      bounds.fatigue[kind].minimum = Math.min(bounds.fatigue[kind].minimum, value);
      bounds.fatigue[kind].maximum = Math.max(bounds.fatigue[kind].maximum, value);
      bounded &&= Number.isFinite(value) && value >= 0 && value <= 100;
    }
    assertInvariant("intermediate-state-remains-bounded", bounded, { ...context, scenarioId: room.scenarioId });
  }
}

function finalizeBounds(bounds) {
  const normalize = (record) => Object.fromEntries(Object.entries(record).map(([key, value]) => [key, {
    minimum: round(value.minimum),
    maximum: round(value.maximum),
  }]));
  return {
    stateObservations: bounds.stateObservations,
    roomObservations: bounds.roomObservations,
    reach: { minimum: round(bounds.reach.minimum), maximum: round(bounds.reach.maximum), rule: "non-negative safe integer" },
    normalizedMetrics: normalize(bounds.normalizedMetrics),
    fatigue: normalize(bounds.fatigue),
    normalizedRule: "finite and within 0–100 inclusive",
  };
}

function packSignature(pack) {
  return {
    seed: pack.seed,
    generatorVersion: pack.generatorVersion,
    night: {
      id: pack.night.id,
      startTime: pack.night.startTime,
      links: pack.night.links.map((link) => ({
        id: link.id,
        sourceScenarioId: link.sourceScenarioId,
        targetScenarioId: link.targetScenarioId,
        layer: link.layer,
        mechanism: link.mechanism,
        strength: link.strength,
        repairCapacity: link.repairCapacity,
      })),
    },
    scenarios: pack.scenarios.map((scenario) => ({
      id: scenario.id,
      actorKind: scenario.protagonistModel.kind,
      dynamic: scenario.communicationModel.dynamic,
      beneficiary: scenario.communicationModel.misrepresentation.beneficiary,
      activeCodeId: scenario.protagonistModel.languageProfile.primaryCodeId,
      audienceCeiling: scenario.audienceCeiling,
      scenes: scenario.scenes.map((scene) => ({
        id: scene.id,
        act: scene.act,
        time: scene.time,
        autonomous: scene.autonomous,
        platformLoad: scene.platformLoad,
        choices: scene.choices.map((choice) => ({
          id: choice.id,
          availability: choice.availability.status,
          ideal: choice.ideal,
          minutes: choice.minutes,
          effects: choice.effects,
          fatigueLoad: choice.fatigueLoad,
          behaviorMove: choice.behaviorMove,
          codeAction: choice.codeAction,
        })),
      })),
    })),
    reports: [pack.nightReport, ...pack.reports].map((report) => ({
      scenarioId: report.scenarioId,
      passed: report.passed,
      score: report.score,
      checks: report.checks.map((check) => [check.id, check.passed, check.severity]),
    })),
  };
}

async function implementationDigest() {
  const hash = createHash("sha256");
  const files = [];
  for (const relativePath of SOURCE_FILES) {
    const content = await readFile(path.join(ROOT, relativePath));
    const fileHash = sha256(content);
    files.push({ path: relativePath, sha256: fileHash, bytes: content.byteLength });
    hash.update(`${relativePath}\0${fileHash}\n`);
  }
  return { files, sha256: hash.digest("hex") };
}

function createRandom(seed) {
  let state = seed || 0x6d2b79f5;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    return state / 0x1_0000_0000;
  };
}

function shuffled(values, random) {
  const copy = [...values];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [copy[index], copy[target]] = [copy[target], copy[index]];
  }
  return copy;
}

function sameSet(left, right) {
  return left.length === right.length && [...left].sort().every((value, index) => value === [...right].sort()[index]);
}

function round(value) {
  return Number(value.toFixed(6));
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function canonicalStringify(value) {
  if (Array.isArray(value)) return `[${value.map((item) => canonicalStringify(item)).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalStringify(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function validateConfig(config) {
  const counts = Object.entries(config);
  for (const [name, value] of counts) {
    if (!Number.isSafeInteger(value) || value < 0) throw new TypeError(`${name} must be a non-negative safe integer.`);
  }
  for (const name of ["playedSeedCount", "autonomousSeedCount", "determinismSeedCount", "invalidStateSeedCount", "invalidActionSeedCount"]) {
    if (config[name] > config.coherenceSeedCount) throw new RangeError(`${name} cannot exceed coherenceSeedCount.`);
  }
}

async function main() {
  const check = process.argv.includes("--check");
  const outputArg = process.argv.indexOf("--output");
  const output = outputArg >= 0 ? path.resolve(process.argv[outputArg + 1]) : DEFAULT_OUTPUT;
  const report = await runSimulationEvidence();
  const text = `${JSON.stringify(report, null, 2)}\n`;
  if (check) {
    const existing = await readFile(output, "utf8");
    if (existing !== text) throw new Error(`Simulation evidence drifted: ${path.relative(ROOT, output)}`);
  } else {
    await writeFile(output, text);
  }
  process.stdout.write(`${report.results.status.toUpperCase()} ${report.results.assertions} assertions; ${report.results.invariantFailures} failures; ${report.evidenceSha256}\n`);
  if (report.results.status !== "pass") process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
