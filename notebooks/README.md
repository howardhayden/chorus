# CHORUS executed notebooks

This directory contains the canonical executed notebook sources. Static, self-contained HTML editions and direct notebook downloads are published under [`public/notebooks/`](../public/notebooks/).

## Editions

- [CHORUS Systems Atlas](../public/notebooks/chorus-systems-atlas.html) · [executed notebook](CHORUS-Systems-Atlas.ipynb)
- [CHORUS Model Specification](../public/notebooks/chorus-model-specification.html) · [executed notebook](CHORUS-Model-Specification.ipynb)
- [CHORUS Research Design Atlas](../public/notebooks/chorus-research-design.html) · [executed notebook](CHORUS-Research-Design.ipynb)
- [CHORUS Historical Verification Ledger](../public/notebooks/chorus-validation-atlas.html) · [executed notebook](CHORUS-Validation-Atlas.ipynb)
- [Published index](../public/notebooks/index.html)
- [Updated working-tree status](../public/evidence/updated-working-tree-status.html)
- [Historical bounded release evidence](../public/evidence/index.html)
- [Integrity manifest](artifact-manifest.json)

## Rebuild and verify

The publication path uses the Python standard library only.

```sh
python3 scripts/docs/build_notebooks.py
python3 scripts/docs/build_notebooks.py --check
```

The first command executes every code cell in a clean per-notebook namespace, commits cell outputs, writes the accessible HTML editions, copies downloadable notebook files, and refreshes the integrity manifest. The second command performs the same build in memory and fails if any committed artifact has drifted.

The HTML editions are ordinary long-form documents rather than part of the one-viewport game shell. They provide semantic landmarks, skip links, labelled scrollable tables, visible focus, reduced-motion and forced-color handling, responsive reflow, print treatment, and complete text equivalents for every computed summary.

The four notebooks also publish 17 deterministic SVG diagrams using the diagram type appropriate to the explanatory task: C4 context, component architecture, ERD/domain model, activity flow, causal DAG, controlled research design, validity boundaries, measurement and risk pipelines, artifact/route maps, verification provenance, and a test-coverage matrix. Every connector route is orthogonal; the builder rejects line crossings, node incursions, and node overlaps before publication.
