# Executed notebook publication

## Purpose

CHORUS publishes executable fixed-contract atlases beside completed HTML so a
reader can inspect their declared architecture, arithmetic, tables, and
checklists without running a notebook and can reproduce those outputs from
source.

Canonical notebook sources:

- [`notebooks/CHORUS-Systems-Atlas.ipynb`](../notebooks/CHORUS-Systems-Atlas.ipynb)
- [`notebooks/CHORUS-Model-Specification.ipynb`](../notebooks/CHORUS-Model-Specification.ipynb)
- [`notebooks/CHORUS-Research-Design.ipynb`](../notebooks/CHORUS-Research-Design.ipynb)
- [`notebooks/CHORUS-Validation-Atlas.ipynb`](../notebooks/CHORUS-Validation-Atlas.ipynb)
- [Notebook run instructions and environment](../notebooks/README.md)

Published completed output:

- [Notebook index](../public/notebooks/index.html)
- [Systems Atlas HTML](../public/notebooks/chorus-systems-atlas.html)
- [Model Specification HTML](../public/notebooks/chorus-model-specification.html)
- [Research Design Atlas HTML](../public/notebooks/chorus-research-design.html)
- [Validation Atlas HTML](../public/notebooks/chorus-validation-atlas.html)
- [Systems Atlas source download](../public/notebooks/CHORUS-Systems-Atlas.ipynb)
- [Model Specification source download](../public/notebooks/CHORUS-Model-Specification.ipynb)
- [Research Design source download](../public/notebooks/CHORUS-Research-Design.ipynb)
- [Validation Atlas source download](../public/notebooks/CHORUS-Validation-Atlas.ipynb)
- [Release evidence index](../public/evidence/index.html), which links the
  executed notebooks to the exact retained release results they support

These notebook sources and HTML publications are rebuilt deterministically
from the current repository declarations. The Systems, Model Specification,
and Research Design atlases explain the current version-15 contracts. The
Historical Verification Ledger deliberately preserves earlier browser,
distribution, and release runs under their original bindings and links
separately to the current working-tree status. Publication does not substitute
for live-browser or assistive-technology execution. Do not hand-edit
`public/notebooks/`.

## Systems Atlas scope

The Systems Atlas exposes fixed architectural declarations for:

- generator and module topology;
- seed-deterministic room, route, and pulse construction;
- one-choice/six-receipt propagation;
- logical clock and concurrent scheduling;
- completion snapshots and afterimages;
- typed content, format, and ambient links; matching choice delivery; and
  selected-versus-background receipt carriage;
- linguistic repertoire and world-model independence;
- fatigue, discernment, enactment, and last-resort thresholds; and
- save/replay boundaries.

## Model Specification scope

The Model Specification exposes:

- units and levels of analysis;
- the construct and variable register, including why each variable exists;
- protected distinctions among record, inference, motive, truth, style, capacity,
  and synthetic frequency;
- assumptions, exclusions, mechanism chains, and sensitivity priorities;
- a multidimensional coherence rubric spanning agentic, motivational,
  affective, relational, epistemic, temporal, causal, network, narrative,
  ethical, and reproducibility requirements;
- construct, internal, external, ecological, content, statistical, and ethical
  validity boundaries; and
- a model-change contract tying definitions to tests, disclosure, maintenance,
  and misuse review.

## Research Design Atlas scope

The Research Design Atlas exposes:

- twelve within-model research questions with explicit independent variables,
  outcomes, and comparison designs;
- matched-seed, factorial, ablation, topology, timing, and policy variants;
- quantitative integrity, paired-effect, distribution, path, sensitivity, and
  multiplicity practices;
- qualitative coding for actor specificity, motivation, affect, relationships,
  epistemic discipline, communication, narrative continuity, and ethics;
- mixed-method joint interpretation, robustness, and falsification criteria;
- synthetic-data and participant-research ethics boundaries; and
- a reproducible reporting template and staged research roadmap.

## Validation Atlas scope

The Validation Atlas is deliberately published as the Historical Verification
Ledger. Its retained `1.0.0-rc.1` browser, distribution, and release runs remain
historical under their recorded provenance; the rebuilt publication links
separately to the current automated working-tree status and its explicit
limits.

The Validation Atlas exposes fixed verification declarations for:

- the retained 4,096-seed/512-play simulation result, its content digest,
  exactly-once receipt totals, and finite-coverage limitation;
- the retained browser complete-night result that was current for its
  historical version-13 source binding, its viewport and application-origin
  error observations, explicitly separated earlier-source interaction history,
  and every unverified browser boundary;
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


## Diagram publication contract

The four notebooks contain 17 deterministic inline-SVG diagrams. Each diagram
uses the representation appropriate to its explanatory task rather than a
single generic box-and-arrow style:

| Notebook | Diagram inventory |
|---|---|
| Systems Atlas | layered technical architecture; deterministic build/publication pipeline; artifact publication structure; route/document relationship map |
| Model Specification | C4 system context; component architecture; ERD/domain model; concurrent-night activity/state flow; directed acyclic propagation model |
| Research Design Atlas | construct-to-output research map; controlled comparative design; validity/claims boundary; measurement and analysis pipeline; ethics and misuse-control gates |
| Historical Verification Ledger | verification stack; evidence provenance; test-family coverage matrix |

Connector-bearing diagrams use explicit orthogonal routes anchored to source and
target boundaries. The builder rejects diagonal segments, line crossings,
collinear route overlaps, traversal through unrelated nodes, node overlap, and
out-of-bounds geometry. The coverage matrix deliberately uses a matrix topology
rather than connectors because the represented relationship is many-to-many
coverage rather than process flow.

Every diagram includes a figure caption, semantic SVG title and description,
non-color labels, an adjacent text equivalent, a visible legend where multiple
edge semantics appear, and an execution assurance line. Diagram source remains
inside the notebook builder so the SVG, notebook output, downloadable source,
and static HTML edition are regenerated from one versioned declaration.

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

- all four canonical sources exist;
- all four completed HTML files exist and are nonempty;
- the expected 5/5/4/3 diagram distribution is present in the Model,
  Research, Systems, and Validation publications;
- every connector diagram passes deterministic orthogonal-routing, crossing,
  node-incursion, boundary-anchor, and node-overlap validation;
- every diagram exposes an SVG title/description and adjacent text equivalent;
- every source download matches its canonical notebook;
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
