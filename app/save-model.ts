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
export const PORTABLE_SAVE_SCHEMA_VERSION = 1 as const;
export const PORTABLE_SAVE_HEADER = "CHORUS SAVE · 1" as const;
export const MAX_PORTABLE_SAVE_BYTES = 512 * 1024;
export const SAVE_SLOTS = ["A", "B", "C"] as const;

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

export type PortableSaveEnvelopeV1 = {
  format: typeof PORTABLE_SAVE_FORMAT;
  schemaVersion: typeof PORTABLE_SAVE_SCHEMA_VERSION;
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
const LOCAL_SLOT_KEY_PREFIX = "chorus:local-save:v1:";
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
    payload: {
      seed: portableState.seed,
      state: portableState,
    },
  } satisfies Omit<PortableSaveEnvelopeV1, "integrity">;
  const envelope: PortableSaveEnvelopeV1 = {
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
  const jsonText = stripPortableHeader(text);
  let raw: unknown;
  try {
    raw = JSON.parse(jsonText);
  } catch {
    throw new SaveModelError("INVALID_JSON", "The selected save is not valid CHORUS text.");
  }
  assertBoundedJsonTree(raw);
  const migrated = migratePortableEnvelope(raw);
  const envelope = migrated.envelope;
  validateEnvelopeShape(envelope);
  verifyIntegrity(envelope);

  const { provenance, payload } = envelope;
  assertIsoTimestamp(provenance.exportedAt);
  assertSeed(payload.seed);
  if (payload.state.seed !== payload.seed) {
    throw new SaveModelError("STATE_INVALID", "The save seed and night state do not match.");
  }
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
  validateAndReconstructState(payload.state);

  const state = cloneJson(payload.state);
  return {
    state,
    preview: previewFor(envelope),
    migratedFrom: migrated.migratedFrom,
  };
}

/** Fully validates a file but returns no playable ledger or free-form story content. */
export function inspectPortableSave(text: string): SavePreview {
  return parsePortableSave(text).preview;
}

/**
 * Current migration hook. Version 0 was an internal prototype with equivalent
 * data at the top level. Its checksum is verified before any conversion.
 */
export function migratePortableEnvelope(raw: unknown): {
  envelope: PortableSaveEnvelopeV1;
  migratedFrom: number | null;
} {
  if (!isPlainObject(raw)) {
    throw new SaveModelError("INVALID_STRUCTURE", "The save envelope is missing.");
  }
  if (raw.format !== PORTABLE_SAVE_FORMAT) {
    throw new SaveModelError("INVALID_FORMAT", "This file is not a CHORUS save.");
  }
  if (raw.schemaVersion === PORTABLE_SAVE_SCHEMA_VERSION) {
    return { envelope: raw as PortableSaveEnvelopeV1, migratedFrom: null };
  }
  if (raw.schemaVersion !== 0) {
    throw new SaveModelError("UNSUPPORTED_SCHEMA", "This CHORUS save version is not supported.");
  }

  validateLegacyV0(raw);
  verifyRawIntegrity(raw);
  const unsigned = {
    format: PORTABLE_SAVE_FORMAT,
    schemaVersion: PORTABLE_SAVE_SCHEMA_VERSION,
    provenance: {
      app: "CHORUS",
      generatorVersion: raw.generatorVersion as number,
      exportedAt: raw.exportedAt as string,
      exportMode: "player-controlled",
      storageScope: "portable-text",
      networkRequired: false,
    },
    payload: {
      seed: raw.seed as number,
      state: raw.state as NightState,
    },
  } satisfies Omit<PortableSaveEnvelopeV1, "integrity">;
  return {
    envelope: {
      ...unsigned,
      integrity: { algorithm: "fnv1a-32", digest: deterministicDigest(unsigned) },
    },
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
  return inspectPortableSave(text);
}

/** Deliberate read: callers should invoke this only after a player selects a slot. */
export function loadLocalSlot(storage: StorageLike, slot: SaveSlot): ParsedPortableSave {
  assertSaveSlot(slot);
  let text: string | null;
  try {
    text = storage.getItem(localSlotKey(slot));
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
      text = storage.getItem(localSlotKey(slot));
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
    storage.removeItem(localSlotKey(consent.slot));
  } catch {
    throw new SaveModelError("STORAGE_UNAVAILABLE", "This browser could not clear that local slot.");
  }
}

export function localSlotKey(slot: SaveSlot): string {
  assertSaveSlot(slot);
  return `${LOCAL_SLOT_KEY_PREFIX}${slot}`;
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

function validateEnvelopeShape(value: unknown): asserts value is PortableSaveEnvelopeV1 {
  if (!isPlainObject(value) || value.format !== PORTABLE_SAVE_FORMAT || value.schemaVersion !== PORTABLE_SAVE_SCHEMA_VERSION) {
    throw new SaveModelError("INVALID_STRUCTURE", "The CHORUS save envelope is invalid.");
  }
  if (!isPlainObject(value.provenance) || !isPlainObject(value.payload) || !isPlainObject(value.integrity)) {
    throw new SaveModelError("INVALID_STRUCTURE", "The CHORUS save sections are incomplete.");
  }
  const provenance = value.provenance;
  if (
    provenance.app !== "CHORUS"
    || !Number.isSafeInteger(provenance.generatorVersion)
    || provenance.exportMode !== "player-controlled"
    || provenance.storageScope !== "portable-text"
    || provenance.networkRequired !== false
  ) {
    throw new SaveModelError("INVALID_STRUCTURE", "The CHORUS save provenance is invalid.");
  }
  if (value.integrity.algorithm !== "fnv1a-32" || !/^[0-9a-f]{8}$/.test(String(value.integrity.digest))) {
    throw new SaveModelError("INVALID_STRUCTURE", "The CHORUS save integrity record is invalid.");
  }
  if (!("seed" in value.payload) || !("state" in value.payload)) {
    throw new SaveModelError("INVALID_STRUCTURE", "The CHORUS save payload is incomplete.");
  }
}

function validateLegacyV0(value: Record<string, unknown>): void {
  if (
    !Number.isSafeInteger(value.generatorVersion)
    || typeof value.exportedAt !== "string"
    || !("seed" in value)
    || !("state" in value)
    || !isPlainObject(value.integrity)
  ) {
    throw new SaveModelError("INVALID_STRUCTURE", "The earlier CHORUS save is incomplete.");
  }
  assertIsoTimestamp(value.exportedAt);
  assertSeed(value.seed);
}

function verifyIntegrity(envelope: PortableSaveEnvelopeV1): void {
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

function previewFor(envelope: PortableSaveEnvelopeV1): SavePreview {
  const rooms = Object.values(envelope.payload.state.rooms);
  return Object.freeze({
    format: PORTABLE_SAVE_FORMAT,
    schemaVersion: PORTABLE_SAVE_SCHEMA_VERSION,
    generatorVersion: envelope.provenance.generatorVersion,
    exportedAt: envelope.provenance.exportedAt,
    seed: envelope.payload.seed,
    turn: envelope.payload.state.turn,
    elapsedMinutes: envelope.payload.state.elapsedMinutes,
    enteredRooms: rooms.filter((room) => room.entered).length,
    completedRooms: rooms.filter((room) => room.completed).length,
  });
}

function stripPortableHeader(text: string): string {
  const normalized = text.replace(/^\uFEFF/, "").trim();
  if (normalized.startsWith(`${PORTABLE_SAVE_HEADER}\n`)) {
    return normalized.slice(PORTABLE_SAVE_HEADER.length).trimStart();
  }
  if (normalized.startsWith("{")) return normalized;
  throw new SaveModelError("INVALID_FORMAT", "This file is not a CHORUS save.");
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
