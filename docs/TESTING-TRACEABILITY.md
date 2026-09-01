# Testing and traceability

## Purpose

CHORUS treats its thesis as an executable contract. This document maps product,
simulation, accessibility, privacy, and portability claims to automated suites,
manual checks, and notebook evidence. A passing build alone is not a complete
release decision.

## Command matrix

| Command | Primary responsibility |
|---|---|
| `npm run lint` | Static code quality and framework rules. |
| `npm run test:night` | Generation, actor cohesion, communication coverage, concurrent state, propagation, fatigue, pressure, sparse structures, authored-copy binding, and replay. |
| `npm run test:simulation` | Fast deterministic contract for the large-run harness, autonomous waiting-room evolution, exactly-once causality, invalid operations, and numeric bounds. |
| `npm run evidence:simulation` | Verify the committed 4,096-seed/512-play machine-readable simulation result against the current harness sources. |
| `npm run test:save` | Memory-only default, local slot consent, portable envelope, bounds, migration, corruption detection, and deterministic reconstruction. |
| `npm run test:copy` | Pure naturalized-summary and plain-concept derivation, route variation, status provenance, adjacent model limit, and tab-free conclusion structure. |
| `npm run test:linguistics` | Exact voice-source authority, fictional-seat focalization, disclosure-gated builders and publications, route-language truthfulness, sealed save bytes, and complete causal clauses. |
| `npm run test:a11y` | Progressive disclosure, navigation uniqueness, semantic relations, focus contracts, target floors, privacy disclosure, and labelled completed-night reading order. |
| `npm run test:viewport` | One-viewport ownership, reflow, named scroll regions, mobile/landscape behavior, operable blocked actions, and the normal-flow completed-night region. |
| `npm run docs:check` | Documentation-link integrity plus committed notebook source/output drift, completed cells, publication metadata, static HTML structure, local assets, and notebook contrast floor. |
| `npm run build` | Production compilation. |
| `npm test` | Documentation; night, simulation-contract, save, copy, linguistics, accessibility, viewport, portability, and distribution suites; production build; and rendered metadata check. |
| `npm run verify:release` | Lint, type check, committed simulation-evidence drift check, then the complete `npm test` release gate. |

Focused suites should be run during development. A release candidate runs every
row, notebook validation, the forbidden-reference scan, and manual checks.

## Test ownership

### `tests/concurrent-night.test.mjs`

This is the principal systems suite. It covers:

- 1,000 generated-night coherence passes;
- arbitrary room-entry order without clock mutation;
- serial and reverse completion with one local plus five remote receipts;
- exactly-once scheduled pulses;
- immutable completion snapshots and changing afterimages;
- stale, early, locked, and unavailable action rejection;
- every entered/unentered disclosure combination;
- distributed support making a blocked ideal reachable;
- exact six-dynamic coverage;
- cohesive actor repertoires and independent world models;
- persisted register transitions;
- deterministic choice shuffling;
- complete deliberate-protection beneficiary coverage;
- sparse conversation routing and its separation from truth and repair;
- incident-bound communication facts;
- compatible relational crossings;
- scapegoat and rumor evidence boundaries;
- common ground across code difference;
- prosocial follow-through decline without discernment decline;
- a non-amplification floor under heavy fatigue;
- last-resort eligibility and asymmetric consequence receipts;
- situational, non-linear pressure transitions;
- sparse leadership, repair, and internal review structures;
- context-compatible critical lenses; and
- persistence of selected framework applications.

### `tests/copy-contract.test.mjs`

This suite owns the source-level version-14 conclusion contract. It checks:

- a single naturalized state-derived summary followed by a separate plain
  concept receipt, with no seven-receipt or Heart structure;
- deterministic summary variation across materially different played states
  without turning the prose into a concept taxonomy;
- a concept receipt deduplicated from `SceneLesson` values attached to accepted
  decision scenes;
- literal `encountered`, `experienced`, and `played` status evidence, including
  source scene IDs, exact rule-matched effect-event IDs, explicit-binding
  played decision IDs, and independence between those provenance sets;
- status invariance under label/detail/intent/tag mutation, loss of played
  status when a binding is removed, rejection of unrelated nonzero metrics,
  and the valid played-without-effect boundary;
- selected-path carriage separated from background-only model movement and
  remaining afterimage selected by normalized rather than raw magnitude;
- a refusal-only route is not reported as a deliberate act the player never
  selected;
- the explanatory-model limit remains visible beside, but outside, the
  naturalized summary; and
- format-only route data never becomes a direct content claim, while a typed
  selected format receipt can still satisfy a rule that explicitly permits
  format carriage.

The suite is an automated source contract, not browser, screen-reader, or
release evidence by itself. Its final execution result remains to be bound to
the promoted version-14 source digest.

### `tests/save-model.test.mjs`

This suite covers:

- import-time memory-only behavior with zero storage access;
- portable round trip and bounded preview;
- generator-version mismatch;
- ordinary corruption and fabricated state with recomputed checksum;
- register-transition replay and tampering;
- per-slot consent and selected-key isolation;
- deliberate inventory and corrupt-slot isolation;
- schema-0 migration after legacy integrity validation; and
- oversized, deep, foreign, and unsupported input rejection.

### `tests/simulation-maturity.test.mjs` and the release harness

The focused test runs a reduced deterministic sample twice and requires
byte-equivalent evidence. It also checks due-minute boundaries while all rooms
remain unentered, direct-versus-stepped clock equivalence, exactly-once local
and remote receipts, replay, invalid-state rejection, invalid-action no-ops,
and normalized metric and fatigue ranges.

The retained release harness expands that contract to seeds 0 through 4,095:

- 4,096 coherent generated nights, 24,576 rooms, 98,304 scenes, and 122,880
  directed links;
- 512 completed randomized interleavings, split evenly across four choice
  policies, with 512 exact action-ledger replays;
- 12,288 accepted decisions and 12,288 autonomous pulses, each with one local
  and five remote effects, for 147,456 total effect receipts;
- 128 direct-versus-stepped clock comparisons, 256 due-boundary checks, and
  768 unentered waiting-room evolution checks;
- 432 targeted semantic and structural state mutations rejected without a
  crash or state replacement, and 640 invalid actions confirmed as no-ops; and
- 118,668 assertions with zero invariant, validation, replay, or choice-path
  failures.

The raw [simulation maturity result](../evidence/runs/simulation-maturity.v1.json)
is deterministic, content-addressed, and contains the exact seed domain,
source digests, policy counts, bounds, result digests, and limitations. A
separate invocation of the same harness with `--check` reproduced the same
file. This finite sweep is strong
release evidence, not an exhaustive proof over all 2³² seeds or every possible
24-choice path.

### Retained historical browser playability result

The raw
[end-to-end playability result](../evidence/runs/end-to-end-playability.v1.json)
separates evidence by source provenance. Its then-current segment used 52
locator-driven steps in one Chrome-family desktop session against the
historical generator-version-13 binding and verified:

- turn 24/24 and six of six rooms closed;
- exactly one historical tabbed whole-night receipt and 24 decisions in the
  conclusion;
- document, window, scroll, and shell dimensions all contained at 1363 by 936
  CSS pixels with zero body offset; and
- zero warnings or errors attributed to the application origin.

That run does not verify the version-14 naturalized summary, plain concept
receipt, model-limit placement, or absence of the former tab/Heart structure.
A new current-source browser completion is pending.

Earlier manual keyboard, drawer-focus, blocked-reason, local-slot, and
export-control observations remain in the same record under their prior-source
digest. They are useful defect and interaction history, not version-14
execution proof. The historical record marks browser import, download arrival,
request-level network observation, assistive technology, physical mobile/touch,
automated contrast scanning, and a second browser engine unverified.

### `tests/accessibility-disclosure.test.mjs`

This suite inspects source and rendered interaction contracts for:

- a directional but non-didactic prelude;
- sealed communication, pressure, protection, and linguistic classifications;
- separate labelled final-story, plain-concept, and model-limit regions in
  their fixed reading order;
- no conclusion tabs, details maze, Heart taxonomy, or revived analytic
  language-profile syllabus;
- path-derived plain concepts without private motive, protected ledger, or
  internal framework leakage;
- a single uncapped new-night control;
- concurrent room switching;
- a filterable and keyboard-explorable relationship view;
- unique destinations per viewport;
- emblem geometry and color order;
- modal isolation, focus containment, and focus return;
- text alternatives for metrics;
- focus visibility, text scaling, and target floors;
- visible but unexplained unavailable ideals;
- declarative concluding copy without player diagnosis or grading; and
- one progressively disclosed privacy and saves destination.

### `tests/viewport-contract.test.mjs`

This suite covers:

- exactly one dynamic viewport owner;
- safe-area metadata without zoom suppression;
- stateful navigation rather than document jumps;
- named internal overflow regions;
- mobile and short-landscape bounds;
- operable unavailable actions and same-control reason closure; and
- one normal-flow completed-night reading region rather than a tab or
  disclosure maze; and
- naturalized summary, concept receipt, and model limit reflow within the one
  debrief scroller.

### `tests/rendered-html.test.mjs`

This suite checks title and description metadata in rendered output. It is a
small smoke test, not a substitute for full interaction or accessibility
inspection.

## Requirements traceability

| Requirement | Generation/static gate | Runtime gate | Automated evidence | Manual or notebook evidence |
|---|---|---|---|---|
| Six concurrent rooms share one logical clock | Pack shape | `NightState.elapsedMinutes` and reducer | Concurrent suite | Systems Atlas event timeline |
| Every accepted choice produces six effects | Route and choice construction | Reducer requires six target effects | Concurrent suite | Systems Atlas propagation view |
| Unentered rooms evolve autonomously by logical time | Scheduled autonomous scene for every beat | `advanceNightTo` processes due pulses without entry | Simulation maturity suite and 128-seed clock sweep | Machine simulation result |
| Interleaved play preserves exactly-once cross-room causality | Six-effect choice and pulse construction | State validation, inbound ledgers, replay | 512-play maturity sweep, 147,456 receipts, zero failures | Machine simulation result |
| A complete playable browser path reaches the current conclusion | Four beats in six rooms | Version-14 browser completion pending | Historical v13 browser result does not verify the current conclusion | Renewed browser record pending; Validation Atlas remains historical |
| Ground truth never changes | Immutable generated pack | Truth excluded from effect application | Concurrent suite | Source review |
| Communication dynamics appear exactly once | Pack validator | Ledger remains attached to scenario | Concurrent suite | Validation Atlas coverage table |
| Truth, propagation, disclosure, and analytic communication facts belong to the active incident without merging | Exact three-field `TruthLedger`; one-field `PropagationLedger`; beat-local `SceneDisclosure`; analytic fact bindings | Scene identity and disclosure access validated | Concurrent and disclosure suites | Validation Atlas fact-binding sample remains historical until regenerated |
| Actors remain cohesive across register switches | Repertoire and continuity gates | Active code and transition persistence | Concurrent and save suites | Systems Atlas repertoire tables |
| Shared code does not imply shared world model | Encounter validator | No relationship edge or direct-route basis | Concurrent and disclosure suites | Systems Atlas comparison |
| Deliberate protection requires prior private knowledge | Misrepresentation ledger gate | Selected record persists | Concurrent suite | Validation Atlas beneficiary matrix |
| Observation, inference, and unknown remain separate | Ledger cardinality gate | Disclosure-specific rendering | Concurrent and disclosure suites | Manual debrief review |
| Fatigue may reduce enactment, not discernment | Typed choice and scene loads | `preserveDiscernment` | Concurrent suite | Systems Atlas trajectories |
| Every beat retains non-amplification | Choice validator | Access exemption | Concurrent suite | Validation Atlas floor matrix |
| Extreme last resort remains gated and asymmetric | Compatible authored choice | Eligibility repeated by reducer | Concurrent suite | Systems Atlas threshold view |
| Pressure contour remains situational | Supported phase set | Transition resolver | Concurrent and disclosure suites | Manual conclusion review |
| Interpretation remains sealed until night complete | Public-copy generation | Completion gate and visible-copy function | Disclosure suite | Screen-reader inspection |
| The conclusion begins with one continuous, state-derived naturalized summary | Pure `buildNaturalizedSummary(pack, state)` | Completed-state gate, beat-local disclosure, one governing route, typed atoms, and ordered paragraph rendering | Copy suite passed 34/34 on the current binding | Browser and assistive-technology renewal pending |
| The summary ends in unresolved reach or afterimage, not a lesson or disclaimer | Source-backed narrative synthesis | Model limit rendered adjacent and outside summary prose | Copy afterimage, tie, no-change, chronology, and cadence attacks passed | Editorial and browser review pending |
| Plain concepts follow in a separate semantic surface | Accepted-scene `SceneLesson` fields and explicit choice bindings | Deduplication, typed status, and visible discriminated evidence | Copy, linguistic, and disclosure suites passed on the current binding | Screen-reader reading-order review pending |
| Concept status means encountered, experienced, or played literally | `SceneLesson.experienceRules` and `GeneratedChoice.conceptPlays` | Strongest status; scene IDs; exact matched effect-event IDs; bound played decision IDs; independent provenance sets | Copy suite passed prose-mutation, removed-binding, unrelated-metric, and played-without-effect boundaries | Source-to-render spot check pending |
| Summary distinguishes selected carriage from background model movement | Typed effect receipts | `selectedPathCarriage` plus applied/background/avoided reach and crossover | Copy and linguistic route-boundary attacks passed | Source-to-render route spot check pending |
| Remaining afterimage is compared across metric scales | Close snapshot and current metrics | Normalized magnitude with raw values retained | Copy suite passed normalized, equal-tie, and valid no-change boundaries | Editorial residue review pending |
| The completed-night view has no tabbed/Heart taxonomy | Tab-free source contract | One normal-flow debrief scroller | Copy, disclosure, and viewport suites passed on the current binding | Browser/reflow review pending |
| Unavailable ideals explain but do not mutate | Blocked-attempt metadata | `choiceAccess` and unchanged state | Concurrent and viewport suites | Keyboard/manual mobile review |
| Choice order does not reveal ideal | Deterministic shuffle | Render source order | Concurrent suite | Multi-seed notebook table |
| Relationship plot does not infer hidden ties | Authored outward relations only | Filtered derived view | Disclosure suite | Keyboard and screen-reader review |
| Reading and assistive technology do not add fatigue | No wall-clock loads | Idempotent same-minute state | Concurrent suite | Manual slow-play review |
| Session-only is default | Save preference | No import-time storage access | Save suite | Browser storage inspection |
| Portable input fails closed | Envelope and bounds | Replay reconstruction | Save suite | Validation Atlas failure matrix |
| Mobile fits one viewport without page side-scroll | CSS contract | Stage and drawer behavior | Viewport suite | Device and zoom matrix |
| Reduced motion preserves information | CSS and component state | Simulation independent of presentation | Disclosure/viewport static checks | Manual reduced-motion review |
| Clean source runs independently | Archive exclusions | Local install and start without repository identity | Clean-room `npm ci` and `npm test` | Clean-room start log |

## Determinism checks

For a fixed seed and ordered action sequence, compare:

- generated room and scene identities;
- truth and communication ledgers;
- route and pulse identities;
- choice order;
- event timestamps;
- all six effects per choice;
- current register and code-transition history;
- pressure and framework moves;
- support and fatigue;
- completion snapshots and afterimages; and
- final canonical night state.

Changing room-navigation order without accepting an action must not change any
of these values.

## Manual release matrix

Automated suites do not replace these checks:

1. Complete a night in desktop, narrow portrait, and short landscape layouts.
2. Switch rooms before and after scheduled arrivals.
3. Open and close an unavailable reason from its own control at each possible
   choice position.
4. Explore the relationship graph with pointer and keyboard, then confirm text
   parity and no horizontal page scroll.
5. Complete keyboard-only and screen-reader passes described in
   [Accessibility](ACCESSIBILITY.md).
6. Verify system reduced motion, Motion off, Film off, and forced-colors states.
7. Inspect browser network activity during generation, play, slot operations,
   portable export, and import.
8. Inspect browser storage before opening privacy, after inventory, after
   enabling a slot, after save, load, and clear.
9. Export, inspect, cancel, load, corrupt, oversize, and version-mismatch saves.
10. Confirm no conclusion appears at turn 23. At turn 24, confirm the fixed
    order is naturalized summary, adjacent model limit, then plain concept
    receipt, with no conclusion tabs or Heart taxonomy.
11. Open every documentation and rendered-notebook link in the source archive
    and published documentation index.

## Notebook evidence

The [Systems Atlas](../public/notebooks/chorus-systems-atlas.html) and
[Validation Atlas](../public/notebooks/chorus-validation-atlas.html) are
committed with completed cell output for their historical bindings. Their
metadata records build date, builder, deterministic status, Python language
version, and execution counts. Their artifact manifest records path, media
type, byte length, and SHA-256 digest. Tables require captions and scoped
headers and cannot rely on color alone.

The notebooks execute fixed architecture and verification declarations from
their standard-library builder. They name the source and test files whose
contracts they explain; they do not import the TypeScript runtime or perform the
1,000-seed sweep. The concurrent suite remains the evidence for live
generation. If a notebook declaration and a release test disagree, the release
test fails and the discrepancy is investigated; the notebook is never used to
waive a gate. These publications are rebuilt from current declarations and
explain the current version-14 contracts. The Historical Verification Ledger
retains earlier browser, distribution, and release results under their original
provenance. Neither publication generation nor current focused tests substitutes
for live-browser or assistive-technology evidence.

## Failure reporting

For a deterministic failure include:

- source revision;
- seed;
- ordered scenario/scene/choice identifiers;
- expected and observed turn and logical minute;
- relevant room state or save error code;
- command, browser, viewport, and input method; and
- whether the failure reproduces after a whole-night replay.

Do not report only visual copy when the underlying event identity is available.
The identity sequence permits exact reconstruction without exposing a personal
interpretation.

## Release evidence record

The canonical candidate boundary is [Release status](RELEASE-STATUS.md). Its
[published evidence record](../public/evidence/index.html) states:

- revision and package-lock digest;
- Node and npm versions;
- each command and exit status;
- advisory review result separated into runtime and development scope;
- notebook source and rendered-output digests;
- manual accessibility/browser/viewport matrix;
- clean-source install/build/start result; and
- known limitations or explicitly deferred noncritical issues.

The public record is derived from a repository-owned machine-readable source.
It binds each retained result to an implementation digest and names pending
manual checks explicitly. Do not edit the rendered HTML or public JSON by hand.
