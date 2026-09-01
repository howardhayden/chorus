# Portable save format

## Status

This document specifies `CHORUS_PORTABLE_SAVE` schema version 2 and its browser
slot contract. Schema 2 stores the minimum numeric replay trace required to
reconstruct a night. It does not persist the generated night state, authored
scene or choice copy, linguistic records, effect receipts, frameworks, motives,
or conclusion text.

The current authored generator is version 15. A save can reproduce its exact
night only through the matching generator and reducer. A save from a different
generator version fails closed with `GENERATOR_VERSION_MISMATCH` unless that
version has a separate, explicit, tested reconstructor. Relabeling a legacy save
does not make it compatible.

## File form

New exports are UTF-8 text with this form:

```text
CHORUS SAVE · 2
{
  "format": "CHORUS_PORTABLE_SAVE",
  "schemaVersion": 2,
  "provenance": { ... },
  "payload": { ... },
  "integrity": { ... }
}
```

The trailing newline is conventional. Import accepts schema-2 JSON without the
human-readable header and tolerates a UTF-8 byte-order mark. It also accepts the
documented schema-1 header for schema-1 migration. A header and body that name
different schemas are rejected. Other prefixes are rejected.

Maximum encoded input size remains 512 KiB so documented legacy full-state
saves can reach their migration path. Schema-2 output is substantially smaller.

## Envelope

### Top level

| Field | Type | Requirement |
|---|---|---|
| `format` | string | Exactly `CHORUS_PORTABLE_SAVE`. |
| `schemaVersion` | integer | Exactly `2` after migration. |
| `provenance` | object | Required; exact keys only. |
| `payload` | object | Numeric replay trace; exact keys only. |
| `integrity` | object | Deterministic corruption check; exact keys only. |

Unknown fields at the top level or inside any schema-2 section are rejected,
even when the digest has been recomputed. This prevents arbitrary prose or
analysis from being carried inside an otherwise valid save envelope.

### Provenance

| Field | Type | Requirement |
|---|---|---|
| `app` | string | Exactly `CHORUS`. |
| `generatorVersion` | integer | Must equal the generator that reconstructs the seed; current exports use `15`. |
| `exportedAt` | string | Canonical valid UTC ISO timestamp ending in `Z`. |
| `exportMode` | string | Exactly `player-controlled`. |
| `storageScope` | string | Exactly `portable-text`. |
| `networkRequired` | boolean | Exactly `false`. |

### Replay payload

| Field | Type | Requirement |
|---|---|---|
| `seed` | integer | Inclusive range 0 through 4,294,967,295. |
| `elapsedMinutes` | integer | Final logical clock, inclusive range 0 through 1,440. |
| `enteredRoomOrdinals` | integer array | Sorted, unique final entered-room ordinals; each is 0 through 5. |
| `decisions` | coordinate array | Ordered accepted decisions; at most 24. |

Each decision coordinate has exactly three integer fields:

| Field | Meaning |
|---|---|
| `roomOrdinal` | Source room position in the seeded scenario pack, 0 through 5. |
| `choiceOrdinal` | Selected choice position in that room's current replay-derived scene. |
| `startMinute` | Logical minute at which the decision began, 0 through 1,440. |

The source scene is not stored. It is the room's current scene at that point in
replay. Turn is not stored; it is the coordinate count. Choice duration,
completion time, room completion, active linguistic code, metrics, fatigue,
support, ambient activity, effects, and conclusion evidence are all regenerated.

The payload contains no string values. In particular it does not contain:

- scenario, scene, choice, event, link, or linguistic-code identifiers;
- scene, artifact, choice, signal, crossing, or room prose;
- relational, diversion, misrepresentation, framework, last-resort, register,
  pressure-phase, or motive records;
- current metrics, completion metrics, fatigue, support, or effect receipts;
- naturalized-summary or plain-concept-receipt content.

### Integrity

| Field | Type | Requirement |
|---|---|---|
| `algorithm` | string | Exactly `fnv1a-32`. |
| `digest` | string | Eight lowercase hexadecimal characters. |

The digest covers canonical JSON for every top-level field except `integrity`.
Object keys are sorted recursively; array order is retained; non-finite and
unsupported values are rejected.

## Export validation

`createPortableSave` does not project arbitrary in-memory values directly into
the file. It:

1. converts the current runtime state to its JSON representation;
2. validates its bounded legacy-shaped runtime structure;
3. regenerates the current pack from the seed;
4. validates the complete runtime invariants;
5. replays every recorded decision and requires canonical equality;
6. derives room, choice, and start-minute coordinates plus final time and room
   entries;
7. reconstructs the night again from only that trace;
8. requires canonical equality with the original state; and
9. writes the schema-2 envelope and corruption digest.

No generated prose or derived analytic state is copied into the payload.

## Import and reconstruction

`parsePortableSave` performs the following sequence:

1. verify input type and byte limit;
2. remove an optional byte-order mark and a supported header;
3. parse JSON and require any header to match the body schema;
4. bound the complete input tree;
5. validate schema 2 or execute a documented legacy migration;
6. require exact schema-2 keys and value shapes;
7. verify the deterministic digest;
8. validate timestamp, seed, and current generator version;
9. create a fresh night from that seed;
10. for each coordinate, derive the room's current scene and indexed choice;
11. advance to the recorded start minute, enter that room, and require the
    choice to advance exactly one turn;
12. require final time not to precede the last choice, then advance to it;
13. restore the sorted final entered-room set and require that it includes every
    room used by a decision;
14. validate the reconstructed runtime invariants; and
15. return only the rebuilt canonical state and bounded preview.

An out-of-range, stale, locked, early, reordered, or otherwise impossible
coordinate fails with no best-effort coercion.

## Preview contract

Preview is computed only after successful reconstruction. It contains:

- format and current schema version;
- generator version;
- export time;
- seed;
- reconstructed turn and elapsed logical minutes;
- reconstructed entered-room count; and
- reconstructed completed-room count.

It contains no playable ledger or free-form content. File selection and preview
do not replace the current night; loading requires a second player action.

## Legacy migration

### Schema 1

Schema 1 stored `seed` and a complete `NightState` under `payload`. Migration is
permitted only when all of these checks pass:

1. exact schema-1 envelope, provenance, payload, and integrity keys;
2. the original schema-1 digest;
3. canonical timestamp and bounded seed;
4. an installed matching generator version;
5. complete legacy state shape and runtime invariants;
6. event-by-event legacy replay with canonical equality;
7. reduction of that validated state to a schema-2 trace; and
8. trace-only reconstruction with a second canonical equality check.

The parser reports `migratedFrom: 1`. Migration occurs in memory and performs no
storage write, deletion, or network request.

### Schema 0

Schema 0 was an internal prototype with generator version, export time, seed,
state, and integrity at the top level. Its exact original keys and digest are
validated before the same full-state and trace reconstruction gates. The parser
reports `migratedFrom: 0`.

Unsupported versions fail with `UNSUPPORTED_SCHEMA`. A legacy save whose
generator is no longer installed fails with `GENERATOR_VERSION_MISMATCH`; it is
not silently reinterpreted through current authored copy.

## Browser slot contract

Current schema-2 slots use these keys:

```text
chorus:local-save:v2:A
chorus:local-save:v2:B
chorus:local-save:v2:C
```

The prior schema-1 keys remain read-only migration candidates:

```text
chorus:local-save:v1:A
chorus:local-save:v1:B
chorus:local-save:v1:C
```

For each selected slot, CHORUS checks the schema-2 key first. It checks the
matching schema-1 key only when the current key is absent. A corrupt current
value is surfaced for review and is not hidden by a stale legacy value.

A read or inventory may migrate legacy text in memory but never writes it back.
An explicit save writes the selected schema-2 key and, after that write
succeeds, removes the selected legacy key if present so conclusion-bearing
legacy bytes do not linger in the replaced logical slot. Explicit clear removes
both versioned keys for the selected slot. No operation enumerates unrelated
browser storage.

A write or clear still requires a short-lived `LocalSlotConsent` capability:

```text
kind: chorus-local-slot-consent
slot: A | B | C
granted: true
```

The capability is created only after the player enables that slot in the open
privacy panel. It is not serialized or retained as a blanket preference.

## Error codes

| Code | Meaning |
|---|---|
| `SAVE_TOO_LARGE` | Encoded input exceeds 512 KiB. |
| `INVALID_JSON` | JSON cannot be parsed. |
| `INVALID_STRUCTURE` | Envelope, exact keys, tree, field, collection, or value shape is invalid. |
| `INVALID_FORMAT` | Header or format identifier does not identify the same supported CHORUS schema as the body. |
| `UNSUPPORTED_SCHEMA` | Schema has no explicit migration path. |
| `INTEGRITY_MISMATCH` | Content changed without a matching deterministic digest. |
| `INVALID_TIMESTAMP` | Export time is not canonical valid UTC. |
| `SEED_RANGE` | Seed is not a 32-bit unsigned integer. |
| `GENERATOR_VERSION_MISMATCH` | The installed generator cannot promise the same authored pack. |
| `STATE_INVALID` | Trace timing, coordinates, entries, legacy state, or reconstructed runtime is inconsistent. |
| `SLOT_CONSENT_REQUIRED` | A browser write or clear was attempted without selecting the slot. |
| `STORAGE_UNAVAILABLE` | Browser storage could not be read, written, migrated after explicit save, or cleared. |
| `SLOT_EMPTY` | Neither versioned key for the selected slot contains a value. |

User-facing copy may be shorter but must preserve the action, result, limit, and
recovery path.

## Integrity and confidentiality limits

FNV-1a is a deterministic corruption check. It is not a digital signature,
message authentication code, encryption method, source credential, or proof of
authorship. Replay rejects impossible or contradictory traces. It cannot tell
an authentic player history from a different valid history whose editor has
recomputed the digest.

Schema 2 minimizes directly stored content; it does not make a save secret. The
numeric seed and matching CHORUS application code are sufficient to regenerate
the authored scenario pack and the conclusion derived from a valid trace.
Players should treat a save as a gameplay record they control.

## Compatibility guarantees

CHORUS guarantees that:

- schema-2 text can be inspected independently as JSON;
- a valid unmodified trace with its matching generator reproduces the exact
  canonical runtime state;
- zero-decision, partial, and completed nights use the same trace-only shape;
- field order does not change the canonical digest;
- schema-1 and schema-0 migration never trusts imported prose as current output;
- preview never renders imported narrative; and
- loading, inventory, and migration do not write browser storage.

CHORUS does not guarantee that:

- a save works with a different generator version;
- the digest identifies an author or proves a historical account;
- localStorage survives browser policy, private mode, profile deletion, sync, or
  quota changes; or
- a downloaded file can be deleted or recovered by CHORUS.

## Change control

Before changing the format:

1. increment the schema and human-readable header;
2. assign a distinct browser key namespace;
3. state whether the change is trace, generator, reducer, or presentation only;
4. define exact keys and bounds;
5. add positive, negative, boundary, combined, and correction tests;
6. red-team persisted bytes for forbidden generated or analytic content;
7. document migration and rejection behavior;
8. verify migration performs no implicit storage or network I/O; and
9. preserve failed tests and the evidence of their correction.
