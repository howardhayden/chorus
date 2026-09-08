# Interactive discovery maps

## Purpose and ownership

CHORUS publishes two coordinated discovery views:

- the [concept map](CONCEPT-MAP.md), which exposes the typed relationships
  among knowledge, concurrency, situated agency, consequence, and conclusion;
  and
- the [CSD matrix](CSD-MATRIX.md), which keeps current repository evidence,
  plausible experience outcomes, and unresolved questions visibly separate.

The authoritative state is
[`docs/discovery/CHORUS-DISCOVERY-ATLAS.json`](discovery/CHORUS-DISCOVERY-ATLAS.json).
The Markdown documents and self-contained HTML editions are deterministic
projections. They must not be edited as independent sources.

This document owns the publication, interaction, accessibility, export, and
maintenance contract. Canonical product behavior remains with the documents
named by the [documentation index](index.md).

## Artifact set

| Artifact | Role | Authority |
|---|---|---|
| `docs/discovery/CHORUS-DISCOVERY-ATLAS.json` | Stable concepts, typed relations, CSD classifications, provenance, dependencies, ownership, research paths, and history | Authoritative source |
| `docs/CONCEPT-MAP.md` | Repository-readable map, Mermaid overview, complete concept definitions, and relationship table | Generated semantic projection |
| `docs/CSD-MATRIX.md` | Repository-readable NN/g matrix and complete atomic discovery register | Generated semantic projection |
| `public/documentation/chorus-concept-map.html` | Searchable and perspective-filterable map with selected-node relations and Markdown export | Generated interactive projection |
| `public/documentation/chorus-csd-matrix.html` | Searchable matrix with topic, priority, and classification filters; bulk disclosure; and Markdown export | Generated interactive projection |
| `public/documentation/*.md` | Downloadable complete Markdown editions | Generated export copies |
| `docs/discovery/artifact-manifest.json` and public copy | Paths, sizes, SHA-256 digests, source digest, build identity, and mutability boundary | Generated integrity record |

The [published map index](../public/documentation/index.html) keeps both views,
their complete Markdown downloads, the machine-readable register, and the
integrity manifest together.

## Authoritative-state boundary

The register uses stable `CHR-MAP-*` and `CHR-CSD-*` identifiers. A rendered
filter, selection, expanded card, URL fragment, or downloaded view changes no
classification and writes no evidence. Authoritative change requires:

1. editing the JSON register;
2. retaining the stable identifier;
3. adding a dated history entry when a CSD classification changes;
4. attaching the source or evidence that permits the change;
5. recording dependencies, review trigger, decision use, and supersession;
6. rebuilding all projections; and
7. passing the drift check.

A removed assertion is superseded or retired explicitly. It is not silently
rewritten out of the historical record.

## Concept-map contract

The map has one governing core and five named domains. Every node declares:

- stable identity;
- label and short caption;
- definition;
- canonical authority;
- source references;
- search aliases;
- perspective membership; and
- fixed, non-overlapping geometry for the HTML edition.

Every relation declares source, target, type, and a verb phrase. The primary
visual routes are orthogonal, boundary-anchored, crossing-free, and prevented
from traversing unrelated nodes. Cross-domain relationships that would make
the visual unreadable remain explicit in the relationship table and
selected-node detail instead of being drawn through another concept.

The SVG does not create meaning through proximity, direction, color, or line
style alone. The complete text catalog and relationship table are the
canonical accessible equivalent.

## CSD classification contract

The matrix follows the Certainties, Suppositions, and Doubts framework
described by [Nielsen Norman Group](https://www.nngroup.com/articles/csd-matrix/).
NN/g credits the technique to Tennyson Pinheiro, Luis Alt, and the Livework São
Paulo team.

CHORUS narrows each category to prevent evidence inflation:

| Classification | CHORUS meaning | Required support |
|---|---|---|
| Certainty | A current repository fact, implemented boundary, or accurately bounded evidence state | Cited current specification, implementation, executable evidence, or explicit absence-of-evidence boundary |
| Supposition | A plausible, testable experience or adoption outcome | Design or early-evidence basis plus a testable research path and decision use |
| Doubt | An unresolved question capable of changing design, claims, release, or context of use | Question form, reason it remains open, research path, owner, and review trigger |

“Certainty” never means that CHORUS predicts real people, proves learning
transfer, establishes universal accessibility, or guarantees future release
state. A passing source test can establish an implementation contract; it
cannot establish a participant outcome.

The goal is not to maximize the certainty column by relabeling. It is to make
the present evidence state and the work required to change it inspectable.

## Interaction contract

Both HTML editions are ordinary long-form documents before enhancement. Their
complete content remains readable when JavaScript is absent or fails.

Enhancement may provide:

- search;
- bounded perspective, topic, priority, or classification filters;
- selected-node emphasis and typed relation detail;
- bulk expansion and collapse of visible CSD entries;
- URL fragments for concept references; and
- a Markdown download of the current visible view.

Enhancement may not:

- edit or persist authoritative state;
- drag an item into another epistemic class;
- hide the only text equivalent;
- infer a relation from visual proximity;
- turn search or dwell behavior into analytics;
- fetch a remote dependency; or
- describe a filtered download as the complete register.

## Export contract

Each HTML edition links to its complete generated Markdown and the complete
JSON register. The interactive download control creates a local Markdown file
from the current visible filter state. Every filtered export names:

- register revision;
- active filters;
- visible stable identifiers;
- definitions or statements;
- typed relationships or evidence state;
- source locations; and
- the warning that the file is a read-only projection.

Export uses an in-browser `Blob`. It makes no network request and writes no
browser storage. The player chooses whether and where the browser saves the
file.

## Visual and accessibility contract

The HTML editions reuse the executed-document visual system: near-black green
paper, green-black panels, cream text, gold trace labels, mint links, silver
secondary text, serif reading type, monospaced identifiers, restrained
asymmetrical radii, and the same focus color. Styling is embedded so the
edition remains self-contained.

Both editions provide:

- one `h1`, stable heading order, landmarks, and a skip link;
- visible labels for every control;
- native buttons, inputs, selects, checkboxes, links, tables, and disclosures;
- 44-pixel control floors;
- visible keyboard focus;
- polite result counts;
- non-color classification and relationship labels;
- a named horizontal scroll owner around the wide visual or table rather than
  document-level side scroll;
- responsive one-column CSD reflow;
- reduced-motion, forced-colors, and print treatment; and
- complete semantic content without enhancement.

Filtering hides matching visual and text entries together. It never deletes
them from the document source. The concept map remains supplementary; the text
register is the authority when visual and textual interpretation differ.

Manual keyboard, screen-reader, touch, zoom, and browser checks are still
required for release evidence. Static generation checks do not constitute a
full accessibility claim.

## Privacy and security

The editions contain no remote font, image, media, module, or script. They do
not call `fetch`, use browser databases or storage, collect analytics, or send
filter and search values elsewhere. Source citations are ordinary outbound
links; reading and filtering the embedded artifact does not require them.

All register text is escaped before insertion into HTML. Dynamic selected-node
content is created with text nodes and safe link properties rather than
`innerHTML`. The build rejects prohibited network, storage, and unsafe dynamic
rendering patterns.

## Build and verification

```sh
python3 scripts/docs/build_discovery_maps.py
python3 scripts/docs/build_discovery_maps.py --check
```

The builder uses the Python standard library only. It validates:

- source format and schema version;
- unique stable IDs and resolvable references;
- local source existence;
- node bounds and overlap;
- edge endpoints, orthogonal routes, unrelated-node incursions, crossings, and
  overlaps;
- complete concept source and perspective data;
- CSD sentence forms, evidence fields, research paths, owners, priorities,
  dependencies, and classification history;
- all three CSD classifications in every topic;
- node, edge, and CSD parity across Markdown and HTML;
- static semantic and progressive-enhancement controls;
- contrast floors and reduced-motion, forced-colors, reflow, and print rules;
- absence of remote runtime assets, network calls, browser storage, and unsafe
  dynamic HTML insertion;
- byte-stable public register publication; and
- deterministic output drift and manifest parity.

`npm run docs:build` and `npm run docs:check` run this publication beside the
executed-notebook publication. A failed discovery-map check fails the combined
documentation gate.

## Maintenance boundary

The map summarizes canonical owners; it does not become a second behavioral
specification. When a product contract changes, update that owner first, then
review every mapped node, relation, certainty, supposition, doubt, dependency,
and source that cites it.

The concept map should remain selective enough to expose relationships. The
CSD matrix should remain selective enough to guide a decision or research
action. Completeness means no material claim is misclassified or hidden, not
that every code symbol becomes a card.

Atomic publication requirements are in the
[discovery-map requirements register](requirements/DISCOVERY-MAPS-REGISTER.md),
and the durable read-only publication decision is recorded in
[ADR 0010](decisions/0010-authoritative-read-only-discovery-maps.md).
