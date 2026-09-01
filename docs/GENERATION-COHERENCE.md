# Generation and coherence

## Purpose

This document owns the scenario-generation pipeline and the conditions that
make a generated night playable. It does not redefine the communication
concepts in the [Communication and fatigue atlas](COMMUNICATION-ATLAS.md) or the
event rules in the [Concurrent-night runtime](CONCURRENT-NIGHT.md).

## Generation contract

`generateScenarioPack(seed)` accepts a finite 32-bit integer under current
generator version 15 and returns one validated `GeneratedScenarioPack`
containing:

- a generator version and normalized seed;
- six unique generated scenarios;
- one shared night clock;
- six sparse compatible direct links;
- 30 bounded ordered cross-room routes;
- scheduled ambient pulses;
- distributed repair paths;
- rejected-draft metadata when applicable; and
- a pack-level coherence report.

The output is not selected from a fixed list of completed stories. The grammar
combines authored incident structures, actors, places, times, artifact forms,
linguistic repertoires, communication dynamics, incentives, choice profiles,
routes, and bounded effects. Authored components are finite and reviewable;
their validated combinations do not impose a numbered campaign or maximum
playable-night count.

## Pipeline

1. Normalize the incoming seed and create the deterministic random stream.
2. Select six incident templates and assign unique room identities.
3. Bind protagonist roles, goals, knowledge, pressure, and stakes; create one
   fact-only `TruthLedger` and separate `PropagationLedger` per incident.
4. Build a cohesive linguistic repertoire for every protagonist.
5. Assign the six reviewed communication dynamics exactly once.
6. Bind deliberate-protection beneficiaries and incentive intersections.
7. Assign sparse conversation-routing moves to compatible rooms.
8. Construct four causal scenes, beat-local typed disclosures, and shuffled
   choice sets with typed delivery contracts per room.
9. Apply situational pressure contours and sparse action structures.
10. Build one preferred typed content or format route from each room.
11. Build a bounded typed cross-room route for every other ordered room pair.
12. Create scheduled ambient pulses and distributed repair paths.
13. Validate every scenario, then validate the pack as one ecology.
14. Return the pack only if every release-blocking invariant passes.

The candidate is never shown while validation is incomplete. Regeneration
keeps the current playable night until a replacement passes the same gates.

Version 15 binds the authored-copy templates, each scene's typed
disclosure and `SceneLesson.experienceRules`, each choice's delivery scope,
carriage, and `conceptPlays`, and every link's semantic class and carrier into
the generated pack. Those fields are deterministic authored output, not
presentation guesses that may be reclassified from labels, tags, detail text,
intent prose, or generic signal copy.

## Four-beat causal structure

Every room has four scenes:

| Beat | Function | Required evidence binding |
|---|---|---|
| Surface | Introduce the artifact and immediate public reading. | Direct incident record. |
| Bridge | Show how interpretation travels through a relationship, institution, or familiar form. | Interpretation linked to the same incident. |
| Crossover | Expose reply access, code collision, direct carrier, or systemic consequence. | Active incident reply or communication condition. |
| Correction | Make repair, persistence, or bounded refusal consequential. | Incident-specific resolution duty. |

The four beats are causal positions, not a fixed emotional cycle. Pressure
states may begin later, skip unsupported stages, reverse, recur, or remain
absent for an instrumental role.

## Incident-bound truth

Each room owns an immutable, fact-only `TruthLedger` with exactly
`knownFact`, `unresolvedAtEntry`, and `laterResolution`. A separate
`PropagationLedger` holds only `circulatingFrame`. The frame is something the
modeled system circulates; placing it outside truth prevents repetition from
quietly promoting it into fact.

Each generated scene also owns a `SceneDisclosure` with typed `records`,
`questions`, and `unknowns`. Surface exposes the known public record, Bridge
the circulating claim, Crossover a public repeat record, and Correction the
attributed update. Every beat gets its own question and unknown rather than
re-rendering one room-wide ledger. The contracted instrumental seat alone may
receive one `seat-private-assignment-brief` record in Bridge, copied from the
actual observable assignment brief. Other atoms are `public-record`.

The communication ledger retains analytic fact bindings for validation, but
those strings do not become extra truth-ledger fields or a shared playable
record. Validation instead checks truth, propagation, public artifacts,
beat-local disclosure, and the analytic ledger as distinct incident-bound
structures.

This prevents a communication lesson from being pasted onto unrelated story
material. Source or evidence from one incident cannot satisfy another
incident's repair requirement. Only support explicitly marked transferable may
move between rooms.

Truth values do not participate in reach, ranking, trust, blame, fatigue, or
other propagation coefficients. Player choice changes distribution and social
conditions, not authored fact.

## Actor cohesion

A generated protagonist contains:

- a role and adjacent goal;
- private knowledge and bounded unknowns;
- discernment and enactment baselines;
- prosocial orientation and modeled pressure contour;
- outward relationships, stakes, and reply conditions;
- one primary and additional learned linguistic registers;
- world-model assumptions; and
- continuity anchors that must survive every permitted register switch.

### Repertoire construction

A register can enter an actor's repertoire only through a represented
individual context such as family, peer, region, socioeconomic setting,
profession, institution, coalition, or platform experience. No demographic
label creates a register automatically.

Every scene selects only from that established repertoire. A switch must have a
plausible audience, relationship, channel, power, or pressure reason and may
change formality, compression, acknowledgment order, evidentiary framing,
shared references, or turn-taking. It may not replace the actor's knowledge,
goal, moral orientation, or semantic commitments.

If a candidate cannot preserve those anchors, it fails generation. The
interface does not label an incoherent actor as unstable to excuse the draft.

### Code and world model remain independent

The generator tests both directions:

- different registers with materially shared goals; and
- a shared register with different assumptions about what the exchange is for.

Shared diction therefore establishes neither agreement nor coordination.
Different coalition language does not establish substantive conflict when the
concrete proposed action is the same.

## Communication coverage

Every six-room night contains exactly one of each reviewed dynamic:

1. defensive scapegoating;
2. self-protective rumor;
3. warm interior with cool presentation;
4. cold or instrumental interior with warm presentation;
5. sociocultural code mismatch; and
6. cross-coalition code convergence.

The communication ledger remains constant across all four scenes in its room.
The complete conceptual and evidentiary requirements are canonical in the
[Communication and fatigue atlas](COMMUNICATION-ATLAS.md).

## Deliberate protection and intersecting incentives

Each room receives a typed deliberate-account ledger. A deliberate route is
valid only if the protagonist's private knowledge is represented before a
selectable account knowingly departs from it.

Across the night, beneficiaries cover self, friend, family, a person under the
protagonist's authority, ally, and client. The authority route additionally
requires an evaluator/dependent asymmetry and unequal reply access.

Each deliberate ledger binds one intersection of:

- a specific competence comparison;
- feared loss of standing;
- material counterevidence;
- a simplified group or class account;
- at least two sociocultural, professional, or political advancement domains;
  and
- a competitive resource such as attention, authority, contract value, issue
  ownership, or market position.

The generator may represent an actor using an essentialized story because it is
instrumentally useful. It may not endorse the story or use group identity as an
effect coefficient.

## Choice construction

Every beat contains:

- at least two imperfect structurally available choices;
- at least one distortion, persistence, or amplification route;
- at least one bounded, translation, refusal, or repair route;
- exactly one choice tagged as the non-amplification floor; and
- an ideal action when the beat supports one, even if its requirements are not
  yet assembled.

Choice order is deterministically shuffled. A blocked ideal cannot occupy a
fixed position across generated rooms. A hidden last resort is not part of the
ordinary three-choice surface and becomes visible only when its complete
high-discernment, low-enactment, and extreme-fatigue eligibility check passes.

## Sparse assignments

The following structures are intentionally absent from many rooms and may be
absent from an entire night when context does not support them:

- situated leadership;
- an accountable repair conversation; and
- the internal situated action review.

Compatible social-theory lenses are assigned only after the scenario is
coherent. They attach to an already non-amplifying or stabilizing choice and do
not create a tactical instruction. The internal action review is never
rendered. Player-facing receipts use CHORUS-native descriptions rather than
source names or doctrine labels.

Conversation routing is also sparse. Exactly three compatible rooms receive
one route each: a supported adjacent concern placed in the current thread, a
non-propositional meme response, and a non-propositional absurdist response.
These moves retain their underlying relational record but provide no evidence
or repair support for the active incident.

## Typed concept bindings

Concept status is authored structurally rather than recovered from prose.
Every choice has `conceptPlays`, including an explicit empty array when the
choice plays no term. Every lesson has one or more conjunctive
`experienceRules`.

| Term | Explicit play binding | Authored experience receipt rules |
|---|---|---|
| Signaling | Surface action with shared or public outward delivery and content, format, or both carriage. | Decision from that lesson scene; cross-room `selectedCarriage` with semantic content or format. |
| Saturation | None; saturation is experience-only. | Decision or pulse from that lesson scene; local or cross-room `backgroundReach > 0` or `avoidedReach > 0`. |
| Correction drag | Correction action recorded as source-bearing repair, bounded accountability, or translation with positive verification or provenance. | Decision or pulse from that lesson scene; local or cross-room verification or provenance increase. |
| Market value | Bridge action for the marketer or instrumental coordinator, with a deliberately distortive relational move and positive reach. | Decision or pulse from that lesson scene; cross-room heat change through `attention-market`. |
| Trust capital | Bridge action for the caregiver or institutional seat, with a non-repair move and positive reach. | Decision-only selected carriage or any trust change from that lesson scene, through `trust-carryover`. |
| Status capital | Bridge action for the youth, creator, or political seat, with a non-repair move and positive reach. | From that lesson scene: ambient-ranking background reach or consensus change, or attribution-carryover blame change. |

Rules match one receipt conjunctively. `event: any` admits decisions and ambient
pulses; `event: decision` does not. `selectedCarriage` means true,
`backgroundReach` and `avoidedReach` mean greater than zero, metric `increase`
means greater than zero, and metric `change` means nonzero. The event source
must be the exact lesson scene, and scope, semantic, and mechanism must match
when declared. A nonzero unrelated metric cannot satisfy a rule.

## Cross-room construction

### Typed routes

Every ordered pair of distinct rooms receives one route chosen from bounded
mechanisms such as shared audience, format imitation, attention market,
institutional load, trust carryover, ambient ranking, attribution carryover,
or code collision. Its discriminated semantic is authored independently of
copy:

- `content` is direct and owns a `shared-channel` carrier;
- `format` is direct and owns an `artifact-format` carrier; and
- `ambient` has no carrier or compatibility basis.

A route projects only metrics relevant to its mechanism. `revealedCue` and
`compatibilityBasis` explain a route after it is classified; neither field is
searched to decide the class.

### Direct routes

Each source room may have at most one preferred direct route. Direct content or
recognizable form can cross only when the generated rooms share the typed
channel or artifact-format carrier. A choice separately declares delivery
scope (`private`, `shared`, `public`, or `withheld`) and carriage (`none`,
`content`, `format`, or both). Private and withheld actions cannot use a direct
carrier. Shared or public actions can use only the carrier their carriage type
permits. A common register, political position, broad theme, or suggestive
choice label is not sufficient.

The generator creates vague copy for unrevealed endpoints and attributable
copy for a state in which both rooms have been entered. Validation rejects
identity-bearing tokens in the vague form.

## Fatigue and repair validity

Every scheduled scene and choice carries typed loads for attentional,
affective, relational, verification, and efficacy fatigue. Values are bounded
and cannot reduce discernment. Prosocial orientation changes modeled enactment
sensitivity, not moral worth.

Every blocked ideal must have a distributed repair path. Incident-specific
source and evidence remain local, while institution, relationship, or
distribution support may be assembled elsewhere. No path may depend on one
indispensable actor, and delay may not erase every legal route.

## Release-blocking coherence gates

A candidate fails if any of the following is false:

- six unique scenarios and 30 unique ordered typed cross-room routes exist;
- all six communication dynamics appear exactly once;
- each communication fact is bound to the active incident and all four beats;
- deliberate protection covers every required beneficiary and has prior private
  knowledge, audience cost, and correction duty;
- actor repertoires, scene selections, switches, and continuity anchors cohere;
- same-register and different-register mental-model cases remain distinct;
- observed, inferred, and unknown ledger entries remain separate;
- every truth ledger has exactly the three fact fields, while the circulating
  frame remains in the one-field propagation ledger;
- every beat exposes unique typed records, questions, and unknowns; only the
  contracted Bridge may expose one actual private assignment brief;
- every concept play binding and experience rule matches its declared lesson
  term and canonical structural shape, with encountered, experienced, and
  played states structurally reachable without display-prose inference;
- person-directed claims are low-stakes and keep conduct separate from trait;
- each beat retains distortion and bounded action plus a non-amplification
  floor;
- every ideal has an intelligible barrier and a viable repair path;
- fatigue is typed, finite, bounded, and incapable of lowering discernment;
- every route has a coherent typed semantic/carrier shape, every choice has a
  coherent typed delivery shape, incompatible or private delivery cannot
  create selected direct carriage, and vague copy has no protected endpoint
  detail;
- scheduled pulses are unique and bounded;
- no real platform name or operational manipulation grammar appears; and
- every metric and effect is finite and within its declared range.

## Versioning

`GENERATOR_VERSION` identifies the scenario model, not the application release.
Increase it when the same seed could produce a materially different pack,
choice identity, event requirement, or reconstruction result. A save created
with another generator version is rejected unless an explicit, tested
reconstruction path exists.

The current authored model is generator version 15. Version 14 changed the
ending architecture, seeded authored copy, and source used by completed-night
concept derivation relative to version 13. Version 15 changes generated
Crossover artifact, reason, question, unknown, and signaling-observable copy
that the in-world Summary can carry. The same seed therefore no longer
reconstructs the version-14 pack byte for byte. The retained `1.0.0-rc.1`
evidence and compatible saves remain historical version-13 records, and the
preceding Summary evidence remains historical version-14 evidence. Schema
version alone does not make either model compatible with version 15; version-13
and version-14 saves fail closed unless an explicit, tested reconstruction path
is added.

At completion, `buildConceptReceipt(pack, state)` considers only
`SceneLesson` terms belonging to scenes resolved by actual accepted decisions,
then deduplicates by term. The generator supplies the term, definition,
perspective, observable, and conjunctive `experienceRules`; each choice
supplies zero or more explicit term-discriminated `conceptPlays`. Runtime state
supplies whether the strongest supported status is `played`, `experienced`, or
`encountered`:

- played requires an accepted choice carrying that exact term binding;
- experienced requires an actual decision or ambient-pulse receipt to match
  every field in one of the lesson's exact rules; and
- encountered requires only that an accepted decision resolved the lesson
  scene.

Precedence is played over experienced over encountered. Saturation deliberately
has no play binding. Played decision IDs and matched effect-event IDs are
derived independently, so a played entry may have no matching effect-event ID.
Presentation never infers a concept by scanning prose.

Schema changes to the portable envelope are versioned separately. See
[Portable save format](SAVE-FORMAT.md) and
[Maintenance and release discipline](MAINTENANCE.md).

## Evidence

The concurrent test suite generates 1,000 nights and checks seed determinism,
coverage, actor cohesion, shuffled choice order, deliberate beneficiaries,
sparse assignment, repair access, fatigue behavior, and safety invariants. The
executed [Systems Atlas](../public/notebooks/chorus-systems-atlas.html) presents the same
relationships as inspectable tables and figures; it does not replace the test
suite.
