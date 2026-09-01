# Maintenance and release discipline

## Purpose

This document defines how to extend CHORUS without weakening determinism,
coherence, disclosure, accessibility, privacy, or the interpretation boundary.
Durable rationale belongs in [architecture decisions](decisions/README.md);
behavioral detail belongs in the canonical specification identified by the
[documentation index](index.md).

## Change classification

Classify a change before editing:

| Class | Examples | Required review |
|---|---|---|
| Content | Incident wording, artifact copy, explanation, label. | Incident binding, PG-bounded/content-safety rules, disclosure, readability, localization assumptions. |
| Grammar | Actor, register, choice, route, framework, assignment. | Multi-seed coherence, generator version, safety, repair reachability. |
| Reducer | Clock, access, effect, fatigue, support, replay. | Determinism, invariants, full runtime and save replay. |
| Interaction | View, navigation, focus, drawer, graph, responsive layout. | Progressive disclosure, keyboard, screen reader, zoom, mobile, reduced motion. |
| Persistence | Envelope, slot, import, migration, preview. | Schema/generator compatibility, threat model, bounds, atomic restore. |
| Dependency | Runtime, build, style, lint, deployment package. | Supply chain, scripts, licenses, clean install/build. |
| Documentation | Specification, notebook, decision, release evidence. | Canonical ownership, links, executed output, forbidden references. |

A change can occupy several classes; apply every relevant review.

## General workflow

1. State the player-visible or maintenance outcome.
2. Identify the canonical specification and existing decision records.
3. Locate the generator, reducer, interface, save, style, and test boundaries
   affected.
4. Add or update a failing focused test where the contract is executable.
5. Implement the smallest coherent change without weakening unrelated gates.
6. Run focused tests, then the complete release command set.
7. Perform required manual accessibility, privacy, mobile, and interaction
   checks.
8. Update the canonical documentation and traceability row.
9. Add a decision record if rationale, trust boundary, versioning, or a durable
   constraint changed.
10. Rebuild executed notebooks when their source data or claims changed.
11. Build and inspect a clean source archive.

For a candidate, `npm run verify:release` is the complete repository gate; it
does not replace the retained browser and clean-distribution results named by
the release record.

## Adding or changing an incident

Answer every question before the incident enters the grammar:

1. What directly happened?
2. Which fact belongs to each of the four beats?
3. What is inferred, by whom, and from which surface?
4. What remains unresolved?
5. What adjacent goal makes the protagonist plausible in the room?
6. Which bounded conduct, if any, actually occurred?
7. Which person, motive, or character generalization could be built from it?
8. What does accepting that generalization protect?
9. Who can reply, and who bears the burden of correction?
10. Which source and evidence are incident-specific?
11. Which institution, relationship, or distribution support can transfer?
12. Which route remains non-amplifying under extreme fatigue?
13. Can any copy become an operational manipulation, targeting, harassment, or
    evasion instruction?
14. Does every phrase remain within the authored PG-bounded, fictional grammar
    and stay understandable without specialist shorthand?

If any answer is missing, the incident is not ready.

## Adding or changing an actor repertoire

1. Bind every register to an individual fictional acquisition or use context.
2. Define audience, relationship, channel, power, and pressure conditions.
3. Preserve knowledge, goal, interior orientation, and semantic commitments
   across a switch.
4. Define readable discourse features without accent imitation or caricature.
5. Keep register, world model, ideology, relationship, motive, and truth as
   separate fields.
6. Define a neutral public surface cue separately from final analysis.
7. Test default, maintain, bridge, and switch behavior where supported.
8. Test same-register/different-model and different-register/shared-goal cases.
9. Verify that active DOM, accessible names, live regions, and Relationships do
   not reveal the final profile.
10. Verify one-column concluding disclosure with forced-colors borders and
    usable targets.

## Adding a metric, fatigue channel, or route mechanism

1. Add it to the typed generator contract.
2. Define what it represents and explicitly does not represent.
3. Declare the only events allowed to change it.
4. Bound every coefficient and runtime range.
5. Define local, systemic, and direct projection behavior.
6. Add a readable interface label and non-color representation.
7. Extend pack, state, save, and replay validation.
8. Test positive, negative, zero, boundary, and repeated-read behavior.
9. Confirm truth remains outside propagation coefficients.
10. Confirm no change removes the non-amplification floor or lowers discernment
    as a fatigue side effect.

## Adding a choice or repair route

- Bind the choice to one current scene and incident.
- Preserve at least two imperfect structurally available choices.
- Preserve one non-amplification floor.
- Assign a modeled duration, finite effects, fatigue load, relational record,
  and pressure direction where applicable.
- Give a blocked ideal an immediate motive, emotional overtake with reason,
  structural requirements, enactment requirement, and distributed path.
- Ensure support has no indispensable actor.
- Shuffle order deterministically.
- Keep unavailable reasons concise and toggled by the action itself.
- Verify stale, early, inaccessible, rapid-double, replay, and save behavior.

## Adding a direct crossing

Document:

- the shared channel or artifact format that permits literal or aesthetic
  crossing;
- why shared theme, register, or identity alone is insufficient;
- source and target metric projections;
- the reviewed vague cue before both endpoints are entered;
- the attributable cue after both are entered; and
- tests across all entered/unentered combinations.

Do not weaken the typed content/format/ambient distinction for narrative
convenience. A direct content link owns a shared-channel carrier, a direct
format link owns an artifact-format carrier, and an ambient link owns neither.
Selected carriage additionally requires compatible typed choice delivery and a
matching realized receipt; labels and narrative phrasing never decide it.

## Changing interaction or layout

- Keep one document viewport and named scroll owners.
- Preserve one navigation control per destination in each viewport.
- Do not replace progressive disclosure with a full-screen form or permanently
  dense dashboard.
- Verify keyboard order, focus movement, live announcements, and dialog return.
- Test 320-pixel portrait, short landscape, 200% zoom, narrow reflow, safe-area
  insets, long generated copy, reduced motion, Film off, and forced colors.
- Confirm the relationship view has no horizontal page scroll and retains a text
  alternative.
- Confirm reasons expand their own card and the same control closes them.

## Changing saves

Determine separately:

- whether the portable schema changes;
- whether the same seed generates a different authored pack;
- whether event replay changes; and
- whether old state can be migrated without guessing.

Never silently coerce an unsupported version. Validate old integrity before
migration, then validate current shape and replay after migration. Preserve
memory-only default, per-slot selection, preview-before-load, selected-key
isolation, bounded parsing, and atomic restore.

## Versioning

### Application version

Describes a distributable release and may include interface, documentation, or
dependency changes that do not alter generation.

### Generator version

Increase when a seed can produce different scenarios, identities, choice order,
requirements, coefficients, or event reconstruction. A generator-version
change can invalidate old saves even if the envelope schema is unchanged.

### Save schema version

Increase when the envelope structure or interpretation changes. Provide an
explicit migration only when old content can be validated and converted without
inventing state.

### Documentation and notebook version

Rendered notebooks record source content digests and the generator version in
executed provenance cells; notebook metadata records build date, builder, and
deterministic publication status. Rebuild when generator, reducer, validation,
metric definitions, or analyzed test fixtures change.

## Documentation maintenance

- Update the canonical owner, not every page that links to it.
- Keep README setup commands synchronized with distributable package scripts.
- Reject links to files excluded from the clean archive.
- Keep notebook source and completed HTML together.
- Do not name prohibited source traditions, hidden internal taxonomies, or
  platform-specific repository internals in public documentation.
- Run the documentation reference and link scan before release.
- Make tables readable without styling and figures understandable through text.

## Decision records

Create an ADR when a change:

- establishes or reverses a module boundary;
- changes determinism, truth, disclosure, storage, or network behavior;
- changes generator or save compatibility;
- adopts or removes a substantial dependency;
- creates a new accessibility floor;
- alters a core interaction invariant; or
- accepts a durable tradeoff future maintainers might otherwise undo.

Do not use an ADR for routine copy correction or a temporary debugging step.
See [Architecture decisions](decisions/README.md).

## Release checklist

This checklist defines the procedure. The pass, fail, pending, and limitation
state for a concrete build belongs to [Release status](RELEASE-STATUS.md) and
its retained evidence record; do not mark this reusable template as though it
were a release transcript.

### Source and behavior

- [ ] Working tree contains only intended changes.
- [ ] Generator and save version decisions are explicit.
- [ ] All focused tests pass.
- [ ] Lint and production build pass.
- [ ] Deterministic replay passes for representative and stress seeds.
- [ ] No release-blocking coherence or content gate is weakened.

### Accessibility and interaction

- [ ] Keyboard and focus pass completed.
- [ ] Screen-reader disclosure boundary checked.
- [ ] Mobile portrait, short landscape, zoom, and reflow checked.
- [ ] Reduced motion, Film off, and forced colors checked.
- [ ] Unavailable reasons expand and collapse from the same shuffled cards.
- [ ] Relationship graph and text list remain equivalent.

### Privacy and security

- [ ] No storage access before deliberate action.
- [ ] Network log shows no night-state transmission.
- [ ] Valid, corrupt, oversized, deep, foreign, and version-mismatch saves
      checked.
- [ ] Advisory and installation-script review completed.
- [ ] No credentials, logs, caches, local identity, or dependency directories
      enter the archive.

### Documentation and evidence

- [ ] README commands match the clean distribution.
- [ ] Documentation index and internal links resolve.
- [ ] Forbidden-reference scan passes.
- [ ] Systems and Validation notebook sources execute cleanly.
- [ ] Completed notebook HTML and source downloads are present.
- [ ] Traceability and known limitations are current.
- [ ] Release evidence records environment, commands, digests, and manual matrix.

### Clean distribution

- [ ] Unpack archive into a new directory.
- [ ] Run `npm ci` with no parent dependency directory.
- [ ] Run every command listed in the clean README.
- [ ] Start local development without repository identity or hidden state.
- [ ] Open documentation and notebook HTML from the archive.
