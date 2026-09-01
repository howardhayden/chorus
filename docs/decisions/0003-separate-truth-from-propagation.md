# ADR 0003: Separate truth from propagation

- Status: Accepted
- Date: 2026-08-18

## Context

Persuasive reach, social fit, trusted repetition, warmth, and defensive motive
can coexist with true, false, partial, or unresolved content. Converting any of
those conditions into a truth coefficient would teach the wrong inference.

## Decision

Keep immutable incident truth, propagation, beat-local disclosure, observed
conduct, audience inference, motive, and analytic unknowns in separate records.
A `TruthLedger` contains exactly `knownFact`, `unresolvedAtEntry`, and
`laterResolution`. A separate `PropagationLedger` contains only
`circulatingFrame`. Neither enters metric projection.

Each playable beat receives a typed `SceneDisclosure` of records, questions,
and unknowns instead of attaching the shared analytic communication ledger to
the scene. The communication ledger may retain incident-bound analytic fact
bindings for validation; they do not expand the truth ledger or become one
repeated playable record.

## Consequences

- Player action changes distribution and interpretation conditions, not fact.
- Repetition changes the reach of a circulating frame, not its status as truth.
- Surface, Bridge, Crossover, and Correction can reveal different bounded
  public records without duplicating one ledger across all four beats.
- A defensive motive does not prove falsity.
- A bounded true detail does not validate a trait claim.
- Corrections can improve trace while failing to recover every audience.
- Final receipts can compare event and interpretation without retroactively
  rewriting either.

## Alternatives considered

- A unified credibility score was rejected because it collapses distinct
  evidentiary questions.
- Truth-adjusted reach was rejected because circulation does not become factual
  merely through model coefficients.

See [Thesis and ethical argument](../THESIS-AND-ETHICS.md) and the
[Communication and fatigue atlas](../COMMUNICATION-ATLAS.md).
