# CHORUS complete updated output

## Output identity

- **Base repository:** `howardhayden/chorus`
- **Base commit:** `e331f79b8fddd397be80891d7ddea25fda778d58`
- **Application version:** `1.0.0-rc.1`
- **Generator version:** `13`
- **Portable-save schema:** `1`
- **Updated implementation digest:** `d8bb8701ca63e46f245aa48f11a0a67d796ca71f7cf5c8472e586d718f7573dd`
- **Output date:** 19 August 2026

This directory is the complete updated CHORUS source tree and current built
`dist/` output. It integrates the scholarly-legibility notebooks, their styled
HTML publications, the House Guide / Field Notes in-app reader, the standalone
notebook index, and the complete icon fallback set.

## Direct verification

The updated tree passed:

- lint and TypeScript checking;
- **118,680** deterministic simulation assertions with zero failures across
  **4,096 generated nights** and **512 completed/replayed nights**;
- **80 focused tests** with zero failures: 34 concurrent-night, 5 simulation,
  10 save-model, 22 accessibility/disclosure, 8 viewport, and 1 rendered-HTML
  metadata test;
- deterministic publication and drift verification for **four executed Jupyter
  notebooks** and **16 generated notebook artifacts**;
- a production Vinext build; and
- a loopback production check of **21 routes**, all returning HTTP 200.

The registry advisory check against the package's byte-identical lockfile found
**0 vulnerabilities** across
**649 dependencies** in the
captured advisory response.

Primary records:

- `public/evidence/updated-working-tree-status.html`
- `evidence/runs/updated-working-tree-status.v1.json`
- `evidence/runs/updated-working-tree-verification.v1.log`
- `evidence/runs/final-output-route-check.v1.json`
- `evidence/runs/dependency-audit.updated-working-tree.v1.json`
- `evidence/runs/simulation-maturity.v1.json`

## Evidence boundary

This is a **complete updated working tree held for evidence renewal**, rather
than a silently relabeled replacement release candidate. The retained live
browser completion and neutral clean-room proof under `public/evidence/` predate
the scholarly-reader and icon changes and are now explicitly presented as
historical evidence for their recorded source binding.

Current source, production HTML, metadata, assets, route publication,
accessibility contracts, viewport contracts, state systems, deterministic
simulation, dependency advisory lookup, notebooks, and production build were
observed directly. Promotion still requires a complete live-browser night and a
fresh neutral-distribution proof bound to the updated implementation digest.

## Run

```sh
npm ci
npm run dev
```

## Verify the updated working tree

```sh
npm run verify:working-tree
```

`npm run verify:release` intentionally remains the stricter promotion gate and
will remain held until the browser and neutral-distribution records are renewed
for this source binding.

## Package contents

The clean archive excludes `node_modules`, `.next`, `.wrangler`, `.DS_Store`,
and Python bytecode. It retains:

- complete application and Worker source;
- locked dependency declarations;
- deployment workflow and configuration;
- tests and evidence harnesses;
- canonical documentation and decision records;
- all four executed notebooks and static HTML publications;
- current and historical evidence with explicit source boundaries;
- all icon and manifest assets; and
- the current production `dist/` output.
