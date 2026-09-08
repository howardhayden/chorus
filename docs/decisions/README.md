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
| [0004](0004-conclusion-gated-progressive-disclosure.md) | Gate analytic classification behind whole-night completion. | Accepted; former sectioned-conclusion consequence superseded by 0009 |
| [0005](0005-memory-first-player-controlled-saves.md) | Default to memory and require player-controlled persistence. | Accepted |
| [0006](0006-one-viewport-named-scroll-owners.md) | Use one viewport with named internal scroll owners. | Accepted |
| [0007](0007-separate-discernment-and-enactment.md) | Separate discernment from enactment and preserve a non-amplification floor. | Accepted |
| [0008](0008-situated-individual-linguistic-repertoires.md) | Model linguistic code as situated individual repertoire. | Accepted |
| [0009](0009-separate-experiential-ending-from-concept-receipt.md) | Separate the naturalized experiential ending from the plain concept receipt. | Accepted, implemented, automated verification passed; interactive promotion evidence open |
| [0010](0010-authoritative-read-only-discovery-maps.md) | Generate interactive concept and CSD views from one read-only authoritative register. | Accepted and implemented; deterministic publication checks present, manual interaction evidence open |

## Creating a record

Use the next four-digit number and include context, decision, consequences,
alternatives considered, and links. A later reversal creates a new record and
marks the earlier one superseded; do not rewrite history to make the old choice
appear inevitable.
