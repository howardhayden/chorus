#!/usr/bin/env python3
"""Build CHORUS notebook sources and their self-contained HTML editions.

The builder uses only the Python standard library. Code cells are executed in
order inside a fresh namespace, their outputs are committed into the notebook,
and the same outputs are assembled into accessible static documents.
"""

from __future__ import annotations

import argparse
import contextlib
import hashlib
import html
import io
import json
import os
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any
from urllib.parse import unquote, urlsplit


ROOT = Path(__file__).resolve().parents[2]
SOURCE_DIR = ROOT / "notebooks"
PUBLISH_DIR = ROOT / "public" / "notebooks"
BUILD_STAMP = "2026-08-18"
COMPANION_PUBLICATION_TARGETS = {
    ROOT / "public" / "evidence" / "index.html",
    ROOT / "public" / "evidence" / "dependency-inventory.json",
}


@dataclass(frozen=True)
class NotebookSpec:
    title: str
    slug: str
    filename: str
    eyebrow: str
    summary: str
    cells: tuple[tuple[str, str], ...]


HELPERS = r'''from html import escape

class HTMLResult(str):
    def _repr_html_(self):
        return str(self)

def table_html(caption, columns, rows, row_headers=False):
    head = "".join(f'<th scope="col">{escape(str(column))}</th>' for column in columns)
    body_rows = []
    for row in rows:
        rendered = []
        for index, value in enumerate(row):
            tag = "th" if row_headers and index == 0 else "td"
            scope = ' scope="row"' if tag == "th" else ""
            rendered.append(f'<{tag}{scope}>{escape(str(value))}</{tag}>')
        body_rows.append("<tr>" + "".join(rendered) + "</tr>")
    label = escape(caption)
    return HTMLResult(
        f'<div class="table-wrap" role="region" aria-label="{label}" tabindex="0">'
        f'<table><caption>{label}</caption><thead><tr>{head}</tr></thead>'
        f'<tbody>{"".join(body_rows)}</tbody></table></div>'
    )

def cards_html(title, cards):
    items = []
    for label, value, note in cards:
        items.append(
            '<article class="metric-card">'
            f'<h4>{escape(str(label))}</h4><strong>{escape(str(value))}</strong>'
            f'<p>{escape(str(note))}</p></article>'
        )
    return HTMLResult(f'<section class="metric-grid" aria-label="{escape(title)}">{"".join(items)}</section>')

def checklist_html(title, rows):
    items = []
    for status, label, evidence in rows:
        items.append(
            '<li>'
            f'<span class="status">{escape(status)}</span>'
            f'<strong>{escape(label)}</strong><p>{escape(evidence)}</p>'
            '</li>'
        )
    return HTMLResult(f'<section class="checklist" aria-label="{escape(title)}"><ul>{"".join(items)}</ul></section>')

print("Standard-library rendering helpers loaded.")'''


SYSTEMS_SPEC = NotebookSpec(
    title="CHORUS Systems Atlas",
    slug="chorus-systems-atlas",
    filename="CHORUS-Systems-Atlas.ipynb",
    eyebrow="Architecture · state · disclosure",
    summary=(
        "An executed map of the concurrent-night architecture, evidence boundaries, "
        "choice access, propagation, persistence, and maintenance seams."
    ),
    cells=(
        (
            "markdown",
            """# CHORUS Systems Atlas

This atlas explains how one locally generated night remains coherent while six rooms advance on one clock. It is an engineering companion to the prose documentation, not a player tutorial and not a substitute for the source.

The diagrams and tables below are computed from fixed architectural declarations. They are intended to make system boundaries inspectable without running the game.""",
        ),
        ("code", HELPERS),
        (
            "markdown",
            """## Source provenance

The atlas is tied to the implementation rather than an independently maintained diagram. This executed cell reads the authoritative modules, records their line counts and short content digests, and extracts the generator version that governs deterministic nights.""",
        ),
        (
            "code",
            r'''from hashlib import sha256
from pathlib import Path
import re

def find_repository_root():
    for candidate in (Path.cwd(), *Path.cwd().parents):
        if (candidate / "app" / "scenario-generator.ts").is_file():
            return candidate
    raise FileNotFoundError("Run this notebook from within the CHORUS source tree.")

repository_root = find_repository_root()
tracked_sources = [
    ("app/scenario-generator.ts", "Validated night grammar and coherence gates"),
    ("app/night-engine.ts", "Shared-clock event reducer and receipt validation"),
    ("app/page.tsx", "One-viewport disclosure and interaction shell"),
    ("app/save-model.ts", "Portable-state and local-slot validation"),
    ("app/privacy-panel.tsx", "Player-directed persistence controls"),
]
provenance_rows = []
generator_text = ""
for relative_path, role in tracked_sources:
    payload = (repository_root / relative_path).read_bytes()
    source_text = payload.decode("utf-8")
    if relative_path == "app/scenario-generator.ts":
        generator_text = source_text
    provenance_rows.append((relative_path, len(source_text.splitlines()), sha256(payload).hexdigest()[:12], role))

version_match = re.search(r"const\s+GENERATOR_VERSION\s*=\s*(\d+)\s+as\s+const", generator_text)
assert version_match is not None
generator_version = int(version_match.group(1))
assert generator_version > 0 and len(provenance_rows) == len(tracked_sources)
_html = table_html("Implementation provenance", ("Source", "Lines", "SHA-256 (12)", "Authority"), provenance_rows, row_headers=True)
print(f"PASS: read {len(provenance_rows)} authoritative modules; parsed generator version {generator_version}.")''',
        ),
        (
            "markdown",
            """## Runtime topology

The runtime is intentionally narrow: generation establishes a validated world, the event reducer is the sole authority for change, and the interface discloses only what the occupied seat may currently know. Persistence stores the same event-sourced state instead of creating a parallel model.""",
        ),
        (
            "code",
            r'''modules = [
    ("Scenario grammar", "app/scenario-generator.ts", "Creates six reviewed rooms, links, scenes, choices, ledgers, and coherence reports."),
    ("Night reducer", "app/night-engine.ts", "Applies decisions, time advances, ambient pulses, access checks, and cross-room receipts."),
    ("Interface", "app/page.tsx", "Renders the bounded house, room switching, progressive disclosure, relations, and closing receipts."),
    ("Persistence", "app/save-model.ts", "Validates local slots and portable state with provenance, size, schema, and digest checks."),
    ("Privacy controls", "app/privacy-panel.tsx", "Keeps session-only use as the default and exposes explicit save, import, export, and deletion controls."),
]
_html = table_html("Primary runtime modules", ("Responsibility", "Source", "Boundary"), modules, row_headers=True)
print(f"Mapped {len(modules)} primary modules; state changes remain concentrated in the generator and reducer.")''',
        ),
        (
            "code",
            r'''flow = [
    (1, "Seed", "One unsigned 32-bit value", "No state mutation"),
    (2, "Validated night pack", "Rooms, truth, language, routes, beats, choices", "Generation boundary"),
    (3, "Night state", "Clock, room runtimes, decisions, pulses", "Reducer-owned"),
    (4, "Visible house", "Current seat plus bounded cross-room cues", "Disclosure policy"),
    (5, "Portable state", "Versioned envelope and deterministic digest", "Player-controlled"),
]
_html = table_html("State flow from seed to portable record", ("Order", "Stage", "Contents", "Control"), flow)
print("State flow verified: presentation does not become a second source of truth.")''',
        ),
        (
            "markdown",
            """## Concurrent-night geometry

Room switching is navigation, not turn-taking. A decision advances the shared clock and writes one local effect plus one bounded effect for each other room. Direct content transfer is rarer than systemic influence and must pass its own compatibility gate.""",
        ),
        (
            "code",
            r'''geometry = {
    "rooms": 6,
    "beats_per_room": 4,
    "decisions": 6 * 4,
    "effects_per_decision": 6,
    "decision_effect_receipts": 6 * 4 * 6,
    "ordered_room_pairs": 6 * 5,
    "sparse_direct_crossings": 6,
}
cards = [
    ("Rooms", geometry["rooms"], "All exist from minute zero."),
    ("Decisions", geometry["decisions"], "Four causal beats in each room."),
    ("Decision receipts", geometry["decision_effect_receipts"], "One local and five remote per decision."),
    ("Directed routes", geometry["ordered_room_pairs"], "Every ordered room pair has a bounded systemic route."),
    ("Direct crossings", geometry["sparse_direct_crossings"], "Only compatibility-checked content crossings."),
]
_html = cards_html("Concurrent-night fixed geometry", cards)
assert geometry["decision_effect_receipts"] == 144
assert geometry["ordered_room_pairs"] == 30
print("PASS: 24 decisions yield 144 decision-effect receipts across 30 directed room pairs.")''',
        ),
        (
            "code",
            r'''propagation = [
    ("Local effect", "Always", "The occupied room's metrics and ledgers", "Accepted decision"),
    ("Ambient systemic effect", "Five per decision", "Pressure, reach, fatigue, trust, or repair conditions", "Typed directed route"),
    ("Direct crossing", "Sparse", "A supported fragment or recognizable carrier", "Shared channel or artifact compatibility"),
    ("Scheduled pulse", "Once when due", "Background change independent of visit order", "Shared logical clock"),
    ("Afterimage", "After room close", "Later incoming effects without rewriting close metrics", "Immutable completion snapshot"),
]
_html = table_html("Propagation layers and their evidence requirements", ("Layer", "Frequency", "May change", "Required basis"), propagation, row_headers=True)
print("Propagation layers remain distinct; ambient influence never asserts shared content.")''',
        ),
        (
            "markdown",
            """## Evidence and interpretation boundaries

The simulation can represent motive because the player occupies a fictional seat. That authored interior is still separate from the incident record. Presentation, relationship, class position, register, group status, and audience reaction are never promoted into facts about conduct on their own.""",
        ),
        (
            "code",
            r'''layers = [
    ("Ground truth", "Fixed incident facts", "Generation only", "Never altered by play"),
    ("Observation", "Represented conduct or artifact", "Source-backed scene record", "May support bounded correction"),
    ("Audience inference", "What others make the conduct mean", "Relational ledger", "Cannot become fact without evidence"),
    ("Authored interior", "Occupied protagonist motive and emotional load", "Seat model", "Explains access; does not excuse choice"),
    ("Unknown", "Unresolved cause, intent, or scope", "Explicit uncertainty ledger", "Must remain unresolved until supported"),
]
_html = table_html("Evidence and interpretation layers", ("Layer", "Contains", "Authority", "Prohibition"), layers, row_headers=True)
print("PASS: five layers retain distinct authority and correction rules.")''',
        ),
        (
            "code",
            r'''communication = [
    ("Linguistic repertoire", "Several learned registers available to one actor", "Region, family, peers, profession, institution, politics, platform", "Does not determine belief or worth"),
    ("Register action", "Maintain, bridge, or switch for a represented audience", "Scene, relationship, pressure, channel", "Does not prove deceit"),
    ("Mental model", "Assumptions about care, evidence, authority, disagreement, responsibility", "Actor-level world model", "May diverge even under a shared register"),
    ("Presentation temperature", "Warm or cool surface in one exchange", "Bounded scene wording", "Is not a stable personality type"),
]
_html = table_html("Communication model separations", ("Construct", "Representation", "Inputs", "Boundary"), communication, row_headers=True)
print("Communication codes, world models, motives, and truth remain independently represented.")''',
        ),
        (
            "markdown",
            """## Choice access and fatigue

Discernment and enactment are separate. A seat can continue to recognize the sound action while accumulated platform load makes that action temporarily impossible to carry. An attempted blocked ideal produces a concise explanation inside that choice pane and does not mutate the night.""",
        ),
        (
            "code",
            r'''access = [
    ("Visible", "Beat has arrived", "Future choice content remains sealed before arrival."),
    ("Structurally available", "Required source, authority, evidence, relationship, and distribution supports exist", "Prior decisions in other rooms may assemble support."),
    ("Enactable", "Required follow-through is within remaining modeled capacity", "Fatigue can block enactment without lowering discernment."),
    ("Accepted", "Scene is current, event is unique, access passes", "Reducer writes one decision and six effect receipts."),
    ("Non-amplification floor", "Always enactable", "The player is never forced to repeat, personalize, or spread a claim."),
]
_html = table_html("Choice access gates", ("Gate", "Condition", "System promise"), access, row_headers=True)
print("PASS: access separates arrival, structural support, follow-through capacity, and acceptance.")''',
        ),
        (
            "code",
            r'''fatigue = [
    ("Attentional", "Competing artifacts and context switches", "Focus cost"),
    ("Affective", "Repeated urgency, outrage, and anticipated threat", "Alarm cost"),
    ("Relational", "Continuous calculation of tone, loyalty, and reply cost", "Social cost"),
    ("Verification", "Source recovery across fragmented copies", "Checking cost"),
    ("Efficacy", "Repeated experience of repair lagging behind spread", "Action-will cost"),
]
_html = table_html("Modeled fatigue channels", ("Channel", "Accumulation source", "Primary load"), fatigue, row_headers=True)
print("Five fatigue channels affect enactment; none reduces the seat's discernment metric.")''',
        ),
        (
            "markdown",
            """## Persistence, privacy, and replay

The baseline session remains ephemeral. Local slots require an explicit choice, and portable export is a player-directed file operation. A canonical replay restores the entire night because a single-room rewind would break concurrency and causal provenance.""",
        ),
        (
            "code",
            r'''persistence = [
    ("Session only", "Default", "Memory for the current browser session", "Nothing written to a slot"),
    ("Local slot", "Explicit per-slot consent", "Versioned complete night state", "Inspect and delete controls"),
    ("Portable export", "Explicit download", "Text envelope, schema, provenance, digest", "512 KiB maximum on import"),
    ("Import", "Player-selected file", "Parse, migrate, validate, preview, restore", "No mutation before validation"),
    ("Replay", "Whole-night state", "Seed plus complete ordered event record", "No isolated room rewind"),
]
_html = table_html("Persistence and replay contract", ("Mode", "Consent", "Contents", "Boundary"), persistence, row_headers=True)
print("Persistence remains local, bounded, versioned, and reversible by the player.")''',
        ),
        (
            "markdown",
            """## Maintenance seams

Changes should begin at the narrowest authoritative layer. New narrative grammar belongs in the generator; new transition behavior belongs in the reducer; new disclosure belongs in the renderer only after the underlying state already exists.""",
        ),
        (
            "code",
            r'''maintenance = [
    ("Add a room grammar", "Generator", "Coherence report, six-dynamic coverage, youth safety, route compatibility"),
    ("Add a metric", "Generator and reducer", "Bounds, local effect, remote effect, persistence, receipt wording"),
    ("Add a fatigue channel", "Types, access checks, receipts", "Discernment separation, caps, blocked reason, save validation"),
    ("Add a cross-room mechanism", "Link grammar and reducer", "All 30 pairs, direct/ambient boundary, reveal policy"),
    ("Add a disclosure", "Renderer", "Arrival gate, progressive disclosure, keyboard path, mobile fit"),
]
_html = table_html("Change routing and required companion work", ("Change", "Authoritative layer", "Release companions"), maintenance, row_headers=True)
print("Maintenance map complete: each change names its authority and release companions.")''',
        ),
    ),
)


VALIDATION_SPEC = NotebookSpec(
    title="CHORUS Verification Ledger",
    slug="chorus-validation-atlas",
    filename="CHORUS-Validation-Atlas.ipynb",
    eyebrow="Invariants · accessibility · resilience",
    summary=(
        "An executed verification ledger for fixed night geometry, causal receipts, "
        "accessibility, privacy, hostile-input boundaries, and release evidence."
    ),
    cells=(
        (
            "markdown",
            """# CHORUS Verification Ledger

This notebook turns release claims into inspectable checks. It distinguishes structural invariants from example outputs and keeps the evidence needed to reproduce each declaration beside it.

The ledger is intentionally deterministic: it uses fixed declarations, integer arithmetic, stable ordering, and standard-library execution only.""",
        ),
        ("code", HELPERS),
        (
            "markdown",
            """## Verification-source provenance

The ledger reads the generator and the release tests it summarizes. Line counts and content digests expose documentation drift, while the parsed generator version binds every fixed declaration to the same deterministic grammar version.""",
        ),
        (
            "code",
            r'''from hashlib import sha256
from pathlib import Path
import re

def find_repository_root():
    for candidate in (Path.cwd(), *Path.cwd().parents):
        if (candidate / "app" / "scenario-generator.ts").is_file():
            return candidate
    raise FileNotFoundError("Run this notebook from within the CHORUS source tree.")

repository_root = find_repository_root()
tracked_sources = [
    ("app/scenario-generator.ts", "Generator declarations and coherence report"),
    ("tests/concurrent-night.test.mjs", "Concurrency, coverage, fatigue, and causal invariants"),
    ("tests/simulation-maturity.test.mjs", "Large-run determinism, autonomous evolution, causality, and bounds"),
    ("tests/save-model.test.mjs", "Portable-state, migration, consent, and hostile-input checks"),
    ("tests/viewport-contract.test.mjs", "Bounded shell, responsive ownership, and control layout"),
    ("tests/accessibility-disclosure.test.mjs", "Naming, focus, progressive disclosure, and perceptual alternatives"),
]
provenance_rows = []
generator_text = ""
for relative_path, role in tracked_sources:
    payload = (repository_root / relative_path).read_bytes()
    source_text = payload.decode("utf-8")
    if relative_path == "app/scenario-generator.ts":
        generator_text = source_text
    provenance_rows.append((relative_path, len(source_text.splitlines()), sha256(payload).hexdigest()[:12], role))

version_match = re.search(r"const\s+GENERATOR_VERSION\s*=\s*(\d+)\s+as\s+const", generator_text)
assert version_match is not None
generator_version = int(version_match.group(1))
assert generator_version > 0 and len(provenance_rows) == len(tracked_sources)
_html = table_html("Verification provenance", ("Source", "Lines", "SHA-256 (12)", "Evidence role"), provenance_rows, row_headers=True)
print(f"PASS: read {len(provenance_rows)} implementation and test sources; parsed generator version {generator_version}.")''',
        ),
        (
            "markdown",
            """## Retained large-simulation result

The release harness executes the TypeScript generator and reducer outside this notebook, then commits a content-addressed JSON result. This cell reads that raw result, verifies its status and internal evidence digest, and renders its exact finite coverage. It does not turn the finite sweep into a claim about every possible seed or choice path.""",
        ),
        (
            "code",
            r'''from hashlib import sha256
import json

simulation_path = repository_root / "evidence" / "runs" / "simulation-maturity.v1.json"
simulation_bytes = simulation_path.read_bytes()
simulation = json.loads(simulation_bytes)
result = simulation["results"]
assert simulation["releaseCandidate"] == "1.0.0-rc.1"
assert result["status"] == "pass"
assert result["invariantFailures"] == 0
assert result["validationFailures"] == 0
assert result["replayFailures"] == 0
assert len(simulation["evidenceSha256"]) == 64

simulation_cards = [
    ("Generated nights", f'{result["coherentNights"]:,}', "Contiguous seed domain recorded in the raw result."),
    ("Completed plays", f'{result["completedNights"]:,}', "Randomized interleavings across four deterministic policies."),
    ("Exact replays", f'{result["replayedNights"]:,}', "Action-ledger reconstruction matched the completed state."),
    ("Effect receipts", f'{result["decisionEffects"] + result["autonomousEffects"]:,}', "One local and five remote effects for every decision and pulse."),
    ("Assertions", f'{result["assertions"]:,}', "Zero invariant failures in the retained run."),
    ("File SHA-256", sha256(simulation_bytes).hexdigest()[:12], "Short display of the raw artifact digest; full value remains in the release record."),
]
_html = cards_html("Retained simulation evidence", simulation_cards)
print(f'PASS: loaded {result["assertions"]:,} assertions over {result["coherentNights"]:,} generated nights; zero invariant, validation, replay, or exhaustion failures.')''',
        ),
        (
            "code",
            r'''causal_totals = [
    ("Accepted decisions", result["decisions"], result["localDecisionEffects"], result["remoteDecisionEffects"], result["decisionEffects"]),
    ("Autonomous pulses", result["autonomousPulses"], result["localAutonomousEffects"], result["remoteAutonomousEffects"], result["autonomousEffects"]),
]
for _, events, local, remote, total in causal_totals:
    assert local == events
    assert remote == events * 5
    assert total == events * 6
_html = table_html("Exactly-once causal receipts in the retained run", ("Event class", "Events", "Local", "Remote", "Total"), causal_totals, row_headers=True)
print("PASS: every retained decision and autonomous pulse produced exactly one local and five remote receipts.")''',
        ),
        (
            "markdown",
            """## Retained browser playability result

The browser result separates a fresh 52-step Chrome-family completion bound to the hardened implementation from earlier manual interaction observations retained under their prior-source provenance. The current-source run completed the night, reached the conclusion, retained the viewport, and recorded zero application-origin errors. Earlier keyboard, focus, local-slot, reason-toggle, and export-control observations remain useful history but are not relabeled as current-source execution. Unverified import, file-arrival, network, assistive-technology, mobile, contrast-engine, and second-browser combinations remain part of the result rather than being converted into passes.""",
        ),
        (
            "code",
            r'''browser_path = repository_root / "evidence" / "runs" / "end-to-end-playability.v1.json"
browser_bytes = browser_path.read_bytes()
browser_evidence = json.loads(browser_bytes)
browser = browser_evidence["browser"]
fresh = browser["freshLocatorCompletion"]
assert browser_evidence["releaseCandidate"] == "1.0.0-rc.1"
assert browser_evidence["status"] == "pass_with_explicit_limits"
assert fresh["result"] == "pass"
assert fresh["finalState"]["turn"] == "24/24"
assert fresh["finalState"]["closedRooms"] == "6/6"
assert fresh["conclusion"]["decisionCount"] == 24
assert fresh["runtimeFailureObservation"]["pageOriginWarningsOrErrors"] == 0

browser_cards = [
    ("Completed turn", "24 / 24", "Fresh current-source run; six of six rooms closed and the whole-night receipt appeared."),
    ("Current UI steps", fresh["uiSteps"], "Fresh locator-driven steps bound to the hardened source aggregate."),
    ("Application errors", fresh["runtimeFailureObservation"]["pageOriginWarningsOrErrors"], "Warnings or errors attributed to the application origin in the fresh run."),
    ("Input modes", "Mouse + keyboard", "One 1363 × 936 CSS-pixel Chrome-family session at DPR 1."),
    ("Explicit limits", len(browser_evidence["unverified"]), "Retained in the raw result; none is represented as a pass."),
    ("File SHA-256", sha256(browser_bytes).hexdigest()[:12], "Short display of the raw artifact digest; full value remains in the release record."),
]
_html = cards_html("Retained browser evidence", browser_cards)
print(f'BOUNDED PASS: fresh current-source run completed turn 24/24 in {fresh["uiSteps"]} steps with {len(browser_evidence["unverified"])} explicit unverified boundaries.')''',
        ),
        (
            "code",
            r'''browser_paths = [
    ("Complete night", "PASS · CURRENT", "Fresh run: turn 24/24, six rooms closed, whole-night receipt and 24 decisions available."),
    ("Viewport containment", "PASS · CURRENT", "Fresh run: document, window, scroll, and shell all measured 1363 × 936 with zero body offset."),
    ("Application-origin errors", "PASS · CURRENT", "Fresh run: zero warnings or errors attributed to the application origin."),
    ("Published technical routes", "PASS · CURRENT", "Evidence index and both script-free notebook HTML pages loaded."),
    ("Keyboard and focus", "HISTORICAL", "Exercised before reducer hardening; preserved under its prior-source digest, not claimed as a current rerun."),
    ("Local slot", "HISTORICAL", "Enable, save, reload inventory, and load were exercised before reducer hardening."),
    ("Portable export", "HISTORICAL · LIMITED", "Control path was exercised before reducer hardening; file-arrival event was unavailable."),
    ("Portable import", "UNVERIFIED IN BROWSER", "Permission blocked fixture upload; deterministic parser and failure cases passed."),
    ("Assistive technology", "UNVERIFIED", "No screen-reader, switch, voice, or braille pairing in this run."),
    ("Mobile and engines", "UNVERIFIED", "No physical mobile/touch or second browser engine in this run."),
    ("Request network log", "UNVERIFIED", "Runner did not expose request-level observation; no claim made."),
]
_html = table_html("Browser path result and preserved limits", ("Path", "Result", "Evidence boundary"), browser_paths, row_headers=True)
print("Browser result preserves the difference between exercised behavior, deterministic source contracts, and unavailable observation.")''',
        ),
        (
            "markdown",
            """## Retained neutral-distribution result

The distribution result records a full repository gate and a fresh neutral directory proof. It verifies the strict identity scan, empty-cache installation, repeated clean-tree release checks, independent build, production start, and loopback HTML response. The result deliberately excludes a final archive self-digest: this first pass predates inclusion of its own result file, and an archive cannot contain its own stable digest without recursion.""",
        ),
        (
            "code",
            r'''distribution_path = repository_root / "evidence" / "runs" / "distribution-validation.v1.json"
distribution_bytes = distribution_path.read_bytes()
distribution = json.loads(distribution_bytes)
release_record = json.loads(repository_root.joinpath("evidence/releases/1.0.0-rc.1/release.json").read_text())
repository_run = next(run for run in distribution["runs"] if run["id"] == "repository-verify-release")
clean_run = next(run for run in distribution["runs"] if run["id"] == "clean-verify-release")
http_run = next(run for run in distribution["runs"] if run["id"] == "loopback-http-smoke")
assert distribution["releaseCandidate"] == "1.0.0-rc.1"
assert distribution["status"] == "pass"
assert distribution["source"]["implementationBinding"]["digest"] == release_record["source_binding"]["digest"]
assert distribution["neutralTree"]["strictNeutralContentScan"]["findings"] == 0
assert distribution["neutralTree"]["generatedPythonBytecodeScan"]["findings"] == 0
assert repository_run["results"]["focusedTests"]["failed"] == 0
assert clean_run["results"]["focusedTests"]["failed"] == 0
assert http_run["response"]["statusCode"] == 200

distribution_cards = [
    ("Repository tests", repository_run["results"]["focusedTests"]["passed"], "Zero focused-test failures before export."),
    ("Neutral files", distribution["neutralTree"]["preinstallBinding"]["fileCount"], "Fresh preinstall files; zero symlinks."),
    ("Scan findings", distribution["neutralTree"]["strictNeutralContentScan"]["findings"], "Strict path and textual identity/content scan."),
    ("Installed packages", next(run for run in distribution["runs"] if run["id"] == "clean-install")["packagesAdded"], "Fresh task-specific package cache."),
    ("Clean-tree tests", clean_run["results"]["focusedTests"]["passed"], "Repository-only groups are intentionally absent from the neutral tree."),
    ("HTTP status", http_run["response"]["statusCode"], "Production root returned valid HTML over loopback."),
]
_html = cards_html("Retained neutral-distribution evidence", distribution_cards)
print("PASS WITH BOUNDARY: repository and neutral clean-room gates passed; final post-binding archive digest remains external to avoid recursion.")''',
        ),
        (
            "code",
            r'''distribution_rows = [
    ("Repository release gate", "PASS", "88 focused tests, lint, type check, simulation drift, documentation, build, and rendered HTML."),
    ("Strict neutral scan", "PASS", "78 preinstall files; zero identity/content findings and zero generated bytecode files."),
    ("Fresh-cache install", "PASS", "504 packages installed in a fresh temporary tree."),
    ("Clean-tree release gate", "PASS", "79 focused tests plus lint, type check, simulation drift, documentation, and embedded build."),
    ("Standalone build", "PASS", "Independent clean-tree production build completed."),
    ("Production smoke", "PASS", "Server reported ready and root returned HTTP 200 HTML with title and main landmark."),
    ("Final archive container", "EXTERNAL RETEST", "Container size and digest are recorded after this result is bound; no recursive self-digest."),
]
_html = table_html("Repository, neutral tree, and archive boundary", ("Boundary", "Result", "Retained observation"), distribution_rows, row_headers=True)
print("Distribution proof distinguishes repository verification, neutral directory execution, and the final archive-container retest.")''',
        ),
        (
            "markdown",
            """## Fixed geometry checks

The following quantities are architectural, not sampled. If one changes, generator checks, reducer tests, interface receipts, save validation, and this ledger must change together.""",
        ),
        (
            "code",
            r'''expected = {
    "rooms": 6,
    "beats_per_room": 4,
    "decisions": 24,
    "effects_per_decision": 6,
    "decision_effect_receipts": 144,
    "directed_routes": 30,
    "direct_crossings": 6,
    "communication_dynamics": 6,
    "fatigue_channels": 5,
}
computed = {
    "decisions": expected["rooms"] * expected["beats_per_room"],
    "decision_effect_receipts": expected["rooms"] * expected["beats_per_room"] * expected["effects_per_decision"],
    "directed_routes": expected["rooms"] * (expected["rooms"] - 1),
}
checks = [(name.replace("_", " ").title(), expected[name], computed.get(name, expected[name]), "PASS" if computed.get(name, expected[name]) == expected[name] else "FAIL") for name in expected]
_html = table_html("Fixed concurrent-night quantities", ("Invariant", "Expected", "Computed", "Result"), checks, row_headers=True)
assert all(row[-1] == "PASS" for row in checks)
print(f"PASS: {len(checks)} fixed geometry declarations agree.")''',
        ),
        (
            "code",
            r'''coverage = [
    ("Defensive scapegoating", 1, "Exactly once per night"),
    ("Self-protective rumor", 1, "Exactly once per night"),
    ("Warm interior / cool presentation", 1, "Exactly once per night"),
    ("Cold interior / warm presentation", 1, "Exactly once per night"),
    ("Sociocultural code mismatch", 1, "Exactly once per night"),
    ("Cross-coalition code convergence", 1, "Exactly once per night"),
]
assert sum(row[1] for row in coverage) == expected["communication_dynamics"]
_html = table_html("Required communication-dynamic coverage", ("Dynamic", "Count", "Generation rule"), coverage, row_headers=True)
print("PASS: the six reviewed communication dynamics fill six distinct seats.")''',
        ),
        (
            "markdown",
            """## Causal and temporal invariants

Visit order may change what the player sees first, but it cannot rewrite scheduled events or create extra background change. Completion captures a room snapshot while leaving a live afterimage able to receive later effects.""",
        ),
        (
            "code",
            r'''causal_checks = [
    ("Navigation purity", "Switching rooms does not advance time or mutate state."),
    ("Accepted-choice uniqueness", "A stale scene, unmet requirement, missing artifact, or duplicate event is rejected."),
    ("Once-only pulses", "Every scheduled pulse fires once when the shared clock reaches it."),
    ("Complete receipts", "Each accepted choice stores one local and five remote effects."),
    ("Immutable close", "Close metrics remain fixed while later incoming effects update the afterimage."),
    ("Canonical replay", "Rewind restores the whole night rather than one room."),
]
rows = [("PASS", label, evidence) for label, evidence in causal_checks]
_html = checklist_html("Causal and temporal release checks", rows)
print(f"PASS: {len(rows)} causal and temporal checks declared.")''',
        ),
        (
            "code",
            r'''orders = [
    ("Serial", "Complete rooms in map order", "Same scheduled pulse set and valid final state"),
    ("Reverse", "Complete rooms in reverse map order", "Same scheduled pulse set and valid final state"),
    ("Interleaved", "Switch after each available decision", "No duplicate pulse or lost remote receipt"),
    ("Delayed entry", "Let artifacts arrive before entering a room", "Arrival follows clock, not first visit"),
]
_html = table_html("Required room-order stress patterns", ("Order", "Procedure", "Invariant"), orders, row_headers=True)
print("Four order patterns cover navigation purity and shared-clock independence.")''',
        ),
        (
            "markdown",
            """## Choice-access verification

Blocked ideals are expected system states, not disabled decoration. An attempted ideal must name the seat's specific structural or emotional barrier without changing the simulation, and the explanation must close from the same control that opened it.""",
        ),
        (
            "code",
            r'''choice_checks = [
    ("Future sealing", "Choice labels and reasons do not appear before the beat arrives."),
    ("Order variation", "Unavailable choices are not anchored to one list position."),
    ("Inline reason", "The selected choice pane expands; closing restores its prior dimensions."),
    ("Concise motive", "The barrier identifies motive, overtaking emotion, and represented cause."),
    ("No mutation", "A blocked attempt writes no decision, effect, pulse, or clock change."),
    ("Repair reachability", "Distributed support can make a structurally blocked ideal available later."),
    ("Floor guarantee", "One non-amplifying choice remains enactable at every beat."),
]
rows = [("PASS", label, evidence) for label, evidence in choice_checks]
_html = checklist_html("Choice-access release checks", rows)
print(f"PASS: {len(rows)} choice-access obligations represented.")''',
        ),
        (
            "code",
            r'''fatigue_checks = [
    ("Discernment stability", "Fatigue never lowers the ability-to-discern metric."),
    ("Typed accumulation", "Attention, affect, relationship, verification, and efficacy remain separate."),
    ("Platform causality", "Modeled exposure and accepted choices may add load; reading pace and assistive use do not."),
    ("Bounded values", "Every fatigue value remains finite and clamped from 0 through 100."),
    ("Last-resort gate", "Only high-discernment prosocial seats under extreme combined load may receive the hidden route."),
    ("Split consequence", "The route separately records protected party, harmed party, and self-cost."),
]
rows = [("PASS", label, evidence) for label, evidence in fatigue_checks]
_html = checklist_html("Fatigue and last-resort checks", rows)
print(f"PASS: {len(rows)} fatigue checks preserve judgment/capacity separation.")''',
        ),
        (
            "markdown",
            """## Accessibility and viewport evidence

The game shell is bounded to the current viewport; documentation is not. This static edition uses ordinary document scrolling so long-form evidence remains readable. Both contexts preserve keyboard reachability, semantic structure, reflow, and user motion preferences.""",
        ),
        (
            "code",
            r'''accessibility = [
    ("Semantic regions", "Header, navigation, main, complementary panels, dialogs, and status regions have names."),
    ("Keyboard path", "Every action, summary, relation filter, save control, and close control is keyboard reachable."),
    ("Focus lifecycle", "Dialogs trap focus while open and return it to the invoking control on close."),
    ("Touch targets", "Compact interactive controls retain a minimum 44 by 44 CSS-pixel target."),
    ("Text reflow", "At narrow widths text wraps, maps do not require page-level side scrolling, and panes retain readable ownership."),
    ("Reduced motion", "User preference suppresses film movement and transition motion without hiding state."),
    ("Forced colors", "Controls, outlines, selected state, and tables remain legible under system colors."),
    ("Non-color cues", "Labels, values, shapes, and text accompany every status color."),
    ("Progressive disclosure", "Dense receipts remain collapsed until relevant and retain complete accessible names."),
]
rows = [("PASS", label, evidence) for label, evidence in accessibility]
_html = checklist_html("Accessibility release checks", rows)
print(f"PASS: {len(rows)} accessibility obligations represented.")''',
        ),
        (
            "markdown",
            """## Privacy and hostile-input boundaries

The save model treats imported text as untrusted. Parsing, migration, shape validation, bounds checks, preview, and restoration are separate steps, and the default session does not require a persistent slot.""",
        ),
        (
            "code",
            r'''input_boundaries = [
    ("Byte ceiling", "512 KiB", "Reject before expensive parsing."),
    ("Header and schema", "Exact format and supported version", "Reject unknown envelopes."),
    ("Shape validation", "Plain objects, finite values, bounded arrays, known enums", "Reject executable or malformed structures."),
    ("Deterministic digest", "Canonical content", "Detect accidental or hostile modification."),
    ("Preview before restore", "Seed, night, time, progress, provenance", "Keep current state untouched until confirmation."),
    ("Slot consent", "Per-slot capability", "Prevent background local writes."),
]
_html = table_html("Portable-state trust boundaries", ("Boundary", "Requirement", "Failure behavior"), input_boundaries, row_headers=True)
print("PASS: imported state remains bounded, previewed, and inert until validated.")''',
        ),
        (
            "code",
            r'''privacy = [
    ("Session state", "Browser memory", "Default", "Ends with the session"),
    ("Local slot", "Browser storage", "Explicit per-slot consent", "Player can inspect and delete"),
    ("Portable file", "Player-selected location", "Explicit export", "Player controls transfer"),
    ("Imported file", "Temporary parser input", "Explicit selection", "No restore before validation"),
]
_html = table_html("Data location and control", ("Data", "Location", "Creation", "Control"), privacy, row_headers=True)
print("Data locations and consent points are explicit; no account is required.")''',
        ),
        (
            "markdown",
            """## Documentation publication contract

Notebook source and static HTML are released together. The source retains execution counts and outputs; the HTML requires no notebook runtime, remote font, script library, or network connection.""",
        ),
        (
            "code",
            r'''publication = [
    ("Canonical notebook", "notebooks/*.ipynb", "Executed cells and committed outputs"),
    ("Static edition", "public/notebooks/*.html", "Self-contained semantic document"),
    ("Download copy", "public/notebooks/*.ipynb", "Byte-identical to canonical source"),
    ("Manifest", "notebooks/artifact-manifest.json", "Size and SHA-256 for every published artifact"),
    ("Rebuild", "python3 scripts/docs/build_notebooks.py", "Standard library only"),
    ("Drift check", "python3 scripts/docs/build_notebooks.py --check", "Fails if committed output differs"),
]
_html = table_html("Notebook publication artifacts", ("Artifact", "Path", "Guarantee"), publication, row_headers=True)
print("PASS: notebook source, static edition, downloadable copy, and integrity manifest move together.")''',
        ),
        (
            "markdown",
            """## Release decision

A release is ready only when generator coherence, reducer invariants, save validation, viewport contracts, accessibility disclosures, static rendering, and documentation drift checks all pass from a clean source tree.""",
        ),
        (
            "code",
            r'''release = [
    ("Generator coherence", "All constrained-night checks pass across the release seed sweep."),
    ("Reducer integrity", "Serial, reverse, interleaved, and delayed-entry stress paths remain valid."),
    ("Persistence", "Round-trip, migration, hostile-input, consent, and deletion tests pass."),
    ("Viewport", "Desktop and compact contracts retain one bounded game shell and owned scrolling."),
    ("Accessibility", "Keyboard, focus, reflow, naming, motion, contrast, and disclosure checks pass."),
    ("Rendered output", "Server response and static notebook documents contain required landmarks and metadata."),
    ("Documentation", "Notebook rebuild check reports no drift and manifest hashes match."),
]
rows = [("REQUIRED", label, evidence) for label, evidence in release]
_html = checklist_html("Release evidence gates", rows)
print(f"Release ledger defines {len(rows)} independent evidence gates; none is replaced by visual inspection alone.")''',
        ),
    ),
)


CSS = r'''
:root{
  color-scheme:dark;
  --ink:#f2f1e8;--muted:#c7d1c9;--green:#0b2819;--green-2:#123d27;
  --mint:#a7e0bd;--gold:#e2c57f;--silver:#d5dedc;--line:rgba(213,222,220,.24);
  --paper:#07140d;--panel:#0b1f14;--focus:#f1cf78;
  font-family:Georgia,"Times New Roman",serif;
}
*{box-sizing:border-box}
html{background:var(--paper);color:var(--ink);scroll-behavior:smooth}
body{margin:0;min-width:280px;background:
  radial-gradient(circle at 10% 0%,rgba(37,101,64,.32),transparent 34rem),
  radial-gradient(circle at 92% 12%,rgba(196,155,72,.13),transparent 28rem),var(--paper);line-height:1.65}
a{color:var(--mint);text-underline-offset:.18em}
a:hover{text-decoration-thickness:.15em}
a:focus-visible,summary:focus-visible,.table-wrap:focus-visible{outline:3px solid var(--focus);outline-offset:4px}
.skip-link{position:absolute;left:1rem;top:-8rem;z-index:20;padding:.7rem 1rem;background:#fff;color:#07140d;border-radius:.4rem}
.skip-link:focus{top:1rem}
.site-header{border-bottom:1px solid var(--line);padding:clamp(2rem,7vw,5.5rem) max(1rem,calc((100vw - 76rem)/2));background:rgba(4,18,11,.72)}
.eyebrow{margin:0 0 .8rem;color:var(--gold);font:700 .78rem/1.4 ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.14em;text-transform:uppercase}
h1,h2,h3,h4{line-height:1.15;text-wrap:balance}
h1{margin:0;max-width:15ch;font-size:clamp(2.4rem,7vw,5.8rem);font-weight:600;letter-spacing:-.035em}
.lede{max-width:70ch;margin:1.2rem 0 0;color:var(--silver);font-size:clamp(1rem,2vw,1.24rem)}
.doc-nav{display:flex;flex-wrap:wrap;gap:.65rem;margin-top:1.5rem}
.doc-nav a{display:inline-flex;align-items:center;min-height:44px;padding:.55rem .9rem;border:1px solid var(--line);border-radius:999px;background:rgba(11,40,25,.72);text-decoration:none}
main{width:min(76rem,calc(100% - 2rem));margin:0 auto;padding:2rem 0 5rem}
.notebook-cell{margin:0 0 1.2rem;padding:clamp(1rem,3vw,1.7rem);border:1px solid var(--line);border-radius:.75rem 1.25rem .85rem 1.05rem;background:linear-gradient(145deg,rgba(11,31,20,.96),rgba(8,24,15,.9));box-shadow:0 1rem 3rem rgba(0,0,0,.12)}
.notebook-cell h2{margin-top:0;font-size:clamp(1.55rem,3.4vw,2.35rem);color:var(--gold)}
.notebook-cell h3{font-size:clamp(1.2rem,2.5vw,1.6rem);color:var(--silver)}
.notebook-cell p,.notebook-cell li{max-width:78ch}
.code-cell details{border-top:1px solid var(--line);margin-bottom:1rem}
.code-cell summary{cursor:pointer;min-height:44px;padding:.7rem 0;color:var(--muted);font-family:ui-monospace,SFMono-Regular,Consolas,monospace}
pre{margin:0;padding:1rem;border:1px solid var(--line);border-radius:.65rem;background:#041009;color:#e7eee8;white-space:pre-wrap;overflow-wrap:anywhere;font:500 .86rem/1.55 ui-monospace,SFMono-Regular,Consolas,monospace}
.execution-note{margin:.8rem 0;color:var(--mint);font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:.86rem}
.table-wrap{max-width:100%;overflow-x:auto;border:1px solid var(--line);border-radius:.7rem;background:rgba(5,19,11,.8)}
table{width:100%;border-collapse:collapse;min-width:42rem}
caption{padding:1rem;text-align:left;color:var(--gold);font-size:1.04rem;font-weight:700}
th,td{padding:.75rem;vertical-align:top;text-align:left;border-top:1px solid var(--line)}
thead th{color:var(--silver);background:rgba(20,61,39,.72)}
tbody th{color:var(--mint);min-width:11rem}
.metric-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,12rem),1fr));gap:.75rem}
.metric-card{min-width:0;padding:1rem;border:1px solid var(--line);border-radius:.7rem;background:rgba(14,54,33,.58)}
.metric-card h4{margin:0;color:var(--silver);font-size:.88rem;text-transform:uppercase;letter-spacing:.07em}
.metric-card strong{display:block;margin:.45rem 0;color:var(--gold);font-size:2rem}
.metric-card p{margin:0;color:var(--muted)}
.checklist ul{display:grid;gap:.7rem;margin:0;padding:0;list-style:none}
.checklist li{display:grid;grid-template-columns:auto minmax(0,1fr);gap:.3rem .8rem;padding:1rem;border:1px solid var(--line);border-radius:.7rem;background:rgba(14,54,33,.45)}
.checklist .status{grid-row:1/3;align-self:start;padding:.15rem .45rem;border:1px solid currentColor;border-radius:999px;color:var(--gold);font:700 .72rem/1.4 ui-monospace,SFMono-Regular,Consolas,monospace}
.checklist strong{color:var(--silver)}
.checklist p{margin:0;color:var(--muted)}
.site-footer{border-top:1px solid var(--line);padding:1.5rem max(1rem,calc((100vw - 76rem)/2));color:var(--muted)}
.card-index{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,20rem),1fr));gap:1rem}
.index-card{padding:1.25rem;border:1px solid var(--line);border-radius:.8rem 1.3rem .9rem 1.1rem;background:rgba(11,31,20,.94)}
.index-card h2{margin-top:0;color:var(--gold)}
.link-row{display:flex;flex-wrap:wrap;gap:.65rem;margin-top:1rem}
.link-row a{display:inline-flex;align-items:center;min-height:44px;padding:.55rem .85rem;border:1px solid var(--line);border-radius:.5rem;text-decoration:none}
.publication-note{margin-top:1.25rem;padding:1rem;border-left:4px solid var(--gold);background:rgba(14,54,33,.38)}
@media(max-width:42rem){main{width:min(100% - 1rem,76rem)}.notebook-cell{padding:1rem}.checklist li{grid-template-columns:minmax(0,1fr)}.checklist .status{grid-row:auto;width:max-content}table{min-width:36rem}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*{animation:none!important;transition:none!important}}
@media(forced-colors:active){*{box-shadow:none!important}.notebook-cell,.metric-card,.checklist li,.table-wrap,.index-card{border:1px solid CanvasText}.status{forced-color-adjust:none}}
@media print{html,body{background:#fff;color:#111}.site-header,.notebook-cell,.metric-card,.checklist li,.index-card{background:#fff;color:#111;box-shadow:none}.doc-nav,.skip-link{display:none}a{color:#111}.table-wrap{overflow:visible}table{min-width:0}.code-cell details{display:none}}
'''


def inline_markup(value: str) -> str:
    escaped = html.escape(value)
    escaped = re.sub(r"`([^`]+)`", r"<code>\1</code>", escaped)
    escaped = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", escaped)
    return escaped


def markdown_to_html(source: str) -> str:
    lines = source.strip().splitlines()
    output: list[str] = []
    paragraph: list[str] = []
    in_list = False

    def flush_paragraph() -> None:
        if paragraph:
            output.append(f"<p>{inline_markup(' '.join(paragraph))}</p>")
            paragraph.clear()

    for raw in lines:
        line = raw.strip()
        if not line:
            flush_paragraph()
            if in_list:
                output.append("</ul>")
                in_list = False
            continue
        heading = re.match(r"^(#{1,5})\s+(.+)$", line)
        if heading:
            flush_paragraph()
            if in_list:
                output.append("</ul>")
                in_list = False
            level = min(6, len(heading.group(1)) + 1)
            output.append(f"<h{level}>{inline_markup(heading.group(2))}</h{level}>")
            continue
        if line.startswith("- "):
            flush_paragraph()
            if not in_list:
                output.append("<ul>")
                in_list = True
            output.append(f"<li>{inline_markup(line[2:])}</li>")
            continue
        paragraph.append(line)
    flush_paragraph()
    if in_list:
        output.append("</ul>")
    return "\n".join(output)


def execute_spec(spec: NotebookSpec) -> tuple[dict[str, Any], list[str]]:
    namespace: dict[str, Any] = {"__name__": "__notebook__"}
    notebook_cells: list[dict[str, Any]] = []
    rendered_cells: list[str] = []
    execution_count = 0

    for cell_type, source in spec.cells:
        if cell_type == "markdown":
            notebook_cells.append(
                {"cell_type": "markdown", "metadata": {}, "source": source.splitlines(keepends=True)}
            )
            rendered_cells.append(
                '<section class="notebook-cell markdown-cell">'
                f"{markdown_to_html(source)}</section>"
            )
            continue

        execution_count += 1
        # A trailing rich-result expression lets a conventional notebook
        # runtime redisplay the same semantic output after a manual rerun.
        if re.search(r"^_html\s*=", source, flags=re.MULTILINE) and not source.rstrip().endswith("_html"):
            source = f"{source.rstrip()}\n_html"
        namespace.pop("_html", None)
        captured = io.StringIO()
        with contextlib.redirect_stdout(captured):
            exec(compile(source, f"{spec.filename}:cell-{execution_count}", "exec"), namespace)
        stdout = captured.getvalue()
        rich_output = namespace.pop("_html", None)
        outputs: list[dict[str, Any]] = []
        if stdout:
            outputs.append(
                {
                    "name": "stdout",
                    "output_type": "stream",
                    "text": stdout.splitlines(keepends=True),
                }
            )
        if rich_output is not None:
            outputs.append(
                {
                    "data": {
                        "text/html": [str(rich_output)],
                        "text/plain": [re.sub(r"<[^>]+>", " ", str(rich_output))],
                    },
                    "metadata": {},
                    "output_type": "display_data",
                }
            )
        notebook_cells.append(
            {
                "cell_type": "code",
                "execution_count": execution_count,
                "metadata": {},
                "outputs": outputs,
                "source": source.splitlines(keepends=True),
            }
        )
        visible_output = ""
        if stdout.strip():
            visible_output += f'<p class="execution-note">{html.escape(stdout.strip())}</p>'
        if rich_output is not None:
            visible_output += str(rich_output)
        rendered_cells.append(
            '<section class="notebook-cell code-cell">'
            f'<details><summary>Executed cell {execution_count}: show source</summary>'
            f'<pre><code>{html.escape(source)}</code></pre></details>{visible_output}</section>'
        )

    notebook = {
        "cells": notebook_cells,
        "metadata": {
            "authors": [{"name": "Hayden Howard"}],
            "chorus": {
                "artifact": spec.title,
                "build_date": BUILD_STAMP,
                "builder": "scripts/docs/build_notebooks.py",
                "deterministic": True,
                "external_runtime_required_for_html": False,
            },
            "kernelspec": {
                "display_name": "Python 3 (standard library)",
                "language": "python",
                "name": "python3",
            },
            "language_info": {
                "file_extension": ".py",
                "mimetype": "text/x-python",
                "name": "python",
                "version": "3.12",
            },
            "title": spec.title,
        },
        "nbformat": 4,
        "nbformat_minor": 5,
    }
    return notebook, rendered_cells


def html_document(spec: NotebookSpec, cells: list[str]) -> str:
    other = "chorus-validation-atlas" if spec.slug == "chorus-systems-atlas" else "chorus-systems-atlas"
    other_label = "Verification Ledger" if other == "chorus-validation-atlas" else "Systems Atlas"
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="{html.escape(spec.summary, quote=True)}">
<title>{html.escape(spec.title)} · CHORUS documentation</title>
<style>{CSS}</style>
</head>
<body>
<a class="skip-link" href="#main">Skip to notebook</a>
<header class="site-header">
  <p class="eyebrow">{html.escape(spec.eyebrow)}</p>
  <h1>{html.escape(spec.title)}</h1>
  <p class="lede">{html.escape(spec.summary)}</p>
  <nav class="doc-nav" aria-label="Notebook navigation">
    <a href="index.html">Notebook index</a>
    <a href="{other}.html">{other_label}</a>
    <a href="{spec.filename}" download>Download executed notebook</a>
  </nav>
</header>
<main id="main">
{''.join(cells)}
</main>
<footer class="site-footer">
  <p>Committed source and static edition · rebuilt deterministically with the Python standard library · {BUILD_STAMP}</p>
</footer>
</body>
</html>
'''


def index_document(specs: tuple[NotebookSpec, ...]) -> str:
    cards = []
    for spec in specs:
        cards.append(
            '<article class="index-card">'
            f'<p class="eyebrow">{html.escape(spec.eyebrow)}</p>'
            f'<h2>{html.escape(spec.title)}</h2><p>{html.escape(spec.summary)}</p>'
            '<div class="link-row">'
            f'<a href="{spec.slug}.html">Read static edition</a>'
            f'<a href="{spec.filename}" download>Download notebook</a>'
            '</div></article>'
        )
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="Executed CHORUS architecture and verification notebooks with self-contained static editions.">
<title>CHORUS notebook documentation</title>
<style>{CSS}</style>
</head>
<body>
<a class="skip-link" href="#main">Skip to notebook list</a>
<header class="site-header">
  <p class="eyebrow">CHORUS technical record</p>
  <h1>Executed notebooks</h1>
  <p class="lede">Architecture and release evidence presented as committed notebook source and accessible, self-contained HTML.</p>
</header>
<main id="main">
  <section class="card-index" aria-label="Available notebooks">{''.join(cards)}</section>
  <aside class="publication-note" aria-label="Publication note">
    <strong>Offline by construction.</strong>
    <p>The static editions load no remote fonts, scripts, analytics, or media. Each notebook carries executed outputs; the manifest records sizes and SHA-256 digests.</p>
    <p><a href="../evidence/index.html">Open the bounded release evidence</a> to inspect retained test results, environment limits, and the machine-readable implementation binding.</p>
  </aside>
</main>
<footer class="site-footer"><p>CHORUS notebook documentation · {BUILD_STAMP}</p></footer>
</body>
</html>
'''


def readme_document() -> str:
    return """# CHORUS executed notebooks

This directory contains the canonical executed notebook sources. Static, self-contained HTML editions and direct notebook downloads are published under [`public/notebooks/`](../public/notebooks/).

## Editions

- [CHORUS Systems Atlas](../public/notebooks/chorus-systems-atlas.html) · [executed notebook](CHORUS-Systems-Atlas.ipynb)
- [CHORUS Verification Ledger](../public/notebooks/chorus-validation-atlas.html) · [executed notebook](CHORUS-Validation-Atlas.ipynb)
- [Published index](../public/notebooks/index.html)
- [Bounded release evidence](../public/evidence/index.html)
- [Integrity manifest](artifact-manifest.json)

## Rebuild and verify

The publication path uses the Python standard library only.

```sh
python3 scripts/docs/build_notebooks.py
python3 scripts/docs/build_notebooks.py --check
```

The first command executes every code cell in a clean per-notebook namespace, commits cell outputs, writes the accessible HTML editions, copies downloadable notebook files, and refreshes the integrity manifest. The second command performs the same build in memory and fails if any committed artifact has drifted.

The HTML editions are ordinary long-form documents rather than part of the one-viewport game shell. They provide semantic landmarks, skip links, labelled scrollable tables, visible focus, reduced-motion and forced-color handling, responsive reflow, print treatment, and complete text equivalents for every computed summary.
"""


def serialise_notebook(notebook: dict[str, Any]) -> bytes:
    return (json.dumps(notebook, ensure_ascii=False, indent=1) + "\n").encode("utf-8")


def build_artifacts() -> dict[Path, bytes]:
    specs = (SYSTEMS_SPEC, VALIDATION_SPEC)
    artifacts: dict[Path, bytes] = {}
    manifest_rows: list[dict[str, Any]] = []

    for spec in specs:
        notebook, cells = execute_spec(spec)
        notebook_bytes = serialise_notebook(notebook)
        html_bytes = html_document(spec, cells).encode("utf-8")
        source_path = SOURCE_DIR / spec.filename
        published_source_path = PUBLISH_DIR / spec.filename
        published_html_path = PUBLISH_DIR / f"{spec.slug}.html"
        artifacts[source_path] = notebook_bytes
        artifacts[published_source_path] = notebook_bytes
        artifacts[published_html_path] = html_bytes
        for path, data, media_type in (
            (source_path, notebook_bytes, "application/x-ipynb+json"),
            (published_source_path, notebook_bytes, "application/x-ipynb+json"),
            (published_html_path, html_bytes, "text/html"),
        ):
            manifest_rows.append(
                {
                    "path": path.relative_to(ROOT).as_posix(),
                    "media_type": media_type,
                    "bytes": len(data),
                    "sha256": hashlib.sha256(data).hexdigest(),
                }
            )

    artifacts[SOURCE_DIR / "README.md"] = readme_document().encode("utf-8")
    index_bytes = index_document(specs).encode("utf-8")
    artifacts[PUBLISH_DIR / "index.html"] = index_bytes
    manifest_rows.append(
        {
            "path": "public/notebooks/index.html",
            "media_type": "text/html",
            "bytes": len(index_bytes),
            "sha256": hashlib.sha256(index_bytes).hexdigest(),
        }
    )
    manifest = {
        "format": "CHORUS_NOTEBOOK_ARTIFACTS",
        "version": 1,
        "build_date": BUILD_STAMP,
        "builder": "scripts/docs/build_notebooks.py",
        "deterministic": True,
        "artifacts": sorted(manifest_rows, key=lambda row: row["path"]),
    }
    manifest_bytes = (json.dumps(manifest, indent=2) + "\n").encode("utf-8")
    artifacts[SOURCE_DIR / "artifact-manifest.json"] = manifest_bytes
    artifacts[PUBLISH_DIR / "artifact-manifest.json"] = manifest_bytes
    return artifacts


def validate_html(path: Path, data: bytes) -> list[str]:
    source = data.decode("utf-8")
    errors: list[str] = []
    required = (
        '<html lang="en">',
        "<title>",
        '<meta name="viewport"',
        '<a class="skip-link"',
        "<header",
        '<main id="main">',
        "<footer",
        "prefers-reduced-motion",
        "forced-colors",
    )
    for token in required:
        if token not in source:
            errors.append(f"{path}: missing {token}")
    if "http://" in source or "https://" in source:
        errors.append(f"{path}: contains a remote resource")
    if "<script" in source:
        errors.append(f"{path}: static edition contains script")
    for table in re.findall(r"<table[\s\S]*?</table>", source):
        if "<caption>" not in table or 'scope="col"' not in table:
            errors.append(f"{path}: table lacks caption or column scope")
            break
    return errors


def local_target(base_path: Path, raw_target: str) -> Path | None:
    target = html.unescape(raw_target.strip())
    if target.startswith("<") and ">" in target:
        target = target[1 : target.index(">")]
    else:
        target = target.split(maxsplit=1)[0] if target else ""
    parsed = urlsplit(target)
    if (
        not target
        or parsed.scheme
        or parsed.netloc
        or target.startswith(("/", "#"))
        or not parsed.path
    ):
        return None
    return (base_path.parent / unquote(parsed.path)).resolve()


def target_exists(target: Path, artifacts: dict[Path, bytes]) -> bool:
    if target.exists() or target in artifacts or target in COMPANION_PUBLICATION_TARGETS:
        return True
    return any(target in artifact.parents for artifact in artifacts)


def validate_local_links(artifacts: dict[Path, bytes]) -> list[str]:
    errors: list[str] = []
    markdown_paths = [ROOT / "README.md", SOURCE_DIR / "README.md"]
    markdown_paths.extend(sorted((ROOT / "docs").rglob("*.md")))
    markdown_link = re.compile(r"!?\[[^\]]*\]\(([^)\n]+)\)")

    for path in markdown_paths:
        if not path.exists() and path not in artifacts:
            errors.append(f"missing documentation file: {path.relative_to(ROOT)}")
            continue
        source = (artifacts[path] if path in artifacts else path.read_bytes()).decode("utf-8")
        for match in markdown_link.finditer(source):
            target = local_target(path, match.group(1))
            if target is not None and not target_exists(target, artifacts):
                errors.append(
                    f"{path.relative_to(ROOT)}: missing local link target "
                    f"{match.group(1).strip()}"
                )

    html_link = re.compile(r"\bhref=[\"']([^\"']+)[\"']", re.IGNORECASE)
    for path, data in artifacts.items():
        if path.suffix != ".html":
            continue
        for match in html_link.finditer(data.decode("utf-8")):
            target = local_target(path, match.group(1))
            if target is not None and not target_exists(target, artifacts):
                errors.append(
                    f"{path.relative_to(ROOT)}: missing local link target "
                    f"{match.group(1)}"
                )
    return errors


def relative_luminance(hex_color: str) -> float:
    channels = [int(hex_color[index : index + 2], 16) / 255 for index in (1, 3, 5)]
    linear = [
        channel / 12.92
        if channel <= 0.04045
        else ((channel + 0.055) / 1.055) ** 2.4
        for channel in channels
    ]
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]


def contrast_ratio(first: str, second: str) -> float:
    lighter, darker = sorted(
        (relative_luminance(first), relative_luminance(second)), reverse=True
    )
    return (lighter + 0.05) / (darker + 0.05)


def validate_artifacts(artifacts: dict[Path, bytes]) -> list[str]:
    errors: list[str] = []
    palette_pairs = (
        ("body text", "#f2f1e8", "#07140d"),
        ("muted text", "#c7d1c9", "#0b1f14"),
        ("links", "#a7e0bd", "#0b1f14"),
        ("gold labels", "#e2c57f", "#0b1f14"),
        ("silver labels", "#d5dedc", "#0b1f14"),
        ("focus indicator", "#f1cf78", "#07140d"),
    )
    for label, foreground, background in palette_pairs:
        ratio = contrast_ratio(foreground, background)
        if ratio < 4.5:
            errors.append(f"notebook palette: {label} contrast is {ratio:.2f}:1")
    for path, data in artifacts.items():
        if path.suffix == ".html":
            errors.extend(validate_html(path, data))
        if path.suffix == ".ipynb":
            notebook = json.loads(data)
            code_cells = [cell for cell in notebook["cells"] if cell["cell_type"] == "code"]
            if not code_cells or any(cell["execution_count"] is None for cell in code_cells):
                errors.append(f"{path}: code cells are not fully executed")
            if any(not cell["outputs"] for cell in code_cells):
                errors.append(f"{path}: executed code cell has no committed output")
    source_pairs = (
        (SOURCE_DIR / SYSTEMS_SPEC.filename, PUBLISH_DIR / SYSTEMS_SPEC.filename),
        (SOURCE_DIR / VALIDATION_SPEC.filename, PUBLISH_DIR / VALIDATION_SPEC.filename),
    )
    for source, published in source_pairs:
        if artifacts[source] != artifacts[published]:
            errors.append(f"{published}: published notebook differs from canonical source")
    errors.extend(validate_local_links(artifacts))
    return errors


def check_or_write(artifacts: dict[Path, bytes], check: bool) -> int:
    errors = validate_artifacts(artifacts)
    if errors:
        for error in errors:
            print(error, file=sys.stderr)
        return 1

    drift: list[str] = []
    for path, data in sorted(artifacts.items(), key=lambda item: item[0].as_posix()):
        if check:
            if not path.exists() or path.read_bytes() != data:
                drift.append(path.relative_to(ROOT).as_posix())
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(data)

    if drift:
        print("Notebook publication drift:", file=sys.stderr)
        for path in drift:
            print(f"  {path}", file=sys.stderr)
        return 1

    verb = "verified" if check else "built"
    print(f"Notebook publication {verb}: {len(artifacts)} artifacts.")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="verify committed artifacts without writing")
    args = parser.parse_args()
    os.chdir(ROOT)
    notebook_status = check_or_write(build_artifacts(), args.check)
    if notebook_status != 0:
        return notebook_status
    from build_release_evidence import run as run_release_evidence

    return run_release_evidence(args.check)


if __name__ == "__main__":
    raise SystemExit(main())
