# 0009: Separate the experiential ending from the concept receipt

## Status

**Accepted, implemented, and verified by the current automated working-tree gate; interactive promotion evidence remains open.**

The version-14 source, canonical specifications, focused suites, generated
publications, and automated working-tree evidence are renewed for the current
implementation binding. This status does not assert current live-browser,
assistive-technology, production-route, dependency, or neutral-distribution
verification.

## Context

At baseline commit `4fffddf11a03a2fc84798a3c5343db00fc3135da`,
`HeartReceipt` combines the final reflective movement with a six-card taxonomy
of represented ideas. The automated accessibility/disclosure test named `The
heart defines the represented ideas without instructional imperatives`
requires several definitions to remain inside that component. The interaction
specification likewise assigns concept-definition ownership to The Heart.

The direct request of 31 August 2026 requires a different architecture:

- red-team the present copy before editing it;
- adopt the exact pinned Catalysis voice in atomized form;
- red-team the rewritten copy again;
- naturalize the summary at the end instead of breaking it down; and
- explain concepts encountered, experienced, or played by the user in plainer
  copy, separately.

The exact request text is bound by SHA-256
`98dd018a7c43e3013eaaedb8fd77c43bc2639da78cca678217fe9de3003ecf97`.

The exact Catalysis source is the 1,735,609-byte HTML artifact with SHA-256
`566f7c653142b239c098a0a3a0b628f3a3179535b219a99d889fdd48cc9513af`.

The current combined Heart cannot satisfy both “natural continuous ending” and
“separate plain concepts” merely by restyling its cards. Treating atomization
as a visual breakdown would reproduce the conflict in a more literary form.

## Decision

CHORUS gives the completed night two distinct concluding responsibilities in
one continuous, tab-free view.

### Plain concept receipt

A distinct, accessible concluding surface explains only concepts supported by
the completed pack and state. `buildConceptReceipt(pack, state)` considers
only `SceneLesson` terms from scenes with actual accepted decisions and
deduplicates by term. It uses plain language rather than the
Catalysis narrative voice. The first related `lesson.definition` supplies
`plain`, and its `lesson.observable` supplies `limit`. Stable concept
identifiers and typed evidence distinguish:

- a concept encountered in a reached scene;
- a concept experienced when an actual receipt matches one complete declared
  lesson rule; and
- a concept played when an accepted action carries the exact term's explicit
  choice binding.

Status precedence is `played` over `experienced` over `encountered`. An
accepted scene establishes encountered, not played. Experienced requires one
actual decision or scene-pulse receipt to match every field in a conjunctive
`SceneLesson.experienceRules` variant and retains the matching event IDs.
Played requires an accepted choice to carry an explicit term-matching
`GeneratedChoice.conceptPlays` binding and retains the bound decision IDs.
Those two provenance sets are independent: played status may have no matching
effect-event ID, and a background matching event creates no played decision.
Saturation intentionally has no play variant. An offered action, accepted
scene, or selected action without the explicit binding is not played. Labels,
details, intent, tags, and generic signal prose are never predicates. A
generated possibility is not necessarily experienced. A selected fictional
action does not establish the player's real belief or character.

The typed `SceneLesson` fields and their authored `experienceRules`, together
with each choice's typed `conceptPlays`, are the canonical starting point for
signaling, saturation, correction drag, market value, trust capital, and status
capital. The interface will not create a second hard-coded glossary or infer
status from display prose.

### Experiential ending

`buildNaturalizedSummary(pack, state)` returns ordered paragraphs and typed
supporting narrative-source identifiers from the completed pack and state. The
summary is one natural, integrated passage. Ordinary paragraphs
are permitted; term-definition cards, a glossary grid, numbered lessons, and
parallel concept mini-essays are not. The passage may synthesize concrete
events, pressures, choices, unresolved questions, and aftereffects supported
by the completed night. It will preserve motive/truth and
understanding/innocence distinctions without prescribing belief, grading the
player, or inventing the player's interior.

Catalysis atomization governs the ending's local semantic units and cadence,
not its macrostructure. It must not fracture the ending into slogans,
aphorisms, or one-concept tiles.

Catalysis atomization is an editorial and adversarial-review constraint, not a
visible receipt taxonomy. The completed view does not expose “atom” or
“Catalysis” headings, modules, scores, or badges to demonstrate compliance.

A visible labelled model-limit note is adjacent to the summary but outside its
prose thesis. The summary itself ends on remaining unresolved reach or
afterimage, not on a lesson, score, command, or model disclaimer. The separate
plain concept receipt follows.

Summary provenance distinguishes selected-path content or format carriage from
background-only model movement. If several post-close metrics changed, the
remaining residue is selected by normalized magnitude—reach against its
scenario audience ceiling and other eligible metrics against their 100-point
scale—while the source retains raw close/debrief values and the normalized
change.

### Voice boundary

Experiential, narrative, and interpretive atoms may use Catalysis. Concept
explanations, controls, errors, privacy and save copy, accessible names, and
live announcements remain plain and task-specific. No voice decision may
weaken CHORUS truth, disclosure, ethics, accessibility, privacy, determinism,
or safety constraints.

### Evidence sequence

The baseline copy and the present Heart test remain preserved. The first red
team is completed before implementation. The rewritten copy is attacked with
the same matrix plus Catalysis-specific tests. Failed tests and corrections
remain linked through:

`issue → constraint → design decision → implementation → failed test → correction → verification`

No historical run is relabeled as evidence for changed source.

## Consequences

- The ending can carry relational and emotional depth without becoming an
  instructional glossary.
- Players can inspect plain meanings and the evidence for “encountered,”
  “experienced,” or “played” without those explanations flattening the ending.
- Concept claims become path- and evidence-bounded instead of being hard-coded
  generic assertions.
- The completed-night view has a single reading order that must remain usable
  in narrow view, keyboard traversal, screen-reader order, and the one-viewport
  model.
- The ending uses completed `NightState` as well as the generated pack.
- Generator-authored copy changes advanced `GENERATOR_VERSION` from historical
  13 to current 14; prior save compatibility and retained simulation evidence
  remain explicit boundaries.
- Existing interaction documentation, traceability, tests, notebook/source
  bindings, and release evidence will require coordinated renewal when the
  implementation changes.

## Supersession boundary

This record does not rewrite the baseline to make the old choice appear wrong
or never accepted. At `4fffddf...`, the Heart component, interaction
specification, and old Heart test remain accurate historical evidence.

At the version-14 implementation level:

- the naturalized summary supersedes the baseline Heart's taxonomic layout
  duty;
- the separate concept receipt receives the concept-definition duty;
- the old Heart test obligation is replaced by contracts for semantic
  separation, conclusion gating, naturalized-summary structure, concept
  evidence status, and accessibility; and
- the old component, test result, and pre-rewrite findings remain preserved as
  baseline evidence.

Those supersessions are verified by the current automated and publication
binding; live-browser, assistive-technology, and promotion evidence remain
open.

## Alternatives considered

### Rewrite the six Heart cards in Catalysis

Rejected. It changes diction while retaining the breakdown the request asks to
naturalize, and it invites atomization to become visual fragmentation.

### Put plain definitions inside the natural ending

Rejected. It merges the explanatory apparatus back into the experiential
summary, encourages repeated inference, and makes the ending read as a polished
mini-essay or disguised glossary.

### Remove explicit concepts entirely

Rejected. It satisfies neither the request for separate plain explanation nor
CHORUS's inspectable educational purpose.

### Apply Catalysis to every user-visible string

Rejected. Controls, errors, privacy boundaries, accessible names, and concept
definitions require immediate plain meaning. A universal voice treatment would
create ambiguity and accessibility risk.

### Infer concept status from prose or visual impression

Rejected. “Encountered,” “experienced,” and “played” are claims about the
actual completed night and require typed predicates and supporting identifiers.

## Links

- [Copy and voice](../COPY-VOICE.md)
- [Copy and voice atomic requirements register](../requirements/COPY-VOICE-REGISTER.md)
- [Conclusion-gated progressive disclosure](0004-conclusion-gated-progressive-disclosure.md)
- [Interaction and progressive disclosure](../INTERACTION-DISCLOSURE.md)
- [Communication and fatigue atlas](../COMMUNICATION-ATLAS.md)
- [Testing and traceability](../TESTING-TRACEABILITY.md)
