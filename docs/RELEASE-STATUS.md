# Release status

## Decision

CHORUS `1.0.0-rc.1` is a **bounded release candidate**, not a claim of
unqualified production readiness. The candidate boundary is one locally
generated, single-player browser night with six concurrent rooms, player-owned
persistence, a complete-night debrief, and self-contained technical evidence.
Generator version 13 and portable-save schema 1 are compatibility boundaries.

The release decision is evidence-led: a capability is marked verified only
when the corresponding command or interaction has a retained result. A written
requirement, notebook declaration, or static source inspection is not counted
as end-to-end proof.

The machine-readable result and its accessible static rendering are published
at the [release evidence index](../public/evidence/index.html). That record owns
the exact commands, environments, results, artifact digests, and open manual
checks for this candidate.

## Included product scope

- deterministic construction of an uncapped sequence of coherent six-room
  nights from 32-bit seeds;
- one shared logical clock, autonomous scheduled room events, cross-room
  effects, sparse compatible direct crossings, immutable close snapshots, and
  live afterimages;
- four beats per room, deterministic choice shuffling, blocked-ideal reasons,
  distributed repair support, fatigue and enactment constraints, and complete
  causal receipts;
- room switching, house map, relationship exploration and text parity,
  progressive disclosure, and the conclusion-gated whole-night receipt;
- session-only play, three explicitly enabled local slots, portable export,
  bounded import preview, migration, integrity checks, and deterministic
  reconstruction; and
- source, tests, canonical documentation, executed notebooks, static HTML
  editions, and a host-neutral source archive.

## Supported environments

The package contract requires Node.js 22.13 or newer for local development and
Python 3.10 or newer for rebuilding the technical publications. The browser
application targets current standards-capable desktop and mobile browsers with
JavaScript, CSS Grid, custom properties, `dialog`, `inert`, local storage, and
download support.

"Supported" does not mean that every browser and assistive-technology pair has
been manually certified. The evidence record distinguishes:

- the exact automated reference environment;
- browser engines and viewport/input combinations exercised end to end;
- source-level accessibility contracts; and
- manual combinations that remain unverified.

Absence from the verified matrix is an untested environment, not a known
failure and not an implied pass.

## Release gates

| Gate | Required evidence | Decision rule |
|---|---|---|
| Complete play | A browser run reaches turn 24, closes all rooms, exposes the debrief, and records no uncaught error. | Block if the primary path cannot finish. |
| Autonomous concurrency | Scheduled events fire once by logical time across multiple visit orders; navigation alone does not mutate time. | Block on duplication, loss, or visit-order dependence. |
| Cross-room causality | Every accepted action writes one local and five remote effects; later effects preserve close snapshots and update afterimages. | Block on missing, extra, or truth-mutating effects. |
| Simulation scale | A recorded seed sweep passes pack, state, replay, coverage, and range invariants with zero rejected valid seeds. | Block on any unexplained deterministic failure. |
| Persistence and hostile input | Round-trip, slot consent, migration, corruption, size, depth, version, and fabricated-state cases retain atomic failure behavior. | Block if invalid input can replace current state or background storage occurs. |
| Accessibility and layout | Automated semantic contracts plus retained keyboard, focus, reflow, motion, contrast, and text-equivalence checks. | Block on inaccessible primary action or premature disclosure. |
| Privacy | No state transmission, account requirement, analytics client, or implicit persistence in the tested runtime. | Block on undisclosed read, write, or transfer. |
| Publication | Notebook sources are executed, static HTML is self-contained, local links resolve, and manifest digests match. | Block on drift, missing output, remote asset, or broken evidence link. |
| Distribution | A clean archive installs, tests, builds, and starts without repository or deployment identity. | Block if the archive depends on its parent checkout. |

## Evidence hierarchy

Evidence is interpreted in this order:

1. retained end-to-end or focused test result tied to an implementation
   content digest;
2. production build or clean-distribution result;
3. focused source-level contract test;
4. executed notebook calculation or table; and
5. prose specification or manual observation without a retained trace.

A lower layer can explain a higher one but cannot waive its failure. The
[testing and traceability map](TESTING-TRACEABILITY.md) owns requirement-to-test
relationships; this page owns only the release boundary and decision.

## Limitations and deferrals

The candidate's inherent modeling and product limitations are canonical in
[Limitations](LIMITATIONS.md). Release-specific unverified environments and
deferred checks appear only in the evidence record so they cannot be mistaken
for durable system properties.

Any change to generator output, replay, save interpretation, primary
interaction, dependency graph, or evidence-generating test invalidates the
candidate's source binding and requires a new evidence capture. Documentation
copy that does not alter those contracts still requires link, publication, and
artifact-drift checks.

## Promotion rule

Promotion from `1.0.0-rc.1` requires all release-blocking automated gates to
pass on the same implementation digest, no unresolved severity-one defect, and
explicit review of every unverified manual accessibility/browser combination.
The release may still ship with documented noncritical limitations; it may not
convert missing evidence into a pass.
