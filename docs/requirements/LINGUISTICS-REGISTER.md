# CHORUS linguistic-system atomic requirements register

## Register state

| Field | Value |
|---|---|
| Register ID | `CHR-LING-REGISTER` |
| Version | `1.2.0` |
| Created | 31 August 2026 |
| Updated | 1 September 2026 |
| Baseline commit | `4fffddf11a03a2fc84798a3c5343db00fc3135da` |
| Scope | Generated language, situated repertoires, player-visible narrative and choice copy, live crossing copy, disclosure, persistence, conclusion synthesis, and linguistic claim boundaries |
| Implementation status at registration | **Partially implemented; adversarial failures open** |
| Verification status at registration | **Failed / pending correction** |
| Current implementation status | **Catalysis and debrief-understandability correction pass implemented; preserved initial failures remain historical evidence** |
| Current verification status | **Automated working-tree pass on digest `09f21cfa…99021`; browser, assistive-technology, manual viewport, current route/dependency, and distribution evidence remain open** |
| Related register | [`CHR-COPY-REGISTER`](COPY-VOICE-REGISTER.md) |

This register is the operative atomization for CHORUS linguistics. It does not
claim to reproduce a missing prior reusable Catalysis register. The accessible
authorities support a fresh CHORUS-specific derivation with stable `CHR-LING-*`
identifiers. The exact pinned Catalysis corpus remains the primary voice
evidence; the local voice design records how that evidence is constrained by
CHORUS semantics, accessibility, and disclosure.

An implementation row is not verified merely because code or prose exists.
Verification requires the named positive, negative, boundary, and applicable
combination evidence on one source binding.

## Source provenance and precedence

### `SRC-U-20260831-CHORUS-LING`

**Authority:** current direct instruction; highest precedence for this change.

**Exact text, without a trailing newline:**

> Atomize linguistics of CHORUS using Catalysis writing voice, then implement and red-team.

**SHA-256:**
`6f3045c41a3287dcf82d2c8657034dbc968fa26f8afb9d63b438316423be91d3`

### `SRC-CATALYSIS-CORPUS-566F7C65`

| Field | Value |
|---|---|
| Artifact | Exact supplied `Catalysis.html` corpus |
| Bytes | `1,735,609` |
| SHA-256 | `566f7c653142b239c098a0a3a0b628f3a3179535b219a99d889fdd48cc9513af` |
| Role | Primary evidence for the adapted voice; never permission to alter CHORUS truth, safety, disclosure, or accessibility semantics |

The previously requested standalone atomized Catalysis definition and its
`WV-*` identifiers were not recoverable from the accessible workspace or
personal context. No `WV-*` identifier is therefore imported or silently
reconstructed here. [`COPY-VOICE.md`](../COPY-VOICE.md) is the explicit local
interpretation used by this register: concrete pressure, situated inquiry,
relationship or structure, asymmetry or cost; high-variance cadence; genuine
subtext; scene-first context; no redundant inference; and no polished
mini-essay that suspends the present action.

### `SRC-LATTICE-RSR-D6CC85B`

| Field | Value |
|---|---|
| Repository | `howardhayden/lattice` |
| Commit | `d6cc85b275e3f14163a5a547f626832fd21b27b0` |
| Profile | `profiles/relational-systems.profile.json` |
| Profile SHA-256 | `1868a428c0f3ffd55671cf8de5d1b549ffd309a920aaf01ff1db24e93536a996` |
| Role | Advisory relational-systems register for the 1 September debrief-understandability correction |

The pinned profile supplies stable atoms for layer conditioning, redundancy,
causal depth, operational vocabulary, epistemic limits, affected parties, and
scene closure. Freeform `lintText` output is advisory and declares no semantic
guarantee. CHORUS therefore claims no formal Lattice conformance without typed
candidates, dependencies, and a complete mapping. The local operative mapping
is [`CHR-DEBRIEF-UNDERSTANDABILITY`](DEBRIEF-UNDERSTANDABILITY-REGISTER.md).

### `SRC-CHORUS-4FFFDDf-LING`

Accepted linguistic and disclosure authority at the baseline commit:

| Owner | SHA-256 of bytes at `4fffddf` | Governing scope |
|---|---|---|
| `docs/decisions/0008-situated-individual-linguistic-repertoires.md` | `4eebf9dd59c06df5da7036e174552dbbd65d5146fe6c7b6cf30b4ded181d55aa` | Individual repertoires, switching, cohesion, code/world-model separation, conclusion gate |
| `docs/COMMUNICATION-ATLAS.md` | `bfadf4d09576e7ad5cc1338e3a2efdad07a5df83da02931f8737e8c22167e9c3` | Communication semantics, claim boundaries, choice grammar, safety invariants |
| `docs/INTERACTION-DISCLOSURE.md` | `c265384e11a35f756991e2edc1bfaa2b04643c5aabdda2f3ba2a98aa4ddcef23` | Visible timing, hidden/accessible surfaces, linguistic disclosure |
| `docs/GENERATION-COHERENCE.md` | `6c3e14b4bbeba87c6fa40322f49ad65733968ebdbb8602a35db69ea3cb133179` | Repertoire construction and rejection gates |
| `docs/CONCURRENT-NIGHT.md` | `d2c11404c07befd2e9d84fa893e8f35ee9a5c4c452c206dce09b5bd562bb27a8` | Runtime records, transitions, receipts, replay |
| `docs/THESIS-AND-ETHICS.md` | `4904093a09b62d54fd07e82d7f66f19c80de4dd820876548e9ef8d5f6e0f9828` | Interpretation and non-diagnostic boundaries |
| `docs/SAVE-FORMAT.md` | `45c92c094bc58dda65b94ce5dfc67b7f56a505b6d62ae794c54ec893a6730e0d` | Inspectable persistence and exact reconstruction; conflicts below require resolution |

General user standards `SRC-U-ATOM-PROV` and `SRC-U-REDTEAM` require complete
atomic provenance and the preserved chain:

`issue → constraint → design decision → implementation → failed test → correction → verification`

Normative precedence is: current direct instruction and general project
standards; CHORUS ethical, truth, disclosure, accessibility, privacy, and
determinism invariants; the pinned Catalysis corpus for eligible voice
behavior; accepted baseline behavior not superseded above. A stylistic
similarity never outranks a semantic invariant.

## Status vocabulary

| Status | Meaning |
|---|---|
| `Pending` | Required but not yet represented by implementation-bound evidence. |
| `Implemented; verification pending` | Corresponding source structure exists, but all adversarial gates have not passed. |
| `Failed` | A preserved counterexample violates the requirement. |
| `Corrected; verification pending` | A correction exists; all affected gates have not yet passed on one final binding. |
| `Verified` | Positive, negative, boundary, and applicable combination evidence pass on one identified source binding. |
| `Superseded` | A later stable atom replaces this atom; both remain in history. |

## Atomic requirements

The `Initial status` cells below preserve the first registration and red-team
state; version 1.1.0 does not rewrite them after correction. Requirements added
in version 1.1.0 say so explicitly, and the current correction ledger records
their implementation and focused verification separately.

### Provenance, ownership, and sequencing

| ID | Atomic requirement | Source / dependencies | Owner | Acceptance evidence | Negative and boundary attack | Initial status |
|---|---|---|---|---|---|---|
| `CHR-LING-PROV-001` | Bind the exact current instruction, Catalysis corpus, CHORUS baseline, and derived local interpretation. | Direct request; none | This register | Exact text/digests and precedence are present and independently reproducible. | Reject filename-only, memory-only, truncated, or invented `WV-*` authority. | **Implemented; verification pending** |
| `CHR-LING-PROV-002` | Give each linguistic obligation one stable independently testable ID. | Atomic standard; `PROV-001` | This register | Every row has one operative obligation, owner, evidence, adversarial test, and status. | Reject compound completion claims, blank owners, or line-number-only identities. | **Implemented; verification pending** |
| `CHR-LING-PROV-003` | Inventory every linguistic output channel, including nonvisual and persisted channels. | Atomic and red-team standards; `PROV-001` | Copy inventory and tests | Inventory covers generated fields, JSX, live regions, accessible names, saves, local slots, notebooks/links, receipts, and docs. | Omit hidden DOM, JSON, iframe publication, error, conditional, or autonomous-event copy. | **Failed**: portable state and pre-completion research links escaped the prior inventory gate. |
| `CHR-LING-PROV-004` | Preserve pre-correction counterexamples under their original source binding. | Red-team standard; `PROV-003` | `evidence/linguistics/` | Findings retain exact seed/path, expected/observed result, severity, source digest, and correction link. | Overwrite a failed artifact, refresh its hash onto new bytes, or record only the final pass. | **Pending** |
| `CHR-LING-SEQ-001` | Complete this register and first red-team finding set before corrections are credited. | Direct request; `PROV-001–004` | Evidence controller | Register and failed findings predate credited correction evidence. | Treat inherited implementation or passing legacy tests as proof of atomization. | **Pending** |

### Catalysis adaptation and copy classes

| ID | Atomic requirement | Source / dependencies | Owner | Acceptance evidence | Negative and boundary attack | Initial status |
|---|---|---|---|---|---|---|
| `CHR-LING-VOICE-001` | Classify each output atom as `catalysis`, `plain-concept`, `plain-utility`, or `technical-verbatim`. | Direct request; `PROV-003` | Copy inventory and render owners | Every atom has one class; class determines its voice and ambiguity budget. | Literary privacy/error/control copy; unreviewed boilerplate inside an experiential scene. | **Implemented; verification pending** through `CHR-COPY-SCOPE-001`. |
| `CHR-LING-VOICE-002` | Give each Catalysis-class atom one immediate semantic job. | Catalysis; `VOICE-001` | Generator and narrative builders | One atom advances artifact, pressure, question, relation, cost, or consequence without doing several at once. | One sentence explains history, motive, diagnosis, and instruction; one idea fragmented into decorative shards. | **Implemented; verification pending** |
| `CHR-LING-VOICE-003` | Let a local passage move from concrete pressure toward inquiry, structure, asymmetry, or cost only where space permits. | Catalysis; `VOICE-002` | Generator and narrative builders | Movement emerges across a scene cluster without forcing controls or labels into a miniature arc. | Mechanical sensation→question template; unrelated ornament; utility label made literary. | **Implemented; verification pending** |
| `CHR-LING-VOICE-004` | Use high-variance cadence only when the situation supports it. | Catalysis; `VOICE-002` | Narrative copy owners | Sentence and paragraph lengths vary; fragments retain recoverable subject, action, and consequence. | Uniform fragments, uniform polish, staccato used as a style badge, or screen-reader ambiguity. | **Implemented; verification pending** |
| `CHR-LING-VOICE-005` | Prefer genuine subtext to repeated inference. | Catalysis; `VOICE-002` | Artifact, scene, choice, receipt, and ending owners | A gesture, omission, artifact, or response carries the inference once; explicit explanation remains only for safety or semantic boundary. | Same motive or lesson repeated in artifact, seat copy, choice detail, receipt, and conclusion. | **Failed**: active choice details explicitly repeat protected interest and analytic motive. |
| `CHR-LING-VOICE-006` | Move the present incident before lineage or institutional context. | Catalysis; `VOICE-003` | Scenario generator | Artifact/action appears before bounded historical or institutional context enters through a present consequence. | Front-loaded history, abstract throat-clearing, or mini-essay before the choice. | **Implemented; verification pending** |
| `CHR-LING-VOICE-007` | Prevent eloquence, ambiguity, or metaphor from changing truth or causal scope. | CHORUS semantics; `VOICE-002` | All narrative owners | Observation, inference, unknown, selected action, route, background effect, and responsibility remain separately recoverable. | Beautiful prose makes ambient pressure sound like carried content or motive sound proven. | **Failed**: current live direct-layer crossing copy overclaims selected carriage. |
| `CHR-LING-VOICE-008` | Keep plain-concept copy familiar, bounded, and nonliterary. | Direct request; `VOICE-001` | `buildConceptReceipt`, renderer | It says what the term means here, what this night supports, and where the claim stops. | Jargon substitution, Catalysis ornament, encyclopedia history, or prose used as evidence predicate. | **Implemented; verification pending** through `CHR-COPY-CONCEPT-*`. |
| `CHR-LING-VOICE-009` | Keep utility, error, privacy, accessible-name, and live-announcement copy direct. | Accessibility and privacy; `VOICE-001` | UI and save owners | Copy names action, state, result, limit, and recovery without subtext. | Poetic error; ambiguous destructive action; live region repeats or leaks hidden analysis. | **Implemented; verification pending** |
| `CHR-LING-VOICE-010` | Preserve complete causal propositions when bounding length. | Catalysis and semantic integrity; `VOICE-002–007` | `app/debrief-copy.ts`, generated copy | Bounded prose omits optional detail by selection, never by mid-proposition ellipsis of protected party, benefit, harmed party, harm, or self-cost. | Long last-resort fields, long choice labels, narrow viewport, and screen-reader linearization. | **Failed**: last-resort summary truncates causal clauses into incomplete ellipses. |
| `CHR-LING-VOICE-011` | Derive choice voice from typed affordance records: stable safety, repair, and locked-ideal actions use `plain-utility`; the incident-responsive remainder uses `catalysis`. | Direct request and Catalysis; `VOICE-001`, `VOICE-005`, `VOICE-009`, `DISC-008` | `app/scenario-generator.ts::choiceCopyVoiceClass` | Across generated choices, availability plus ethics tags identify the repeated utility affordances, while all other choices remain incident-responsive Catalysis; label text is never a predicate. | Rename a stable label, duplicate its words on an incident-specific choice, remove one governing tag, or classify from prose rather than typed fields. | **Added in v1.1.0; verified automatically on implementation digest `09f21cfa…99021`; release hold retained.** |

### Situated repertoires and linguistic inference

| ID | Atomic requirement | Source / dependencies | Owner | Acceptance evidence | Negative and boundary attack | Initial status |
|---|---|---|---|---|---|---|
| `CHR-LING-REP-001` | Model each actor's repertoire as individually learned resources, not a group destiny. | ADR 0008; none | Generator | Every code has represented individual acquisition/use context; no demographic field auto-assigns it. | Same group always receives same code; protected identity changes an effect coefficient. | **Implemented; verification pending** |
| `CHR-LING-REP-002` | Select a scene register only from the actor's established repertoire. | ADR 0008; `REP-001` | Generator/runtime validation | Selected `codeId` belongs to repertoire for every scene and replay state. | Unknown code, injected code, empty repertoire, or switch to another actor's code. | **Implemented; verification pending** |
| `CHR-LING-REP-003` | Require a situated reason for every register selection or switch. | ADR 0008; `REP-002` | Generator | Audience, relationship, channel, power, stakes, or pressure supports the selection. | Random variety, plot convenience, or post-hoc instability label. | **Implemented; verification pending** |
| `CHR-LING-REP-004` | Preserve knowledge, goal, interior orientation, and semantic commitments across register change. | ADR 0008; `REP-003` | Generator/runtime/replay | Continuity anchors survive maintain, switch, and bridge cases. | Switch silently changes fact knowledge, moral orientation, or objective. | **Implemented; verification pending** |
| `CHR-LING-REP-005` | Never treat register switching as evidence of deceit, instability, or concealed identity. | ADR 0008 and ethics; `REP-004` | Generated and explanatory copy | Deliberate misrepresentation requires separate prior knowledge and record-departure evidence. | Copy calls a switch suspicious; status derives from code change alone. | **Implemented; verification pending** |
| `CHR-LING-REP-006` | Keep shared register independent from shared world model. | ADR 0008; `REP-001` | Generator and relationship/summary owners | Same-register/different-model cases remain reachable and separately evidenced. | Shared diction creates agreement, ideology, relationship, truth, or coordination. | **Implemented; verification pending** |
| `CHR-LING-REP-007` | Permit different registers to carry shared concrete commitments. | ADR 0008; `REP-001` | Generator and common-ground model | Different-code/shared-action cases remain reachable without forced coalition unity. | Surface vocabulary alone creates substantive conflict or erases residual disagreement. | **Implemented; verification pending** |
| `CHR-LING-REP-008` | Use readable discourse structure rather than accent imitation or caricature. | Ethics; `REP-001` | Code definitions and copy generator | No phonetic spelling, protected-class shorthand, unexplained abbreviation, or punctuation hostile to assistive technology. | Seed sweep across every code and worst-case concatenation. | **Implemented; verification pending** |
| `CHR-LING-REP-009` | Treat warmth, reserve, fluency, terseness, age, region, profession, or coalition vocabulary as presentation—not proof. | CHORUS ethics; `REP-001` | All copy and inference predicates | Truth, care, competence, motive, and coordination require their own evidence. | Warmth proves care/deceit; terseness proves contempt; register fit proves belief. | **Implemented; verification pending** |
| `CHR-LING-REP-010` | Reject incoherent linguistic candidates instead of exposing a character stability score. | ADR 0008; `REP-002–004` | Validator | Invalid continuity/selection candidates fail generation; no player-facing cohesion score exists. | Repair bad generation with a visible disclaimer or numeric stability badge. | **Implemented; verification pending** |

### Epistemic and active-play disclosure

| ID | Atomic requirement | Source / dependencies | Owner | Acceptance evidence | Negative and boundary attack | Initial status |
|---|---|---|---|---|---|---|
| `CHR-LING-DISC-001` | Keep observation, inference, and unknown in distinct typed and visible roles. | Communication Atlas; none | Generator and scene renderer | Each scene shows bounded records, questions, and unknowns without using one as another. | Inference in record; unknown treated as evidence; private motive in public artifact. | **Implemented; verification pending** |
| `CHR-LING-DISC-002` | Before turn 24, expose only the public surface cue and bounded scene-specific hints from the linguistic profile. | ADR 0008 and Interaction; `DISC-001` | Renderer, announcements, persistence, publications | Every channel remains within the allowed projection through turn 23. | Hidden DOM, ARIA, live region, save bytes, local slot, URL, iframe, or linked notebook exposes more. | **Failed**: save payload and research links bypass the visual gate. |
| `CHR-LING-DISC-003` | Before turn 24, withhold the complete repertoire and acquisition anchors. | Interaction; `DISC-002` | All output channels | No repertoire inventory or regional/socioeconomic context appears in active channels. | Seed 0, `0xffffffff`, imported save, unopened room, screen reader, source-linked notebook. | **Failed** through persisted full state/source-linked publications. |
| `CHR-LING-DISC-004` | Before turn 24, withhold internal code identifiers and switch rationale. | Interaction; `DISC-002` | All output channels | IDs/reasons remain model data; visible copy describes only the situated action needed now. | Save JSON, error detail, debug attribute, announcement, relationship label. | **Failed** through serialized `activeCodeId` and `codeTransition`. |
| `CHR-LING-DISC-005` | Before turn 24, withhold same-register/different-model classification, analytic motive, and cohesion judgments. | Interaction and ethics; `DISC-002` | Choice copy, saves, notes, relationships | Active copy gives concrete knowledge/action/pressure without lesson labels or analytic conclusions. | Choice detail names protected interest; blocked reason diagnoses; research notebook reveals taxonomy. | **Failed** |
| `CHR-LING-DISC-006` | Allow authored interior only as bounded fictional-seat knowledge, never as an inference about the player or real people. | Thesis and ethics; `DISC-001` | Scene, choice, conclusion owners | Copy names the fictional seat and model boundary; no player feeling, belief, diagnosis, or character judgment. | “You felt/learned/wanted”; selected action equals endorsement; real-person detection rule. | **Implemented; verification pending** |
| `CHR-LING-DISC-007` | Gate spoiler-bearing technical publications with the same conclusion boundary as the analysis they expose. | Interaction; `DISC-002` | Notes/privacy drawer | Pre-completion notes contain only operational guidance; analytic notebooks appear only after completion with a spoiler label. | Direct notes iframe, index default page, keyboard link, or screen-reader link before turn 24. | **Failed** |
| `CHR-LING-DISC-008` | Keep pre-completion choice copy situated and actionable without pre-solving its analytic classification. | Catalysis, Interaction; `VOICE-005`, `DISC-005` | Scenario generator and choice renderer | Label/detail state what the seat can do and omit, while consequence and subtext remain legible without analytic naming. | “This protects…”, “blame transfer”, “rumor carriage”, or repeated motive explanation in visible detail. | **Failed** |
| `CHR-LING-DISC-009` | Keep unavailable-action explanation bounded to immediate motive, pressure, capacity, and missing systems. | Interaction; `DISC-005` | Blocked receipt | Explanation enables agency without exposing full incentive intersection, language profile, or future result. | Whole analytic ledger, fixed diagnosis, or preferred conclusion disclosed. | **Implemented; verification pending** |
| `CHR-LING-DISC-010` | Treat completion as an in-product discovery gate, never as confidentiality or access control for static publications. | Interaction and privacy; `DISC-002`, `DISC-007` | Notes/privacy navigation and publication owners | Product links and embeds remain conclusion-gated; always-public static records contain no played state and state that a direct URL is public. | Claim a notebook is secret, store played state in it, expose a product link before completion, or call navigation gating authorization. | **Corrected; automated source verification passed; direct-URL public boundary accepted.** |

### Live cross-room language and causality

| ID | Atomic requirement | Source / dependencies | Owner | Acceptance evidence | Negative and boundary attack | Initial status |
|---|---|---|---|---|---|---|
| `CHR-LING-CROSS-001` | Keep endpoint identity vague until both source and target rooms have been entered. | Interaction; none | `visibleCrossingCopy` | All four entry combinations use attributable copy only for entered/entered. | Identity token in vague cue, accessible name, live announcement, or relationship label. | **Implemented; verification pending** |
| `CHR-LING-CROSS-002` | Describe selected content carriage only when `semantic=content` and `selectedCarriage=true`. | Runtime semantics; `CROSS-001` | Receipt calculator and `visibleCrossingCopy` | Copy names the selected action and content carrier only for an actual compatible selected route. | Direct link compatibility, applied background reach, or choice label alone reported as carriage. | **Failed** |
| `CHR-LING-CROSS-003` | Describe selected format carriage without implying factual-content carriage. | Runtime semantics; `CROSS-001` | Receipt calculator and `visibleCrossingCopy` | Format copy explicitly separates recognizable form from claim. | “The claim crossed” on a format route; format similarity treated as evidence. | **Failed** in live copy; implemented in final summary. |
| `CHR-LING-CROSS-004` | Describe ambient or background effects without implying that the same content, target, or selected action crossed. | Communication Atlas; `CROSS-001` | `visibleCrossingCopy` and summary | Copy names shared conditions/mechanism and explicitly denies unsupported carriage where needed. | Ambient pulse or incompatible/private choice attributed as selected crossing. | **Failed** |
| `CHR-LING-CROSS-005` | Distinguish autonomous pulses from player decisions in causal wording. | Concurrent Night; `CROSS-002–004` | `visibleCrossingCopy` and echo renderer | Ambient-event copy never says a selected move caused it; decision copy names a move only when supported. | `event.kind=ambient` with direct link; same label template for both kinds. | **Implemented; verification pending** |
| `CHR-LING-CROSS-006` | Keep applied, background, avoided, and selected-carriage reach distinct in both data and prose. | Runtime semantics; `CROSS-002–005` | Engine, live copy, summary | Every branch maps to the matching receipt fields; zero/boundary combinations are explicit. | `selectedCarriageReach=0`, background-only direct link, avoided-only link, mixed background+selected, and tampered receipt. | **Partially implemented; verification failed in live copy.** |

### Persistence and reconstruction

| ID | Atomic requirement | Source / dependencies | Owner | Acceptance evidence | Negative and boundary attack | Initial status |
|---|---|---|---|---|---|---|
| `CHR-LING-SAVE-001` | Persist only the minimum player-path projection needed to reconstruct the night. | Disclosure and save contracts; `DISC-002` | `app/save-model.ts` | Payload contains seed, bounded logical time, entered-room projection, and replay coordinates; reconstructed state is canonical. | Full `NightState`, generated prose, relational records, framework records, motives, or code rationale in bytes. | **Failed** |
| `CHR-LING-SAVE-002` | Keep pre-completion persisted bytes free of conclusion-gated linguistic and analytic tokens. | Disclosure; `SAVE-001` | Save model and tests | Token/structural scan over portable text and browser-slot value finds no protected field names or values for turns 0–23. | `activeCodeId`, `switchReason`, repertoire, motive, framework, diversion, misrepresentation, last-resort cost, choice label, or analytic IDs. | **Failed** |
| `CHR-LING-SAVE-003` | Reconstruct exact canonical state from the minimal projection rather than trusting imported derived state. | Save integrity; `SAVE-001` | Parser/replay | Import regenerates pack, replays each coordinate at its recorded start minute, advances final clock, restores entries, validates state, and returns rebuilt state. | Fabricated timing/index/entry, impossible choice, stale scene, generator mismatch, or recomputed checksum. | **Pending** |
| `CHR-LING-SAVE-004` | Treat integrity as corruption/replay consistency, not authentication or truth. | Save and privacy semantics; `SAVE-003` | Parser and UI copy | UI and docs state the limit; recomputed digest cannot bypass replay. | “Verified/authentic/trusted file” wording or source authorship inference. | **Implemented; verification pending** |
| `CHR-LING-SAVE-005` | Version the format fail-closed when the payload contract changes. | Save format; `SAVE-001` | Save schema/docs/tests | New schema/header/key are explicit; unsupported old versions reject or migrate only through a specified tested path. | Silently read complete-state v1 as minimal projection; overwrite same slot key with ambiguous bytes. | **Pending** |
| `CHR-LING-SAVE-006` | Keep preview and local-slot behavior independent from sealed prose. | Privacy and save contracts; `SAVE-001–005` | Save UI/model | Preview derives only seed/time/turn/entry/completion counts; deliberate read/write/clear behavior remains. | Preview includes choice or motive; inventory renders imported story; denied storage conflated with corruption. | **Implemented; correction verification pending** |
| `CHR-LING-SAVE-007` | Reject repeated decoded JSON object-member names before materialization and integrity checking. | Minimal persistence and exact-key semantics; `SAVE-001–005` | Raw JSON parser and save tests | A grammar-level scan rejects exact and escaped-equivalent duplicate keys at every object depth before `JSON.parse`. | Earlier prose-bearing `seed` or `payload` member is discarded by last-value parsing while the surviving object and digest remain valid. | **Corrected; automated regression passed.** |

### Conclusion and plain concepts

| ID | Atomic requirement | Source / dependencies | Owner | Acceptance evidence | Negative and boundary attack | Initial status |
|---|---|---|---|---|---|---|
| `CHR-LING-END-001` | Open the completed linguistic synthesis only after all 24 accepted decisions. | Interaction; `DISC-002` | `NightDebrief` and all channels | Turn 23 returns no debrief, concept, repertoire, motive, or technical-publication analysis; turn 24 opens the ordered region. | Hidden DOM, save bytes, notes link, live region, or stale `debriefOpen` bypass. | **Failed** outside the JSX debrief gate. |
| `CHR-LING-END-002` | Keep the ending natural and state-derived rather than a linguistic taxonomy. | Direct request and Catalysis; `VOICE-*`, `END-001` | `buildNaturalizedSummary` | Continuous paragraphs synthesize only supported selected actions, routes, and residue; no repertoire tab or mini-essay grid. | One card per code, glossary disguised as lyric fragments, generic ending across paths. | **Implemented; verification pending** through `CHR-COPY-END-*`. |
| `CHR-LING-END-003` | Keep plain encountered/experienced/played concepts separate from the narrative voice. | Direct request; `END-001` | `buildConceptReceipt` | Typed predicates and independent IDs determine status; plain evidence explains the model limit. | Offered equals played; prose/tags imply status; literary receipt; saturation promoted to played. | **Implemented; verification pending** through `CHR-COPY-CONCEPT-*`. |
| `CHR-LING-END-004` | Keep all narrated decision-bearing ending blocks globally chronological by accepted turn. | Catalysis and causal integrity; `VOICE-007`, `VOICE-010`, `END-002` | `app/debrief-copy.ts::NarrativeBlock`, `buildNaturalizedSummary` | Decision sources are nondecreasing by turn; each route remains between its earlier origin and later receiving decision; last-resort costs stay attached to their decision block rather than returning in an analeptic tail. | Reverse a route, sort by narrative salience instead of turn, append an earlier last resort after a later decision, duplicate a decision source, or repair order with “Earlier in the night.” | **Added in v1.1.0; verified automatically on implementation digest `09f21cfa…99021`; release hold retained.** |
| `CHR-LING-END-005` | Begin supported ending motion with the first narrated decision's public beat: visible artifact, beat-local public record, present pressure where it adds distinct information, and one public question or unknown before the accepted action and supported consequence. | Catalysis scene-first motion; `VOICE-002`, `VOICE-006`, `VOICE-007`, `DISC-001`, `DISC-005`, `END-002` | `app/debrief-copy.ts::sceneFirstOpening`, `buildNaturalizedSummary` | Every disclosure source resolves to the narrated scene's public `RecordAtom`; scenario-entry `knownFact` and `unresolvedAtEntry` are not substituted for a later beat; substantially repeated clauses are omitted; missing fields produce no invented source. | Lead with history or theory, pair a CORRECTION artifact with the entry-time unknown, import a private ledger, repeat the artifact as pressure, fabricate an inquiry, or place the decision before the scene. | **Corrected after the 1 September direct-user counterexample; focused automated verification passed, release hold retained.** |

### Red-team and release evidence

| ID | Atomic requirement | Source / dependencies | Owner | Acceptance evidence | Negative and boundary attack | Initial status |
|---|---|---|---|---|---|---|
| `CHR-LING-RT-001` | Preserve the first linguistic red-team matrix before correction. | Red-team standard; `PROV-004` | `evidence/linguistics/linguistics-red-team.pre.v1.json` | Every failure above has reproducible evidence and severity. | Only prose opinion, missing seeds, or deleted failed output. | **Pending** |
| `CHR-LING-RT-002` | Retest the entire first matrix after correction. | Direct request; `RT-001` | `evidence/linguistics/linguistics-red-team.post.v1.json` | Every first-pass case maps to fixed/open/superseded with authority; none is silently omitted. | Run only easier new tests or relabel removed surface as fixed without checking another channel. | **Pending** |
| `CHR-LING-RT-003` | Add Catalysis-specific attacks after rewrite. | Catalysis; `RT-002` | Editorial and test owners | Attack semantic camouflage, fake subtext, purple ambiguity, mechanical fragments, repeated inference, scene delay, and proposition truncation. | Pass on signature words, cadence statistics, or surface resemblance alone. | **Pending** |
| `CHR-LING-RT-004` | Test positive, negative, boundary, and combination cases across generation, runtime, persistence, rendering, and accessibility. | Red-team standard; `RT-002` | Test owners | Includes seeds `0` and `0xffffffff`, turns 0/23/24, all entry pairs, event kinds, route semantics, carriage states, 320px/200%/forced colors, and screen-reader order. | Unit-only claim, happy-path save, one seed, or source regex used as browser proof. | **Pending** |
| `CHR-LING-RT-005` | Hold completion/release claims while any critical or high linguistic, disclosure, causal, or accessibility failure remains open. | Red-team and release standards; `RT-001–004` | Evidence controller | Final status names source digest, passed gates, and explicit remaining manual limitations. | Inherited green tests override a new counterexample; historical browser evidence relabeled current. | **Pending** |

## Conflict and supersession ledger

| Conflict ID | Earlier requirement or implementation | New atom(s) | Resolution at registration |
|---|---|---|---|
| `CHR-LING-CONFLICT-SAVE-001` | Schema-1 saves store an inspectable complete `NightState`, including conclusion-gated linguistic and analytic fields. | `DISC-002–005`, `SAVE-001–005` | **Corrected; automated verification passed.** Schema 2 persists a numeric replay trace, while legacy schema 1 is validated and replayed before in-memory migration. Manual browser-slot inspection remains pending. |
| `CHR-LING-CONFLICT-CROSS-001` | Live copy treated every `layer=direct` receipt as a selected crossing. | `CROSS-002–006` | **Corrected; automated verification passed.** Typed `semantic`, `selectedCarriage`, event kind, and separated reach fields govern wording. Browser announcement review remains pending. |
| `CHR-LING-CONFLICT-CHOICE-001` | Several active choice details explicitly repeat the protected relationship and interest. | `VOICE-005`, `DISC-005`, `DISC-008` | **Corrected; automated verification passed.** Active details retain the concrete omission without repeating the analytic protected-interest explanation. Editorial browser review remains pending. |
| `CHR-LING-CONFLICT-NOTEBOOK-001` | Notes link and embed spoiler-bearing research publications before completion. | `DISC-002–007`, `END-001` | **Corrected; automated verification passed.** The operational House Guide remains available; analytic publications are conclusion-gated. Browser keyboard and screen-reader review remains pending. |
| `CHR-LING-CONFLICT-PUBLIC-001` | `DISC-002`/`DISC-007` could be read as promising that a direct static notebook URL is hidden until completion. | `DISC-010`, `RT-005` | **Superseded at the access-boundary level.** Completion gates product discovery, links, and embeds. Static technical publications are always public, contain no played state, and are not an access-control boundary. |
| `CHR-LING-CONFLICT-BOUND-001` | The former `shortFragment`/`boundedParagraph` design could truncate protected causal clauses into incomplete ellipses. | `VOICE-010` | **Corrected; automated verification passed.** `shortFragment` was retired; every selected last resort renders its complete protected party, benefit, harmed party, harm, and self-cost, and paragraph packing keeps the event together. Browser reflow and screen-reader review remain pending. |
| `CHR-LING-CONFLICT-WV-001` | The exact earlier reusable Catalysis atomic register is unavailable. | `PROV-001`, `VOICE-*` | **Resolved at authority level.** This register uses new `CHR-LING-*` atoms and does not claim recovered `WV-*` provenance. |

## Current correction ledger

This ledger supplements—and does not replace—the preserved initial statuses and
`linguistics-red-team.pre.v1.json`. A focused pass is evidence for the named
boundary only; it is not a release or browser/assistive-technology claim.

| Correction ID | Preserved issue | Governing atom | Design decision and implementation owner | Focused verification | Current status |
|---|---|---|---|---|---|
| `CHR-LING-CORR-CHOICE-001` | `LING-PRE-005` exposed analytic motive; `LING-PRE-011` found repeated choice language. | `VOICE-011` | Preserve repetition only for typed, learnable safety/repair/locked-ideal affordances; classify them in `app/scenario-generator.ts::choiceCopyVoiceClass`; keep the incident-responsive remainder in Catalysis voice. | `tests/linguistics-contract.test.mjs`: “stable safety and repair affordances stay plain while incident-responsive choices carry Catalysis.” | **Corrected; current binding verified automatically.** |
| `CHR-LING-CORR-END-ORDER-001` | `LING-PRE-008` exposed false event identity; `LING-PRE-011` exposed mechanical summary transitions and tail structure. | `END-004` | Build typed `NarrativeBlock`s, attach route and cost provenance to the represented decisions, then sort blocks by accepted turn in `buildNaturalizedSummary`. | `tests/copy-contract.test.mjs`: “summary decision and route provenance remains globally chronological across broad seeded paths.” | **Corrected; current binding verified automatically.** |
| `CHR-LING-CORR-END-SCENE-001` | `LING-PRE-011` and the Catalysis scene-delay attack showed that a causal summary could remain generic even when its claims were sourced. | `END-005` | `sceneFirstOpening` now admits the narrated beat's authored artifact, public `SceneDisclosure` records/questions/unknowns, and distinct visible pressure; it never reuses scenario-entry truth for a later beat. | `tests/copy-contract.test.mjs`: “scene-first inquiry uses only the narrated beat's public disclosure provenance,” including seed 74 CORRECTION and missing-disclosure boundaries. | **Corrected; current binding verified automatically.** |
| `CHR-LING-CORR-END-ATOM-002` | The first correction still exposed audit wrappers, hash-selected synonym families, false response causality, split route clauses, and repetitive last-resort mini-ledgers. | `VOICE-002–004`, `VOICE-007`, `VOICE-010`, `END-004–005` | `NarrativeAtom` carries clause-level source and chronological relation; route realization follows typed carriage; `NarrativeBlock` packing keeps route atoms and complete last-resort events together; residue uses plain metric-specific motion with typed no-change support. | `tests/copy-contract.test.mjs`: audit-scaffold rejection, situation-conditioned route/residue branches, 194-night bounds, atom/block integrity, grammar, seed 74, and split-cost completeness. | **Corrected; focused automated verification passed; live browser and assistive-technology review remain open.** |
| `CHR-LING-CORR-DEBRIEF-001` | The direct 1 September review counterexample showed that grammatical Catalysis prose could remain hard to understand when story and concept layers shared proof-register diction. | `VOICE-001–010`, `END-001–005`; `CHR-DEBRIEF-UND-001–014` | `buildNaturalizedSummary` now selects one governing route and names source, target, and movement; last-resort costs remain separate sourced sentences; the renderer explains status once and pairs canonical concepts with plain subtitles, exact evidence, and unique limits. | `tests/copy-contract.test.mjs` 34/34; 194-night bounds; pinned Lattice advisory before/after run; `debrief-understandability-red-team.post.v1.json`. | **Corrected on digest `09f21cfa…99021`; no automated or advisory understandability blocker remains; manual browser/AT review remains open.** |

## Planned evidence

| Artifact | Purpose | Preserved/current state |
|---|---|---|
| `evidence/linguistics/linguistics-red-team.pre.v1.json` | Source-bound first-pass failures and attack coverage | Captured; retained as failed pre-correction evidence |
| `evidence/linguistics/linguistics-red-team.post.v1.json` | Full retest plus Catalysis-specific attacks | Captured on the current implementation binding; no blocker or high-severity finding remains open |
| `evidence/linguistics/linguistics-verification.v1.json` | Final commands, counts, source digest, browser/manual scope, and limitations | Captured; validated automated pass with five held promotion gaps |
| `evidence/linguistics/linguistic-surface-inventory.v1.json` | Stable channel, phase, owner-symbol, proposition, and voice-class bindings | Implemented at v1.1.0; targeted schema/owner validation passed with 29 atoms, five channels, and four voice classes |
| `evidence/linguistics/debrief-understandability-red-team.pre.v1.json` and `.post.v1.json` | Preserve the direct counterexample, Lattice mapping, correction, final advisory result, and current automated boundary | Captured; freeform Lattice output is explicitly advisory rather than a conformance claim |
| `tests/linguistics-contract.test.mjs` | Repertoire, disclosure, live-crossing, persisted-byte, and voice-boundary contracts | Implemented and wired into `npm test` and both release gates; focused current-tree run passed 10/10 |
| `tests/copy-contract.test.mjs` | Catalysis motion, beat-local disclosure, global chronology, understandability, causal provenance, semantic-atom integrity, proposition, and concept contracts | Implemented; focused current-tree run passed 34/34 |
