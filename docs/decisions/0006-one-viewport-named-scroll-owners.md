# ADR 0006: One viewport with named scroll owners

- Status: Accepted
- Date: 2026-08-18

## Context

The simultaneous house needs persistent room switching, but earlier dense
full-page layouts caused mobile overflow, overlapping text, inaccessible panes,
and ambiguous scroll ownership.

## Decision

Keep the document fixed to one dynamic viewport. Give the stage, explicit
panes, and drawers named internal scroll regions. Reflow the room rail into a
two-by-three mobile switcher and move secondary signals into a drawer.

## Consequences

- Content must use `min-width: 0` and `min-height: 0` correctly inside grids.
- Long text wraps and scrolls in its owner rather than escaping the page.
- Drawers require modal focus and independent scroll containment.
- Short landscape layouts reduce ornament before removing function.
- Relationship exploration must fit width and retain a text alternative.

## Alternatives considered

- Stacked full-screen sections were rejected because they duplicate navigation
  and lose concurrent context.
- A desktop canvas scaled down on mobile was rejected because text and actions
  become inaccessible.
- Nested unlabelled scroll regions were rejected because focus and reading
  position become ambiguous.

See [Interaction and progressive disclosure](../INTERACTION-DISCLOSURE.md) and
[Accessibility](../ACCESSIBILITY.md).

