# Architecture decisions

Architecture decision records preserve the reasons behind durable constraints.
They are intentionally short. The linked canonical specifications own current
behavior.

## Status vocabulary

- **Accepted:** current governing decision.
- **Superseded:** replaced by a later numbered record.
- **Deprecated:** retained for history but scheduled for removal.

## Index

| ADR | Decision | Status |
|---|---|---|
| [0001](0001-deterministic-local-generation.md) | Use deterministic local constrained generation. | Accepted |
| [0002](0002-one-concurrent-event-ledger.md) | Treat six rooms as one concurrent event ledger. | Accepted |
| [0003](0003-separate-truth-from-propagation.md) | Keep truth separate from propagation and interpretation. | Accepted |
| [0004](0004-conclusion-gated-progressive-disclosure.md) | Gate analytic classification behind whole-night completion. | Accepted |
| [0005](0005-memory-first-player-controlled-saves.md) | Default to memory and require player-controlled persistence. | Accepted |
| [0006](0006-one-viewport-named-scroll-owners.md) | Use one viewport with named internal scroll owners. | Accepted |
| [0007](0007-separate-discernment-and-enactment.md) | Separate discernment from enactment and preserve a non-amplification floor. | Accepted |
| [0008](0008-situated-individual-linguistic-repertoires.md) | Model linguistic code as situated individual repertoire. | Accepted |

## Creating a record

Use the next four-digit number and include context, decision, consequences,
alternatives considered, and links. A later reversal creates a new record and
marks the earlier one superseded; do not rewrite history to make the old choice
appear inevitable.

