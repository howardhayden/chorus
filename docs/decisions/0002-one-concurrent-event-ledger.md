# ADR 0002: One concurrent event ledger

- Status: Accepted
- Date: 2026-08-18

## Context

Independent stories would let a player isolate decisions from the shared
attention, trust, correction, and institutional conditions the simulation is
meant to represent.

## Decision

Treat a generated pack as one night with one logical clock and append-only event
ledger. Every accepted choice produces one local and five remote receipts.
Unentered and completed rooms continue to receive valid effects. Canonical
replay rewinds the whole night.

## Consequences

- Room switching is freely available but never pauses the ecology.
- A local choice always has inspectable externalities.
- Completion snapshots and live afterimages must be separate.
- Isolated room replay is structurally invalid.
- Save reconstruction must replay the ordered full-night ledger.

## Alternatives considered

- Independent room state was rejected because it erased concurrency.
- Visit-order background effects were rejected because navigation would change
  history.
- Global content crossover for every room pair was rejected because shared
  conditions do not prove shared claims.

See [Concurrent-night runtime](../CONCURRENT-NIGHT.md).

