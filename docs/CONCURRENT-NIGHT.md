# Concurrent-night runtime

## Purpose and ownership

This document owns the live simulation contract: night state, logical time,
choice access, accepted-event reduction, effects, scheduling, completion,
replay, and runtime validation.

Related canonical specifications:

- scenario construction and rejection: [Generation and coherence](GENERATION-COHERENCE.md);
- communication, linguistic, relational, pressure, and fatigue semantics:
  [Communication and fatigue atlas](COMMUNICATION-ATLAS.md);
- player-visible information timing: [Interaction and progressive disclosure](INTERACTION-DISCLOSURE.md);
- stored representation and reconstruction: [Portable save format](SAVE-FORMAT.md).

## Governing transition

One accepted decision produces exactly six receipts: one local effect and one
effect for each of the five other rooms. Every room exists from minute zero,
including rooms the player has not entered. Entry controls attribution and
disclosure; it does not create the room or start its clock.

## State model

### `NightState`

| Field | Contract |
|---|---|
| `seed` | Unsigned 32-bit generator seed. |
| `elapsedMinutes` | One shared logical minute offset from the authored start. |
| `turn` | Count of accepted player decisions; equal to `decisions.length`. |
| `rooms` | Exactly one `RoomRuntime` for every generated scenario. |
| `decisions` | Append-only accepted decision ledger. |
| `ambientEvents` | Append-only once-only scheduled event ledger. |
| `processedPulseIds` | Idempotency ledger for scheduled pulses. |

### `RoomRuntime`

| Field | Contract |
|---|---|
| `scenarioId` | Identity fixed by the generated pack. |
| `activeCodeId` | Current register; always present in the actor's validated repertoire. |
| `entered` | Whether the player has occupied the seat. |
| `completed` | Whether its fourth local decision resolved. |
| `sceneIndex` | Current four-beat cursor. |
| `metrics` | Live bounded state. |
| `atCompletion` | Immutable metric snapshot created at room close. |
| `inboundEventIds` | Events whose effects reached the room. |
| `localDecisionIds` | Decisions accepted from the room. |
| `support` | Source, evidence, institution, relationship, and distribution receipts assembled for access. |
| `fatigue` | Five bounded load channels. |
| `platformMinutes` | Accepted modeled platform time, never wall-clock reading time. |
| `behaviorPhase` | Current supported pressure state or null for an unmodeled seat. |

### Metrics

The runtime carries separate metrics for:

- reach, heat, crossover, belief, and perceived consensus;
- provenance, verification, trust, and coordination;
- blame, interpretive gap, common ground, and thread focus; and
- discernment and enactment.

Metrics are explanatory variables, not truth, diagnosis, player score, or
prediction. Truth remains in the immutable generated pack and is never read by
effect projection.

## Initialization

`createNightState(pack)`:

1. creates one unentered, incomplete room per scenario;
2. sets its active code to the protagonist's primary register;
3. applies shared initial metrics while preserving actor-specific discernment
   and enactment baselines;
4. creates empty event, support, and fatigue ledgers;
5. sets each supported initial pressure state; and
6. processes any pulse due at logical minute zero exactly once.

Initialization is pure for a validated pack.

## Entry and navigation

`enterNightRoom(state, scenarioId)` changes only `entered` from false to true.
Calling it again is idempotent. It does not:

- advance time;
- mark a decision;
- apply fatigue;
- reveal a future artifact;
- fabricate an event; or
- change metrics.

The interface may show more attributable copy after both crossing endpoints are
entered, but the underlying event and effect remain unchanged.

## Scheduling

### Scene arrival

Each room and beat has an offset from the night start. A choice is eligible only
when the current scene is due at `elapsedMinutes`. A player may switch rooms or
explicitly advance the logical clock to the next arrival. Wall-clock delay has
no effect.

### Ambient pulses

`advanceNightTo(pack, state, minute)` processes every authored pulse whose time
is greater than the current minute and less than or equal to the requested
minute. Each pulse:

- is ordered by logical time;
- is processed at most once through `processedPulseIds`;
- creates one local and five remote effects;
- can change current metrics and fatigue; and
- does not create or imply a player choice.

Advancing to the same minute is idempotent. Moving backward is rejected through
the unchanged state contract.

### Waiting and delay

No choice expires. Delay can accumulate modeled house conditions through due
pulses and accepted actions elsewhere, but it cannot delete every legal repair
route. Reading speed, hesitation, focus movement, drawer use, relationship
exploration, and assistive technology do not advance the clock.

## Choice access

`choiceAccess(choice, room)` returns a structured result rather than a single
disabled flag.

### Structural access

For a choice whose authored status is locked, each required condition is met by
either:

- its incident-authored local condition; or
- support already assembled in the room for that transferable system.

Source and evidence remain incident-scoped. Institution, relationship, and
distribution support may be transferable when explicitly authored.

### Enactment access

An action is capacity-blocked when its `enactmentRequired` exceeds current
enactment. Choices tagged `non-amplification-floor` are exempt so fatigue never
forces repetition, personalization, or amplification.

The result includes required and available enactment plus composite fatigue. It
does not lower discernment or mutate the room.

### Last-resort access

A last resort is inaccessible unless all authored thresholds pass:

- minimum discernment;
- maximum remaining enactment;
- minimum composite fatigue; and
- minimum dominant-channel fatigue.

The same check controls visibility and is repeated by the reducer. A fabricated
or stale interface request cannot invoke it early.

### Visible explanation

An inaccessible ordinary ideal remains visible so the player can distinguish
recognition from capability. The interface may render its authored concise
reason, but attempting it returns the unchanged `NightState`.

## Accepted-choice transition

`applyNightChoice(pack, state, scenarioId, sceneId, choiceId)` follows this
order:

1. Resolve scenario, current room, current scene, and choice identities.
2. Reject completed, stale, duplicate, early, structurally locked,
   capacity-blocked, or ineligible requests.
3. Advance the shared clock by the choice's modeled minutes.
4. Process every scheduled pulse due within that interval once.
5. Calculate one local effect.
6. Calculate one effect for each of the five other rooms.
7. Apply bounded metric, reach, support, and fatigue changes.
8. Preserve discernment against fatigue-driven reduction.
9. Persist any register, conversation, pressure, last-resort, relational, and
   framework records carried by the choice.
10. Append one `DecisionEvent` containing all six effects.
11. Add inbound and local event identities to affected rooms.
12. Advance only the source room's scene cursor.
13. If the fourth local choice resolved, mark that room complete and freeze
    `atCompletion`.
14. Return a state that passes runtime validation.

A failed check returns the original state object. The reducer does not partially
apply a transition.

## Decision event

Every accepted `DecisionEvent` stores:

- deterministic event identity, turn, and logical minute;
- source room, scene, seat, choice, label, intent, signal, and duration;
- typed relational move;
- optional conversation route;
- optional register transition;
- optional pressure transition;
- optional last-resort record;
- sparse framework moves; and
- exactly six `EffectReceipt` records.

The event ledger is sufficient to reconstruct the night from the generated
pack. Rendering choices such as selected tab or open drawer are not events.

## Effect receipts

Each target-specific receipt records:

- target room;
- local or cross-room scope;
- optional link identity, direct/ambient layer, discriminated semantic, and
  mechanism;
- metric deltas;
- background, avoided, and applied reach;
- whether the selected choice actually used a compatible direct carrier, and
  how much reach belongs to that selected carriage;
- transferable support added; and
- reviewed vague and attributable copy where applicable.

### Local effect

The local receipt carries the choice's direct effects in its source room and
may emit incident or transferable support.

### Cross-room ambient effect

Every other room receives a bounded effect projected through its ordered route.
Mechanisms project only relevant metrics. A link with semantic `ambient` may
change attention, trust, attribution, institution load, ranking, or code
friction without asserting that the same claim, format, or target crossed. It
has no carrier and never sets `selectedCarriage`.

### Cross-room direct effect

A direct effect has semantic `content` with a `shared-channel` carrier or
semantic `format` with an `artifact-format` carrier. The source choice must be
shared or public and must permit the matching carriage type. A private or
withheld choice, a content/format mismatch, or a compatible link with no
realized selected movement keeps `selectedCarriage` false. Background model
movement remains possible and separately recorded; it is never rewritten as
selected content or format carriage.

## Fatigue enforcement

Runtime fatigue is added only by authored scene exposure, accepted choices, and
their bounded projected loads. Every channel is clamped to 0 through 100.

`preserveDiscernment(previous, next)` prevents fatigue application from lowering
discernment. Enactment may decline according to authored protagonist sensitivity.
The conceptual meaning of the five channels and the responsibility boundary are
defined in the [Communication and fatigue atlas](COMMUNICATION-ATLAS.md).

## Register transitions

A code-bearing accepted choice can maintain, bridge, or switch registers. The
event records source and target code, audience, intended function, reason, and
bounded switch load. The target register must already belong to the actor's
generated repertoire.

Truth, goal, and discernment do not change merely because a register changed.
`RoomRuntime.activeCodeId` and event history allow the concluding receipt and a
portable replay to reconstruct which codes were actually used.

## Pressure transitions

Each supported choice declares one direction: hold, intensify, contain, settle,
or surge. The resolver maps that direction onto only the phases supported by
the scenario. It may hold, skip unsupported phases, interrupt escalation, begin
release, or reactivate pressure. It cannot infer a phase from elapsed time or a
remote event.

Instrumental actors with null pressure state produce no transition. The
player-facing interface receives phenomenological cues, not the ordered
internal taxonomy.

## Completion and afterimage

When a room's fourth accepted decision resolves:

- `completed` becomes true;
- `atCompletion` freezes a clone of current metrics;
- current metrics, fatigue, support, and inbound history remain live; and
- later house events may change the afterimage but never the snapshot.

The complete house debrief becomes available only when all six rooms are
complete and `turn` is 24.

## Disclosure function

`visibleCrossingCopy(event, effect, state, scenarios)` selects wording based on
whether both source and target rooms have been entered. It never changes effect
values or event history. Generic and attributable copy rules are canonical in
[Interaction and progressive disclosure](INTERACTION-DISCLOSURE.md).

## Runtime validation

`validateNightState(pack, state)` checks at minimum:

- seed and room-set agreement;
- turn and append-only ledger cardinality;
- finite bounded metrics and fatigue;
- valid room cursors, statuses, active registers, and pressure states;
- unique decision, effect, ambient, and pulse identities;
- exactly six effects per decision and pulse;
- valid local and cross-room targets;
- local receipts with no semantic or selected carriage, and cross-room
  receipts whose semantic matches their generated link;
- selected carriage and selected-carriage reach exactly matching typed choice
  delivery, carrier compatibility, and realized movement;
- current support and event references;
- no duplicate pulse processing;
- immutable completion snapshots;
- scene, choice, time, and completion consistency;
- preserved discernment;
- valid register and pressure transitions; and
- reachable access and repair invariants carried from the generated pack.

An invalid state cannot be exported. An imported state must pass these checks
and full reconstruction before it can replace memory state.

## Deterministic replay

Replay begins with `createNightState(pack)`. For each recorded decision:

1. advance to the recorded decision start;
2. enter its source room;
3. resolve the generated scenario, scene, and choice identities;
4. apply the ordinary reducer; and
5. require the turn to increase by one.

After all decisions, advance to the stored logical minute and restore any rooms
entered without a decision. Canonical serialized state must equal the imported
state. A recomputed checksum cannot bypass this requirement.

## Runtime release blockers

- navigation or reading mutates time or fatigue;
- an accepted event lacks one of six effects;
- a pulse fires more than once;
- stale, early, locked, duplicate, or ineligible action mutates state;
- truth participates in effect projection;
- fatigue lowers discernment;
- no carryable non-amplification floor exists;
- unsupported register or pressure transition is accepted;
- a route or receipt class is inferred from prose instead of typed semantic,
  carrier, and delivery fields;
- a direct route claims content or format without its matching carrier, or a
  private, withheld, or mismatched action records selected carriage;
- unrevealed copy names a protected endpoint;
- close snapshot changes after completion;
- isolated replay is permitted; or
- canonical replay differs from the stored state.

The executable coverage map is in
[Testing and traceability](TESTING-TRACEABILITY.md).
