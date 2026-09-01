# Copy and voice atomic requirements register

## Register state

| Field | Value |
|---|---|
| Register ID | `CHR-COPY-REGISTER` |
| Version | `1.0.0` |
| Created | 31 August 2026 |
| Baseline commit | `4fffddf11a03a2fc84798a3c5343db00fc3135da` |
| Target implementation status | **Pass on the current implementation binding** |
| Target verification status | **Automated pass; browser, assistive-technology, route, dependency, and distribution promotion evidence held open** |
| Canonical design | [Copy and voice](../COPY-VOICE.md) |
| Governing decision | [ADR 0009](../decisions/0009-separate-experiential-ending-from-concept-receipt.md) |

This register decomposes the requested CHORUS copy change into independently
testable requirements. Version-14 source and canonical documentation implement
the ending/concept architecture. Preserved row statuses record the state at
registration; the post-red-team and verification records own the current
binding and its explicit promotion gaps.

## Source provenance

### `SRC-U-20260831-CHORUS-COPY`

**Authority:** direct user instruction, highest precedence for this change.

**SHA-256:**
`98dd018a7c43e3013eaaedb8fd77c43bc2639da78cca678217fe9de3003ecf97`

> Pull the present CHORUS, then red-team copy, update writing voice to atomized
> [writing voice Catalysis], then red-team again, and naturalize the summary at
> the end rather than breaking it down (red-teamed by Catalysis atomization),
> with concepts encountered, experienced, or played by the user broken down in
> plainer copy separately.

### `SRC-CATALYSIS-HTML-566F7C65`

| Field | Value |
|---|---|
| Artifact | Catalysis HTML supplied as the authoritative writing-voice source |
| Bytes | `1,735,609` |
| SHA-256 | `566f7c653142b239c098a0a3a0b628f3a3179535b219a99d889fdd48cc9513af` |
| Authority | Governs Catalysis voice behavior; subordinate to the direct request and protected CHORUS constraints. |

The digest and byte length identify the exact source. A summary, recollection,
or later file with the same display name is not the pinned source.

### `SRC-CHORUS-4FFFDDf`

| Field | Value |
|---|---|
| Repository state | Present CHORUS before the requested rewrite |
| Commit | `4fffddf11a03a2fc84798a3c5343db00fc3135da` |
| Authority | Current behavior, canonical product constraints, accepted ADRs, tests, and evidence conventions. |

### General user standards

| Source ID | Requirement |
|---|---|
| `SRC-U-ATOM-PROV` | Decompose authoritative specifications and corrections into stable, independently testable requirements with provenance, conflicts, dependencies, ownership, acceptance criteria, adversarial evidence, status, and supersession history. |
| `SRC-U-REDTEAM` | Red-team specifications, implementations, integrations, and completion claims; preserve positive, negative, boundary, combination, failed-test, correction, and verification evidence in one engineering chain. |

## Precedence and conflict rules

Normative precedence is:

1. `SRC-U-20260831-CHORUS-COPY`, `SRC-U-ATOM-PROV`, and
   `SRC-U-REDTEAM`;
2. `SRC-CATALYSIS-HTML-566F7C65` for voice behavior;
3. accepted CHORUS truth, disclosure, ethics, accessibility, privacy,
   determinism, and evidence constraints at `SRC-CHORUS-4FFFDDf`; and
4. baseline copy where no higher source supersedes it.

When sources appear to conflict, implementation fails closed until the conflict
is recorded and resolved. Catalysis cannot waive a CHORUS semantic or
accessibility invariant. Existing tests are evidence of baseline behavior, not
authority to reject the direct request. Conversely, changing an expected test
string cannot by itself prove the new requirement.

## Status vocabulary

| Status | Meaning |
|---|---|
| `Pending` | Required but not yet demonstrated by implementation-bound evidence. |
| `Implemented` | Corresponding source change exists; verification remains incomplete. |
| `Implemented; verification pending` | The adopted source structure exists, but its full focused, browser, assistive-technology, publication, and release evidence chain is incomplete. |
| `Verified` | Acceptance, negative, boundary, and applicable combination evidence pass on one identified source binding. |
| `Blocked` | A named unresolved dependency or conflict prevents progress. |
| `Superseded` | A later stable requirement replaces this row; the row and its evidence remain historical. |

Rows below preserve their registration state rather than being rewritten after
the fact. Current automated disposition is recorded in
`copy-red-team.post.v1.json` and `copy-verification.v1.json`; neither artifact
claims the unperformed browser or assistive-technology work.

## Atomic requirements

### Provenance, sequencing, and first red team

| ID | Requirement | Source / precedence | Dependencies | Implementation owner | Acceptance and evidence method | Negative and boundary tests | Status / supersession |
|---|---|---|---|---|---|---|---|
| `CHR-COPY-PROV-001` | Preserve the exact present copy before any edit. | Direct request, atomic standard / 1 | None | `evidence/copy/`, copy inventory producer | Bind commit, path digests, exact copy atoms, semantic selectors, surface, disclosure phase, and voice class in immutable baseline JSON. | Reject capture made after rewrite, missing generated copy, missing accessible names/live copy, or missing seed 0 and `0xffffffff` samples. | **Pending**; supersedes none. |
| `CHR-COPY-PROV-002` | Pin the exact Catalysis source used. | Catalysis source / 2 | `PROV-001` | Requirements/evidence controller | Record 1,735,609 bytes and SHA-256 `566f7c...513af`; later change requires a new source ID and supersession record. | Reject filename-only, paraphrased, memory-only, truncated, or digest-mismatched voice source. | **Pending**; supersedes only through a later versioned source. |
| `CHR-COPY-PROV-003` | Assign every in-scope copy atom a stable semantic ID. | Atomic standard / 1 | `PROV-001` | Copy inventory and affected source owner | ID maps to component or generated field, context, disclosure class, propositions, and governing requirements and survives line movement. | Reject line-number-only IDs, reused IDs with different meaning, conditional runtime strings without IDs, or one ID spanning unrelated jobs. | **Pending**; supersedes none. |
| `CHR-COPY-PROV-004` | Record provenance, precedence, conflicts, dependencies, owner, acceptance, adversarial tests, evidence, status, and supersession for every requirement. | Atomic standard / 1 | `PROV-002` | This register | A schema or explicit review rejects incomplete rows and unsupported completion states. | Blank owner, status, evidence, or supersession; `Verified` based only on prose or design adoption. | **Pending**; supersedes none. |
| `CHR-COPY-SEQ-001` | Complete and bind the present-copy red team before rewriting. | Direct request / 1 | `PROV-001–004` | Evidence controller | Pre-rewrite finding set is source-bound, closed to baseline additions, and hashed before implementation edits begin. | Rewrite begins with unaudited surface classes; findings retroactively changed to match implementation. | **Pending**; supersedes none. |
| `CHR-COPY-SEQ-002` | Preserve issue → constraint → design decision → implementation → failed test → correction → verification. | Atomic and red-team standards / 1 | `SEQ-001` | Evidence controller and implementation owners | Every correction claim links all seven stages or remains pending. | Only final pass retained, failed observation overwritten, or issue closed by assertion. | **Pending**; supersedes none. |
| `CHR-COPY-SEM-001` | Maintain a proposition ledger across the rewrite. | Direct request plus CHORUS constraints / 1, 3 | `PROV-003` | `app/page.tsx`, `app/scenario-generator.ts`, affected copy owners | Every baseline factual, causal, ethical, and disclosure proposition is preserved, intentionally superseded by authority, or removed with rationale. | Rewrite changes who knew what, evidence status, causality, responsibility, effect scope, action availability, or unknowns. Test adjacent atoms that jointly carry one distinction. | **Pending**; supersedes none. |
| `CHR-COPY-RT1-001` | Red-team every player-visible copy class before rewrite. | Direct request, red-team standard / 1 | `SEQ-001` | `evidence/copy/copy-red-team.pre.v1.json` | Coverage includes narrative, generated artifacts, choices, blocked reasons, receipts, controls, accessible names, announcements, privacy/save/error copy, and ending. | Review only Heart or static JSX; omit generated, conditional, collapsed, or hidden copy. | **Pending**; supersedes none. |
| `CHR-COPY-RT1-002` | Attack semantic, ethical, and safety failure modes. | Red-team standard and CHORUS / 1, 3 | `RT1-001` | Pre-rewrite red-team owner | Findings cover fact/inference/unknown collapse, motive-as-truth, capacity-as-excuse, diagnosis, universal claims, moral grading, premature disclosure, source leakage, and operational manipulation. | Polished prose accepted despite semantic drift; benevolent tone hides responsibility transfer. Include ambiguous and hostile readings. | **Pending**; supersedes none. |
| `CHR-COPY-RT1-003` | Attack copy-form and Catalysis-readiness failure modes. | Direct request and Catalysis / 1, 2 | `RT1-001` | Pre-rewrite red-team owner | Findings cover duplication, mini-essays, front-loaded history, jargon, throat-clearing, cadence monotony, purple ambiguity, mechanical fragments, and scene delay. | Count short sentences as atomization or delete protected distinctions merely to shorten copy. Test longest generated atoms and smallest supported viewport. | **Pending**; supersedes none. |

### Voice scope and semantic behavior

| ID | Requirement | Source / precedence | Dependencies | Implementation owner | Acceptance and evidence method | Negative and boundary tests | Status / supersession |
|---|---|---|---|---|---|---|---|
| `CHR-COPY-SCOPE-001` | Classify each player-visible atom as `catalysis`, `plain-concept`, `plain-utility`, or `technical-verbatim`. | Direct request plus CHORUS / 1, 3 | `PROV-002` | Inventory; all player-copy owners | Inventory contains exactly one governing class per atom and the renderer uses the intended source. | Privacy warning, error, control, accessible name, or live announcement receives literary ambiguity; narrative receives unreviewed utility boilerplate. | **Pending**; supersedes none. |
| `CHR-COPY-VOICE-001` | Give each Catalysis atom one immediate semantic job. | Catalysis / 2 | `SCOPE-001`, `SEM-001` | Narrative and interpretive copy owners | Atom has one local purpose and does not restate an inference already carried by an adjacent atom. | Dialogue, narration, thought, and receipt repeat the same inference; one atom supplies history, diagnosis, and instruction. | **Pending**; supersedes none. |
| `CHR-COPY-VOICE-002` | Distribute concrete pressure → inquiry → relation or structure → asymmetry or cost through a local passage where space permits. | Catalysis / 2 | `VOICE-001` | Narrative copy owners | Review identifies the movement without requiring every label or sentence to contain all stages. | Mechanical template repetition, unrelated sensory ornament, or a control forced into a literary arc. Test short surfaces that correctly perform only one task. | **Pending**; supersedes none. |
| `CHR-COPY-VOICE-003` | Preserve visceral pressure and high-variance cadence without losing clarity. | Catalysis / 2 | `VOICE-001` | Narrative copy owners | Variation serves situation; fragments remain recoverable in context and screen-reader order. | Uniform fragments, uniformly elaborate sentences, unclear subject/action, or rhythm used as substitute for meaning. | **Pending**; supersedes none. |
| `CHR-COPY-VOICE-004` | Prefer genuine subtext over repeated explicit inference. | Catalysis / 2 | `VOICE-001` | Narrative copy owners | Artifact, action, response, or silence carries inference where sufficient; explanation remains when safety or semantic accuracy requires it. | Same inference appears in artifact, seat text, choice, receipt, and ending; necessary evidence/unknown boundary removed as “exposition.” | **Pending**; supersedes none. |
| `CHR-COPY-VOICE-005` | Move the present scene before expanding history or institution. | Catalysis / 2 | `VOICE-002` | `app/scenario-generator.ts`, scene rendering copy | Structure enters through the current artifact, relationship, consequence, or bounded detail without suspending action. | Long lineage or institutional preamble, abstract throat-clearing, or standalone polished mini-essay before the actionable scene. | **Pending**; supersedes none. |
| `CHR-COPY-VOICE-006` | Focalize through the fictional seat without inventing the player's interior. | Direct request, Catalysis, CHORUS ethics / 1–3 | `SEM-001` | Generated and rendered seat copy | Copy names authored knowledge and pressure only; it does not state the player's feelings, beliefs, motives, diagnosis, or learned conclusion. | “You realized/felt/wanted”; selected fictional action treated as real endorsement. Test all choice-path variants. | **Pending**; supersedes none. |
| `CHR-COPY-VOICE-007` | Prevent the voice from changing system truth or causal scope. | CHORUS constraints / 3 | `SEM-001`, `VOICE-002` | Generator and receipts | Ground truth, observation, inference, unknown, motive, responsibility, and ambient/direct distinction remain independently recoverable. | Metaphor implies direct crossing from ambient effect; warmth proves care; fatigue proves innocence; shared code proves shared belief. | **Pending**; supersedes none. |
| `CHR-COPY-VOICE-008` | Keep utility copy direct and plain. | Direct request and accessibility / 1, 3 | `SCOPE-001` | `app/page.tsx`, `app/privacy-panel.tsx`, `app/save-model.ts` | Controls name action/result, errors name failure/recovery, privacy names data effect, accessible names remain unambiguous. | Poetic button, ambiguous failure recovery, Catalysis fragment in live announcement, or critical state encoded only in atmosphere. | **Pending**; supersedes none. |
| `CHR-COPY-VOICE-009` | Preserve copy meaning through reflow and assistive technology. | CHORUS accessibility / 3 | `VOICE-001–008` | JSX and CSS owners | No proposition is lost at 320px portrait, short landscape, 200% zoom, forced colors, reduced motion, or screen-reader linearization. | Meaning depends on adjacency, color, capitalization, visual pause, hover, or clipped generated text. | **Pending**; supersedes none. |
| `CHR-COPY-DISC-001` | Preserve conclusion-gated analytic disclosure. | Accepted ADR 0004 / 3 | `SEM-001` | `app/page.tsx` | No analytic label, language profile, framework name, protected motive, or concluding concept appears before turn 24, including hidden DOM and accessible output. | Beautiful implication leaks sealed classification; collapsed content remains discoverable; turn 23 exposes target copy. | **Pending**; supersedes none and does not weaken ADR 0004. |

### Natural ending and separate plain concepts

| ID | Requirement | Source / precedence | Dependencies | Implementation owner | Acceptance and evidence method | Negative and boundary tests | Status / supersession |
|---|---|---|---|---|---|---|---|
| `CHR-COPY-END-001` | Make the final summary natural, continuous prose rather than a concept breakdown. | Direct request / 1 | Voice requirements | `buildNaturalizedSummary`, completed-night renderer | The first concluding surface is one integrated passage with ordinary paragraphs and no taxonomy, card grid, numbered lessons, term-definition pairs, or parallel mini-essays. | Glossary disguised as lyric fragments; one concept per card; all-caps concept headings. | **Implemented; verification pending**; supersedes the baseline Heart layout duty at the implementation level. |
| `CHR-COPY-END-002` | Apply atomization as an editorial/red-team constraint on ending cadence, not as visible ending macrostructure. | Direct request and Catalysis / 1, 2 | `END-001`, `VOICE-002` | `buildNaturalizedSummary` | Sentence-level pressure and semantic precision coexist with one continuous argument; no visible Catalysis/atom modules, headings, badges, or score appear. | Ending fractures into aphorisms, slogans, tiles, isolated claims, repeated mini-arcs, or review vocabulary exposed as interface taxonomy. | **Implemented; verification pending**; supersedes none. |
| `CHR-COPY-END-003` | Derive ending claims from the completed pack and state. | Direct request and CHORUS / 1, 3 | `END-001`, concept evidence model | `buildNaturalizedSummary(pack, state)` | Every named event, pressure, choice, unresolved question, and aftereffect has supporting `NarrativeSource` identifiers; same input is deterministic; final paragraph remains with unresolved reach or afterimage. | Generic unchanged ending across materially different paths; offered action called selected; model disclaimer used as final thesis. Test no optional framework, no last resort, and no selected diversion. | **Implemented; verification pending**; supersedes none. |
| `CHR-COPY-END-004` | Preserve accountability without prescribing belief or grading the player. | CHORUS ethics / 3 | `SEM-001`, `END-003` | Naturalized-summary copy | Motive stays separate from truth and understanding from innocence; ending contains no command, diagnosis, purity test, score, or character judgment; model limit is a labelled adjacent note. | “You should,” “you learned,” selection-as-character, burden shifted to the harmed party, or disclaimer appended as the summary's moral. | **Implemented; verification pending**; supersedes none. |
| `CHR-COPY-END-005` | Prevent the ending from repeating the plain concept explanations. | Direct request / 1 | `END-001`, `CONCEPT-001` | Summary and concept builders | Shared ideas appear as synthesis or implication, not duplicated definitions. | Concept definition copied into ending or ending becomes a second glossary. | **Implemented; verification pending**; supersedes none. |
| `CHR-COPY-END-006` | Distinguish selected-path carriage from background-only model movement. | CHORUS causal boundary / 3 | `END-003`, `SEM-001` | `buildNaturalizedSummary(pack, state)` route sources | Route source retains `selectedPathCarriage`, applied/background/avoided reach, and crossover; prose attributes content or format carriage to the selected path only when the realized receipt supports it. | Direct compatibility alone reported as selected carriage; background reach rewritten as a player-selected crossing; avoided reach narrated as movement. | **Implemented; verification pending**; supersedes none. |
| `CHR-COPY-END-007` | Select and trace remaining afterimage residue on comparable scales. | Direct request and CHORUS completion semantics / 1, 3 | `END-003` | `buildNaturalizedSummary(pack, state)` afterimage source | Strongest eligible post-close change is selected by normalized magnitude: reach divided by audience ceiling, other eligible metrics by 100; source retains raw close/debrief values and `normalizedChange`, with deterministic tie-breaking. | Raw reach always dominates percentage metrics; normalization mutates state; summary calls normalized residue objectively most important. Test equal normalized magnitudes and no changed afterimage. | **Implemented; verification pending**; supersedes none. |
| `CHR-COPY-CONCEPT-001` | Place plain concept explanations in a distinct concluding semantic surface. | Direct request / 1 | `END-001` | `buildConceptReceipt`, completed-night renderer | A separately headed plain concept receipt follows the summary and adjacent model limit without a conclusion tabset. | Definitions embedded in ending; visual separation without semantic heading/region separation. | **Implemented; verification pending**; receives the concept-definition duty formerly held by Heart. |
| `CHR-COPY-CONCEPT-002` | Give each concept a stable ID and explicit typed evidence predicates. | Atomic standard / 1 | `PROV-003` | Generator and `buildConceptReceipt(pack, state)` | Receipt deduplicates accepted-scene `SceneLesson` terms; the first related `lesson.definition` supplies `plain`, its `lesson.observable` supplies `limit`, and output records strongest applicable status, scene IDs, bound played decision IDs, exact matched `effectEventIds`, and visible discriminated evidence. | Label/detail/intent/tag/signal inference, second hard-coded glossary, missing rule field, duplicated term, opaque evidence count, or untyped claim. | **Implemented; verification pending**; supersedes none. |
| `CHR-COPY-CONCEPT-003` | Distinguish `encountered`, `experienced`, and `played` literally. | Direct request / 1 | `CONCEPT-002` | Concept-status predicates | Precedence is `played > experienced > encountered`. Encountered requires an accepted source scene. Experienced requires one actual decision or scene-pulse receipt to match every field of one lesson rule. Played requires an accepted action's exact term binding. Saturation has no play variant. Effect-event IDs and played decision IDs are independent, so a played entry may have no effect ID. | Offered equals played, accepted scene alone equals played, prose mutation changes status, removed binding still plays, unrelated nonzero metric counts as experience, background pulse becomes a played decision, or selected fictional action equals player endorsement. | **Implemented; verification pending**; supersedes none. |
| `CHR-COPY-CONCEPT-004` | Use typed `SceneLesson` and `GeneratedChoice` fields as the canonical source for the six system concepts. | Version-14 generator / 3 | `CONCEPT-002` | `app/scenario-generator.ts`, `buildConceptReceipt` | Signaling, saturation, correction drag, market value, trust capital, and status capital derive from `term`, `definition`, `perspective`, `observable`, conjunctive `experienceRules`, and explicit `conceptPlays`, restricted to actual accepted decision scenes and events. | Second hard-coded JSX glossary, display-prose predicates, or drift between receipt and generator semantics. | **Implemented; verification pending**; supersedes the hard-coded Heart taxonomy at the implementation level. |
| `CHR-COPY-CONCEPT-005` | Explain each concept in familiar, bounded language. | Direct request / 1 | `CONCEPT-002` | Plain concept copy | Each entry states what it means here, what this night supports, and where the model's claim stops, with one idea per sentence. | Unexplained provenance/crossover/capital/framework jargon, encyclopedic history, Catalysis ornament, or vague synonym substitution. | **Implemented; verification pending**; supersedes none. |
| `CHR-COPY-CONCEPT-006` | Retain protected distinctions while simplifying. | CHORUS semantics / 3 | `SEM-001`, `CONCEPT-005` | Plain concept copy | Relevant entries preserve observation/inference/unknown, ambient/direct, discernment/enactment, motive/truth, and offered/played. | “Rumor means false,” “fatigue caused the choice,” or “shared language means shared belief.” | **Implemented; verification pending**; supersedes none. |
| `CHR-COPY-CONCEPT-007` | Keep concepts conclusion-gated, semantically structured, and reflow-safe. | ADR 0004 and accessibility / 3 | `DISC-001` | Completed-night JSX and CSS | Content appears only after turn 24, uses accessible heading/list structure, creates no nested scroll owner, and remains operable and coherent on narrow view and screen reader. | Hidden early DOM, conclusion tabset, badges as sole meaning, or duplicate navigation destination. | **Implemented; verification pending**; supersedes none. |
| `CHR-COPY-CONCEPT-008` | Retain independent provenance for background experience and selected concept play. | Atomic and CHORUS causal standards / 1, 3 | `CONCEPT-002–003` | `buildConceptReceipt(pack, state)` | `effectEventIds` names only actual decision or ambient-pulse events with a receipt matching every rule field; `decisionIds` names only accepted choices with exact term bindings. Either set may exist without the other. Encountered has neither. | Played status manufactures an effect event, effect match manufactures a played decision, unrelated nonzero metric passes, prose is used as provenance, or visible evidence omits its discriminant/target. | **Implemented; verification pending**; supersedes none. |

### Determinism, second red team, compatibility, and release

| ID | Requirement | Source / precedence | Dependencies | Implementation owner | Acceptance and evidence method | Negative and boundary tests | Status / supersession |
|---|---|---|---|---|---|---|---|
| `CHR-COPY-DET-001` | Keep rewritten and path-situated copy deterministic, local, and network-independent. | CHORUS architecture / 3 | Ending and concept derivation | Generator and pure summary/concept builders | Same pack/state produces byte-equivalent text without runtime model or remote copy service. | Wall clock, random navigation, remote response, or unrecorded environment changes copy. | **Implemented; verification pending**; supersedes none. |
| `CHR-COPY-RT2-001` | Rerun the complete first red-team matrix after rewrite. | Direct request / 1 | Implementation complete | `evidence/copy/copy-red-team.post.v1.json` | Every initial finding is retested against the same atom/concept or explicitly superseded with authority and rationale. | Run only new/easier checks, mark removed atoms fixed without mapping, or alter expected result to match observed output. | **Verified automatically on the current implementation binding; live-browser and assistive-technology review remain open.** |
| `CHR-COPY-RT2-002` | Add Catalysis-specific post-rewrite attacks. | Direct request and Catalysis / 1, 2 | `RT2-001` | Post-red-team owner | Attack semantic camouflage, purple ambiguity, mechanical atomization, artificial subtext, fragmented ending, utility-copy voice leakage, and lost scene motion. | Pass based only on signature words, cadence statistics, or surface resemblance. | **Corrected and verified automatically after the 1 September counterexample:** beat-local disclosure, banned audit scaffolds, act/route/residue-conditioned realization, 194-night bounds, atom integrity, and last-resort unit integrity pass; live editorial browser review remains open. |
| `CHR-COPY-RT2-003` | Correct every blocking post-red-team failure and rerun affected gates. | Red-team standard / 1 | `RT2-001–002` | Implementation owners and evidence controller | No critical/high copy, ethics, disclosure, causality, or accessibility finding remains open in a completion claim. | Accepted but undocumented blocker, shared template changed but only one test rerun, or failed evidence discarded. | **Verified automatically; no blocker or high-severity copy finding remains open.** |
| `CHR-COPY-COMPAT-001` | Advance generator compatibility when generated authored bytes change. | Baseline `MAINTENANCE.md` and `GENERATION-COHERENCE.md` / 3 | Final generator diff | `app/scenario-generator.ts`, save tests/docs | Current generator is version 14; version-13 saves fail closed unless a separately specified reconstruction path exists. | Same seed silently yields new authored pack under v13 or prior save is guessed/coerced. | **Implemented; verification pending**; historical v13 remains preserved. |
| `CHR-COPY-REL-001` | Hold release claims until evidence is renewed against the new implementation binding. | CHORUS release discipline / 3 | All implementation requirements | Release evidence owner | New tests and retained runs name one final implementation digest; old browser/distribution evidence remains historical. | Refresh old hashes onto new source or relabel baseline browser evidence current. | **Satisfied for automated source evidence; promotion remains held for the explicit interactive and distribution gaps.** |
| `CHR-COPY-REL-002` | Update every canonical owner and traceability link when behavior changes. | CHORUS documentation rules / 3 | Adopted implementation | `docs/COPY-VOICE.md`, interaction, communication, traceability, decisions index, release status | Canonical documents agree without making README or notebooks duplicate specifications; documentation checks pass. | Old Heart requirement remains active in current docs, new ADR remains unindexed, or generated publication is hand-edited. | **Verified by the current documentation and publication gates.** |
| `CHR-COPY-REL-003` | Run focused and complete verification on one final digest. | CHORUS release workflow / 3 | `RT2-003` | Tests and release scripts | Copy, generation, accessibility, viewport, save compatibility, docs, typecheck, lint, build, browser, and evidence gates pass or remain explicitly unverified. | Source-regex-only completion claim, browser ending not inspected, or test groups executed on different source bindings. | **Automated working-tree gate passes on one binding; browser, assistive-technology, current route/dependency, and neutral-distribution checks remain explicitly open.** |

## Explicit conflict and supersession ledger

| Conflict ID | Baseline owner | Baseline requirement or behavior | Target requirement | Resolution state |
|---|---|---|---|---|
| `CHR-COPY-CONFLICT-HEART-001` | `app/page.tsx`, `HeartReceipt` at `4fffddf...` | The Heart rendered six hard-coded taxonomic concept cards and a concluding blockquote. | `END-001–005`, `CONCEPT-001–007` | **Resolved and verified by current automated source evidence.** Baseline component and evidence remain preserved. |
| `CHR-COPY-CONFLICT-HEART-TEST-001` | `tests/accessibility-disclosure.test.mjs`, historical test `The heart defines the represented ideas without instructional imperatives` | Baseline test required definitions inside Heart. | Naturalized summary plus separate plain concept receipt contracts | **Resolved and verified by replacement automated contracts.** The baseline test remains historical failed/pre-change evidence and cannot be silently deleted from provenance. |
| `CHR-COPY-CONFLICT-INTERACTION-001` | Historical `docs/INTERACTION-DISCLOSURE.md`, Whole-night debrief | Heart answered what encountered ideas meant and defined them. | `CONCEPT-001` owns plain definition; `END-001` owns natural synthesis. | **Resolved in canonical documentation and verified automatically.** Historical bytes remain baseline evidence. |
| `CHR-COPY-CONFLICT-INDEX-001` | Historical `docs/index.md` | No canonical copy-and-voice owner or register was indexed. | `REL-002` | **Resolved and verified by documentation checks.** |

The target conflicts are resolved at the implementation and canonical-
ownership levels and verified by current automated source-bound evidence.
Failed baseline artifacts remain preserved; live-browser, assistive-technology,
and promotion evidence remain open.

## Evidence artifacts

| Artifact | Purpose | Current status |
|---|---|---|
| `evidence/copy/copy-baseline.4fffddf.v1.json` | Immutable copy-atom and source baseline. | Captured for the pinned baseline; not target verification. |
| `evidence/copy/copy-red-team.pre.v1.json` | First adversarial findings and coverage. | Captured with failed findings preserved; not target verification. |
| `evidence/copy/copy-red-team.post.v1.json` | Rewritten-copy retest, new Catalysis attacks, and correction state. | Captured on the current implementation binding; no blocker or high-severity finding remains open |
| `evidence/copy/copy-verification.v1.json` | Final commands, environments, source binding, manual matrix, and limitations. | Captured; automated pass with explicit release hold |
| `tests/copy-contract.test.mjs` | Deterministic semantic, concept-status, understandability, voice-scope, beat-local ending, and atom/block integrity contracts. | Current source-bound run passed 34/34 |

Public or generated copies of evidence must be built from their canonical
sources and never edited by hand.
