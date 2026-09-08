# Discovery-map atomic requirements register

## Register state

| Field | Value |
|---|---|
| Register ID | `CHR-DOCMAP-REGISTER` |
| Version | `1.0.0` |
| Created | 8 September 2026 |
| Canonical data | [`docs/discovery/CHORUS-DISCOVERY-ATLAS.json`](../discovery/CHORUS-DISCOVERY-ATLAS.json) |
| Canonical publication contract | [Interactive discovery maps](../DISCOVERY-MAPS.md) |
| Governing decision | [ADR 0010](../decisions/0010-authoritative-read-only-discovery-maps.md) |
| Implementation status | Implemented in the standard-library builder |
| Verification status | Automated build and drift gates available; manual browser and assistive-technology evidence remains required |

## Source provenance

### `SRC-U-20260908-CHORUS-DOCMAPS`

**Authority:** direct user instruction; highest precedence for this change.
**SHA-256:** `09df403f8f1b2bc64b7faac3493a6aa719a3c8993a58276902e0559923d25323`

> For CHORUS, create concept map and CSD matrix (NN/g) interactive markdowns
> (interactive; exported) within documentation, maintaining the same styling
> as the other documentation.

### Governing inherited sources

| Source ID | Obligation |
|---|---|
| `SRC-CHORUS-DOCS` | Canonical concepts remain owned by the documents named in `docs/index.md`; generated views summarize and link rather than silently supersede. |
| `SRC-CHORUS-A11Y` | Graphs require equivalent text; interaction requires keyboard, focus, reflow, reduced-motion, forced-colors, and non-color semantics. |
| `SRC-CHORUS-PRIVACY` | Prefer local, static, self-contained publication; no analytics, hidden persistence, or unnecessary remote dependency. |
| `SRC-CHORUS-EVIDENCE` | A requirement, visual, or static inspection does not become end-to-end evidence; preserve source and claim boundaries. |
| `SRC-NNG-CSD` | Use Certainties, Suppositions, and Doubts to separate known information, testable hypotheses, and open questions; retain sources and paths for movement. |
| `SRC-U-AUTHORITATIVE-STATE` | Maintain one authoritative versioned state with provenance, dependencies, acceptance, adversarial checks, status, and supersession. |

## Precedence and conflicts

The direct request governs artifact type, interactivity, export, documentation
placement, and styling. Existing CHORUS accessibility, privacy, truth,
disclosure, and evidence boundaries govern how those artifacts may work. NN/g
governs the three CSD categories but does not authorize CHORUS to call a design
hypothesis certain.

The apparent conflict between “interactive” and deterministic static
documentation is resolved through progressive enhancement: complete Markdown
and HTML semantics exist first; read-only filtering, selection, expansion, and
export are additive. The apparent conflict between a collaborative CSD board
and authoritative evidence is resolved by prohibiting browser reclassification.
Changes occur only in the reviewed source register.

## Atomic requirements

| ID | Requirement | Source / precedence | Dependencies and owner | Acceptance and evidence | Negative and boundary checks | Status / supersession |
|---|---|---|---|---|---|---|
| `CHR-DOCMAP-AUTH-001` | Maintain one machine-readable authoritative register for both artifacts. | Direct request; authoritative-state standard / 1 | None · `docs/discovery/CHORUS-DISCOVERY-ATLAS.json` | Both Markdown and HTML editions are generated from the same validated source and identify it. | Hand-edited projection, duplicate source table, or browser-owned classification. | **Implemented; builder-enforced.** Supersedes none. |
| `CHR-DOCMAP-AUTH-002` | Give concepts, relations, CSD entries, topics, sources, and views unique stable IDs. | Authoritative-state standard / 1 | `AUTH-001` · source register | Duplicate, empty, or dangling IDs fail generation. | Line-number-only identity, ID reused for another meaning, missing dependency. | **Implemented; builder-enforced.** Supersedes none. |
| `CHR-DOCMAP-AUTH-003` | Preserve classification and supersession history. | Authoritative-state standard / 1 | `AUTH-001–002` · source register | Every CSD history ends at its current class; change requires date and basis. | Silent rewrite, deleted prior class, self-dependency, or unsupported movement. | **Implemented; builder-enforced.** Supersedes none. |
| `CHR-DOCMAP-MAP-001` | Map the governing core and five named domains: knowledge, concurrency, situated agency, consequence, and conclusion. | Direct request; CHORUS canonical docs / 1–2 | `AUTH-001–002` · documentation architecture | Every node has label, caption, definition, authority, sources, aliases, and perspective membership. | Missing domain, uncited node, decorative node without semantic role. | **Implemented; builder-enforced.** Supersedes none. |
| `CHR-DOCMAP-MAP-002` | Represent every relation as typed source–verb–target data. | CHORUS epistemic discipline / 2 | `MAP-001` · concept register | Relation table contains every stable edge and non-color type label. | Relation inferred only from proximity, hue, arrow shape, or prose similarity. | **Implemented; parity checked.** Supersedes none. |
| `CHR-DOCMAP-MAP-003` | Keep primary visual routes orthogonal, anchored, crossing-free, and outside unrelated nodes. | Existing diagram publication floor / 2 | `MAP-002` · HTML renderer | Geometry validation checks bounds, overlaps, endpoints, axes, crossings, and node incursions. | Diagonal, crossing, shared-overlap, off-canvas, or through-node route. | **Implemented; builder-enforced.** Supersedes none. |
| `CHR-DOCMAP-CSD-001` | Use NN/g's Certainties, Suppositions, and Doubts categories with attribution. | Direct request; `SRC-NNG-CSD` / 1, 3 | `AUTH-001` · CSD register | All topics contain every class; certainty and supposition sentence forms and doubt question form validate. | Substitute confidence score, merge hypothesis with fact, omit method source. | **Implemented; builder-enforced.** Supersedes none. |
| `CHR-DOCMAP-CSD-002` | Bound certainty to current cited repository facts or evidence state. | CHORUS evidence boundary / 2 | `CSD-001` · assurance owner | Each certainty begins “We know” or “We understand,” cites sources, names evidence and maintenance check, and avoids unsupported user outcome. | Treat design rationale, source test, or absence of failure as external validation. | **Implemented; content and schema checked.** Supersedes none. |
| `CHR-DOCMAP-CSD-003` | Make every supposition plausible and testable. | `SRC-NNG-CSD`; CHORUS evidence boundary / 2–3 | `CSD-001` · research owner | Each begins “We believe,” names basis, needed evidence, research method, owner, priority, and decision use. | Vague aspiration, unfalsifiable benefit, or hypothesis promoted by polish. | **Implemented; builder-enforced.** Supersedes none. |
| `CHR-DOCMAP-CSD-004` | Make every doubt an actionable open question. | `SRC-NNG-CSD`; CHORUS evidence boundary / 2–3 | `CSD-001` · research or assurance owner | Each ends as a question and names why open, research path, owner, priority, trigger, and decision use. | Rhetorical question, hidden known answer, or question with no decision consequence. | **Implemented; builder-enforced.** Supersedes none. |
| `CHR-DOCMAP-INT-001` | Make enhancement read-only and nonessential. | Direct request; accessibility and authoritative-state standards / 1–2 | All map/CSD semantics · HTML renderer | Complete content exists before scripting; controls only filter, select, expand, collapse, or export. | Script-only content, drag-to-reclassify, browser persistence, or filtered state presented as authority. | **Implemented; source patterns checked.** Supersedes none. |
| `CHR-DOCMAP-INT-002` | Support keyboard and labelled-control operation. | CHORUS accessibility / 2 | `INT-001` · HTML/CSS/JS renderer | Native labelled controls, visible focus, Space/Enter node selection, live result count, and 44-pixel floors are present. | Pointer-only path, hover-only detail, focus seizure, unlabeled filter. | **Implemented structurally; manual browser/AT verification open.** Supersedes none. |
| `CHR-DOCMAP-EXP-001` | Publish complete Markdown and JSON downloads plus filtered Markdown export. | Direct request / 1 | `AUTH-001`, `INT-001` · export renderer | Full exports are linked; filtered export names revision, filters, stable IDs, sources, and projection warning. | Remote export service, silent file write, missing scope warning, or export that changes classification. | **Implemented; browser file-arrival observation open.** Supersedes none. |
| `CHR-DOCMAP-A11Y-001` | Preserve complete semantic equivalence outside the visual map. | CHORUS accessibility / 2 | `MAP-002`, `INT-001` · Markdown/HTML renderers | Concept catalog and relation table match every node and edge; CSD native disclosures contain every entry and evidence field. | Missing root, omitted cross-domain edge, color-only class, or hidden no-script content. | **Implemented; builder parity checked.** Supersedes none. |
| `CHR-DOCMAP-A11Y-002` | Match the existing executed-document visual system without weakening reflow or alternate presentation. | Direct request; visual/accessibility docs / 1–2 | `A11Y-001` · CSS renderer | Existing palette and typography roles, contrast floor, named overflow, one-column CSD reflow, reduced-motion, forced-colors, and print rules are present. | New remote font, page-level side scroll, fixed desktop grid, invisible focus, unreadable print. | **Implemented structurally; manual visual and device review open.** Supersedes none. |
| `CHR-DOCMAP-PRIV-001` | Keep artifacts self-contained, telemetry-free, and storage-free. | CHORUS privacy and architecture / 2 | `INT-001`, `EXP-001` · builder and client script | No remote runtime asset, network API, analytics, browser storage, database, or unsafe `innerHTML`; export uses a local Blob. | `fetch`, remote module, web font, local/session storage, hidden search logging, or HTML injection. | **Implemented; builder pattern checks pass.** Supersedes none. |
| `CHR-DOCMAP-PUB-001` | Build deterministically and fail on drift. | CHORUS documentation/evidence floor / 2 | All requirements · `scripts/docs/build_discovery_maps.py` | Standard-library build writes ten coordinated artifacts; check mode compares exact bytes. | Timestamp-at-build nondeterminism, missing projection, or hand-edited public output. | **Implemented; `--check` is the evidence command.** Supersedes none. |
| `CHR-DOCMAP-PUB-002` | Publish an integrity manifest bound to the exact authoritative source. | Authoritative-state and evidence standards / 1–2 | `PUB-001` · builder | Source and public manifest copies match and name source SHA-256 plus every output's path, media type, bytes, and digest. | Self-asserted integrity without source digest, divergent manifests, or omitted output. | **Implemented; builder-enforced.** Supersedes none. |
| `CHR-DOCMAP-TRACE-001` | Integrate both views into documentation navigation, maintenance, and verification instructions. | Direct request; CHORUS documentation rules / 1–2 | `PUB-001` · docs owners | Documentation and README routes resolve; combined docs commands run both builders; maintenance identifies the source-first update path. | Orphan artifact, stale command, second canonical owner, or manual public edit. | **Implemented; combined documentation check owns verification.** Supersedes none. |

## Verification boundary

The builder checks source structure, content parity, geometry, contrast,
progressive-enhancement markers, prohibited runtime behavior, export controls,
manifest completeness, and byte drift. Those checks are strong evidence for
the publication contract. They are not evidence that the interaction has been
successfully used with VoiceOver, NVDA, touch, 400% reflow, forced colors, a
second browser engine, or an actual downloaded-file arrival.

Those observations remain open and must be bound to the exact candidate source
before an unqualified interaction or accessibility completion claim.
