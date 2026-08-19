# CHORUS

CHORUS is a fictional, PG-safe social-trust simulation about how ambiguous
artifacts acquire social meaning. One generated night contains six concurrent
incidents on one logical clock. The player may move between rooms at will, but
no room pauses: each accepted choice changes its source room and produces a
bounded consequence in every other room.

The simulation is generated in the browser from a deterministic, constrained
grammar. A seed and an ordered choice history reproduce the same night. The
scenario model, event reducer, validation gates, saves, and interpretation
receipts all run locally. No account, remote content service, telemetry, or
network write is required to play.

## What the simulation preserves

- Ground truth is fixed and never changes to reward a choice.
- Observation, audience inference, motive, and unresolved questions remain
  separate records.
- Discernment and follow-through are different capacities; modeled platform
  fatigue may obstruct enactment without lowering recognition of better
  judgment.
- Every beat retains a non-amplifying action, even when complete repair is not
  presently reachable.
- Linguistic registers are situated resources in an individual fictional
  repertoire, not identity templates or evidence of belief.
- Direct content crossings require a compatible carrier. Other cross-room
  consequences describe shared conditions rather than a shared claim.
- Interpretive labels remain sealed until the complete night is finished.

## Run locally

Requirements for local play: Node.js 22.13 or newer and npm. Full verification
and notebook rebuilding additionally require Python 3.10 or newer; the notebook
builder uses only the standard library.

```sh
npm ci
npm run dev
```

The development server prints its local address. The application defaults to a
memory-only session. Browser save slots and portable text are used only after a
player deliberately selects them.

## Verify

```sh
npm run lint
npm run test:night
npm run test:simulation
npm run test:save
npm run test:a11y
npm run test:viewport
npm run docs:check
npm run verify:release
```

`npm run verify:release` adds lint, type checking, the committed 4,096-seed
simulation-evidence drift check, and `npm test`. The latter runs documentation,
night, simulation-contract, save, accessibility, viewport, portability,
distribution, production-build, and rendered-output checks. Focused suites
remain available so a failure can be traced to its owning boundary.

## Repository map

| Path | Responsibility |
|---|---|
| `app/scenario-generator.ts` | Seeded scenario grammar, actor repertoires, communication ledgers, choice grammars, compatibility assignment, and generation gates. |
| `app/night-engine.ts` | Pure concurrent-night state, scheduling, choice access, event reduction, propagation, fatigue, support, and replay validation. |
| `app/save-model.ts` | Memory-first save policy, portable envelope, bounded import, migration, integrity check, and selected browser slots. |
| `app/page.tsx` | Single-viewport interaction, room switching, progressive disclosure, relationship exploration, receipts, and debrief. |
| `app/privacy-panel.tsx` | Player-controlled local slots and preview-before-load portable input. |
| `tests/` | Executable coherence, runtime, save, disclosure, accessibility, viewport, portability, and rendering contracts. |
| `docs/` | Design rationale, technical specifications, assurance evidence, maintenance rules, and published analysis. |
| `notebooks/` | Executable systems and validation atlases; rendered copies are published with the application. |

## Documentation

Start with the [documentation index](docs/index.md). It routes readers by
purpose and identifies the canonical owner of each specification.

- [Thesis and ethical argument](docs/THESIS-AND-ETHICS.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Generation and coherence](docs/GENERATION-COHERENCE.md)
- [Concurrent-night runtime](docs/CONCURRENT-NIGHT.md)
- [Communication and fatigue atlas](docs/COMMUNICATION-ATLAS.md)
- [Interaction and progressive disclosure](docs/INTERACTION-DISCLOSURE.md)
- [Accessibility](docs/ACCESSIBILITY.md)
- [Privacy and security](docs/PRIVACY-SECURITY.md)
- [Portable save format](docs/SAVE-FORMAT.md)
- [Testing and traceability](docs/TESTING-TRACEABILITY.md)
- [Current bounded release status](docs/RELEASE-STATUS.md)
- [Edge cases and failure behavior](docs/EDGE-CASES.md)
- [Limitations](docs/LIMITATIONS.md)
- [Dependencies and supply chain](docs/DEPENDENCIES-SUPPLY-CHAIN.md)
- [Maintenance and release discipline](docs/MAINTENANCE.md)
- [Executed notebook publication](docs/NOTEBOOKS.md)
- [Architecture decisions](docs/decisions/README.md)

## Scope boundary

CHORUS is an explanatory model, not a prediction, diagnosis, lie detector, or
trust score. Warmth, reserve, age, vocabulary, class position, regional
experience, coalition language, and register switching are never treated as
proof of motive or coordination. The simulation provides authored interior
state only because the player temporarily occupies a fictional seat.

See [Thesis and ethical argument](docs/THESIS-AND-ETHICS.md) and the
[Communication and fatigue atlas](docs/COMMUNICATION-ATLAS.md) for the complete
interpretation boundary.
