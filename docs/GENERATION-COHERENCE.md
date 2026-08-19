# Generation and coherence

## Purpose

This document owns the scenario-generation pipeline and the conditions that
make a generated night playable. It does not redefine the communication
concepts in the [Communication and fatigue atlas](COMMUNICATION-ATLAS.md) or the
event rules in the [Concurrent-night runtime](CONCURRENT-NIGHT.md).

## Generation contract

`generateScenarioPack(seed)` accepts a finite 32-bit integer and returns one
validated `GeneratedScenarioPack` containing:

- a generator version and normalized seed;
- six unique generated scenarios;
- one shared night clock;
- six sparse compatible direct links;
- 30 bounded ordered systemic routes;
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
3. Bind protagonist roles, goals, knowledge, pressure, stakes, and immutable
   truth ledgers.
4. Build a cohesive linguistic repertoire for every protagonist.
5. Assign the six reviewed communication dynamics exactly once.
6. Bind deliberate-protection beneficiaries and incentive intersections.
7. Assign sparse conversation-routing moves to compatible rooms.
8. Construct four causal scenes and shuffled choice sets per room.
9. Apply situational pressure contours and sparse action structures.
10. Build one preferred compatible direct route from each room.
11. Build a bounded systemic route for every other ordered room pair.
12. Create scheduled ambient pulses and distributed repair paths.
13. Validate every scenario, then validate the pack as one ecology.
14. Return the pack only if every release-blocking invariant passes.

The candidate is never shown while validation is incomplete. Regeneration
keeps the current playable night until a replacement passes the same gates.

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

Each room owns an immutable `TruthLedger` and a reviewed communication hook.
Surface, Bridge, Crossover, and Correction each have a fact binding that must
appear in both the relevant artifact and the same incident's ledger.

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

## Cross-room construction

### Systemic routes

Every ordered pair of distinct rooms receives one route chosen from bounded
mechanisms such as shared audience, format imitation, attention market,
institutional load, trust carryover, ambient ranking, attribution carryover,
or code collision. A route projects only the metrics relevant to its mechanism.

### Direct routes

Each source room may have at most one preferred direct route. Direct content or
recognizable form can cross only when the generated rooms share a represented
channel or artifact format. A common register, political position, or broad
theme is not sufficient.

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

- six unique scenarios and 30 unique ordered systemic routes exist;
- all six communication dynamics appear exactly once;
- each communication fact is bound to the active incident and all four beats;
- deliberate protection covers every required beneficiary and has prior private
  knowledge, audience cost, and correction duty;
- actor repertoires, scene selections, switches, and continuity anchors cohere;
- same-register and different-register mental-model cases remain distinct;
- observed, inferred, and unknown ledger entries remain separate;
- person-directed claims are low-stakes and keep conduct separate from trait;
- each beat retains distortion and bounded action plus a non-amplification
  floor;
- every ideal has an intelligible barrier and a viable repair path;
- fatigue is typed, finite, bounded, and incapable of lowering discernment;
- direct routes have carrier evidence and vague copy has no protected endpoint
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
