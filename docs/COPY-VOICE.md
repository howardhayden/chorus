# Copy and voice

## Status and purpose

This document owns the adopted voice architecture for player-visible CHORUS
copy. The version-14 source implements the target architecture and its focused
automated correction gates pass. Live-browser geometry, assistive-technology
reading order, manual viewport review, and release promotion remain **open**.
Baseline revision
`4fffddf11a03a2fc84798a3c5343db00fc3135da` remains the preserved pre-change
record and is never relabeled as evidence for the new source.

The copy change has two coupled purposes:

1. move experiential, narrative, and interpretive writing into an atomized
   Catalysis voice without weakening CHORUS's factual, ethical, disclosure, or
   accessibility boundaries; and
2. separate the concluding experience from its explanatory apparatus: the
   final summary becomes natural, continuous prose, while concepts the player
   encountered, experienced, or played receive their own plainer explanation.

The atomic requirements, provenance, acceptance criteria, tests, owners, and
supersession state are canonical in
[the copy and voice register](requirements/COPY-VOICE-REGISTER.md). This page
defines the design those requirements govern. The current automated evidence
binds the implemented structure to exact source bytes; it does not substitute
for the open live-browser and assistive-technology gates.

## Authoritative inputs

| Source | Stable binding | Role |
|---|---|---|
| Direct user request, 31 August 2026 | `SRC-U-20260831-CHORUS-COPY`; SHA-256 `98dd018a7c43e3013eaaedb8fd77c43bc2639da78cca678217fe9de3003ecf97` | Governs sequence, voice adoption, ending form, and separate plain concept copy. |
| Catalysis HTML | SHA-256 `566f7c653142b239c098a0a3a0b628f3a3179535b219a99d889fdd48cc9513af`; 1,735,609 bytes | Governs the adopted voice. The exact bytes, not a recollection or abbreviated paraphrase, are authoritative. |
| Present CHORUS | commit `4fffddf11a03a2fc84798a3c5343db00fc3135da` | Supplies the pre-change copy, accepted product invariants, and historical behavior. |
| Atomic-requirements and provenance standard | `SRC-U-ATOM-PROV` | Requires stable IDs, source provenance, conflicts, dependencies, ownership, acceptance, adversarial tests, evidence, status, and supersession. |
| Red-team QA standard | `SRC-U-REDTEAM` | Requires positive, negative, boundary, combination, failed-test, correction, and verification evidence. |

Normative precedence is: the direct request and the user's general project
standards; the exact pinned Catalysis definition for voice behavior; accepted
CHORUS ethical, disclosure, accessibility, privacy, and deterministic
constraints; then existing copy where it has not been explicitly superseded.
Evidence has a different function: it demonstrates whether an implementation
satisfies a requirement and cannot silently rewrite that requirement.

## Copy ownership classes

Every player-visible copy atom must have one stable semantic identifier and
one declared class. An atom is a unit with one immediate communicative job,
not necessarily one sentence or one DOM node.

| Class | Included surfaces | Governing behavior |
|---|---|---|
| `catalysis` | Experiential scene copy, authored artifacts, seat pressure, consequential receipts, and the natural concluding summary. | Uses the atomized Catalysis rules below while preserving the proposition ledger. |
| `plain-concept` | The separate concluding explanation of concepts encountered, experienced, or played. | Uses familiar, bounded language and evidence-qualified status. It does not imitate the narrative voice. |
| `plain-utility` | Controls, state labels, instructions, privacy and save actions, recovery, error messages, accessible names, and live announcements. | States action, result, boundary, or recovery directly. Literary ambiguity is a defect. |
| `technical-verbatim` | Stable identifiers, version names, data limits, integrity states, and other text whose exact technical meaning governs behavior. | Preserves the canonical technical term and adds plain explanation where needed; it is not stylistically decorated. |

Choice copy is split by typed function rather than by its wording. Stable
safety floors, canonical repair actions, and locked visible ideals repeat as
plain utility affordances so the same systemic action remains learnable across
rooms. `choiceCopyVoiceClass` derives that boundary from availability and
ethics records, never from a label string. Incident-responsive labels and
details remain in the Catalysis class. The classification is editorial only;
the interface does not expose voice badges or use the class to decide effects.

The inventory must cover static JSX, generated authored fields, conditional
copy, collapsed content, accessible names, live regions, save and privacy
messages, and every concluding surface. Code comments and maintainer-only
technical prose are outside the player-copy rewrite, although canonical
documentation must be updated when behavior changes.

## Atomized Catalysis

Atomization means applying the voice at the smallest coherent semantic scale
while letting neighboring atoms form a scene. It does not mean cutting every
thought into a fragment, assigning one card to every idea, or forcing every
label to perform a miniature literary arc.

“Catalysis” and “atom” are editorial and red-team constraints, not visible
receipt categories. The interface does not label passages as Catalysis atoms,
split the completed summary into voice modules, or add modular headings to
prove that the style was applied. Review attacks the prose for semantic
camouflage, mechanical fragmentation, and lost motion; the player receives the
scene or continuous summary, not the review vocabulary.

### Local movement

Where the surface has enough room, concrete sensation, artifact, gesture, or
pressure opens into a question; the question reveals a relationship,
institution, history, or system; that structure exposes an asymmetry, burden,
or cost. The movement may be distributed across a scene cluster. Short labels,
controls, and errors perform only their necessary task.

The voice retains visceral intensity and fragmentary pressure where pressure
is real. It also retains cleaner dialogue, stronger scene integration, genuine
conversational subtext, and reduced explanatory clutter. Cadence varies because
the situation varies, not because a sentence-length pattern is being
demonstrated.

### Semantic discipline

- One atom performs one immediate semantic job.
- An inference already carried by an artifact, action, silence, or response is
  not automatically repeated through narration, dialogue, and explanation.
- The present scene moves before lineage or institutional history expands.
  Structure enters through the current record, relation, consequence, or one
  bounded detail.
- Depth does not authorize a polished mini-essay that suspends play.
- Metaphor may deepen relation or cost, but may not change who knew what, what
  happened, what remains unknown, or how an effect traveled.
- Focalization belongs to the fictional seat. Copy may name that authored
  seat's knowledge and pressure; it may not invent the player's feelings,
  beliefs, motives, diagnosis, or lesson learned.
- Fragmentation is valid only when surrounding grammar and reading order make
  the subject, action, and consequence recoverable.

### Protected distinctions

Voice never collapses:

- observation, inference, and unknown;
- ground truth, protagonist motive, and audience interpretation;
- an explanation of capacity and an excuse for harm;
- ambient system pressure and direct content or format carriage;
- shared register, shared world model, shared relationship, and shared belief;
- discernment and enactment;
- an offered action and an accepted action; or
- a fictional seat's authored interior and the player's own interior.

Warmth, reserve, fluency, terseness, affiliation, or aesthetic fit never become
proof of care, contempt, truth, deceit, class, competence, or motive. Fatigue
may explain a modeled barrier and may never certify innocence. Simplification
may never convert CHORUS into a diagnostic instrument or an operational guide
for manipulation, harassment, targeting, or evasion.

## The concluding architecture

### Naturalized summary

`buildNaturalizedSummary(pack, state)` is a pure derivation that returns ordered
paragraphs, typed `NarrativeAtom` clauses, and supporting `NarrativeSource`
identifiers. The summary is
the first part of the completed-night view and one integrated passage with
ordinary paragraphing as needed. It is not a grid, glossary, numbered lesson,
set of term-definition cards, or sequence of parallel mini-essays.

Catalysis atomization applies to its internal cadence and semantic precision,
not to its macrostructure. The ending may gather concrete events, choices,
pressures, unresolved questions, and aftereffects from the completed night. It
may not say that an offered action was selected, treat a selected action as the
player's endorsement, diagnose the player, grade the path, or prescribe a
belief. Motive remains separate from truth; understanding remains separate
from innocence; responsibility does not migrate onto the person made to absorb
another seat's cost.

The builder does not fill independent fact, route, lesson, repair, and residue
slots. It selects a short chronological chain of evidence-bearing routes,
preferring a chain that reaches the room with the strongest normalized
afterimage. The opening comes from the selected beat's public disclosure atoms,
never from an unconditional scenario-entry slot. Artifact, record, pressure,
and inquiry clauses are deduplicated when they repeat the same semantic work.
Prose and source order then follow chronology: beat-local scene → accepted
decision → typed route → later accepted decision. The later decision is marked
only as chronologically later; the summary does not claim that it answered the
route. Any selected last-resort move retains its protected party, gain, harmed
party, harm, and self-cost inside one keep-together narrative unit. Paragraph
packing never splits a `NarrativeAtom` or a bounded last-resort event. The final
paragraph integrates the later resolution with one source-backed afterimage or
an explicitly sourced no-change state. Text equality never establishes event identity: if
independent decisions happen to share a label, each remains attached to its
own room, turn, and decision provenance. Prose may repeat the label; it may
not turn one event into “the same move” merely to avoid verbal repetition.

Route compatibility and route carriage remain separate. A typed narrative
source retains whether the selected path actually carried content or format,
along with applied, background, avoided, and crossover values. A compatible
direct link or background-only model movement cannot be narrated as content or
format carried by the selected action.

The ending must not duplicate the separate concept explanations. It synthesizes
what the night placed in relation and leaves room for genuine subtext. Its last
paragraph remains with unresolved reach or afterimage from this night rather
than turning into a lesson, command, score, or model disclaimer.

When several post-close metrics changed, the builder selects the remaining
afterimage by normalized magnitude rather than letting a large-unit metric win
by raw scale. Reach is normalized to the scenario's audience ceiling; the
other eligible metrics use their 100-point scale. Its `NarrativeSource` retains
the raw close and debrief values plus `normalizedChange`. Normalization chooses
which supported residue to mention; it does not alter `NightState` or claim
that the residue is objectively most important.

A visible labelled model-limit note sits adjacent to the summary but outside
its prose thesis. It states the fictional, explanatory boundary and cannot be
appended as the summary's final moral.

### Separate plain concepts

Concept explanation belongs in a distinct concluding semantic region. The
typed `SceneLesson` record and its `experienceRules`, together with each
choice's typed `conceptPlays`, are the canonical starting point for the six
system concepts already guaranteed across a complete generated night:

- signaling;
- saturation;
- correction drag;
- market value;
- trust capital; and
- status capital.

`buildConceptReceipt(pack, state)` derives the surface from typed pack and
state evidence instead of a second hard-coded glossary. Every generated choice
owns a typed `conceptPlays` array; every `SceneLesson` owns typed conjunctive
`experienceRules`. The builder considers only terms attached to scenes resolved
by actual accepted decisions, deduplicates by term, and returns plain meaning,
limit, exact status, scene identifiers, played decision identifiers, exact
matched effect-event identifiers, and one visible discriminated evidence
sentence. Status precedence is `played` over `experienced` over `encountered`:

- **Encountered:** at least one accepted decision resolves to a scene carrying
  the term; accepted scene identifiers are retained, while decision and
  effect-event identifier arrays remain empty.
- **Experienced:** an actual decision or scene-pulse receipt matches every
  authored field in one of the lesson's `experienceRules`: lesson-scene source,
  allowed event kind, receipt scope, field or metric direction, and any required
  semantic or mechanism. The entry retains the actual matching event IDs but
  no played decision IDs.
- **Played:** an accepted action carries an explicit term-matching
  `conceptPlays` binding. Signaling binds a Surface outward delivery;
  correction drag binds a Correction source-bearing repair; market, trust, and
  status capital bind compatible Bridge actor/classification/effect shapes.
  Saturation intentionally has no play variant. Played entries retain the
  actual bound decision IDs. Their effect-event IDs are independently derived
  through the experience rules and may be empty.

`plain` is the first related accepted scene's `lesson.definition`; `limit` is
that lesson's `lesson.observable`. Non-played entries have no decision IDs, but
experienced entries do retain effect-event provenance. No accepted scene or
unbound selected action implies played. Saturation is never promoted merely
because a choice existed. Labels, details, intent prose, ethics tags, and
generic signals are not status predicates. An offered action is not played. A
generated possibility is not necessarily experienced. A selected fictional
action is not evidence of the player's real belief or character.

Visible evidence is also discriminated: `scene` evidence names the accepted
beat, `effect` evidence names the recorded event and target, and `action`
evidence names the selected bound decision. A metric receipt can record an
applied direction that later meets a room bound; its sentence therefore does
not claim a net increase unless a realized delta supports one. The interface
renders the plain evidence sentence rather than an opaque identifier count;
the identifiers remain in the derived receipt for audit.

Plain concept copy answers, in familiar words: what the concept means here;
what happened in this completed night; and where the model's claim stops. It
must retain relevant distinctions such as ambient versus direct, motive versus
truth, discernment versus enactment, and offered versus played. Jargon is
explained, not merely replaced by a different abstraction.

Both the concept surface and the natural ending remain sealed until all 24
decisions are complete. Visually collapsed content may not leak through hidden
DOM, accessible names, live announcements, or relationship labels.

## Required change sequence

The sequence is fail-closed:

1. Bind the exact present source and inventory every copy atom.
2. Pin the exact Catalysis HTML bytes and requirements register.
3. Red-team the present copy before changing it.
4. Preserve every finding and failed test under its original source binding.
5. Make design decisions against the atomic register.
6. Implement the voice, natural ending, and separate plain concept surface.
7. Red-team the rewritten copy with the entire first attack matrix plus
   Catalysis-specific attacks.
8. Correct blocking failures and rerun every affected focused and full gate.
9. Renew browser, accessibility, publication, and release evidence against the
   same final implementation digest.

Implementation may not begin merely because the register exists. A prose
review, style score, or updated expected string is not verification.

## Adversarial review

The pre- and post-rewrite reviews cover at least:

- semantic duplication across artifact, narration, dialogue, internal thought,
  receipt, and ending;
- fact/inference/unknown collapse and causal-scope drift;
- motive used as a truth test or capacity used as exculpation;
- premature analytic, linguistic, framework, or motive disclosure;
- front-loaded history, abstract throat-clearing, specialist shorthand, and
  scene-stopping mini-essays;
- cadence monotony, mechanical fragmentation, ornamental sensation, purple
  ambiguity, and false subtext;
- a natural ending accidentally rebuilt as atomized cards or aphorisms;
- a concept marked experienced or played without typed evidence;
- literary language leaking into controls, errors, privacy, accessible names,
  or live announcements;
- copy reusable as manipulation, harassment, targeting, evasion, or diagnosis;
- 320-pixel portrait, short landscape, 200% zoom, forced colors, reduced
  motion, keyboard, and screen-reader reading order; and
- long generated content, absent optional frameworks, no last resort, no
  selected diversion, seed 0, and maximum unsigned 32-bit seed boundaries.

The second review repeats the first instead of substituting a new, easier
matrix. It additionally attacks semantic camouflage by beautiful prose and
mechanical imitation of Catalysis markers. No critical or high-severity copy,
ethics, disclosure, causality, or accessibility finding may remain open in a
completion claim.

## Evidence chain

Each issue retains:

`issue → constraint → design decision → implementation → failed test → correction → verification`

The evidence record names source revision, voice digest, requirement IDs, copy
atom IDs, seed and action identities where generated copy is involved,
expected and observed result, severity, status, owner, affected paths,
correction revision, command, and final implementation binding. Prior-source
evidence is never refreshed onto new bytes.

## Current conflict and supersession boundary

At the pinned baseline, `HeartReceipt` was a hard-coded six-card concept
taxonomy, and the automated test named `The heart defines the represented ideas
without instructional imperatives` requires several of those definitions.
The interaction specification likewise assigned concept-definition ownership
to The Heart. These remain accurate descriptions of the baseline and must stay
in the historical record.

[ADR 0009](decisions/0009-separate-experiential-ending-from-concept-receipt.md)
accepts the replacement architecture. The version-14 implementation supersedes
the old Heart obligation at the implementation level with the continuous
summary and separate concept surface; it does not erase the old component,
specification, test, or findings from baseline provenance. Replacement source,
copy, linguistic, accessibility, and viewport tests are current; live-browser
behavior, assistive-technology reading order, and release promotion remain open.
