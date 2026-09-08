# 0010: Generate read-only discovery maps from one authoritative register

## Status

**Accepted and implemented; deterministic source validation and drift checks
are present. Manual browser and assistive-technology evidence remains open.**

## Context

CHORUS needs an interactive concept map and an NN/g CSD matrix inside its
documentation. The artifacts must also be exported as Markdown and retain the
visual language of the existing executed documents.

Two tensions are material:

1. A visual, interactive map can hide relationships from nonvisual readers or
   make JavaScript the only semantic source.
2. A collaborative CSD board often permits easy movement among Certainties,
   Suppositions, and Doubts, while CHORUS requires evidence-backed
   authoritative state and preserved classification history.

Maintaining hand-authored Markdown, hand-authored HTML, and a separate matrix
would also create three places where a claim could drift or be promoted
without its evidence.

## Decision

CHORUS maintains one versioned JSON discovery register. A standard-library
builder validates it and generates:

- canonical repository Markdown for the concept map and CSD matrix;
- downloadable Markdown copies;
- self-contained styled HTML editions;
- a documentation-map index;
- a byte-identical public register copy; and
- matching source/public integrity manifests.

HTML interaction is progressive and read-only. Search, filters, selected-node
emphasis, native disclosure, and Markdown export change only the rendered
view. They do not write storage, make a network request, drag an item into a
new class, or revise the canonical register.

The concept map draws only crossing-free primary routes. Every node and every
primary or cross-domain relationship remains present in a complete text
equivalent. The CSD matrix uses NN/g's three categories, but “certainty” is
explicitly bounded to current cited repository facts or evidence state; user
outcomes and external validity remain suppositions or doubts until researched.

## Consequences

- Markdown, HTML, interactive filters, and exports cannot silently diverge in
  content.
- Stable IDs and dated CSD history make epistemic movement inspectable.
- The artifacts remain meaningful without JavaScript, CSS, color, or the SVG.
- Filtered downloads are useful working views but are visibly nonauthoritative.
- Adding a concept or discovery item requires source, owner, review trigger,
  and evidence or research path.
- The builder and generated artifacts enlarge documentation maintenance, but
  drift becomes a failing gate rather than an editorial convention.
- Static validation does not close live browser, assistive-technology, touch,
  zoom, or file-arrival evidence.

## Alternatives considered

### Hand-author two Markdown files only

Rejected. Native disclosures would provide limited interaction, but filtering,
selected relationships, downloadable working views, and enforced parity would
remain absent.

### Make the HTML editions authoritative

Rejected. Presentation markup and client state are poor evidence owners and
would make nonvisual and repository inspection secondary.

### Permit drag-and-drop CSD reclassification

Rejected. Moving a polished card would change apparent evidence state without
requiring a source, dated history, or review. A later collaborative authoring
tool may prepare a proposed change, but it cannot commit authority implicitly.

### Use a remote graph or board dependency

Rejected. It would weaken offline publication, privacy, determinism, supply
chain scope, and styling control for a function the local artifact can provide.

## Links

- [Interactive discovery maps](../DISCOVERY-MAPS.md)
- [Discovery-map atomic requirements](../requirements/DISCOVERY-MAPS-REGISTER.md)
- [Concept map](../CONCEPT-MAP.md)
- [CSD matrix](../CSD-MATRIX.md)
- [Accessibility](../ACCESSIBILITY.md)
- [Testing and traceability](../TESTING-TRACEABILITY.md)
