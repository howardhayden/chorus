# ADR 0001: Deterministic local constrained generation

- Status: Accepted
- Date: 2026-08-18

## Context

CHORUS needs open-ended nights without a fixed campaign, but every scenario must
remain inspectable, PG-safe, causally bound, replayable, and valid across
communication, repair, linguistic, fatigue, and propagation systems.

## Decision

Generate each candidate locally from authored constrained grammars and a 32-bit
seed. Validate the complete six-room pack before it can replace the current
night. A seed and ordered choice history must reproduce the same state.

## Consequences

- Authored components and rules remain reviewable.
- New nights have no numbered exhaustion point.
- Invalid combinations fail closed before play.
- Save compatibility depends on generator version as well as envelope schema.
- Tests can reproduce a failure from seed and choice identities.

## Alternatives considered

- A fixed story list was rejected because it would cap the system and weaken
  cross-system variation.
- Unconstrained runtime text generation was rejected because coherence,
  replay, content safety, and causal trace could not be guaranteed.
- Remote scenario delivery was rejected because it would weaken local privacy,
  portability, and reproducibility.

See [Generation and coherence](../GENERATION-COHERENCE.md).

