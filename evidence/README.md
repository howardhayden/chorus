# Release evidence

This directory contains retained machine-readable results and the canonical
source record for a bounded CHORUS release. It is evidence, not a second
behavioral specification.

## Ownership

- `releases/<release>/release.json` owns the release decision, implementation
  content binding, gate statuses, exact commands, verified and unverified
  environment matrix, linked artifacts, and release-specific limitations.
- `releases/<release>/dependency-inventory.json` is generated deterministically
  from `package.json` and `package-lock.json`. It records direct dependency
  pins, lock integrity values, the lockfile digest, and exact lifecycle-script
  approvals.
- `runs/` contains machine-readable outputs produced by simulation, end-to-end,
  audit, and distribution checks. A release record references each retained
  file by SHA-256.
- `public/evidence/` contains generated publication copies. Never edit those
  files by hand.

The behavioral owner for each claim remains the document named by
[`docs/index.md`](../docs/index.md). The requirement-to-test map remains
[`docs/TESTING-TRACEABILITY.md`](../docs/TESTING-TRACEABILITY.md).

## Build and verification

```sh
python3 scripts/docs/build_release_evidence.py --refresh-bindings
python3 scripts/docs/build_release_evidence.py --check
```

The refresh command is used only after all retained runs target the final
implementation. It recalculates implementation, artifact, package, and lock
bindings. The check command fails on source drift, a missing or altered run,
an unpassed blocking gate, a missing raw demonstration, or publication drift.

`npm run docs:build` and `npm run docs:check` build or verify the notebook and
release-evidence publications together.

## Result rules

- Record an exact command and observed result; do not convert an intended
  assertion into a pass.
- Bind every retained run to the implementation digest it exercised.
- Keep unavailable browser and assistive-technology combinations explicitly
  unverified.
- A notebook declaration explains a system contract but never substitutes for
  a focused or end-to-end run.
- A prose observation without a retained trace can be useful context, but it
  cannot satisfy a release-blocking gate.
- After implementation drift, either rerun the affected evidence or hold the
  candidate. Do not refresh old runs onto new source.
