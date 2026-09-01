# CHORUS Communication and Fatigue Atlas

## Status and scope

This atlas is the canonical specification for CHORUS's relational-communication
and follow-through semantics. It explains what the simulation represents, what
it deliberately does not infer, how each reviewed dynamic becomes a choice
grammar, and which invariants prevent a lesson about manipulation from becoming
manipulation instruction.

CHORUS uses fictional composites. The dynamics are not recreations of particular people, retrospective diagnoses, personality tests, or rules for deciding who is trustworthy. They are authored explanatory models whose hidden state can be shown because the player temporarily occupies each fictional seat.

The [concurrent-night runtime](CONCURRENT-NIGHT.md) owns event enforcement. The
[interaction and disclosure specification](INTERACTION-DISCLOSURE.md) owns
player-visible timing and layout. This atlas does not restate those contracts.

## Governing distinctions

CHORUS keeps several commonly collapsed questions separate:

1. **What happened?** The observable event record.
2. **What did an audience infer?** A motive, character, loyalty, care, or coalition reading.
3. **What remains unknown?** Questions the available evidence cannot resolve.
4. **What does accepting the interpretation protect?** Status, belonging, care identity, authority, issue ownership, contract value, or another local stake.
5. **What effect did an action have?** Distribution, attribution, trust, common-ground, and fatigue consequences.
6. **Could the seat identify the better action?** Discernment.
7. **Could the seat currently carry it?** Enactment.

None substitutes for another. A warm presentation is not a motive record. A defensive motive is not a falsity test. A correct fact does not validate a character generalization. Understanding a capacity barrier does not erase responsibility for the action taken next.

## The six-dynamic night

Every generated night contains the following dynamics exactly once. The assignment follows the role ecology, so the six dynamics remain present even when the final public-facing role varies between a creator and a political aide.

| Dynamic | Typical seat | Interior and presentation | Primary distortion | Repair grammar |
|---|---|---|---|---|
| Defensive scapegoating | Regional brand growth lead | Status-protective interior; warm managerial presentation | A distributed approval failure migrates into a lower-status contributor's character. | Restore approval chronology, bound every contribution, and return responsibility to every decision point. |
| Self-protective rumor | Family-group moderator | Prosocial, ashamed, self-protective interior; warm confidential presentation | A trusted speaker's earlier mistake is displaced into a private story about a quieter participant. | Name the speaker's own forwarding decision, contact the person directly, and retract through every receiving relationship. |
| Warm interior, cool presentation | Student group organizer | Protective, affiliation-seeking interior; terse task-direct presentation | Brevity or reserve is read as contempt, disloyalty, or lack of care. | Keep the factual boundary, add a legible relationship cue, and ask the room to separate request from motive attribution. |
| Cold/instrumental interior, warm presentation | Contracted narrative coordinator | Instrumental, outcome-detached interior; affiliative local presentation | Social fluency is mistaken for shared concern or accountability. | Evaluate record and incentive separately from warmth; refuse or disclose the interest without supplying operational detail. |
| Sociocultural code mismatch | Public-information editor | Prosocial, duty-bound interior; cool institutional-qualified presentation | Precision is coded as evasion while relationship acknowledgment is treated as incompatible with accuracy. | Preserve qualified facts, acknowledge impact, and explicitly translate the situated codes. |
| Cross-coalition code convergence | Local creator or civic campaign aide | Prosocial but coalition-vigilant interior; mixed political presentation | Opposing vocabularies hide an identical object-level commitment. | Normalize both positions into concrete actions, surface the overlap, and preserve only the disagreement that remains. |

These pairings are scenario roles, not claims about caregivers, young people, institutions, marketers, creators, political workers, or any real-world group in general.

## The communication ledger

Each generated scenario contains one `CommunicationLedger`, but its four
playable scenes do not reference or expose that analytic object. Generation
uses the shared scenario ledger to keep the dynamic coherent, while each scene
receives its own narrower `SceneDisclosure`. The dynamic cannot change
mid-room merely to make the plot more dramatic.

The ledger also carries reviewed analytic `factBindings` for Surface, Bridge,
Crossover, and Correction. Those strings come from the active incident's
communication hook and remain inside the analytic ledger for validation. They
do not become four fields in playable truth.

The incident instead owns two narrower immutable records: a fact-only
`TruthLedger` (`knownFact`, `unresolvedAtEntry`, `laterResolution`) and a
separate `PropagationLedger` (`circulatingFrame`). Each scene owns a typed,
beat-local `SceneDisclosure` of records, questions, and unknowns. Validation
checks all of these structures and the matching artifact against the same
incident without merging them. A room cannot teach a person-story, code
collision, or repair that belongs to a parallel unseen event.

### Mental models

`speakerMentalModel` and `audienceMentalModel` describe what the fictional parties think the exchange is doing. One party may understand a message as task coordination while another understands it as negotiation of care, loyalty, hierarchy, or belonging. The mismatch can exist even when both parties understand every literal word.

`speechCode` remains the compatibility label used by the six-dynamic ledger. The linguistic-repertoire model supplies the fuller character-level account: which registers the actor has learned, which one a scene selects, what audience and pressure make that selection coherent, and what parts of the actor's communicative practice remain continuous across a switch.

### Linguistic repertoires and code selection

Every generated protagonist carries a `GeneratedLanguageProfile` whose `repertoire` is a set of learned resources, not a single identity label. A register may be situated in a fictional region, a resource or class setting, a family or peer group, a profession, an institution, a political coalition, or a platform convention. Those contexts describe where a fictional actor learned or uses the register; they never infer ethnicity, nationality, protected class, intelligence, honesty, competence, or moral worth from diction.

Each repertoire records:

- a default register that fits the actor's role, history, and ordinary audience;
- one or more available registers with concrete contextual anchors;
- stable continuity anchors, such as evidentiary habits, favored metaphors, relationship priorities, or recurring sentence structure;
- a public surface cue that can be shown without naming the lesson; and
- scene-level selection conditions: audience, channel, relationship, power, stakes, and represented pressure.

A scene may retain the default register or select another register already present in the repertoire. A switch is valid only when the audience and situation make it plausible and the generated wording preserves the actor's continuity anchors. Register changes may alter formality, compression, acknowledgment order, evidentiary framing, shared references, or turn-taking. They may not randomly replace the actor's knowledge, goal, interior orientation, or semantic commitments. Cohesion is a generation invariant: an incoherent draft is rejected rather than labeled “unstable” or repaired with a visible character score.

Active play renders only the neutral `publicSurfaceCue` and bounded
pre-conclusion `playInferenceHints`. It does not expose the repertoire
inventory, contextual anchors, switch rationale, internal code identifiers, or
same-register classification. After completion, the naturalized summary may
name a register action or assumption mismatch only when an accepted decision
and its typed source support that synthesis. CHORUS no longer expands the full
profile into a concluding repertoire taxonomy.

### Shared code, different world model

Linguistic compatibility and mental-model compatibility are independent. Two actors may share the same register, vocabulary, and interactional rhythm while disagreeing about what counts as evidence, what authority owes, whether a post coordinates action or performs belonging, how risk should be distributed, or what a familiar political term commits anyone to doing.

CHORUS can therefore model a same-register friction without inventing a code
mismatch. When the completed summary includes that friction, its retained
narrative sources must identify the genuinely shared surface and separately
support the represented conversational difference, resulting
misunderstanding, and accountable translation route. Shared language is not
treated as shared ideology, class position, motive, truth, relationship, or
common ground; those require their own evidence.

### Observed, inferred, unknown

Every ledger must provide at least two observations, one inference, and one unknown.

| Ledger class | May contain | Must not be treated as |
|---|---|---|
| Observable record | Represented words, timing, approval role, one bounded action, source state, reply access | A complete motive or permanent character judgment |
| Inferences | What the modeled audience concludes about care, competence, loyalty, intent, or coalition position | Proven interior state |
| Unknowns | Missing access, purpose, instruction, incentive, or interpretation | Evidence for whichever narrative is most emotionally useful |

The active Record panel exposes the current scene's typed disclosure: one
public record, one question, and one unknown, with a second seat-private record
only for the contracted instrumental Bridge. The room-close receipt holds the
record in place without repeating the atoms or adding a motive judgment. After
completion, the continuous summary may synthesize the accepted path from its
typed sources; there is no whole-night Interpretation tab.

### Authored interior

`interiorOrientation` is disclosed because the player occupies the fictional protagonist. This is a narrative affordance, not a claim that real interiors can be read from the same signals. Outside the authored simulation, motive remains unknown until timing, incentives, records, access, and correction behavior support an inference.

## Scapegoating and defensive rumor

### Evidence boundary

The two person-directed ledgers include a constrained claim object:

- a fictional role target rather than a real identity;
- one `boundedBehavior`;
- a distinct `traitGeneralization`;
- the initiator's own exposure;
- the self-protection function served by the story;
- an evidence status of `partial`, `unverified`, or `contradicted`; and
- a fixed severity of `low-stakes-reputational`.

The target is not required to be flawless. Scapegoating can begin with a real bounded mistake. The distortion occurs when the room turns that action into a total character explanation, suppresses distributed causes, and shifts repair burdens toward the least powerful or least present person.

### Recognition standard

CHORUS does not classify one negative report as scapegoating. The modeled recognition pattern asks for converging features:

- accountability approaches the source before the person-label appears;
- the source benefits if the character explanation is accepted;
- a specific event becomes a generalized trait;
- distributed approval, access, or timing causes disappear;
- the claim travels through third-party trust rather than direct contact;
- the target has unequal or nonexistent reply access; and
- silence or self-defense is treated as confirming evidence.

This is a pattern-recognition lesson, not a detector or a rule that criticism is abusive whenever its source has an incentive.

### Motive and truth remain separate

A rumor can protect its source and still contain one true detail. Conversely, a source can sincerely believe a self-protective reconstruction. The simulation therefore never computes truth from motive. It checks the event record against the claim while separately recording what the claim protects.

The repair path likewise does not demand that the target prove warmth, forgive the source, or repair the source's social standing. It restores chronology, bounds the conduct, distributes responsibility, opens direct reply access where appropriate, and retracts the person-story through the channels that received it.

## Intersecting status, group, and competitive incentives

CHORUS does not use “insecurity” as a diagnosis or a sufficient explanation. A represented competence threat must name a specific comparison, a feared loss of standing, and a material counter-record. The protagonist may fear that another person's stronger performance will expose their own weaker judgment; the model then shows how that fear can make a deliberately simplified account instrumentally useful.

Each room binds that comparison pressure to at least two advancement domains: a social-class story, sociocultural standing, professional standing, political standing, or market position. The same altered account may therefore protect a friend, reassure a familiar social stratum, preserve a credential hierarchy, secure coalition issue ownership, and compete for attention or paid work at the same time. These are intersections, not interchangeable labels.

The protected group story is always tested against a contrary mixed record. No family, class, coalition, profession, cultural code, or formal rank is assigned inherent competence. A room may show actors using such an essentialized story because it is socially or competitively useful; the generator may not endorse that story as truth or use identity as an effect coefficient.

The typed model retains seven distinct parts: competence threat, feared
inference, material counter-record, protected group/class story, advancement
domains, competitive prize, and the combined motive. Before completion, play
shows only the concrete comparison, the known record, what the seat risks
losing, and the available action. After completion, the naturalized summary may
name only the parts supported and needed by its state-derived synthesis; it
does not dump all seven parts as a taxonomic receipt.

## Presentation-temperature mismatches

“Warm” and “cool” describe the outward presentation of one exchange. They are not permanent personality traits and do not map directly to kind/cruel, safe/dangerous, honest/deceptive, or caring/uncaring.

### Warm interior, cool presentation

The youth seat is authored as protective and affiliation-seeking while using compressed, task-direct language. The audience can understand the requested action and still infer contempt from the missing relational cue. Costly helpful behavior may support the authored interior inside the simulation; terseness alone does not.

The repair does not require abandoning directness. It preserves the boundary and adds enough relationship information for the receiving code to hear the intended commitment.

### Cold/instrumental interior, warm presentation

The coordinator is authored as contract-governed and outcome-detached while using locally fluent care language. Warmth lowers resistance without improving the evidence. The recognition cue is not “warm people are suspect”; it is that warmth, evidence, incentive, and accountability must be evaluated as separate dimensions.

The model exposes no real-world targeting recipe. The coordinator chooses only aggregate thematic actions, refusal, or disclosure at an abstract level.

## Sociocultural code mismatch

The institutional seat models a collision between two situated definitions of care:

- precision, attributable scope, and a promised update time; and
- relational acknowledgment before procedure.

Both can be sincere. Neither code is assigned to a nationality, ethnicity, or immutable community type. The distortion occurs when absence of one ritual is treated as absence of concern, or when relational acknowledgment is treated as necessarily incompatible with accurate qualification.

The repair combines the functions: preserve the attributable record, acknowledge impact, name the translation problem, and avoid diagnosing the audience or speaker.

## Cross-coalition linguistic convergence

The cross-coalition room separates surface vocabulary from object-level action. Its fixed common-ground proposition is:

> Publish the complete record promptly and preserve a human-accessible route during review.

One vocabulary can frame this as access, accountability, or public investment. Another can frame it as duty, family stability, stewardship, or local control. The platform can reward symbolic conflict even when the verbs match.

A `code-collision` move lowers visible common ground; a `translation` move raises it. Translation does not manufacture unity, force a coalition identity, or erase residual disagreement. It restates both positions as concrete commitments and then measures what disagreement remains.

This is only one linguistic configuration. The repertoire engine also permits actors from different regional, socioeconomic, professional, institutional, family, peer, and platform settings to converge on a register, and it permits actors who share a register to retain conflicting world models. Neither surface difference nor surface fluency settles the object-level question.

## Relational moves and choice grammar

Every generated choice carries one reviewed `RelationalMove` classification:

- `blame-transfer`;
- `rumor-carriage`;
- `motive-assumption`;
- `code-collision`;
- `translation`;
- `bounded-accountability`; or
- `repair`.

Each move records its evidence basis, the audience inference it invites, and a repair cue. Every beat must contrast at least one distortion or persistence move with at least one bounded-accountability, translation, or repair move.

The four-beat relational arc is:

1. **Surface:** a bounded event and local pressure are visible while motive remains incompletely evidenced.
2. **Bridge:** trust, status, or a communication code turns the event into a socially useful interpretation.
3. **Crossover:** repeated exposure makes the interpretation assumed context; response and silence can form a double bind.
4. **Correction:** the event record becomes attributable, but chronology, reply access, trust routes, and retraction distribution still require work.

The final persistence choice is dynamic-specific: keep one person as the explanation, preserve the rumor after correcting the event, treat reserve as contempt, let warmth substitute for accountability, demand one code as proof of care, or protect issue ownership from visible agreement.

## Discernment and enactment

CHORUS refuses the assumption that failure to perform the best action proves failure to recognize it.

### Discernment

Discernment represents the seat's modeled ability to identify source quality, attribution limits, communication mismatch, and better action. Fatigue does not lower it. Choice effects may improve it, and runtime reduction preserves it against decline.

### Enactment

Enactment represents current follow-through capacity: the ability to spend attention, verification work, social cost, emotional regulation, and efficacy on the action. An ideal can remain visible while becoming inaccessible because its requirement exceeds current enactment.

The protagonist baselines are deliberately separate:

| Orientation | Discernment baseline | Enactment baseline |
|---|---:|---:|
| Strongly prosocial | 86 | 88 |
| Mixed | 76 | 80 |
| Instrumental | 62 | 78 |

These values are internal explanatory parameters, not human scores. “Prosocial orientation” changes modeled fatigue sensitivity; it does not certify goodness or innocence.

## The five fatigue types

Fatigue is not one generic “willpower” meter.

| Type | Definition in CHORUS | Typical pressure |
|---|---|---|
| Attentional | Too many competing artifacts and context switches. | Monitoring rooms, comparing versions, switching tasks. |
| Affective | Repeated urgency, outrage, anticipatory threat, or shame. | Alarms, identity threat, visible correction, emotionally loaded repetition. |
| Relational | Continuous calculation of tone, loyalty, belonging, and reply cost. | Private groups, coalition signaling, direct-contact risk, retraction through trusted ties. |
| Verification | Source recovery and comparison across fragmented copies. | Finding originals, checking timestamps, reconnecting a crop to its record. |
| Efficacy | The sense that careful repair cannot catch the moving cascade. | Saturation, correction drag, fragmented audiences, persistent afterimages. |

Each scheduled beat supplies all five scene loads. Accepted choices add typed loads according to what they demand. Cross-room routes carry a smaller bounded fraction. Loads accumulate by type and clamp at 100.

Only modeled platform activity changes this state. The application does not measure real-player dwell time, scrolling speed, reading speed, hesitation, disability, assistive-technology use, or emotion. Repeatedly reading the same modeled minute is state-idempotent.

### Extreme-load last resorts

A strongly prosocial seat with baseline discernment at least 84 may receive one extraordinary final-beat move. It stays absent until all four authored conditions hold: discernment remains at least 80, enactment is at most 58, total five-channel fatigue is at least 150, and one fatigue channel is at least 32. These are modeled-state thresholds, not judgments about a real player.

The move remains inside the authored PG-bounded, nonviolent grammar but is
intentionally severe in social, professional, economic, or institutional
terms. Its typed receipt must name a cared-for party protected, a different
cared-for party who bears a serious cost, and the protagonist's own sacrifice.
It may interrupt distribution or expose an attributable omission, but it may
not erase previous copies, suspend the non-amplification floor, lower
discernment, or describe fatigue as innocence. The move is an unusual boundary
crossing by someone who still understands the ordinary boundary.

## Situational pressure contour

CHORUS maintains an internal, non-clinical contour of response availability. Its state names are **open range**, **pressure contact**, **narrowing field**, **committed field**, **break point**, **release**, and **return**. These are engineering terms for causal continuity, not a sequence the player is expected to learn, identify in another person, or reproduce.

The reducer never advances this contour on a timer. Each accepted choice carries one bounded direction: hold, intensify, contain, settle, or surge. A room may enter partway through the contour, hold its present range, skip unsupported states, begin release, reactivate after release, or end before return. One stabilizing move cannot imply that capacity, relationships, or consequences have reset.

The abstract contracted coordinator has no pressure contour. Its harmful choices are represented as instrumental strategy, not recast as emotional dysregulation without evidence. Mixed competitive seats omit the strongest break and return states when the short incident supports strategic commitment but not those stronger inferences. Active play receives only a sentence about the occupied seat's immediate pressure; the state inventory and transition map are not rendered in the interface.

## Sparse CHORUS-native action structures

### Situated leadership

This optional structure models useful influence from any occupied level. It is eligible in at most one youth-peer, caregiver, or institutional room and is absent from many generated nights. Its checks orient the seat to its own objective and pressure, read the affected room rather than universalizing one communication code, keep relationships capable of carrying correction, and complete the attributable part of repair the seat actually controls.

The generator requires a represented human influence relationship, communication or authority difference, and a viable bounded action. The structure does not assume that warmth, confidence, rank, or self-description constitutes leadership.

### Situated action review

The internal action review keeps four distinctions intact across a compatible adult room: the **condition** that actually requires decision or repair; the **publics** that differ in knowledge, code, risk, and reply access; the **limits** on evidence, authority, time, distribution, safety, relationship, and enactment; and the **conduct** with which the occupied seat uses access and authority.

This scaffold may shape one already coherent non-amplifying or stabilizing choice at each beat. It never appears as a named framework, ordered lesson, score, mnemonic, receipt card, or source attribution. The player encounters only the situated record, people, pressures, limits, and consequences. Reading speed and assistive technology never count as modeled limits.

### Accountable repair conversation

One compatible adult relational-conflict room may receive a repair conversation that moves from an attributable record, through represented stakes and multiple bounded options, into an accountable follow-through condition. It remains absent unless direct engagement is safe, reply access is meaningful, the least-powerful person is not forced to defend a trait claim, and any agreement is voluntary, attributable, reviewable, and responsive to power asymmetry.

### Academic social theory as a critical lens

Each night selects exactly two distinct, context-compatible academic lenses. They are used to recognize represented problems and construct accountable alternatives, never to supply operational manipulation tactics:

| Research tradition | Represented problem | Governing idea | Accountable solution |
|---|---|---|---|
| Attribution theory and social projection | Projection and charged character stories. | Reaction can masquerade as objective perception. | Separate reaction from record; inspect patterns, incentives, and correction behavior. |
| Social power and resource dependence | Reputation and reply access functioning as power. | Power operates through perception, dependence, and control of the field. | Map control of record, audience, reply, and correction; reduce single-broker dependence. |
| Strategic interaction and conflict framing | Reactive commitment to the most provocative surface. | Detachment preserves the wider objective and keeps the immediate frame from becoming the only field. | Restate the objective and take the smallest action that changes the real condition. |
| Expertise development and corrective feedback | Fluency or early competence mistaken for expertise. | Reality contact, apprenticeship, practice, and corrective feedback matter more than image protection. | Return to the source task and use precise correction as input for the next iteration. |
| Impression management and affect heuristics | Warmth, distance, persona, or aesthetic fluency carrying unsupported implication. | Attention and projection can create persuasive effect without truth. | Test provenance, incentive, preparation asymmetry, and audience cost independently of the surface. |
| Threat-rigidity and self-presentation | Fear of perceived incompetence producing defensive fiction. | Fear distorts perception when image protection outranks reality contact. | Name the feared loss and choose from the verified condition rather than the defensive story. |

Framework records remain internal analytic and research data. Selected decision
receipts preserve them for audit, but the current naturalized summary does not
consume or name framework moves. Its narrower source record follows represented
facts, selected decisions, typed routes, and one post-close afterimage. Active
play never names the framework, and there is no separate Practice receipt.

### Unnamed classical social-strategy lenses

Each night also receives exactly one context-compatible lens reappropriated
from classical political-strategy traditions. CHORUS withholds source
identities, maxims, and doctrine labels. It preserves only represented
condition, governing idea, accountable solution, applicability, and whether
the associated choice was selected. These fields remain available to research
and validation; the current player-facing naturalized summary does not consume
them.

| Concluding lens | Social-theory reappropriation | Accountable use |
|---|---|---|
| Conflict, reputation, and institutional form | Personal virtue and reputation cannot substitute for institutions that expose interests and constrain opportunism. | Move disputes onto attributable records and distribute reply, review, and correction power. |
| Interdependent seats, resources, and welfare | Social power arises from connected roles, material capacity, counsel, public welfare, and feedback rather than one dominant personality. | Map dependencies, verify through independent routes, and repair the material condition alongside its story. |
| Social terrain, tempo, and indirect repair | Channels, audience position, incentives, timing, visibility, and exit costs shape what communication can accomplish. | Reduce the value of the immediate contest and shift to the smallest supported route that changes the actual condition. |

The generator selects one lens only after compatibility checks and binds it to a non-amplifying or stabilizing choice. Validation rejects direct source naming, operational targeting language, and any conversion of the source traditions into interpersonal tactics.

## Blocked ideals and the non-amplification floor

### Why an ideal can be blocked

An ideal can be unavailable for either or both reasons:

- **Structural:** source, evidence, institution, relationship, or distribution support remains disconnected.
- **Capacity:** current enactment is below the action's declared requirement.

The ideal stays on screen. Attempting it produces a blocked receipt rather than silently doing nothing. The receipt names the protagonist's motive, modeled emotional overtake, triggering condition, missing systems, enactment gap, and dominant fatigue type.

The explanation is causal, not exculpatory. Its closing principle is: motive explains the barrier; it does not excuse the next choice.

### Floor guarantee

Every beat includes an available choice tagged `non-amplification-floor`. This floor is exempt from enactment depletion. It can be incomplete or costly, but it does not personalize or further distribute the claim.

Examples include:

- asking one trusted person privately;
- making a bounded process statement;
- keeping a campaign generic;
- refusing the motive claim and comparing records;
- pausing an abstract assignment; or
- correcting only the room that currently trusts the seat.

The floor prevents the fatigue model from becoming coercive. CHORUS may frustrate full repair; it never claims that exhaustion forces amplification.

## Cross-room interpretation effects

Two systemic mechanisms carry the relational model between otherwise distinct incidents:

- **Attribution carryover:** repeated person-labels can raise blame concentration and interpretive gap or lower the evidence threshold for adjacent character claims.
- **Code collision:** familiar coalition or communication-code conflict can widen interpretive gap and conceal common ground elsewhere.

These are ambient conditions only when the link's authored semantic is
`ambient`. An ambient link has no carrier and never means the same rumor,
target, claim, culture, or political position crossed rooms. Direct `content`
and `format` links are separate discriminated variants with `shared-channel`
and `artifact-format` carriers respectively; prose does not promote one class
into another.

Special routes are compatibility-gated: attribution carryover must originate in a represented scapegoat or defensive-rumor person-label, and code collision connects only the two represented communication-code rooms. Other room pairs use generic systemic mechanisms.

## Truth, relevance, and conversation routing

A response can be accurate without answering the active question. CHORUS therefore records conversation routing beside, not instead of, the underlying relational move. Exactly three distinct compatible rooms per night receive one such move:

- a supported adjacent concern placed in the active thread, with its own separate record and a better separate-post route;
- a familiar meme or reaction format that adds no truth-evaluable proposition; and
- an absurdist or impossible version that adds no truth-evaluable proposition.

The model classifies the authored function, timing, and still-unanswered question—not a style, joke, image, or unusual tone by itself. The adjacent concern never enters the active incident's truth ledger, and none of these moves supplies evidence or source support for repairing that incident. A selected route persists alongside its existing blame, rumor, code, or misrepresentation receipt, allowing intersections without pretending the mechanisms are identical.

Playable choice copy remains natural and unlabelled. After completion, a
selected action may appear in the naturalized summary through its ordinary
decision label, but the current `NarrativeSource` does not expose the analytic
conversation-routing fields, active question, or better-placement proposal.
There is no collapsed whole-night Choices receipt, and an offered route is
never reported as played.
Direct-route compatibility alone also does not prove carriage by the selected
path. Every choice declares typed delivery scope and carriage. Private or
withheld delivery cannot traverse a direct link, and content delivery cannot
use a format carrier or vice versa. The effect receipt records
`selectedCarriage` and `selectedCarriageReach`; background and avoided reach
remain separate model activity.

## Interface and concluding architecture

The communication model is distributed through progressive disclosure rather
than appended as one lecture. During play, surfaces may show the concrete
record, bounded room reading, unknowns, public register cue, reply conditions,
and local pressure. After all 24 decisions, a continuous state-derived summary
synthesizes one supported chain from factual scenario records, selected
decisions, typed route receipts, and one room afterimage. It is followed by a
separate plain receipt containing deduplicated `SceneLesson` concepts from
accepted decision scenes. Its experienced statuses come only from conjunctive
lesson receipt rules, and its played statuses come only from explicit selected-
choice term bindings; display prose is never a predicate. The conclusion does
not restore the former seven-tab receipt system or expose complete internal
taxonomies merely because the night ended.

The outward-relationships plot remains a public relationship map. Sharing a
register does not create an edge because it establishes no alliance, agreement,
trust, or shared mental model. The exact view, drawer, reason-toggle, graph, and
completed-night contracts are specified once in
[Interaction and progressive disclosure](INTERACTION-DISCLOSURE.md).

### Deliberate protective misrepresentation

Each room also carries one typed deliberate-misrepresentation ledger. This is not inferred from error, loyalty, warmth, reserve, or a harmful outcome. The simulation represents all four required elements:

1. the private record the occupied protagonist actually knows;
2. a knowingly altered account available to protect a named relationship;
3. the audience and reply-access cost if that account is selected; and
4. a correction duty that returns to every audience that received it.

Every six-room night covers protection of self, a friend, family, and a person under the protagonist's authority. The remaining rooms cover an ally and a client. The authority case separately records the evaluator/dependent asymmetry: the protagonist can shape an official account while the protected person depends on their evaluation and the person absorbing the cost has less access to reply.

The distinction from motivated reconstruction is release-critical. A
protagonist may sincerely reach a self-protective interpretation without
knowingly lying; that remains an inference problem. A choice is marked
deliberate only when the authored private record precedes the represented
departure from it. The current completed summary does not name beneficiary,
altered account, power condition, correction duty, or other fields from this
analytic ledger. It follows factual scenario records, selected decisions,
typed route receipts, and one room afterimage. Before the conclusion, the
player sees only the concrete occupied-seat record and action—not the lesson
label.

All of this remains inside the one-viewport application shell. Named panes and drawers own overflow so adding explanatory depth does not recreate a page-length form.

## Safety invariants

- All interpersonal roles and claims are fictional composites.
- Claim severity is fixed to low-stakes reputational harm.
- No criminal, sexual, medical, identity-based, violent, or self-harm allegation grammar exists.
- Bounded behavior never equals trait generalization.
- A target's silence is represented as an unknown when reply access is absent or unequal.
- Youth content remains ordinary peer context; no malicious-adult microtargeting is modeled.
- Bad-actor choices remain abstract and non-compositional.
- Real platform names and operational manipulation terms are rejected.
- Communication code is never inferred from identity, nationality, accent, or protected class.
- Regional, socioeconomic, institutional, professional, family, peer, coalition, and platform contexts may shape an individual fictional repertoire but never function as deterministic group templates.
- Generated registers use readable discourse structure rather than phonetic accent imitation, caricatured spelling, screen-reader-hostile punctuation, or unfamiliar abbreviations without expansion.
- A selected register must already belong to the actor's validated repertoire, and a switch must preserve represented knowledge, goals, and continuity anchors.
- Switching registers is not treated as evidence of deceit, instability, or a concealed identity; deliberate misrepresentation still requires its separate private-record and record-departure evidence.
- Shared code never establishes a shared world model, relationship, ideology, motive, truth status, or coordination.
- Warmth, coolness, age, foreignness, anonymity, and eccentricity are not coordination evidence.
- Ground truth is fixed independently of player route, protagonist motive, and relational interpretation.
- The simulation is explanatory, not predictive or diagnostic.

## Validation matrix

| Invariant | Generation/runtime evidence |
|---|---|
| Six dynamics exactly once | Pack validation plus multi-seed engine test |
| Communication facts belong to the active incident | Hook ID plus four truth-ledger, artifact, and ledger binding checks across multiple seeds |
| Deliberate protection is represented, not diagnosed | Private knowledge, altered account, audience cost, and correction duty are incident-bound across all four beats |
| Protective beneficiary coverage | Every night includes self, friend, family, and person-under-authority routes; ally/client variants fill the remaining seats |
| Authority is not generic loyalty | The authority route requires an explicit evaluator/dependent and official-account asymmetry |
| Ledger continuity | Every scene's dynamic must equal its scenario ledger |
| Observed/inferred/unknown separation | Minimum ledger cardinality and visible receipt structure |
| Presentation is not motive | Interior differs from presentation and unresolved motive questions remain explicit |
| Low-stakes person claims | Typed severity plus PG-bounded and restricted-term validation |
| Behavior is not character | Bounded behavior and trait generalization must differ |
| Common ground survives code difference | Cross-coalition ledger requires a concrete shared proposition |
| Repertoires remain character-coherent | Every selected register belongs to the actor; contextual acquisition, scene fit, switch pressure, and continuity anchors pass generation validation |
| Context does not become identity destiny | Regional, socioeconomic, social-group, institutional, professional, political, and platform anchors are individual fictional history, never effect coefficients or protected-class inference |
| Shared register does not imply shared model | Same-register friction preserves a genuinely shared surface while separately binding both represented conversational models and their translation route |
| Progressive linguistic disclosure | Active surfaces use only `publicSurfaceCue` and `playInferenceHints`; the completed summary names only state-supported played register actions or assumption frictions and does not expose a full profile taxonomy |
| Distortion and repair both exist | Every beat must contain harmful/persistence and bounded/translation/repair moves |
| Non-amplification remains possible | Every beat requires an available floor choice |
| Discernment survives fatigue | Runtime preserves discernment and rejects modeled collapse |
| Fatigue is typed and bounded | Five scene loads, typed choice loads, and 0–100 state validation |
| Reading does not spend capacity | Repeated advancement to the same modeled minute is idempotent |
| Blocked ideals remain intelligible | Each ideal carries a motive, emotional overtake, trigger, and concise explanation |
| Special crossings remain plausible | Person-label and code-bearing source/target compatibility checks |

## Maintenance questions

Before adding or changing a relational scenario, answer all of the following:

1. What is directly observed?
2. What is inferred, and by whom?
3. What remains unknown?
4. What bounded behavior, if any, actually occurred?
5. What trait or motive generalization is being built from it?
6. What does accepting that generalization protect?
7. Does the target have equal knowledge of and access to the conversation?
8. Which communication codes are colliding, and are they described without identity essentialism?
9. What concrete common ground remains after vocabulary is normalized?
10. Which fatigue types make the repair costly?
11. Can the player still choose a non-amplification floor?
12. Does the repair restore chronology and responsibility without demanding emotional labor from the target?
13. Could any copy be reused as a harassment, targeting, evasion, or bot-operation instruction?
14. Are the authored interior and the real-world inference boundary both explicit?
15. Which registers are genuinely available to this actor, and what represented history makes that repertoire plausible?
16. If the actor switches, which audience, relationship, power condition, channel, or pressure explains the selection?
17. What linguistic and semantic continuity makes the actor recognizable across registers without a visible stability label?
18. If two actors share a register, which world-model assumption differs, and does the scene avoid treating shared diction as agreement?
19. Can every generated phrase be understood without accent imitation, caricature, unexplained shorthand, or typographic performance?

If any answer is missing, the module is not ready for the generator.
