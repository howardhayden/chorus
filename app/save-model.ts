import { advanceNightTo, applyNightChoice, createNightState, enterNightRoom, validateNightState, type NightState } from "./night-engine.ts";
import { generateScenarioPack, type GeneratedScenarioPack } from "./scenario-generator.ts";

/**
 * CHORUS never persists a night merely because this module was imported.
 * The UI must make an explicit call to a portable or local-slot operation.
 */
export const DEFAULT_SAVE_PREFERENCE = Object.freeze({
  mode: "memory-only" as const,
  activeSlot: null,
  autosave: false,
  localWrites: false,
  networkWrites: false,
});

export const PORTABLE_SAVE_FORMAT = "CHORUS_PORTABLE_SAVE" as const;
export const PORTABLE_SAVE_SCHEMA_VERSION = 2 as const;
export const PORTABLE_SAVE_HEADER = "CHORUS SAVE · 2" as const;
export const MAX_PORTABLE_SAVE_BYTES = 512 * 1024;
export const SAVE_SLOTS = ["A", "B", "C"] as const;

const LEGACY_PORTABLE_SAVE_HEADER = "CHORUS SAVE · 1" as const;

export type SaveSlot = (typeof SAVE_SLOTS)[number];

export type SaveModelErrorCode =
  | "SAVE_TOO_LARGE"
  | "INVALID_JSON"
  | "INVALID_STRUCTURE"
  | "INVALID_FORMAT"
  | "UNSUPPORTED_SCHEMA"
  | "INTEGRITY_MISMATCH"
  | "INVALID_TIMESTAMP"
  | "SEED_RANGE"
  | "GENERATOR_VERSION_MISMATCH"
  | "STATE_INVALID"
  | "SLOT_CONSENT_REQUIRED"
  | "STORAGE_UNAVAILABLE"
  | "SLOT_EMPTY";

export class SaveModelError extends Error {
  readonly code: SaveModelErrorCode;

  constructor(code: SaveModelErrorCode, message: string) {
    super(message);
    this.name = "SaveModelError";
    this.code = code;
  }
}

export type SaveProvenance = {
  app: "CHORUS";
  generatorVersion: number;
  exportedAt: string;
  exportMode: "player-controlled";
  storageScope: "portable-text";
  networkRequired: false;
};

export type PortableDecisionCoordinateV2 = {
  roomOrdinal: number;
  choiceOrdinal: number;
  startMinute: number;
};

export type PortableTracePayloadV2 = {
  seed: number;
  elapsedMinutes: number;
  enteredRoomOrdinals: number[];
  decisions: PortableDecisionCoordinateV2[];
};

export type PortableSaveEnvelopeV2 = {
  format: typeof PORTABLE_SAVE_FORMAT;
  schemaVersion: typeof PORTABLE_SAVE_SCHEMA_VERSION;
  provenance: SaveProvenance;
  payload: PortableTracePayloadV2;
  integrity: {
    algorithm: "fnv1a-32";
    digest: string;
  };
};

export type PortableSaveEnvelopeV1 = {
  format: typeof PORTABLE_SAVE_FORMAT;
  schemaVersion: 1;
  provenance: SaveProvenance;
  payload: {
    seed: number;
    state: NightState;
  };
  integrity: {
    algorithm: "fnv1a-32";
    digest: string;
  };
};

export type SavePreview = {
  format: typeof PORTABLE_SAVE_FORMAT;
  schemaVersion: typeof PORTABLE_SAVE_SCHEMA_VERSION;
  generatorVersion: number;
  exportedAt: string;
  seed: number;
  turn: number;
  elapsedMinutes: number;
  enteredRooms: number;
  completedRooms: number;
};

export type ParsedPortableSave = {
  state: NightState;
  preview: SavePreview;
  migratedFrom: number | null;
};

export type PortableSaveOptions = {
  exportedAt?: string;
};

export type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

/** A short-lived capability. Creating it does not read or write browser storage. */
export type LocalSlotConsent = Readonly<{
  kind: "chorus-local-slot-consent";
  slot: SaveSlot;
  granted: true;
}>;

export type LocalSlotInspection =
  | { slot: SaveSlot; status: "empty" }
  | { slot: SaveSlot; status: "ready"; preview: SavePreview }
  | { slot: SaveSlot; status: "invalid"; errorCode: SaveModelErrorCode };

const SEED_MAX = 0xffff_ffff;
const MAX_TREE_DEPTH = 48;
const MAX_TREE_NODES = 80_000;
const MAX_STRING_LENGTH = 32_768;
const MAX_ARRAY_LENGTH = 1_000;
const LOCAL_SLOT_KEY_PREFIX = "chorus:local-save:v2:";
const LEGACY_LOCAL_SLOT_KEY_PREFIX = "chorus:local-save:v1:";
const METRIC_NAMES = [
  "reach",
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
] as const;
const FATIGUE_NAMES = ["attentional", "affective", "relational", "verification", "efficacy"] as const;

export function grantLocalSlotConsent(slot: SaveSlot): LocalSlotConsent {
  assertSaveSlot(slot);
  return Object.freeze({ kind: "chorus-local-slot-consent", slot, granted: true });
}

export function createPortableSave(state: NightState, options: PortableSaveOptions = {}): string {
  const exportedAt = options.exportedAt ?? new Date().toISOString();
  assertIsoTimestamp(exportedAt);
  // Engine objects can contain optional properties with the value `undefined`.
  // Portable saves deliberately use their JSON representation so imports are
  // identical across browsers and never depend on JavaScript-only values.
  const portableState = cloneJson(state);
  const pack = validateAndReconstructState(portableState);
  const payload = tracePayloadFor(pack, portableState);
  const reconstructed = reconstructTrace(pack, payload);
  if (canonicalStringify(cloneJson(reconstructed)) !== canonicalStringify(portableState)) {
    throw new SaveModelError("STATE_INVALID", "The night cannot be represented by the portable replay trace.");
  }
  const unsigned = {
    format: PORTABLE_SAVE_FORMAT,
    schemaVersion: PORTABLE_SAVE_SCHEMA_VERSION,
    provenance: {
      app: "CHORUS",
      generatorVersion: Number(pack.generatorVersion),
      exportedAt,
      exportMode: "player-controlled",
      storageScope: "portable-text",
      networkRequired: false,
    },
    payload,
  } satisfies Omit<PortableSaveEnvelopeV2, "integrity">;
  const envelope: PortableSaveEnvelopeV2 = {
    ...unsigned,
    integrity: {
      algorithm: "fnv1a-32",
      digest: deterministicDigest(unsigned),
    },
  };
  const text = `${PORTABLE_SAVE_HEADER}\n${JSON.stringify(envelope, null, 2)}\n`;
  assertByteLimit(text);
  return text;
}

export function parsePortableSave(text: string): ParsedPortableSave {
  if (typeof text !== "string") {
    throw new SaveModelError("INVALID_STRUCTURE", "The selected save is not text.");
  }
  assertByteLimit(text);
  const stripped = stripPortableHeader(text);
  let raw: unknown;
  try {
    assertNoDuplicateJsonKeys(stripped.jsonText);
    raw = JSON.parse(stripped.jsonText);
  } catch (error) {
    if (error instanceof SaveModelError) throw error;
    throw new SaveModelError("INVALID_JSON", "The selected save is not valid CHORUS text.");
  }
  assertBoundedJsonTree(raw);
  assertHeaderMatchesSchema(stripped.headerSchemaVersion, raw);
  const migrated = migratePortableEnvelope(raw);
  const envelope = migrated.envelope;
  validateEnvelopeShape(envelope);
  verifyIntegrity(envelope);

  const { provenance, payload } = envelope;
  assertIsoTimestamp(provenance.exportedAt);
  assertSeed(payload.seed);
  let currentPack: GeneratedScenarioPack;
  try {
    currentPack = generateScenarioPack(payload.seed);
  } catch {
    throw new SaveModelError("STATE_INVALID", "The night seed could not reconstruct a CHORUS house.");
  }
  if (Number(currentPack.generatorVersion) !== provenance.generatorVersion) {
    throw new SaveModelError(
      "GENERATOR_VERSION_MISMATCH",
      "This save was made with a different CHORUS scenario model.",
    );
  }
  const state = cloneJson(reconstructTrace(currentPack, payload));
  return {
    state,
    preview: previewFor(envelope, state),
    migratedFrom: migrated.migratedFrom,
  };
}

/** Fully validates a file but returns no playable ledger or free-form story content. */
export function inspectPortableSave(text: string): SavePreview {
  return parsePortableSave(text).preview;
}

/**
 * Schema 1 stored a complete NightState. Version 0 was an internal prototype
 * with equivalent data at the top level. A legacy checksum and full canonical
 * replay are verified before the state is reduced to a schema-2 trace.
 */
export function migratePortableEnvelope(raw: unknown): {
  envelope: PortableSaveEnvelopeV2;
  migratedFrom: number | null;
} {
  assertBoundedJsonTree(raw);
  if (!isPlainObject(raw)) {
    throw new SaveModelError("INVALID_STRUCTURE", "The save envelope is missing.");
  }
  if (raw.format !== PORTABLE_SAVE_FORMAT) {
    throw new SaveModelError("INVALID_FORMAT", "This file is not a CHORUS save.");
  }
  if (raw.schemaVersion === PORTABLE_SAVE_SCHEMA_VERSION) {
    return { envelope: raw as PortableSaveEnvelopeV2, migratedFrom: null };
  }
  if (raw.schemaVersion === 1) {
    validateLegacyV1(raw);
    verifyLegacyIntegrity(raw as PortableSaveEnvelopeV1);
    const envelope = migrateLegacyState({
      generatorVersion: raw.provenance.generatorVersion,
      exportedAt: raw.provenance.exportedAt,
      seed: raw.payload.seed,
      state: raw.payload.state,
    });
    return { envelope, migratedFrom: 1 };
  }
  if (raw.schemaVersion !== 0) {
    throw new SaveModelError("UNSUPPORTED_SCHEMA", "This CHORUS save version is not supported.");
  }

  validateLegacyV0(raw);
  verifyRawIntegrity(raw);
  return {
    envelope: migrateLegacyState({
      generatorVersion: raw.generatorVersion as number,
      exportedAt: raw.exportedAt as string,
      seed: raw.seed as number,
      state: raw.state as NightState,
    }),
    migratedFrom: 0,
  };
}

/** Deterministic corruption check, not a signature or authentication mechanism. */
export function deterministicDigest(value: unknown): string {
  const bytes = new TextEncoder().encode(canonicalStringify(value));
  let hash = 0x811c9dc5;
  for (const byte of bytes) {
    hash ^= byte;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

export function saveLocalSlot(
  storage: StorageLike,
  consent: LocalSlotConsent,
  state: NightState,
  options: PortableSaveOptions = {},
): SavePreview {
  assertConsent(consent);
  const text = createPortableSave(state, options);
  try {
    storage.setItem(localSlotKey(consent.slot), text);
  } catch {
    throw new SaveModelError("STORAGE_UNAVAILABLE", "This browser could not write that local slot.");
  }
  try {
    storage.removeItem(legacyLocalSlotKey(consent.slot));
  } catch {
    throw new SaveModelError(
      "STORAGE_UNAVAILABLE",
      "The new trace was saved, but this browser could not remove the earlier slot value. Clear this slot to retire it.",
    );
  }
  return inspectPortableSave(text);
}

/** Deliberate read: callers should invoke this only after a player selects a slot. */
export function loadLocalSlot(storage: StorageLike, slot: SaveSlot): ParsedPortableSave {
  assertSaveSlot(slot);
  let text: string | null;
  try {
    text = readLocalSlotText(storage, slot);
  } catch {
    throw new SaveModelError("STORAGE_UNAVAILABLE", "This browser could not read that local slot.");
  }
  if (text === null) throw new SaveModelError("SLOT_EMPTY", `Local slot ${slot} is empty.`);
  return parsePortableSave(text);
}

/** Deliberate inventory: no storage is read until the UI calls this function. */
export function inspectLocalSlots(storage: StorageLike): LocalSlotInspection[] {
  return SAVE_SLOTS.map((slot) => {
    let text: string | null;
    try {
      text = readLocalSlotText(storage, slot);
    } catch {
      return { slot, status: "invalid", errorCode: "STORAGE_UNAVAILABLE" } as const;
    }
    if (text === null) return { slot, status: "empty" } as const;
    try {
      return { slot, status: "ready", preview: inspectPortableSave(text) } as const;
    } catch (error) {
      return {
        slot,
        status: "invalid",
        errorCode: error instanceof SaveModelError ? error.code : "INVALID_STRUCTURE",
      } as const;
    }
  });
}

export function clearLocalSlot(storage: StorageLike, consent: LocalSlotConsent): void {
  assertConsent(consent);
  try {
    storage.removeItem(legacyLocalSlotKey(consent.slot));
    storage.removeItem(localSlotKey(consent.slot));
  } catch {
    throw new SaveModelError("STORAGE_UNAVAILABLE", "This browser could not clear that local slot.");
  }
}

export function localSlotKey(slot: SaveSlot): string {
  assertSaveSlot(slot);
  return `${LOCAL_SLOT_KEY_PREFIX}${slot}`;
}

export function legacyLocalSlotKey(slot: SaveSlot): string {
  assertSaveSlot(slot);
  return `${LEGACY_LOCAL_SLOT_KEY_PREFIX}${slot}`;
}

function readLocalSlotText(storage: StorageLike, slot: SaveSlot): string | null {
  const current = storage.getItem(localSlotKey(slot));
  return current ?? storage.getItem(legacyLocalSlotKey(slot));
}

function migrateLegacyState(input: {
  generatorVersion: number;
  exportedAt: string;
  seed: number;
  state: NightState;
}): PortableSaveEnvelopeV2 {
  assertIsoTimestamp(input.exportedAt);
  assertSeed(input.seed);
  if (!Number.isSafeInteger(input.generatorVersion)) {
    throw new SaveModelError("INVALID_STRUCTURE", "The earlier CHORUS save has an invalid generator version.");
  }
  let pack: GeneratedScenarioPack;
  try {
    pack = generateScenarioPack(input.seed);
  } catch {
    throw new SaveModelError("STATE_INVALID", "The night seed could not reconstruct a CHORUS house.");
  }
  if (Number(pack.generatorVersion) !== input.generatorVersion) {
    throw new SaveModelError(
      "GENERATOR_VERSION_MISMATCH",
      "This save was made with a different CHORUS scenario model.",
    );
  }
  if (input.state.seed !== input.seed) {
    throw new SaveModelError("STATE_INVALID", "The save seed and night state do not match.");
  }
  const portableState = cloneJson(input.state);
  validateAndReconstructState(portableState);
  const payload = tracePayloadFor(pack, portableState);
  const reconstructed = reconstructTrace(pack, payload);
  if (canonicalStringify(cloneJson(reconstructed)) !== canonicalStringify(portableState)) {
    throw new SaveModelError("STATE_INVALID", "The earlier night cannot be reduced to an exact replay trace.");
  }
  const unsigned = {
    format: PORTABLE_SAVE_FORMAT,
    schemaVersion: PORTABLE_SAVE_SCHEMA_VERSION,
    provenance: {
      app: "CHORUS",
      generatorVersion: input.generatorVersion,
      exportedAt: input.exportedAt,
      exportMode: "player-controlled",
      storageScope: "portable-text",
      networkRequired: false,
    },
    payload,
  } satisfies Omit<PortableSaveEnvelopeV2, "integrity">;
  return {
    ...unsigned,
    integrity: { algorithm: "fnv1a-32", digest: deterministicDigest(unsigned) },
  };
}

function tracePayloadFor(pack: GeneratedScenarioPack, state: NightState): PortableTracePayloadV2 {
  const sceneCursors = new Map(pack.scenarios.map((scenario) => [scenario.id, 0]));
  const decisions = state.decisions.map((decision): PortableDecisionCoordinateV2 => {
    const roomOrdinal = pack.scenarios.findIndex((scenario) => scenario.id === decision.sourceScenarioId);
    if (roomOrdinal < 0) invalidState("A decision refers to a room outside the generated night.");
    const scenario = pack.scenarios[roomOrdinal];
    const sceneIndex = sceneCursors.get(scenario.id) ?? 0;
    const scene = scenario.scenes[sceneIndex];
    if (!scene || scene.id !== decision.sourceSceneId) {
      invalidState("A decision scene does not match its replay cursor.");
    }
    const choiceOrdinal = scene.choices.findIndex((choice) => choice.id === decision.choiceId);
    if (choiceOrdinal < 0) invalidState("A decision refers to a choice outside its replay scene.");
    const choice = scene.choices[choiceOrdinal];
    const startMinute = decision.atMinute - choice.minutes;
    if (!isBoundedInteger(startMinute, 0, 1_440)) invalidState("A decision start minute is invalid.");
    sceneCursors.set(scenario.id, sceneIndex + 1);
    return { roomOrdinal, choiceOrdinal, startMinute };
  });
  return {
    seed: state.seed,
    elapsedMinutes: state.elapsedMinutes,
    enteredRoomOrdinals: pack.scenarios.flatMap((scenario, ordinal) =>
      state.rooms[scenario.id]?.entered ? [ordinal] : []
    ),
    decisions,
  };
}

function reconstructTrace(pack: GeneratedScenarioPack, payload: PortableTracePayloadV2): NightState {
  assertTracePayloadShape(payload);
  if (payload.seed !== pack.seed) invalidState("The replay seed does not match the generated night.");
  let rebuilt = createNightState(pack);
  for (const coordinate of payload.decisions) {
    const scenario = pack.scenarios[coordinate.roomOrdinal];
    const room = scenario ? rebuilt.rooms[scenario.id] : undefined;
    const scene = scenario && room ? scenario.scenes[room.sceneIndex] : undefined;
    const choice = scene?.choices[coordinate.choiceOrdinal];
    if (!scenario || !room || !scene || !choice) {
      invalidState("A replay coordinate is outside the generated night.");
    }
    if (coordinate.startMinute < rebuilt.elapsedMinutes) {
      invalidState("The replay decision timing is inconsistent.");
    }
    rebuilt = advanceNightTo(pack, rebuilt, coordinate.startMinute);
    rebuilt = enterNightRoom(rebuilt, scenario.id);
    const beforeTurn = rebuilt.turn;
    rebuilt = applyNightChoice(pack, rebuilt, scenario.id, scene.id, choice.id);
    if (rebuilt.turn !== beforeTurn + 1) {
      invalidState("A replayed choice was unavailable at its recorded time.");
    }
  }
  if (payload.elapsedMinutes < rebuilt.elapsedMinutes) {
    invalidState("The saved clock precedes its final choice.");
  }
  rebuilt = advanceNightTo(pack, rebuilt, payload.elapsedMinutes);
  for (const ordinal of payload.enteredRoomOrdinals) {
    rebuilt = enterNightRoom(rebuilt, pack.scenarios[ordinal].id);
  }
  const rebuiltEntries = pack.scenarios.flatMap((scenario, ordinal) =>
    rebuilt.rooms[scenario.id].entered ? [ordinal] : []
  );
  if (!sameNumberArray(rebuiltEntries, payload.enteredRoomOrdinals)) {
    invalidState("The entered-room trace omits a room used by a recorded choice.");
  }
  const issues = validateNightState(pack, rebuilt);
  if (issues.length > 0) {
    invalidState(`The replayed night is inconsistent (${issues[0]}).`);
  }
  return rebuilt;
}

function validateAndReconstructState(state: NightState): GeneratedScenarioPack {
  assertNightStateShape(state);
  assertSeed(state.seed);
  let pack: GeneratedScenarioPack;
  try {
    pack = generateScenarioPack(state.seed);
  } catch {
    throw new SaveModelError("STATE_INVALID", "The night seed could not reconstruct a CHORUS house.");
  }
  const issues = validateNightState(pack, state);
  if (issues.length > 0) {
    throw new SaveModelError("STATE_INVALID", `The night ledger is inconsistent (${issues[0]}).`);
  }
  const reconstructed = reconstructNight(pack, state);
  if (canonicalStringify(cloneJson(reconstructed)) !== canonicalStringify(state)) {
    throw new SaveModelError("STATE_INVALID", "The night ledger does not reproduce from its recorded choices.");
  }
  return pack;
}

function reconstructNight(pack: GeneratedScenarioPack, imported: NightState): NightState {
  let rebuilt = createNightState(pack);
  for (const recorded of imported.decisions) {
    const scenario = pack.scenarios.find((candidate) => candidate.id === recorded.sourceScenarioId);
    const scene = scenario?.scenes.find((candidate) => candidate.id === recorded.sourceSceneId);
    const choice = scene?.choices.find((candidate) => candidate.id === recorded.choiceId);
    if (!scenario || !scene || !choice) {
      throw new SaveModelError("STATE_INVALID", "The save refers to a choice outside this generated night.");
    }
    const decisionStart = recorded.atMinute - choice.minutes;
    if (!Number.isSafeInteger(decisionStart) || decisionStart < rebuilt.elapsedMinutes) {
      throw new SaveModelError("STATE_INVALID", "The saved choice timing is inconsistent.");
    }
    rebuilt = advanceNightTo(pack, rebuilt, decisionStart);
    rebuilt = enterNightRoom(rebuilt, scenario.id);
    const beforeTurn = rebuilt.turn;
    rebuilt = applyNightChoice(pack, rebuilt, scenario.id, scene.id, choice.id);
    if (rebuilt.turn !== beforeTurn + 1) {
      throw new SaveModelError("STATE_INVALID", "A saved choice could not be replayed.");
    }
  }
  if (imported.elapsedMinutes < rebuilt.elapsedMinutes) {
    throw new SaveModelError("STATE_INVALID", "The saved clock precedes its final choice.");
  }
  rebuilt = advanceNightTo(pack, rebuilt, imported.elapsedMinutes);
  for (const scenario of pack.scenarios) {
    if (imported.rooms[scenario.id].entered) rebuilt = enterNightRoom(rebuilt, scenario.id);
  }
  return rebuilt;
}

function assertNightStateShape(value: unknown): asserts value is NightState {
  assertBoundedJsonTree(value);
  if (!isPlainObject(value)) invalidState("The night state is missing.");
  assertSeed(value.seed);
  if (!isBoundedInteger(value.elapsedMinutes, 0, 1_440)) invalidState("The saved clock is out of range.");
  if (!isBoundedInteger(value.turn, 0, 24)) invalidState("The saved turn is out of range.");
  if (!isPlainObject(value.rooms)) invalidState("The saved rooms are missing.");
  if (!Array.isArray(value.decisions) || value.decisions.length !== value.turn) invalidState("The decision ledger is incomplete.");
  if (!Array.isArray(value.ambientEvents) || value.ambientEvents.length > 24) invalidState("The ambient ledger is invalid.");
  if (!isStringArray(value.processedPulseIds, 24)) invalidState("The pulse ledger is invalid.");

  const pack = generateScenarioPack(value.seed);
  const scenarioIds = pack.scenarios.map((scenario) => scenario.id).sort();
  const roomIds = Object.keys(value.rooms).sort();
  if (canonicalStringify(roomIds) !== canonicalStringify(scenarioIds)) invalidState("The room set does not match the seed.");
  for (const scenario of pack.scenarios) {
    const room = value.rooms[scenario.id];
    if (!isPlainObject(room) || room.scenarioId !== scenario.id) invalidState("A saved room identity is invalid.");
    if (!isShortString(room.activeCodeId) || !scenario.protagonistModel.languageProfile.repertoire.some((access) => access.codeId === room.activeCodeId)) {
      invalidState("A saved room register is outside this character's repertoire.");
    }
    if (typeof room.entered !== "boolean" || typeof room.completed !== "boolean") invalidState("A saved room status is invalid.");
    if (!isBoundedInteger(room.sceneIndex, 0, scenario.scenes.length)) invalidState("A saved scene position is invalid.");
    if (!isMetrics(room.metrics) || (room.atCompletion !== undefined && !isMetrics(room.atCompletion))) invalidState("A saved metric set is invalid.");
    if (!isStringArray(room.inboundEventIds, 200) || !isStringArray(room.localDecisionIds, 24)) invalidState("A saved room ledger is invalid.");
    if (!isPlainObject(room.support)) invalidState("A saved support ledger is invalid.");
    for (const support of Object.values(room.support)) {
      if (!isStringArray(support, 100)) invalidState("A saved support path is invalid.");
    }
    if (!isFatigue(room.fatigue)) invalidState("A saved fatigue model is invalid.");
    if (!isBoundedNumber(room.platformMinutes, 0, 10_000)) invalidState("Saved platform time is invalid.");
    if (!(room.behaviorPhase === null || typeof room.behaviorPhase === "string")) invalidState("A saved behavior phase is invalid.");
  }
  for (const decision of value.decisions) assertDecisionShape(decision, scenarioIds);
  for (const event of value.ambientEvents) assertAmbientShape(event, scenarioIds);
}

function assertDecisionShape(value: unknown, scenarioIds: string[]): void {
  if (!isPlainObject(value)) invalidState("A saved decision is invalid.");
  for (const field of ["id", "sourceScenarioId", "sourceSceneId", "choiceId"] as const) {
    if (!isShortString(value[field])) invalidState("A saved decision identity is invalid.");
  }
  if (!scenarioIds.includes(value.sourceScenarioId as string)) invalidState("A saved decision room is invalid.");
  if (!isBoundedInteger(value.turn, 1, 24) || !isBoundedInteger(value.atMinute, 0, 1_440)) invalidState("A saved decision time is invalid.");
  if (!Array.isArray(value.effects) || value.effects.length !== scenarioIds.length) invalidState("A saved effect ledger is invalid.");
  if (!Array.isArray(value.frameworkMoves)) invalidState("A saved framework ledger is invalid.");
  if (value.conversationDiversion !== undefined) assertConversationDiversionShape(value.conversationDiversion);
  if (value.codeTransition !== undefined) assertCodeTransitionShape(value.codeTransition);
  if (value.behaviorTransition !== undefined) {
    if (!isPlainObject(value.behaviorTransition) || !isShortString(value.behaviorTransition.to)) invalidState("A saved behavior transition is invalid.");
  }
  for (const effect of value.effects) assertEffectShape(effect, scenarioIds);
}

function assertCodeTransitionShape(value: unknown): void {
  if (!isPlainObject(value)) invalidState("A saved register transition is invalid.");
  if (!["maintain", "switch", "bridge"].includes(String(value.mode))) invalidState("A saved register transition mode is invalid.");
  for (const field of ["fromCodeId", "toCodeId", "audienceContext", "intendedFunction", "switchReason"] as const) {
    if (!isShortString(value[field])) invalidState("A saved register transition record is invalid.");
  }
  if (!isPlainObject(value.switchLoad)) invalidState("A saved register transition load is invalid.");
  for (const [kind, amount] of Object.entries(value.switchLoad)) {
    if (!FATIGUE_NAMES.includes(kind as (typeof FATIGUE_NAMES)[number]) || !isBoundedNumber(amount, 0, 100)) {
      invalidState("A saved register transition load is invalid.");
    }
  }
}

function assertConversationDiversionShape(value: unknown): void {
  if (!isPlainObject(value)) invalidState("A saved conversation route is invalid.");
  if (!["adjacent-concern", "meme-deflection", "absurdist-derailment"].includes(String(value.mode))) invalidState("A saved conversation route mode is invalid.");
  if (!["BRIDGE", "CROSSOVER", "CORRECTION"].includes(String(value.scenePhase))) invalidState("A saved conversation route phase is invalid.");
  if (value.intentionality !== "deliberate" || value.placement !== "same-thread") invalidState("A saved conversation route intent is invalid.");
  for (const field of ["activeQuestion", "introducedMaterial", "displacementEffect", "actorMotive", "betterRoute"] as const) {
    if (!isShortString(value[field])) invalidState("A saved conversation route record is invalid.");
  }
  if (!(value.propositionStatus === "supported" || value.propositionStatus === "no-proposition")) invalidState("A saved conversation proposition status is invalid.");
  if (!["adjacent-separate-thread", "format-only", "nonresponsive"].includes(String(value.responseFit))) invalidState("A saved conversation response fit is invalid.");
  if (value.mode === "adjacent-concern" && !isShortString(value.recordBasis)) invalidState("A supported adjacent concern is missing its separate record.");
}

function assertAmbientShape(value: unknown, scenarioIds: string[]): void {
  if (!isPlainObject(value)) invalidState("A saved ambient event is invalid.");
  if (!isShortString(value.id) || !isShortString(value.sourceScenarioId) || !scenarioIds.includes(value.sourceScenarioId)) invalidState("A saved ambient identity is invalid.");
  if (!isBoundedInteger(value.atMinute, 0, 1_440) || !Array.isArray(value.effects) || value.effects.length !== scenarioIds.length) invalidState("A saved ambient event ledger is invalid.");
  for (const effect of value.effects) assertEffectShape(effect, scenarioIds);
}

function assertEffectShape(value: unknown, scenarioIds: string[]): void {
  if (!isPlainObject(value) || !isShortString(value.targetScenarioId) || !scenarioIds.includes(value.targetScenarioId)) invalidState("A saved effect target is invalid.");
  if (!(value.scope === "local" || value.scope === "cross-room")) invalidState("A saved effect scope is invalid.");
  if (!isPlainObject(value.metrics)) invalidState("A saved effect metric set is invalid.");
  for (const [name, amount] of Object.entries(value.metrics)) {
    if (!METRIC_NAMES.includes(name as (typeof METRIC_NAMES)[number]) || !isBoundedNumber(amount, -1_000_000, 1_000_000)) invalidState("A saved effect metric is invalid.");
  }
  for (const name of ["backgroundReach", "avoidedReach", "appliedReach"] as const) {
    if (!isBoundedNumber(value[name], 0, 1_000_000_000)) invalidState("A saved reach receipt is invalid.");
  }
  if (!isStringArray(value.supportAdded, 10)) invalidState("A saved support receipt is invalid.");
}

function validateEnvelopeShape(value: unknown): asserts value is PortableSaveEnvelopeV2 {
  if (
    !isPlainObject(value)
    || !hasExactKeys(value, ["format", "schemaVersion", "provenance", "payload", "integrity"])
    || value.format !== PORTABLE_SAVE_FORMAT
    || value.schemaVersion !== PORTABLE_SAVE_SCHEMA_VERSION
  ) {
    throw new SaveModelError("INVALID_STRUCTURE", "The CHORUS save envelope is invalid.");
  }
  if (!isPlainObject(value.provenance) || !isPlainObject(value.payload) || !isPlainObject(value.integrity)) {
    throw new SaveModelError("INVALID_STRUCTURE", "The CHORUS save sections are incomplete.");
  }
  const provenance = value.provenance;
  if (
    !hasExactKeys(provenance, ["app", "generatorVersion", "exportedAt", "exportMode", "storageScope", "networkRequired"])
    || provenance.app !== "CHORUS"
    || !Number.isSafeInteger(provenance.generatorVersion)
    || typeof provenance.exportedAt !== "string"
    || provenance.exportMode !== "player-controlled"
    || provenance.storageScope !== "portable-text"
    || provenance.networkRequired !== false
  ) {
    throw new SaveModelError("INVALID_STRUCTURE", "The CHORUS save provenance is invalid.");
  }
  if (
    !hasExactKeys(value.integrity, ["algorithm", "digest"])
    || value.integrity.algorithm !== "fnv1a-32"
    || typeof value.integrity.digest !== "string"
    || !/^[0-9a-f]{8}$/.test(value.integrity.digest)
  ) {
    throw new SaveModelError("INVALID_STRUCTURE", "The CHORUS save integrity record is invalid.");
  }
  assertTracePayloadShape(value.payload);
}

function assertTracePayloadShape(value: unknown): asserts value is PortableTracePayloadV2 {
  if (
    !isPlainObject(value)
    || !hasExactKeys(value, ["seed", "elapsedMinutes", "enteredRoomOrdinals", "decisions"])
  ) {
    throw new SaveModelError("INVALID_STRUCTURE", "The CHORUS replay trace is invalid.");
  }
  assertSeed(value.seed);
  if (!isBoundedInteger(value.elapsedMinutes, 0, 1_440)) invalidState("The replay clock is out of range.");
  const elapsedMinutes = value.elapsedMinutes;
  if (!Array.isArray(value.enteredRoomOrdinals) || value.enteredRoomOrdinals.length > 6) {
    throw new SaveModelError("INVALID_STRUCTURE", "The replay room entries are invalid.");
  }
  if (!value.enteredRoomOrdinals.every((ordinal) => isBoundedInteger(ordinal, 0, 5))) {
    invalidState("A replay room ordinal is out of range.");
  }
  for (let index = 1; index < value.enteredRoomOrdinals.length; index += 1) {
    if (value.enteredRoomOrdinals[index] <= value.enteredRoomOrdinals[index - 1]) {
      invalidState("Replay room ordinals must be unique and ordered.");
    }
  }
  if (!Array.isArray(value.decisions) || value.decisions.length > 24) {
    throw new SaveModelError("INVALID_STRUCTURE", "The replay decision trace is invalid.");
  }
  value.decisions.forEach((decision) => {
    if (
      !isPlainObject(decision)
      || !hasExactKeys(decision, ["roomOrdinal", "choiceOrdinal", "startMinute"])
    ) {
      throw new SaveModelError("INVALID_STRUCTURE", "A replay decision coordinate is invalid.");
    }
    if (!isBoundedInteger(decision.roomOrdinal, 0, 5)) invalidState("A replay decision room is out of range.");
    if (!isBoundedInteger(decision.choiceOrdinal, 0, 15)) invalidState("A replay choice ordinal is out of range.");
    if (!isBoundedInteger(decision.startMinute, 0, 1_440) || decision.startMinute > elapsedMinutes) {
      invalidState("A replay decision time is out of range.");
    }
  });
}

function validateLegacyV1(value: Record<string, unknown>): asserts value is PortableSaveEnvelopeV1 {
  if (
    !hasExactKeys(value, ["format", "schemaVersion", "provenance", "payload", "integrity"])
    || value.format !== PORTABLE_SAVE_FORMAT
    || value.schemaVersion !== 1
    || !isPlainObject(value.provenance)
    || !hasExactKeys(value.provenance, ["app", "generatorVersion", "exportedAt", "exportMode", "storageScope", "networkRequired"])
    || value.provenance.app !== "CHORUS"
    || !Number.isSafeInteger(value.provenance.generatorVersion)
    || typeof value.provenance.exportedAt !== "string"
    || value.provenance.exportMode !== "player-controlled"
    || value.provenance.storageScope !== "portable-text"
    || value.provenance.networkRequired !== false
    || !isPlainObject(value.payload)
    || !hasExactKeys(value.payload, ["seed", "state"])
    || !("state" in value.payload)
    || !isPlainObject(value.integrity)
    || !hasExactKeys(value.integrity, ["algorithm", "digest"])
    || value.integrity.algorithm !== "fnv1a-32"
    || !/^[0-9a-f]{8}$/.test(String(value.integrity.digest))
  ) {
    throw new SaveModelError("INVALID_STRUCTURE", "The schema-1 CHORUS save is invalid.");
  }
  assertIsoTimestamp(value.provenance.exportedAt);
  assertSeed(value.payload.seed);
}

function validateLegacyV0(value: Record<string, unknown>): void {
  if (
    !hasExactKeys(value, ["format", "schemaVersion", "generatorVersion", "exportedAt", "seed", "state", "integrity"])
    || value.format !== PORTABLE_SAVE_FORMAT
    || value.schemaVersion !== 0
    || !Number.isSafeInteger(value.generatorVersion)
    || typeof value.exportedAt !== "string"
    || !("seed" in value)
    || !("state" in value)
    || !isPlainObject(value.integrity)
    || !hasExactKeys(value.integrity, ["algorithm", "digest"])
    || value.integrity.algorithm !== "fnv1a-32"
    || !/^[0-9a-f]{8}$/.test(String(value.integrity.digest))
  ) {
    throw new SaveModelError("INVALID_STRUCTURE", "The earlier CHORUS save is incomplete.");
  }
  assertIsoTimestamp(value.exportedAt);
  assertSeed(value.seed);
}

function verifyIntegrity(envelope: PortableSaveEnvelopeV2): void {
  const { integrity, ...unsigned } = envelope;
  if (integrity.digest !== deterministicDigest(unsigned)) {
    throw new SaveModelError("INTEGRITY_MISMATCH", "The save changed after it was written.");
  }
}

function verifyLegacyIntegrity(envelope: PortableSaveEnvelopeV1): void {
  const { integrity, ...unsigned } = envelope;
  if (integrity.digest !== deterministicDigest(unsigned)) {
    throw new SaveModelError("INTEGRITY_MISMATCH", "The save changed after it was written.");
  }
}

function verifyRawIntegrity(raw: Record<string, unknown>): void {
  const integrity = raw.integrity;
  if (!isPlainObject(integrity) || integrity.algorithm !== "fnv1a-32" || typeof integrity.digest !== "string") {
    throw new SaveModelError("INVALID_STRUCTURE", "The earlier CHORUS save integrity record is invalid.");
  }
  const { integrity: omitted, ...unsigned } = raw;
  void omitted;
  if (integrity.digest !== deterministicDigest(unsigned)) {
    throw new SaveModelError("INTEGRITY_MISMATCH", "The save changed after it was written.");
  }
}

function previewFor(envelope: PortableSaveEnvelopeV2, state: NightState): SavePreview {
  const rooms = Object.values(state.rooms);
  return Object.freeze({
    format: PORTABLE_SAVE_FORMAT,
    schemaVersion: PORTABLE_SAVE_SCHEMA_VERSION,
    generatorVersion: envelope.provenance.generatorVersion,
    exportedAt: envelope.provenance.exportedAt,
    seed: envelope.payload.seed,
    turn: state.turn,
    elapsedMinutes: state.elapsedMinutes,
    enteredRooms: rooms.filter((room) => room.entered).length,
    completedRooms: rooms.filter((room) => room.completed).length,
  });
}

function stripPortableHeader(text: string): { jsonText: string; headerSchemaVersion: number | null } {
  const normalized = text.replace(/^\uFEFF/, "").trim();
  for (const [header, version] of [[PORTABLE_SAVE_HEADER, 2], [LEGACY_PORTABLE_SAVE_HEADER, 1]] as const) {
    if (normalized.startsWith(`${header}\n`) || normalized.startsWith(`${header}\r\n`)) {
      return { jsonText: normalized.slice(header.length).trimStart(), headerSchemaVersion: version };
    }
  }
  if (normalized.startsWith("{")) return { jsonText: normalized, headerSchemaVersion: null };
  throw new SaveModelError("INVALID_FORMAT", "This file is not a CHORUS save.");
}

function assertHeaderMatchesSchema(headerSchemaVersion: number | null, raw: unknown): void {
  if (headerSchemaVersion === null) return;
  if (!isPlainObject(raw) || raw.schemaVersion !== headerSchemaVersion) {
    throw new SaveModelError("INVALID_FORMAT", "The CHORUS save header and schema version do not match.");
  }
}

/**
 * JSON.parse keeps only the last value for a repeated object key. Inspect the
 * raw grammar first so a shadow field cannot carry discarded prose while the
 * materialized object and digest still look canonical.
 */
function assertNoDuplicateJsonKeys(text: string): void {
  let index = 0;

  function invalidJson(): never {
    throw new SyntaxError("Invalid JSON grammar");
  }

  function skipWhitespace(): void {
    while (index < text.length && /[\t\n\r ]/.test(text[index])) index += 1;
  }

  function parseString(): string {
    if (text[index] !== '"') invalidJson();
    const start = index;
    index += 1;
    while (index < text.length) {
      const character = text[index];
      if (character === '"') {
        index += 1;
        return JSON.parse(text.slice(start, index)) as string;
      }
      if (character === "\\") {
        index += 1;
        if (index >= text.length) invalidJson();
        if (text[index] === "u") {
          if (!/^[0-9a-fA-F]{4}$/.test(text.slice(index + 1, index + 5))) invalidJson();
          index += 5;
          continue;
        }
        if (!/["\\/bfnrt]/.test(text[index])) invalidJson();
        index += 1;
        continue;
      }
      if (character.charCodeAt(0) < 0x20) invalidJson();
      index += 1;
    }
    invalidJson();
  }

  function parseValue(depth: number): void {
    if (depth > MAX_TREE_DEPTH) {
      throw new SaveModelError("INVALID_STRUCTURE", "The selected save is too complex.");
    }
    skipWhitespace();
    const character = text[index];
    if (character === "{") {
      index += 1;
      skipWhitespace();
      const keys = new Set<string>();
      if (text[index] === "}") {
        index += 1;
        return;
      }
      while (index < text.length) {
        const key = parseString();
        if (keys.has(key)) {
          throw new SaveModelError("INVALID_STRUCTURE", `The selected save repeats the field ${JSON.stringify(key)}.`);
        }
        keys.add(key);
        skipWhitespace();
        if (text[index] !== ":") invalidJson();
        index += 1;
        parseValue(depth + 1);
        skipWhitespace();
        if (text[index] === "}") {
          index += 1;
          return;
        }
        if (text[index] !== ",") invalidJson();
        index += 1;
        skipWhitespace();
      }
      invalidJson();
    }
    if (character === "[") {
      index += 1;
      skipWhitespace();
      if (text[index] === "]") {
        index += 1;
        return;
      }
      while (index < text.length) {
        parseValue(depth + 1);
        skipWhitespace();
        if (text[index] === "]") {
          index += 1;
          return;
        }
        if (text[index] !== ",") invalidJson();
        index += 1;
      }
      invalidJson();
    }
    if (character === '"') {
      parseString();
      return;
    }
    for (const literal of ["true", "false", "null"]) {
      if (text.startsWith(literal, index)) {
        index += literal.length;
        return;
      }
    }
    const number = text.slice(index).match(/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/u)?.[0];
    if (!number) invalidJson();
    index += number.length;
  }

  parseValue(0);
  skipWhitespace();
  if (index !== text.length) invalidJson();
}

function canonicalStringify(value: unknown): string {
  if (value === null) return "null";
  if (typeof value === "string" || typeof value === "boolean") return JSON.stringify(value);
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new SaveModelError("INVALID_STRUCTURE", "The save contains a non-finite number.");
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map(canonicalStringify).join(",")}]`;
  if (isPlainObject(value)) {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalStringify(value[key])}`).join(",")}}`;
  }
  throw new SaveModelError("INVALID_STRUCTURE", "The save contains an unsupported value.");
}

function assertBoundedJsonTree(root: unknown): void {
  const stack: Array<{ value: unknown; depth: number }> = [{ value: root, depth: 0 }];
  let nodes = 0;
  while (stack.length > 0) {
    const { value, depth } = stack.pop()!;
    nodes += 1;
    if (nodes > MAX_TREE_NODES || depth > MAX_TREE_DEPTH) {
      throw new SaveModelError("INVALID_STRUCTURE", "The selected save is too complex.");
    }
    if (typeof value === "string") {
      if (value.length > MAX_STRING_LENGTH) throw new SaveModelError("INVALID_STRUCTURE", "The selected save contains oversized text.");
      continue;
    }
    if (typeof value === "number") {
      if (!Number.isSafeInteger(value) && (!Number.isFinite(value) || Math.abs(value) > Number.MAX_SAFE_INTEGER)) {
        throw new SaveModelError("INVALID_STRUCTURE", "The selected save contains an invalid number.");
      }
      continue;
    }
    if (value === null || typeof value === "boolean") continue;
    if (Array.isArray(value)) {
      if (value.length > MAX_ARRAY_LENGTH) throw new SaveModelError("INVALID_STRUCTURE", "The selected save contains an oversized list.");
      for (const item of value) stack.push({ value: item, depth: depth + 1 });
      continue;
    }
    if (isPlainObject(value)) {
      for (const [key, item] of Object.entries(value)) {
        if (key.length > 128) throw new SaveModelError("INVALID_STRUCTURE", "The selected save contains an invalid field name.");
        stack.push({ value: item, depth: depth + 1 });
      }
      continue;
    }
    throw new SaveModelError("INVALID_STRUCTURE", "The selected save contains an unsupported value.");
  }
}

function assertByteLimit(text: string): void {
  if (new TextEncoder().encode(text).byteLength > MAX_PORTABLE_SAVE_BYTES) {
    throw new SaveModelError("SAVE_TOO_LARGE", "The selected save is larger than CHORUS accepts.");
  }
}

function assertIsoTimestamp(value: unknown): asserts value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)) {
    throw new SaveModelError("INVALID_TIMESTAMP", "The save timestamp is invalid.");
  }
  const parsed = Date.parse(value);
  const expanded = value.includes(".") ? value : value.replace(/Z$/, ".000Z");
  if (!Number.isFinite(parsed) || new Date(parsed).toISOString() !== expanded) {
    throw new SaveModelError("INVALID_TIMESTAMP", "The save timestamp is invalid.");
  }
}

function assertSeed(value: unknown): asserts value is number {
  if (!Number.isSafeInteger(value) || (value as number) < 0 || (value as number) > SEED_MAX) {
    throw new SaveModelError("SEED_RANGE", "The save seed is out of range.");
  }
}

function assertSaveSlot(slot: unknown): asserts slot is SaveSlot {
  if (!SAVE_SLOTS.includes(slot as SaveSlot)) {
    throw new SaveModelError("INVALID_STRUCTURE", "That local slot does not exist.");
  }
}

function assertConsent(consent: LocalSlotConsent): void {
  if (!isPlainObject(consent) || consent.kind !== "chorus-local-slot-consent" || consent.granted !== true) {
    throw new SaveModelError("SLOT_CONSENT_REQUIRED", "Choose a local slot before writing browser storage.");
  }
  assertSaveSlot(consent.slot);
}

function isMetrics(value: unknown): boolean {
  if (!isPlainObject(value)) return false;
  return METRIC_NAMES.every((name) => isBoundedNumber(value[name], 0, 1_000_000_000));
}

function isFatigue(value: unknown): boolean {
  if (!isPlainObject(value)) return false;
  return FATIGUE_NAMES.every((name) => isBoundedNumber(value[name], 0, 100));
}

function isStringArray(value: unknown, maximumLength: number): value is string[] {
  return Array.isArray(value) && value.length <= maximumLength && value.every(isShortString);
}

function isShortString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= 1_024;
}

function isBoundedInteger(value: unknown, minimum: number, maximum: number): value is number {
  return Number.isSafeInteger(value) && (value as number) >= minimum && (value as number) <= maximum;
}

function isBoundedNumber(value: unknown, minimum: number, maximum: number): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= minimum && value <= maximum;
}

function hasExactKeys(value: Record<string, unknown>, expected: readonly string[]): boolean {
  const actual = Object.keys(value).sort();
  const required = [...expected].sort();
  return actual.length === required.length && actual.every((key, index) => key === required[index]);
}

function sameNumberArray(left: number[], right: number[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
}

function invalidState(message: string): never {
  throw new SaveModelError("STATE_INVALID", message);
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
