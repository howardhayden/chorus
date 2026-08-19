# Executed notebook publication

## Purpose

CHORUS publishes executable fixed-contract atlases beside completed HTML so a
reader can inspect their declared architecture, arithmetic, tables, and
checklists without running a notebook and can reproduce those outputs from
source.

Canonical notebook sources:

- [`notebooks/CHORUS-Systems-Atlas.ipynb`](../notebooks/CHORUS-Systems-Atlas.ipynb)
- [`notebooks/CHORUS-Validation-Atlas.ipynb`](../notebooks/CHORUS-Validation-Atlas.ipynb)
- [Notebook run instructions and environment](../notebooks/README.md)

Published completed output:

- [Notebook index](../public/notebooks/index.html)
- [Systems Atlas HTML](../public/notebooks/chorus-systems-atlas.html)
- [Validation Atlas HTML](../public/notebooks/chorus-validation-atlas.html)
- [Systems Atlas source download](../public/notebooks/CHORUS-Systems-Atlas.ipynb)
- [Validation Atlas source download](../public/notebooks/CHORUS-Validation-Atlas.ipynb)
- [Release evidence index](../public/evidence/index.html), which links the
  executed notebooks to the exact retained release results they support

## Systems Atlas scope

The Systems Atlas exposes fixed architectural declarations for:

- generator and module topology;
- seed-deterministic room, route, and pulse construction;
- one-choice/six-receipt propagation;
- logical clock and concurrent scheduling;
- completion snapshots and afterimages;
- systemic versus direct crossings;
- linguistic repertoire and world-model independence;
- fatigue, discernment, enactment, and last-resort thresholds; and
- save/replay boundaries.

## Validation Atlas scope

The Validation Atlas exposes fixed verification declarations for:

- the retained 4,096-seed/512-play simulation result, its content digest,
  exactly-once receipt totals, and finite-coverage limitation;
- the retained current-source real-browser complete-night result, viewport and
  application-origin error observations, explicitly separated earlier-source
  interaction history, and every unverified browser boundary;
- the retained repository and neutral clean-room proof, including strict scan,
  fresh-cache installation, focused suites, independent build, production
  start, HTTP smoke, and the nonrecursive final-archive boundary;
- the multi-seed coherence requirement and its owning test;
- six-dynamic and beneficiary coverage;
- actor cohesion and register-selection gates;
- incident fact-binding checks;
- shuffled unavailable-action positions;
- non-amplification and distributed repair reachability;
- sparse pressure and action-structure assignment;
- portable-save failure classes;
- disclosure and viewport contracts; and
- traceability from requirement to automated evidence.

## Completed-output requirements

Every published HTML file must:

- contain completed cell output rather than empty source cells;
- identify its build date and standard-library execution basis;
- embed or locally package required style and image assets;
- remain readable without a notebook server;
- include headings, table headers, figure captions, and text explanations;
- avoid color-only encodings;
- provide alt text or an equivalent adjacent description for figures; and
- link back to its exact source notebook.

Source and rendered files are both included in the clean distribution.

## Reproducibility

Notebook execution uses fixed declarations defined by the repository's notebook
builder. A clean run creates a fresh namespace, executes code cells in order,
fails on an exception, and commits monotonically numbered execution counts and
their outputs. Python 3.10 or newer is required; no third-party Python package
is used.

These notebooks do not import the TypeScript generator or perform seed sweeps.
They identify the exact source and test files whose contracts they summarize,
and the Validation Atlas verifies and renders the committed machine result from
the separate TypeScript maturity harness. Live multi-seed coherence and reducer
behavior remain the responsibility of that harness and the focused suites
described in [Testing and traceability](TESTING-TRACEABILITY.md).

## Publication and validation

The notebook build process writes completed HTML and downloadable source copies
to `public/notebooks/`. Release validation checks that:

- both canonical sources exist;
- both completed HTML files exist and are nonempty;
- source downloads match the canonical notebooks;
- completed cells and run metadata are present;
- every code cell has an execution count and committed output;
- build date, builder, Python language metadata, and deterministic status are
  present in notebook metadata;
- the artifact manifest records path, media type, byte length, and SHA-256
  digest for every source, downloadable copy, HTML atlas, and index;
- links from this page and the documentation index resolve; and
- forbidden references and remote asset dependencies are absent.

Notebook declarations explain fixed contracts. Where a notebook renders a
retained run, it names and hashes that separate artifact rather than pretending
the notebook executed the browser or TypeScript harness. Notebooks do not
replace release-blocking tests. The canonical requirement-to-test map remains
[Testing and traceability](TESTING-TRACEABILITY.md).
