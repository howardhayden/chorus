# CHORUS debrief understandability register

## Authority and scope

| Field | Value |
|---|---|
| Register ID | `CHR-DEBRIEF-UNDERSTANDABILITY` |
| Version | `1.0.0` |
| Created | 1 September 2026 |
| Direct source | User-supplied completed-night review beginning “What the house kept moving.” |
| Lattice source | `howardhayden/lattice` at commit `d6cc85b275e3f14163a5a547f626832fd21b27b0` |
| Lattice profile | `profiles/relational-systems.profile.json`, SHA-256 `1868a428c0f3ffd55671cf8de5d1b549ffd309a920aaf01ff1db24e93536a996` |
| CHORUS base | `8cf429a523605fdf76def52e40e6d6a39c608585` |
| Surface | Completed-night narrative, model boundary, status key, and concept cards |

The direct counterexample has highest authority for this correction. Lattice
supplies a pinned register vocabulary for analyzing the prose; it does not
override CHORUS truth, causality, accessibility, disclosure, or provenance
contracts. Freeform Lattice lint is advisory. This change does not claim formal
Lattice conformance because the CHORUS debrief is not emitted as a complete set
of Lattice-typed candidates.

## First understandability assessment

The supplied review is grammatical, but it is not reliably understandable on
a first read. The problem is architectural rather than cosmetic: both the
played-night narrative and the “plain” concept receipt use evidence-register
prose. The reader must repeatedly reconstruct who acted, what moved, whether a
sentence describes an observed result or only a possible cost, and what labels
such as `PLAYED` mean.

| Finding | Counterexample | Reader burden | Severity |
|---|---|---|---|
| Unstable referents | “The message reached…”; “borrowed blame shifted there anyway” | Resolve the source, target, object, and causal relation from prior paragraphs. | High |
| Abstract noun stacks | “trusted forms,” “unresolved frame,” “recognizable form,” “protected handoff” | Translate internal model categories before understanding the event. | High |
| Mixed actuality | A selected last resort is followed by benefits, harms, and risks without a stable grammatical boundary. | Decide which outcomes occurred, which are modeled consequences, and which remain possible. | High |
| Weak chronology | “Later” recurs while source and receiving actions are packed into long paragraphs. | Rebuild the event order and avoid reading adjacency as causation. | High |
| Proof-register repetition | Every concept repeats “Evidence here would require…” and “This records the selected action only…” | Memorize a repeated audit template instead of learning what happened in this night. | High |
| Opaque status labels | `PLAYED`, `EXPERIENCED`, and `ENCOUNTERED` depend on a dense introductory legend. | Hold a local taxonomy in memory while reading each card. | Medium |
| Specialist headings without a bridge | “Market Value,” “Trust Capital,” and “Status Capital” appear without a glanceable paraphrase. | Decode a concept name before reading the definition and evidence. | Medium |
| No night-level selection | Several route transitions and every cost compete for equal narrative weight. | Find the governing change inside a complete audit trail. | Medium |

## Atomic requirements

| ID | Requirement | Lattice basis | Implementation owner | Acceptance and adversarial boundary | Status |
|---|---|---|---|---|---|
| `CHR-DEBRIEF-UND-001` | Keep three registers distinct: experiential played-night prose, interpretive concept prose, and operative model/status guidance. | `RSR-CORE-002`, `RSR-FLOW-006` | `NightDebrief`, `buildNaturalizedSummary`, `buildConceptReceipt` | Each region has its own heading and semantic container; concept or model language cannot leak into the story. | Implemented; automated verification passed |
| `CHR-DEBRIEF-UND-002` | Begin with no more than three sourced scene atoms: the artifact, one public disclosure, and distinct present pressure. | `RSR-EXP-002`, `RSR-SCN-001` | `sceneFirstOpening`, `selectOpeningAtoms` | The first choice follows within 72 words; private ledgers, entry-time substitutions, and redundant scene explanations fail. | Implemented; automated verification passed |
| `CHR-DEBRIEF-UND-003` | Follow one governing cross-room route, not a stacked chain of equally weighted routes. | `RSR-DEP-004`, `RSR-SCN-003–004` | `narrativeChain` | One supported route names its source action and later target-room action; all selected last resorts remain independently present. | Implemented; automated verification passed |
| `CHR-DEBRIEF-UND-004` | Name the source room, target room, and what did or did not travel in every route sentence. | `RSR-LEX-003`, `RSR-TEC-001` | `routeNarration` | Reject “the message,” “it,” “there,” mechanism IDs, or an unlabeled change when more than one antecedent is possible. | Implemented; automated verification passed |
| `CHR-DEBRIEF-UND-005` | Keep actual selected actions, recorded effects, authored consequences, affected parties, and stated risks grammatically separate. | `RSR-FLOW-004–005`, `RSR-ETH-001`, `RSR-ETH-004–005`, `RSR-TEC-003` | `decisionSentence`, `lastResortCostAtoms`, concept evidence builders | Each selected last resort names the actor and exact choice, then preserves benefit, protected party, cost bearer, harm, and self-cost in order. | Implemented; automated verification passed |
| `CHR-DEBRIEF-UND-006` | Explain status once with direct labels: `Selected action`, `Recorded effect`, and `Seen in scene`. | `RSR-CORE-001`, `RSR-SUB-002` | `CONCEPT_STATUS_COPY`, debrief status key | A reader need not memorize the canonical status vocabulary; the typed status remains available in `data-status`. | Implemented; automated verification passed |
| `CHR-DEBRIEF-UND-007` | Give each canonical concept a glanceable plain subtitle. | `RSR-LEX-001–002` | `CONCEPT_GLOSSES`, concept renderer | Every subtitle is nonempty and no more than six words; the canonical term remains visible for precision. | Implemented; automated verification passed |
| `CHR-DEBRIEF-UND-008` | Shape each concept card as meaning, exact reason for appearance, and one unique boundary. | `RSR-CORE-001`, `RSR-SUB-002`, `RSR-TEC-003` | `buildConceptReceipt`, evidence-copy functions | Reject repeated proof boilerplate, opaque evidence counts, prose-derived status, and identical limits across cards. | Implemented; automated verification passed |
| `CHR-DEBRIEF-UND-009` | Distinguish an action's design from a realized downstream effect. | `RSR-TEC-001`, `RSR-TEC-003` | `playedEvidenceCopy`, `experiencedEvidenceCopy` | Played evidence says what the action was designed to do; experienced evidence cites an actual matching receipt. Neither invents the other. | Implemented; automated verification passed |
| `CHR-DEBRIEF-UND-010` | Bound sentence and paragraph load without truncating causal propositions. | `RSR-CORE-001`, `RSR-EXC-003–004` | narrative atom packing and copy contracts | Story sentences stay within 38 words, concept-evidence sentences within 32, plain definitions within 22, and every required cost remains intact. | Implemented; automated verification passed |
| `CHR-DEBRIEF-UND-011` | Use concrete operational verbs and reject internal abstraction stacks. | `RSR-LEX-003`, `RSR-DEP-005` | generator and debrief copy | Seed sweeps reject internal mechanism/metric names and named opaque clusters such as “recognizable form,” “unresolved frame,” and “protected handoff.” | Implemented; automated verification passed |
| `CHR-DEBRIEF-UND-012` | Preserve accessible reading order and reflow for story, boundary, key, and cards. | CHORUS accessibility contract | `NightDebrief`, `app/globals.css` | Semantic regions remain in DOM order; status key and cards collapse to one column; forced-colors borders remain visible. | Implemented; source-contract verification passed; manual AT review open |
| `CHR-DEBRIEF-UND-013` | Treat Lattice output as advisory unless typed candidates and dependencies are supplied. | Lattice contract boundary | documentation and evidence | Reject a claim of “Lattice compliant” based only on freeform lint or hand-selected passing atoms. | Implemented |
| `CHR-DEBRIEF-UND-014` | Preserve the counterexample, correction, and broad-seed retest as distinct evidence. | CHORUS red-team standard | `tests/copy-contract.test.mjs`, `evidence/linguistics/` | Focused tests cover at least 194 completed nights, route branches, repeated last resorts, malformed state, and status provenance before a pass is claimed. | Implemented; automated verification passed |

## Lattice mapping used for the correction

| Lattice atom | Applied CHORUS decision |
|---|---|
| `RSR-CORE-001` | Remove the repeated evidence preamble and repeated selected-action disclaimer. |
| `RSR-CORE-002` | Keep story, concept, and operative guidance in different registers. |
| `RSR-FLOW-004–006` | Preserve asymmetry and cost, return to action/consequence, and keep concepts outside the story. |
| `RSR-SUB-002` | State each epistemic boundary once unless a later card adds a different limit. |
| `RSR-EXP-002–005` | Lead with records and actions; omit system detail that does not change the current reading. |
| `RSR-DEP-001–005` | Preserve layered causes while selecting one clear route through them. |
| `RSR-LEX-001–003` | Pair specialist terms with plain subtitles and use verbs that name what moved. |
| `RSR-ETH-001`, `RSR-ETH-004–005` | Keep protected parties, cost bearers, and competing consequences visible. |
| `RSR-TEC-001`, `RSR-TEC-003` | Keep source, record, selected design, recorded effect, and truth claim distinct. |
| `RSR-SCN-001–004` | Open on the governing scene change and stop after the supported resolution/residue. |
| `RSR-EXC-003–004` | Reject mechanical fragments, compressed jargon, and obscurity presented as depth. |

## Verification boundary

Passing source and generated-copy contracts supports understandability of the
implemented language system; it is not proof that every reader will understand
every generated night. Current-source browser, screen-reader, text-zoom, and
manual editorial review remain separate promotion evidence.
