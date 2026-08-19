# Architecture

## Purpose

This document owns the repository-level architecture: module boundaries, data
flow, mutation boundaries, runtime trust boundaries, and the relationship
between generation, play, persistence, and rendering. Domain semantics belong
to the [Communication and fatigue atlas](COMMUNICATION-ATLAS.md); reducer-level
rules belong to the [Concurrent-night runtime](CONCURRENT-NIGHT.md).

## System shape

CHORUS is a browser-first deterministic application with five layers:

1. **Scenario grammar** creates a candidate six-room night from a 32-bit seed.
2. **Coherence gates** reject a candidate that violates content, causal,
   accessibility, safety, or repair-path invariants.
3. **Pure night reducer** accepts validated actions and appends deterministic
   events to one shared night state.
4. **Interaction layer** renders only the information permitted by the current
   entry, completion, and disclosure state.
5. **Player-controlled persistence** reconstructs and validates a saved night
   before allowing it to replace memory state.

```text
32-bit seed
    |
    v
scenario grammar --> coherence validation --> immutable generated pack
                                               |
                                               v
                                      initial night state
                                               |
                          accepted action + current scene identity
                                               |
                                               v
                                      pure event reduction
                                               |
                   +---------------------------+------------------+
                   |                           |                  |
                   v                           v                  v
            rendered disclosure        optional local save   portable text
                   |                           |                  |
                   +---------------------------+------------------+
                                               |
                                      validate + reconstruct
```

## Module ownership

### `app/scenario-generator.ts`

Owns immutable content and construction:

- generator version and seeded pseudo-random selection;
- incident, actor, linguistic, and world-model source grammars;
- four-beat scene and choice construction;
- communication, deliberate-protection, incentive, and fatigue ledgers;
- situational pressure contours and sparse action structures;
- systemic routes, compatible direct crossings, and ambient pulses;
- distributed repair paths and non-amplification floors; and
- scenario, pack, content-safety, and coherence validation.

It does not own player state or mutate an accepted night.

### `app/night-engine.ts`

Owns live concurrent state:

- initial room state;
- entered, active, completed, and close-snapshot status;
- shared logical clock and scheduled pulse processing;
- structural and enactment access checks;
- accepted decision events and six effect receipts;
- metric, support, fatigue, linguistic, pressure, and framework transitions;
- live afterimages after a room closes;
- disclosure-safe crossing copy; and
- full-state validation and deterministic replay.

The engine is a pure state transformer. It does not read the DOM, browser
storage, wall-clock dwell time, or network state.

### `app/save-model.ts`

Owns persistence boundaries:

- memory-only default preference;
- three explicitly selected browser slots;
- portable text envelope and preview;
- size, depth, node, string, array, type, range, and version checks;
- deterministic corruption detection;
- schema migration hook;
- reconstruction from seed and accepted event history; and
- rejection of state that cannot be reproduced by the current generator.

It has no import-time storage side effect. Storage is provided through a small
`StorageLike` interface so behavior is testable without a browser.

### `app/page.tsx`

Owns application interaction and derived presentation:

- prelude, map, invitations, active rooms, close receipts, relationship view,
  and whole-night debrief;
- room switching without clock mutation;
- focus transfer and live announcements;
- blocked-action expansion and collapse;
- drawer isolation and focus containment;
- player-selected film and motion presentation; and
- aggregation used only for visible house context.

It may request an engine transition, but it does not calculate an alternate
truth, bypass choice access, or write a save automatically.

### `app/privacy-panel.tsx`

Owns explicit persistence controls. It reads slot inventory only when asked,
requires a per-slot enabling action before writing, previews portable input
before loading, and confirms destructive slot clearing.

### `app/globals.css`

Owns visual tokens, the single-viewport grid, named scroll regions, responsive
reflow, touch targets, focus appearance, reduced-motion behavior, forced-colors
behavior, and progressive-disclosure layouts.

### `tests/`

Owns executable contracts. Tests import the same generator, reducer, and save
functions used by the application. Static surface tests also inspect rendered
markup and style contracts for disclosure and accessibility regressions.

## Data ownership

| Data | Created by | Mutable during play | Persisted by default | May affect truth |
|---|---|---:|---:|---:|
| Generated pack | Scenario grammar | No | No | Defines immutable truth |
| Truth ledger | Scenario grammar | No | Only inside a chosen save | It is truth; never a propagation coefficient |
| Room runtime | Night reducer | Yes, by accepted events | No | No |
| Decision events | Night reducer | Append-only | No | No |
| Ambient events | Scheduler | Append-only | No | No |
| Completion snapshot | Night reducer | No after room close | No | No |
| Current afterimage | Night reducer | Yes after room close | No | No |
| Interface selection | Interaction layer | Yes | No | No |
| Blocked explanation state | Interaction layer | Yes | No | No |
| Browser slot | Save model after explicit action | Replaced only by explicit action | Yes | No |
| Portable text | Save model after explicit action | File controlled by player | Outside application | No |

## Determinism boundary

Generation is deterministic for a normalized 32-bit seed. Reduction is
deterministic for a validated pack and ordered sequence of scene and choice
identifiers. The following are deliberately outside deterministic simulation
state:

- how long the player reads;
- DOM read frequency;
- keyboard, pointer, touch, or assistive-technology input method;
- which room is visually selected when no action is accepted;
- film and motion presentation preferences;
- drawer, details, tab, or relationship-filter state; and
- file location chosen for a portable export.

New-night generation requests an unpredictable browser seed when available and
uses a deterministic arithmetic fallback only if the sampled value is zero.
Once selected, that seed produces a reproducible pack.

## Mutation boundary

Only these actions may mutate `NightState`:

- entering a room, which changes only its `entered` flag;
- accepting a currently due and accessible choice;
- explicitly advancing the logical clock to the next arrival; and
- restoring a fully validated save.

Navigation, reading, focus, disclosure toggles, relationship filters, film,
motion, and an unsuccessful choice attempt do not mutate the night.

## Trust boundaries

### Authored source

Scenario strings and coefficients ship with the application and pass
generation validation before play.

### Portable input

Portable text is untrusted. Parsing is bounded before deep traversal. The
envelope, schema, timestamp, seed, generator version, metrics, events, effects,
fatigue, linguistic transitions, and checksum are validated. The imported state
must also replay against a newly generated pack for the same seed.

### Browser storage

Local storage is treated as optional and fallible. A corrupt slot is isolated
and reported without blocking inspection of other slots. No slot is read on
module import or application start.

### Rendering

Imported free-form story text is never trusted as a new scenario source. The
current generator reconstructs the authored pack and verifies the event ledger;
the renderer consumes validated application state.

## Network boundary

After application assets have loaded, play, generation, reduction, local slots,
portable input/output, relationship exploration, and debrief require no remote
request. The application contains no account system, analytics client,
advertising client, remote scenario endpoint, or server-side game-state store.

Deployment mechanics are intentionally outside the game architecture. A source
archive must run locally without a project identity file or remote binding.

## Failure containment

- An invalid generated candidate never replaces a playable night.
- A stale, early, locked, or duplicate action returns the unchanged state.
- A malformed save is rejected before application state changes.
- One corrupt browser slot does not invalidate the others.
- A drawer never mutates simulation state.
- Missing motion or film effects do not remove information.
- A room can retain its immutable close receipt even as later events alter its
  live afterimage.

Expected degraded states and recovery behavior are catalogued in
[Edge cases and failure behavior](EDGE-CASES.md).

