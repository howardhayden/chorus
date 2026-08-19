import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_SAVE_PREFERENCE,
  MAX_PORTABLE_SAVE_BYTES,
  PORTABLE_SAVE_FORMAT,
  SaveModelError,
  clearLocalSlot,
  createPortableSave,
  deterministicDigest,
  grantLocalSlotConsent,
  inspectLocalSlots,
  inspectPortableSave,
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
  isRoomOpen,
  sceneArrivalOffset,
} from "../app/night-engine.ts";

const EXPORTED_AT = "2026-08-18T17:00:00.000Z";

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
  return { pack, state };
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
        && !choiceAccess(candidate, state.rooms[scenario.id]).locked,
      );
      if (!choice) continue;
      const truthBefore = JSON.stringify(scenario.truth);
      const activeBefore = state.rooms[scenario.id].activeCodeId;
      const next = applyNightChoice(pack, state, scenario.id, scenario.scenes[0].id, choice.id);
      if (next.turn !== 1 || next.rooms[scenario.id].activeCodeId === activeBefore) continue;
      assert.equal(JSON.stringify(scenario.truth), truthBefore);
      return { pack, state: next, scenario, choice };
    }
  }
  assert.fail("expected a playable generated register switch");
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

test("portable text round-trips a reconstructed night and exposes a bounded preview", () => {
  const { state } = oneDecisionState();
  const text = createPortableSave(state, { exportedAt: EXPORTED_AT });
  assert.ok(text.startsWith("CHORUS SAVE · 1\n"));
  assert.ok(Buffer.byteLength(text, "utf8") < MAX_PORTABLE_SAVE_BYTES);

  const parsed = parsePortableSave(text);
  assert.deepEqual(parsed.state, JSON.parse(JSON.stringify(state)));
  assert.deepEqual(parsed.preview, {
    format: PORTABLE_SAVE_FORMAT,
    schemaVersion: 1,
    generatorVersion: 13,
    exportedAt: EXPORTED_AT,
    seed: state.seed,
    turn: 1,
    elapsedMinutes: state.elapsedMinutes,
    enteredRooms: 1,
    completedRooms: 0,
  });
  assert.equal("state" in inspectPortableSave(text), false);
  assert.equal(JSON.stringify(parsed.preview).includes("choiceLabel"), false);
});

test("an earlier scenario model reports a version mismatch before ledger replay", () => {
  const { state } = oneDecisionState(89);
  const envelope = envelopeFrom(createPortableSave(state, { exportedAt: EXPORTED_AT }));
  envelope.provenance.generatorVersion = 12;
  const earlier = withFreshIntegrity(envelope);
  assert.throws(() => parsePortableSave(JSON.stringify(earlier)), expectCode("GENERATOR_VERSION_MISMATCH"));
});

test("an ordinary text mutation fails the deterministic corruption check", () => {
  const { state } = oneDecisionState(84);
  const envelope = envelopeFrom(createPortableSave(state, { exportedAt: EXPORTED_AT }));
  envelope.payload.state.elapsedMinutes += 1;
  assert.throws(() => parsePortableSave(JSON.stringify(envelope)), expectCode("INTEGRITY_MISMATCH"));
});

test("a recomputed checksum cannot make a fabricated state reproducible", () => {
  const { state } = oneDecisionState(85);
  const envelope = envelopeFrom(createPortableSave(state, { exportedAt: EXPORTED_AT }));
  const roomId = Object.keys(envelope.payload.state.rooms)[0];
  envelope.payload.state.rooms[roomId].metrics.trust += 1;
  const tampered = withFreshIntegrity(envelope);
  assert.throws(() => parsePortableSave(JSON.stringify(tampered)), expectCode("STATE_INVALID"));
});

test("an enacted register switch survives replay and rejects active-code or transition tampering", () => {
  const { state, scenario, choice } = oneCodeSwitchState();
  const transition = state.decisions[0].codeTransition;
  assert.ok(transition);
  assert.equal(transition.fromCodeId, scenario.protagonistModel.languageProfile.primaryCodeId);
  assert.equal(transition.toCodeId, choice.codeAction.toCodeId);
  assert.equal(state.rooms[scenario.id].activeCodeId, transition.toCodeId);
  assert.ok(Object.keys(transition.switchLoad).every((kind) => ["attentional", "relational"].includes(kind)));

  const text = createPortableSave(state, { exportedAt: EXPORTED_AT });
  assert.deepEqual(parsePortableSave(text).state, JSON.parse(JSON.stringify(state)));

  const activeCodeEnvelope = envelopeFrom(text);
  activeCodeEnvelope.payload.state.rooms[scenario.id].activeCodeId = transition.fromCodeId;
  assert.throws(
    () => parsePortableSave(JSON.stringify(withFreshIntegrity(activeCodeEnvelope))),
    expectCode("STATE_INVALID"),
  );

  const transitionEnvelope = envelopeFrom(text);
  transitionEnvelope.payload.state.decisions[0].codeTransition.switchReason += " altered";
  assert.throws(
    () => parsePortableSave(JSON.stringify(withFreshIntegrity(transitionEnvelope))),
    expectCode("STATE_INVALID"),
  );
});

test("local slots require an explicit slot capability and only touch the selected key", () => {
  const { state } = oneDecisionState(86);
  const storage = new MemoryStorage();
  assert.throws(
    () => saveLocalSlot(storage, null, state, { exportedAt: EXPORTED_AT }),
    expectCode("SLOT_CONSENT_REQUIRED"),
  );
  assert.equal(storage.writes, 0);

  const consentB = grantLocalSlotConsent("B");
  const preview = saveLocalSlot(storage, consentB, state, { exportedAt: EXPORTED_AT });
  assert.equal(preview.seed, 86);
  assert.equal(storage.writes, 1);
  assert.deepEqual([...storage.values.keys()], [localSlotKey("B")]);
  assert.deepEqual(loadLocalSlot(storage, "B").state, JSON.parse(JSON.stringify(state)));

  clearLocalSlot(storage, consentB);
  assert.equal(storage.removals, 1);
  assert.equal(storage.values.has(localSlotKey("B")), false);
});

test("slot inventory reads only when called and isolates corrupt entries", () => {
  const storage = new MemoryStorage();
  storage.values.set(localSlotKey("A"), "not a save");
  assert.equal(storage.reads, 0);
  const slots = inspectLocalSlots(storage);
  assert.equal(storage.reads, 3);
  assert.deepEqual(slots.map(({ slot, status }) => [slot, status]), [
    ["A", "invalid"],
    ["B", "empty"],
    ["C", "empty"],
  ]);
});

test("schema 0 uses the migration hook after validating its own checksum", () => {
  const pack = generateScenarioPack(87);
  const state = createNightState(pack);
  const unsignedV0 = {
    format: PORTABLE_SAVE_FORMAT,
    schemaVersion: 0,
    generatorVersion: Number(pack.generatorVersion),
    exportedAt: EXPORTED_AT,
    seed: state.seed,
    state,
  };
  const v0 = {
    ...unsignedV0,
    integrity: { algorithm: "fnv1a-32", digest: deterministicDigest(unsignedV0) },
  };
  const parsed = parsePortableSave(JSON.stringify(v0));
  assert.equal(parsed.migratedFrom, 0);
  assert.deepEqual(parsed.state, state);
});

test("oversized, deep, foreign, and unsupported inputs fail closed", () => {
  assert.throws(() => parsePortableSave("x".repeat(MAX_PORTABLE_SAVE_BYTES + 1)), expectCode("SAVE_TOO_LARGE"));
  assert.throws(() => parsePortableSave("FOG OF SEA\n{}"), expectCode("INVALID_FORMAT"));
  assert.throws(
    () => parsePortableSave(JSON.stringify({ format: PORTABLE_SAVE_FORMAT, schemaVersion: 99 })),
    expectCode("UNSUPPORTED_SCHEMA"),
  );

  let deep = null;
  for (let index = 0; index < 60; index += 1) deep = { next: deep };
  assert.throws(() => parsePortableSave(JSON.stringify(deep)), expectCode("INVALID_STRUCTURE"));
});
