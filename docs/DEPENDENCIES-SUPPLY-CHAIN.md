# Dependencies and supply chain

## Principles

CHORUS keeps its simulation independent from remote content and state services.
Dependencies provide the browser interface, type system, build, lint, style
processing, local development, and deployment packaging. Scenario generation,
event reduction, validation, save integrity, and debrief logic are repository
code with deterministic inputs.

The manifest and lockfile are authoritative for exact package names, versions,
integrity hashes, and transitive paths. This document owns why categories exist,
how installation scripts are reviewed, how advisories are assessed, and how an
update is accepted.

## Direct dependency roles

| Category | Role | Imported by simulation core |
|---|---|---:|
| Component runtime | Render the application and manage local interaction state. | No; generator, reducer, and save logic remain ordinary TypeScript modules. |
| Application framework | Route and render the browser application. | No. |
| TypeScript | Static types and development-time checking. | Source language only. |
| Build tool | Compile the application and local development server. | No. |
| Style processor | Transform repository-owned styles. | No. |
| Linter and framework rules | Static quality checks. | No. |
| Type declarations | Development-time types for runtime libraries and Node. | No. |
| Deployment adapter | Package a verified build for the current delivery target. | No. |
| Python standard library | Rebuild and verify executed notebook and static documentation artifacts. | No. |

No direct package supplies generated story text, actor behavior, communication
classification, scoring, save interpretation, or player profiling.

## Runtime versus development scope

When reviewing a dependency issue, determine first whether the affected package
is:

1. loaded in the player's browser;
2. executed only during build or local development;
3. executed only by deployment packaging; or
4. an optional operating-system helper.

Severity is not reduced merely because a package is transitive, but exposure
and remedy differ. A build-only advisory does not imply vulnerable application
code; a browser-runtime advisory cannot be dismissed because the vulnerable
package entered through the framework.

Use these commands as evidence:

```sh
npm ls --all
npm explain <package>
npm audit --json
npm audit --omit=dev --json
npm outdated --json
```

Keep the unedited reports with release evidence rather than copying only a
headline count into permanent prose.

## Lockfile policy

- Commit `package-lock.json` with every accepted dependency change.
- Use `npm ci` for clean installation; do not regenerate a lockfile implicitly
  during a release build.
- Require registry integrity metadata for every downloaded tarball.
- Review manifest and lockfile diffs together.
- Reject unexplained source, registry, lifecycle-script, binary, or license
  changes.
- Record the lockfile digest in release evidence.

## Installation-script policy

Some build tools and native helpers use installation scripts to select or
verify a platform binary. Such scripts are code execution during installation
and require narrow review.

- Approve an exact package and exact version, not all scripts.
- Confirm why the script is necessary for supported platforms.
- Inspect the package's published script and transitive path.
- Re-review when the version changes, even within a patch release.
- Remove stale approvals when the package leaves the lockfile.
- Never solve a warning with a blanket approval command.
- Verify a fresh installation on at least one supported clean environment.

## Update procedure

1. Capture the current manifest, lockfile digest, audit reports, and passing
   verification results.
2. Identify whether the package is direct or transitive and why it exists.
3. Read the maintainer's release and security notes.
4. Prefer the smallest compatible direct upgrade that removes the affected
   path.
5. Use an override only when the upstream compatibility range genuinely permits
   it and tests exercise the affected path.
6. Review added and removed packages, lifecycle scripts, binaries, licenses,
   and bundle effects.
7. Run every focused suite, production build, rendered check, clean-source
   start, and notebook validation.
8. Perform manual interaction and accessibility smoke checks when the framework,
   component runtime, CSS processing, or build pipeline changes.
9. Record rationale and remaining exposure in release evidence.

Do not use a forced audit repair as a substitute for dependency analysis. A
forced major change can cross framework compatibility boundaries while leaving
the actual vulnerable path misunderstood.

## Removal before addition

Before adding a package, ask:

- Can the platform or existing dependency already provide the capability?
- Is the feature part of CHORUS's thesis or only implementation convenience?
- Can a small repository-owned deterministic function remain more inspectable?
- Does the package add remote calls, telemetry, dynamic code, native scripts,
  a large transitive graph, or inaccessible interface behavior?
- Who owns maintenance if the package is abandoned?

An unused scaffold, example integration, default asset, or optional feature is
removed rather than documented as part of the product.

## Software inventory and notices

A release archive should include or link to:

- `package.json` and `package-lock.json`;
- a machine-readable dependency tree or software bill of materials;
- third-party license notices required by included packages and assets;
- the package-lock digest;
- current advisory reports; and
- a list of narrowly approved installation scripts.

Generated inventory is evidence, not a replacement for the role explanation in
this document.

The current candidate publishes a deterministic
[machine-readable dependency inventory](../public/evidence/dependency-inventory.json).
It records the normalized direct manifest, lockfile digest, exact direct pins,
registry integrity values, and exact-version lifecycle-script allowlist. The
[release evidence index](../public/evidence/index.html) separately retains the
time-bound advisory result so a later audit cannot silently rewrite an older
release claim.

## Source archive boundary

A distributable source archive includes authored source, tests, documentation,
notebook sources and executed HTML, manifests, and lockfile. It excludes:

- dependency directories;
- compiled output;
- caches and temporary runtime state;
- logs;
- credentials and environment files;
- editor or operating-system residue; and
- repository- or deployment-specific identity.

The archive is unpacked into a clean directory and verified with `npm ci`, all
test commands, production build, and local development start. Verification must
not rely on a parent checkout, global dependency directory, or hidden project
state.

## Release blockers

- unexplained direct or transitive package;
- unreviewed lifecycle script;
- missing integrity metadata;
- critical or high advisory with an exposed compatible path and no documented
  mitigation;
- runtime network client not required by the product;
- lockfile drift after tests;
- missing license obligation;
- source archive that contains secrets or local identity; or
- source archive that cannot install and start independently.
