# CHORUS

> **Current source status:** generator version 15 and the 1 September
> after-summary/House Map correction pass the current automated working-tree
> gates. Deterministic evidence and the four generated notebook publications
> are current for this implementation binding. Promotion remains held for
> live-browser, assistive-technology, manual viewport, production-route,
> dependency, and neutral-distribution evidence. The retained `1.0.0-rc.1`
> runs remain historical for their own bindings.


CHORUS is a fictional, low-stakes, PG-bounded social-trust simulation about how ambiguous
artifacts acquire social meaning. One generated night contains six concurrent
incidents on one logical clock. The player may move between rooms at will, but
no room pauses: each accepted choice changes its source room and produces a
bounded consequence in every other room.

The simulation is generated in the browser from a deterministic, constrained
grammar. Within one generator version, a normalized seed and ordered scene and
choice identities reproduce the same authored pack and night state. Version 15
does not claim byte-identical reconstruction of version 13 or 14 authored copy. The
scenario model, event reducer, validation gates, saves, state-derived
naturalized summary, and plain concept receipt all run locally. No account,
remote content service, telemetry, or network write is required to play.

## What the simulation preserves

- Ground truth is fixed in a fact-only ledger—known fact, unresolved-at-entry
  boundary, and later resolution—and never changes to reward a choice. The
  circulating frame is stored separately as propagation state.
- Observation, audience inference, motive, and unresolved questions remain
  separate records.
- Discernment and follow-through are different capacities; modeled platform
  fatigue may obstruct enactment without lowering recognition of better
  judgment.
- Every beat retains a non-amplifying action, even when complete repair is not
  presently reachable.
- Linguistic registers are situated resources in an individual fictional
  repertoire, not identity templates or evidence of belief.
- Every cross-room link declares a typed semantic: content through a shared
  channel, format through a represented artifact form, or ambient pressure
  with no carrier. A choice's typed delivery and the realized receipt—not its
  label or prose—determine whether the selected path carried anything.
- Interpretive labels remain sealed until the complete night is finished.
- The completed-night view reads continuously: a state-derived naturalized
  summary first, then a separate plain concept receipt. It is not a score or a
  seven-tab lesson report.
- Concept status comes from explicit authored choice bindings and conjunctive
  scene effect rules. It is never guessed from labels, intent, tags, or the
  tone of the selected prose.

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
npm run verify:working-tree
```

`npm run verify:working-tree` checks the updated source, deterministic simulation
evidence, all focused suites, four executed notebook publications, the production
build, and rendered metadata without rebinding the historical browser and
clean-room records. The narrower commands remain available:

```sh
npm run lint
npm run test:night
npm run test:simulation
npm run test:save
npm run test:copy
npm run test:linguistics
npm run test:a11y
npm run test:viewport
npm run docs:check:working-tree
```

`npm run verify:release` remains the promotion gate. It is expected to remain
held until live-browser, registry-audit, and neutral-distribution evidence are
renewed for the exact updated implementation digest; missing current evidence
is not converted into a pass.

## Repository map

| Path | Responsibility |
|---|---|
| `app/scenario-generator.ts` | Seeded scenario grammar, fact-only truth and separate propagation ledgers, beat-local disclosures, typed delivery and link semantics, actor repertoires, choice grammars, and generation gates. |
| `app/night-engine.ts` | Pure concurrent-night state, scheduling, choice access, event reduction, typed carriage receipts, propagation, fatigue, support, and replay validation. |
| `app/debrief-copy.ts` | Pure causal naturalized-summary and plain concept-receipt derivation with typed source and evidence provenance. |
| `app/save-model.ts` | Memory-first save policy, portable envelope, bounded import, migration, integrity check, and selected browser slots. |
| `app/page.tsx` | Single-viewport interaction, room switching, progressive disclosure, relationship exploration, and pure completed-night summary/concept derivation. |
| `app/privacy-panel.tsx` | Player-controlled local slots and preview-before-load portable input. |
| `tests/` | Executable coherence, runtime, save, disclosure, accessibility, viewport, portability, and rendering contracts. |
| `docs/` | Design rationale, technical specifications, assurance evidence, maintenance rules, and published analysis. |
| `notebooks/` | Executable systems, model-specification, research-design, and validation atlases; rendered copies are published with the application. |

## Documentation

Start with the [documentation index](docs/index.md). It routes readers by
purpose and identifies the canonical owner of each specification.

- [Thesis and ethical argument](docs/THESIS-AND-ETHICS.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Generation and coherence](docs/GENERATION-COHERENCE.md)
- [Concurrent-night runtime](docs/CONCURRENT-NIGHT.md)
- [Communication and fatigue atlas](docs/COMMUNICATION-ATLAS.md)
- [Copy and voice](docs/COPY-VOICE.md)
- [Copy and voice atomic requirements](docs/requirements/COPY-VOICE-REGISTER.md)
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

“PG-bounded” describes the authored low-stakes, nonviolent content grammar and
restricted-term gates. It is not an external content-rating certification or a
claim that a finite validator can anticipate every reader's response.

See [Thesis and ethical argument](docs/THESIS-AND-ETHICS.md) and the
[Communication and fatigue atlas](docs/COMMUNICATION-ATLAS.md) for the complete
interpretation boundary.

## Licensing

CHORUS is **source-available for noncommercial use** under
**PolyForm-Noncommercial-1.0.0**; commercial use requires a separate written license. Separable original documentation and media use **CC-BY-NC-SA-4.0**.
No current source file or function has a permissive commercial-use exception.
See [`LICENSING.md`](LICENSING.md),
[`WORKFLOW-BOUNDARIES.md`](WORKFLOW-BOUNDARIES.md), and
[`LICENSE-MAP.json`](LICENSE-MAP.json) for scope and historical limits.
