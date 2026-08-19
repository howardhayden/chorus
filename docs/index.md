---
title: CHORUS Documentation
---

# CHORUS documentation

This documentation describes the simulation as a designed system: its ethical
argument, deterministic generation, concurrent state, interaction model,
accessibility, privacy boundary, portable saves, verification evidence, and
maintenance rules.

## Choose a route

### Understand the work

1. [Thesis and ethical argument](THESIS-AND-ETHICS.md)
2. [Communication and fatigue atlas](COMMUNICATION-ATLAS.md)
3. [Visual system](VISUAL-SYSTEM.md)

These pages explain what CHORUS represents, which distinctions it protects,
and why its aesthetic and disclosure structure serve the argument.

### Understand the implementation

1. [Architecture](ARCHITECTURE.md)
2. [Generation and coherence](GENERATION-COHERENCE.md)
3. [Concurrent-night runtime](CONCURRENT-NIGHT.md)
4. [Portable save format](SAVE-FORMAT.md)

These pages own the code-facing contracts. A concept is defined once and linked
from other pages rather than restated as a second specification.

### Evaluate the experience

1. [Interaction and progressive disclosure](INTERACTION-DISCLOSURE.md)
2. [Accessibility](ACCESSIBILITY.md)
3. [Privacy and security](PRIVACY-SECURITY.md)
4. [Edge cases and failure behavior](EDGE-CASES.md)

These pages describe player-visible behavior, input methods, responsive layout,
information timing, data handling, and degraded states.

### Verify or maintain the repository

1. [Current bounded release status](RELEASE-STATUS.md)
2. [Testing and traceability](TESTING-TRACEABILITY.md)
3. [Dependencies and supply chain](DEPENDENCIES-SUPPLY-CHAIN.md)
4. [Maintenance and release discipline](MAINTENANCE.md)
5. [Limitations](LIMITATIONS.md)
6. [Architecture decisions](decisions/README.md)
7. [Glossary](GLOSSARY.md)

These pages connect claims to executable checks and record how to extend the
system without weakening its boundaries.

### Inspect the evidence

- [Executed notebook publication](NOTEBOOKS.md)
- [Systems Atlas](../public/notebooks/chorus-systems-atlas.html)
- [Validation Atlas](../public/notebooks/chorus-validation-atlas.html)
- [Notebook downloads and run metadata](../public/notebooks/index.html)
- [Release evidence and retained results](../public/evidence/index.html)

The rendered notebook pages include their completed outputs. Source notebooks
remain available beside them so a result can be inspected and reproduced.

## Canonical ownership

| Topic | Canonical document |
|---|---|
| Product thesis, audience, educational and ethical boundaries | [Thesis and ethical argument](THESIS-AND-ETHICS.md) |
| Communication dynamics, linguistic repertoires, motive/evidence separation, fatigue semantics | [Communication and fatigue atlas](COMMUNICATION-ATLAS.md) |
| Module boundaries and data flow | [Architecture](ARCHITECTURE.md) |
| Grammar, seed handling, assignment, rejection, and coherence gates | [Generation and coherence](GENERATION-COHERENCE.md) |
| Clock, events, scheduling, propagation, replay, and state invariants | [Concurrent-night runtime](CONCURRENT-NIGHT.md) |
| Views, navigation, drawers, blocked actions, debrief, and disclosure timing | [Interaction and progressive disclosure](INTERACTION-DISCLOSURE.md) |
| Semantic structure, keyboard, focus, motion, contrast, reflow, and verification | [Accessibility](ACCESSIBILITY.md) |
| Data inventory, trust boundary, input handling, retention, and threat model | [Privacy and security](PRIVACY-SECURITY.md) |
| Save envelope, migration, integrity, validation, and local slot behavior | [Portable save format](SAVE-FORMAT.md) |
| Test suites, commands, coverage map, and release evidence | [Testing and traceability](TESTING-TRACEABILITY.md) |
| Expected failure and recovery behavior | [Edge cases and failure behavior](EDGE-CASES.md) |
| Current version, release scope, support matrix, promotion rule, and retained result index | [Release status](RELEASE-STATUS.md) |
| Inherent model, narrative, interaction, persistence, privacy, and operational limits | [Limitations](LIMITATIONS.md) |
| Direct and transitive software, installation scripts, update policy, and audit response | [Dependencies and supply chain](DEPENDENCIES-SUPPLY-CHAIN.md) |
| Extension procedure, versioning, documentation, and release checklist | [Maintenance and release discipline](MAINTENANCE.md) |
| Why durable technical choices were made | [Architecture decisions](decisions/README.md) |

## Documentation rules

- The README is a gateway and local-start reference, not a third technical
  specification.
- Domain semantics belong to the Communication Atlas; reducer mechanics belong
  to the concurrent runtime; interface timing belongs to the interaction
  specification.
- Security and accessibility claims require evidence in their respective
  documents and a corresponding executable or manual check.
- Notebook results never replace a release-blocking test. They explain and
  visualize the same deterministic contracts.
- A changed behavior updates its canonical document, traceability row, and
  decision record when the rationale or boundary changes.
