import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_SAVE_PREFERENCE,
  MAX_PORTABLE_SAVE_BYTES,
  PORTABLE_SAVE_FORMAT,
  PORTABLE_SAVE_SCHEMA_VERSION,
  SaveModelError,
  clearLocalSlot,
  createPortableSave,
  deterministicDigest,
  grantLocalSlotConsent,
  inspectLocalSlots,
  inspectPortableSave,
  legacyLocalSlotKey,
  loadLocalSlot,
  localSlotKey,
  parsePortableSave,
  saveLocalSlot,
} from "../app/save-model.ts";
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
  sceneArrivalOffset,
} from "../app/night-engine.ts";

const EXPORTED_AT = "2026-08-18T17:00:00.000Z";
const FORBIDDEN_PERSISTED_TOKENS = /state|rooms|effects|choiceLabel|intent|signal|relationalMove|conversationDiversion|codeTransition|lastResort|frameworkMoves|vagueCue|revealedCue|ambientEvents|processedPulseIds|activeCodeId|switchReason|repertoire|misrepresentation|actorMotive|privateKnowledge/i;

class MemoryStorage {
  values = new Map();
  reads = 0;
  writes = 0;
  removals = 0;

  getItem(key) {
    this.reads += 1;
    return this.values.get(key) ?? null;
  }

  setItem(key, value) {
    this.writes += 1;
    this.values.set(key, value);
  }

  removeItem(key) {
    this.removals += 1;
    this.values.delete(key);
  }
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function oneDecisionState(seed = 0x43484f52) {
  const pack = generateScenarioPack(seed);
  let state = createNightState(pack);
  const scenario = pack.scenarios.find((candidate) => isRoomOpen(pack, state, candidate.id));
  assert.ok(scenario);
  state = enterNightRoom(state, scenario.id);
  const scene = scenario.scenes[0];
  const choice = scene.choices.find((candidate) => !choiceAccess(candidate, state.rooms[scenario.id]).locked);
  assert.ok(choice);
  state = applyNightChoice(pack, state, scenario.id, scene.id, choice.id);
  assert.equal(state.turn, 1);
  return { pack, state, scenario, scene, choice };
}

function oneCodeSwitchState() {
  for (let seed = 0; seed < 100; seed += 1) {
    const pack = generateScenarioPack(seed);
    for (const scenario of pack.scenarios) {
      let state = createNightState(pack);
      state = advanceNightTo(pack, state, sceneArrivalOffset(pack, scenario.id, 0));
      state = enterNightRoom(state, scenario.id);
      const choice = scenario.scenes[0].choices.find((candidate) =>
        candidate.codeAction?.mode === "switch"
        && candidate.codeAction.toCodeId !== scenario.protagonistModel.languageProfile.primaryCodeId
        && !choiceAccess(candidate, state.rooms[scenario.id]).locked
      );
      if (!choice) continue;
      const next = applyNightChoice(pack, state, scenario.id, scenario.scenes[0].id, choice.id);
      if (next.turn !== 1 || next.rooms[scenario.id].activeCodeId === state.rooms[scenario.id].activeCodeId) continue;
      return { pack, state: next, scenario, choice };
    }
  }
  assert.fail("expected a playable generated register switch");
}

function completeNight(seed = 0) {
  const pack = generateScenarioPack(seed);
  let state = createNightState(pack);
  for (const scenario of pack.scenarios) state = enterNightRoom(state, scenario.id);
  for (let guard = 0; guard < 300 && !isNightComplete(state); guard += 1) {
    const scenario = pack.scenarios.find((candidate) =>
      !state.rooms[candidate.id].completed && isSceneDue(pack, state, candidate.id)
    );
    if (!scenario) {
      const nextMinute = pack.scenarios
        .filter((candidate) => !state.rooms[candidate.id].completed)
        .map((candidate) => sceneArrivalOffset(pack, candidate.id, state.rooms[candidate.id].sceneIndex))
        .filter((minute) => minute > state.elapsedMinutes)
        .sort((left, right) => left - right)[0];
      assert.ok(Number.isFinite(nextMinute));
      state = advanceNightTo(pack, state, nextMinute);
      continue;
    }
    const room = state.rooms[scenario.id];
    const scene = scenario.scenes[room.sceneIndex];
    const choice = scene.choices.find((candidate) => !choiceAccess(candidate, room).locked);
    assert.ok(choice);
    const next = applyNightChoice(pack, state, scenario.id, scene.id, choice.id);
    assert.equal(next.turn, state.turn + 1);
    state = next;
  }
  assert.ok(isNightComplete(state));
  return { pack, state };
}

function envelopeFrom(text) {
  return JSON.parse(text.slice(text.indexOf("\n") + 1));
}

function withFreshIntegrity(envelope) {
  const { integrity: omitted, ...unsigned } = envelope;
  void omitted;
  return {
    ...unsigned,
    integrity: { algorithm: "fnv1a-32", digest: deterministicDigest(unsigned) },
  };
}

function legacyV1Text(state, exportedAt = EXPORTED_AT) {
  const pack = generateScenarioPack(state.seed);
  const unsigned = {
    format: PORTABLE_SAVE_FORMAT,
    schemaVersion: 1,
    provenance: {
      app: "CHORUS",
      generatorVersion: Number(pack.generatorVersion),
      exportedAt,
      exportMode: "player-controlled",
      storageScope: "portable-text",
      networkRequired: false,
    },
    payload: { seed: state.seed, state: clone(state) },
  };
  return `CHORUS SAVE · 1\n${JSON.stringify(withFreshIntegrity(unsigned))}\n`;
}

function legacyV0Object(state, exportedAt = EXPORTED_AT) {
  const pack = generateScenarioPack(state.seed);
  const unsigned = {
    format: PORTABLE_SAVE_FORMAT,
    schemaVersion: 0,
    generatorVersion: Number(pack.generatorVersion),
    exportedAt,
    seed: state.seed,
    state: clone(state),
  };
  return withFreshIntegrity(unsigned);
}

function stringLeaves(value) {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(stringLeaves);
  if (value && typeof value === "object") return Object.values(value).flatMap(stringLeaves);
  return [];
}

function assertTraceOnly(text) {
  const envelope = envelopeFrom(text);
  assert.equal(envelope.schemaVersion, 2);
  assert.deepEqual(Object.keys(envelope.payload).sort(), ["decisions", "elapsedMinutes", "enteredRoomOrdinals", "seed"]);
  assert.equal(stringLeaves(envelope.payload).length, 0);
  assert.doesNotMatch(JSON.stringify(envelope.payload), FORBIDDEN_PERSISTED_TOKENS);
  for (const decision of envelope.payload.decisions) {
    assert.deepEqual(Object.keys(decision).sort(), ["choiceOrdinal", "roomOrdinal", "startMinute"]);
  }
  return envelope;
}

function expectCode(code) {
  return (error) => error instanceof SaveModelError && error.code === code;
}

test("the save model defaults to memory only and performs no storage I/O", () => {
  const storage = new MemoryStorage();
  assert.deepEqual(DEFAULT_SAVE_PREFERENCE, {
    mode: "memory-only",
    activeSlot: null,
    autosave: false,
    localWrites: false,
    networkWrites: false,
  });
  assert.deepEqual([storage.reads, storage.writes, storage.removals], [0, 0, 0]);
});

test("a denied slot read is distinguished from corrupt saved text", () => {
  const deniedStorage = {
    getItem() { throw new Error("read denied"); },
    setItem() { throw new Error("not used"); },
    removeItem() { throw new Error("not used"); },
  };
  const inspections = inspectLocalSlots(deniedStorage);
  assert.equal(inspections.length, 3);
  assert.ok(inspections.every((inspection) =>
    inspection.status === "invalid" && inspection.errorCode === "STORAGE_UNAVAILABLE"
  ));
});

test("schema-2 portable text round-trips a partial night and exposes a bounded preview", () => {
  const { state } = oneDecisionState();
  const text = createPortableSave(state, { exportedAt: EXPORTED_AT });
  const envelope = assertTraceOnly(text);
  assert.equal(PORTABLE_SAVE_SCHEMA_VERSION, 2);
  assert.ok(text.startsWith("CHORUS SAVE · 2\n"));
  assert.ok(Buffer.byteLength(text, "utf8") < MAX_PORTABLE_SAVE_BYTES);
  assert.equal(envelope.payload.decisions.length, 1);

  const parsed = parsePortableSave(text);
  assert.deepEqual(parsed.state, clone(state));
  assert.deepEqual(parsed.preview, {
    format: PORTABLE_SAVE_FORMAT,
    schemaVersion: 2,
    generatorVersion: 15,
    exportedAt: EXPORTED_AT,
    seed: state.seed,
    turn: 1,
    elapsedMinutes: state.elapsedMinutes,
    enteredRooms: 1,
    completedRooms: 0,
  });
  assert.equal(parsed.migratedFrom, null);
  assert.equal("state" in inspectPortableSave(text), false);
  assert.equal(JSON.stringify(parsed.preview).includes("choiceLabel"), false);
});

test("zero-decision, partial, and completed saves contain only numeric traces and restore exactly", () => {
  const zeroPack = generateScenarioPack(81);
  let zeroState = createNightState(zeroPack);
  zeroState = enterNightRoom(zeroState, zeroPack.scenarios[2].id);
  zeroState = advanceNightTo(zeroPack, zeroState, 3);
  const partial = oneDecisionState(82).state;
  const complete = completeNight(83).state;

  for (const state of [zeroState, partial, complete]) {
    const text = createPortableSave(state, { exportedAt: EXPORTED_AT });
    const envelope = assertTraceOnly(text);
    assert.equal(envelope.payload.decisions.length, state.turn);
    assert.deepEqual(parsePortableSave(text).state, clone(state));
  }
  assert.equal(complete.turn, 24);
});

test("historical v13 and v14 scenario models report a version mismatch before trace replay", () => {
  const { state } = oneDecisionState(89);
  for (const generatorVersion of [13, 14]) {
    const envelope = envelopeFrom(createPortableSave(state, { exportedAt: EXPORTED_AT }));
    envelope.provenance.generatorVersion = generatorVersion;
    assert.throws(() => parsePortableSave(JSON.stringify(withFreshIntegrity(envelope))), expectCode("GENERATOR_VERSION_MISMATCH"));
  }
});

test("an ordinary trace mutation fails the deterministic corruption check", () => {
  const { state } = oneDecisionState(84);
  const envelope = envelopeFrom(createPortableSave(state, { exportedAt: EXPORTED_AT }));
  envelope.payload.elapsedMinutes += 1;
  assert.throws(() => parsePortableSave(JSON.stringify(envelope)), expectCode("INTEGRITY_MISMATCH"));
});

test("fresh-digest prose smuggling and unknown fields fail exact-key validation", () => {
  const { state } = oneDecisionState(85);
  const envelope = envelopeFrom(createPortableSave(state, { exportedAt: EXPORTED_AT }));
  envelope.payload.summary = "Sealed analytic conclusion";
  assert.throws(() => parsePortableSave(JSON.stringify(withFreshIntegrity(envelope))), expectCode("INVALID_STRUCTURE"));

  const nested = envelopeFrom(createPortableSave(state, { exportedAt: EXPORTED_AT }));
  nested.payload.decisions[0].choiceLabel = "A generated choice label";
  assert.throws(() => parsePortableSave(JSON.stringify(withFreshIntegrity(nested))), expectCode("INVALID_STRUCTURE"));
});

test("raw duplicate JSON members cannot hide prose behind a digest-valid trace", () => {
  const { state } = oneDecisionState(90);
  const text = createPortableSave(state, { exportedAt: EXPORTED_AT });

  const escapedDuplicateSeed = text.replace(
    '    "seed": ',
    '    "se\\u0065d": "activeCodeId protected motive",\n    "seed": ',
  );
  assert.notEqual(escapedDuplicateSeed, text);
  assert.throws(() => parsePortableSave(escapedDuplicateSeed), expectCode("INVALID_STRUCTURE"));

  const shadowPayload = text.replace(
    '  "payload": {',
    '  "payload": {"seed": "misrepresentation protected motive"},\n  "payload": {',
  );
  assert.notEqual(shadowPayload, text);
  assert.throws(() => parsePortableSave(shadowPayload), expectCode("INVALID_STRUCTURE"));
});

test("recomputed digests cannot make impossible coordinates or incomplete entry sets replay", () => {
  const { state } = oneDecisionState(86);
  const original = envelopeFrom(createPortableSave(state, { exportedAt: EXPORTED_AT }));
  const attacks = [
    (envelope) => { envelope.payload.decisions[0].choiceOrdinal = 15; },
    (envelope) => { envelope.payload.decisions[0].startMinute = envelope.payload.elapsedMinutes; },
    (envelope) => { envelope.payload.enteredRoomOrdinals = []; },
    (envelope) => { envelope.payload.enteredRoomOrdinals = [0, 0]; },
  ];
  for (const attack of attacks) {
    const envelope = clone(original);
    attack(envelope);
    assert.throws(() => parsePortableSave(JSON.stringify(withFreshIntegrity(envelope))), expectCode("STATE_INVALID"));
  }
});

test("a fresh digest can describe another valid history and therefore is not authentication", () => {
  let fixture;
  for (let seed = 0; seed < 100 && !fixture; seed += 1) {
    const candidate = oneDecisionState(seed);
    const initial = enterNightRoom(createNightState(candidate.pack), candidate.scenario.id);
    const alternatives = candidate.scene.choices
      .map((choice, ordinal) => ({ choice, ordinal }))
      .filter(({ choice }) => !choiceAccess(choice, initial.rooms[candidate.scenario.id]).locked && choice.id !== candidate.choice.id);
    if (alternatives.length) fixture = { ...candidate, alternativeOrdinal: alternatives[0].ordinal };
  }
  assert.ok(fixture);
  const envelope = envelopeFrom(createPortableSave(fixture.state, { exportedAt: EXPORTED_AT }));
  envelope.payload.decisions[0].choiceOrdinal = fixture.alternativeOrdinal;
  const parsed = parsePortableSave(JSON.stringify(withFreshIntegrity(envelope)));
  assert.equal(parsed.state.turn, 1);
  assert.notDeepEqual(parsed.state, clone(fixture.state));
});

test("an enacted register switch is reconstructed without persisting its linguistic record", () => {
  const { state, scenario, choice } = oneCodeSwitchState();
  const transition = state.decisions[0].codeTransition;
  assert.ok(transition);
  assert.equal(transition.fromCodeId, scenario.protagonistModel.languageProfile.primaryCodeId);
  assert.equal(transition.toCodeId, choice.codeAction.toCodeId);
  const text = createPortableSave(state, { exportedAt: EXPORTED_AT });
  assertTraceOnly(text);
  assert.doesNotMatch(text, new RegExp(transition.switchReason.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
  assert.deepEqual(parsePortableSave(text).state, clone(state));
});

test("local slots require consent, use the v2 key, and retire a selected legacy slot", () => {
  const { state } = oneDecisionState(87);
  const storage = new MemoryStorage();
  storage.values.set(legacyLocalSlotKey("B"), legacyV1Text(state));
  assert.throws(
    () => saveLocalSlot(storage, null, state, { exportedAt: EXPORTED_AT }),
    expectCode("SLOT_CONSENT_REQUIRED"),
  );
  assert.equal(storage.writes, 0);

  const consentB = grantLocalSlotConsent("B");
  const preview = saveLocalSlot(storage, consentB, state, { exportedAt: EXPORTED_AT });
  assert.equal(preview.seed, 87);
  assert.equal(storage.writes, 1);
  assert.equal(storage.removals, 1);
  assert.deepEqual([...storage.values.keys()], [localSlotKey("B")]);
  assertTraceOnly(storage.values.get(localSlotKey("B")));
  assert.deepEqual(loadLocalSlot(storage, "B").state, clone(state));

  clearLocalSlot(storage, consentB);
  assert.equal(storage.removals, 3);
  assert.equal(storage.values.has(localSlotKey("B")), false);
  assert.equal(storage.values.has(legacyLocalSlotKey("B")), false);
});

test("legacy slot inventory and load migrate in memory without implicit writes", () => {
  const { state } = oneDecisionState(88);
  const storage = new MemoryStorage();
  storage.values.set(legacyLocalSlotKey("A"), legacyV1Text(state));
  assert.equal(storage.reads, 0);
  const slots = inspectLocalSlots(storage);
  assert.equal(storage.reads, 6);
  assert.equal(storage.writes, 0);
  assert.equal(storage.removals, 0);
  assert.deepEqual(slots.map(({ slot, status }) => [slot, status]), [
    ["A", "ready"],
    ["B", "empty"],
    ["C", "empty"],
  ]);
  const loaded = loadLocalSlot(storage, "A");
  assert.equal(loaded.migratedFrom, 1);
  assert.deepEqual(loaded.state, clone(state));
  assert.equal(storage.writes, 0);
  assert.equal(storage.removals, 0);
});

test("a corrupt current slot is not hidden by a valid stale legacy slot", () => {
  const { state } = oneDecisionState(90);
  const storage = new MemoryStorage();
  storage.values.set(localSlotKey("A"), "not a save");
  storage.values.set(legacyLocalSlotKey("A"), legacyV1Text(state));
  const slots = inspectLocalSlots(storage);
  assert.equal(slots[0].status, "invalid");
  assert.throws(() => loadLocalSlot(storage, "A"));
  assert.equal(storage.writes, 0);
});

test("schema 1 verifies and replays its full state before in-memory trace migration", () => {
  const { state } = oneCodeSwitchState();
  const text = legacyV1Text(state);
  const parsed = parsePortableSave(text);
  assert.equal(parsed.migratedFrom, 1);
  assert.equal(parsed.preview.schemaVersion, 2);
  assert.deepEqual(parsed.state, clone(state));

  const nextText = createPortableSave(parsed.state, { exportedAt: EXPORTED_AT });
  assertTraceOnly(nextText);
  assert.ok(nextText.startsWith("CHORUS SAVE · 2\n"));
});

test("schema-1 prose tampering with a fresh checksum still fails canonical legacy replay", () => {
  const { state } = oneCodeSwitchState();
  const envelope = envelopeFrom(legacyV1Text(state));
  envelope.payload.state.decisions[0].codeTransition.switchReason += " altered";
  assert.throws(() => parsePortableSave(JSON.stringify(withFreshIntegrity(envelope))), expectCode("STATE_INVALID"));
});

test("schema 0 verifies its checksum and state before migration to schema 2", () => {
  const pack = generateScenarioPack(91);
  const state = createNightState(pack);
  const parsed = parsePortableSave(JSON.stringify(legacyV0Object(state)));
  assert.equal(parsed.migratedFrom, 0);
  assert.equal(parsed.preview.schemaVersion, 2);
  assert.deepEqual(parsed.state, state);
});

test("oversized, deep, foreign, mismatched-header, and unsupported inputs fail closed", () => {
  assert.throws(() => parsePortableSave("x".repeat(MAX_PORTABLE_SAVE_BYTES + 1)), expectCode("SAVE_TOO_LARGE"));
  assert.throws(() => parsePortableSave("FOG OF SEA\n{}"), expectCode("INVALID_FORMAT"));
  assert.throws(
    () => parsePortableSave(JSON.stringify({ format: PORTABLE_SAVE_FORMAT, schemaVersion: 99 })),
    expectCode("UNSUPPORTED_SCHEMA"),
  );

  const { state } = oneDecisionState(92);
  const mislabeled = createPortableSave(state, { exportedAt: EXPORTED_AT }).replace("CHORUS SAVE · 2", "CHORUS SAVE · 1");
  assert.throws(() => parsePortableSave(mislabeled), expectCode("INVALID_FORMAT"));

  let deep = null;
  for (let index = 0; index < 60; index += 1) deep = { next: deep };
  assert.throws(() => parsePortableSave(JSON.stringify(deep)), expectCode("INVALID_STRUCTURE"));
});
