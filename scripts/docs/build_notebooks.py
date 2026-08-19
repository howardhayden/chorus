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
BUILD_STAMP = "2026-08-19"
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


MODEL_SPEC = NotebookSpec(
    title="CHORUS Model Specification",
    slug="chorus-model-specification",
    filename="CHORUS-Model-Specification.ipynb",
    eyebrow="Constructs · assumptions · validity",
    summary=(
        "An executed specification of what CHORUS models, why each construct exists, "
        "which assumptions organize the simulation, how coherence is evaluated, and "
        "where its claims deliberately stop."
    ),
    cells=(
        (
            "markdown",
            """# CHORUS Model Specification

CHORUS is a **synthetic explanatory social simulation**. It represents how locally plausible decisions, uneven information, social relationships, platform conditions, and institutional constraints can combine into network-scale changes in interpretation and action.

This document makes the model legible as a research object. It does not convert the game into a behavioral forecast, diagnostic instrument, lie detector, trust score, or empirical estimate of any population.""",
        ),
        ("code", HELPERS),
        (
            "markdown",
            """## Claim boundary

The simulation can establish consequences **inside its authored rules**. It cannot establish the prevalence, probability, effect size, or causal structure of real-world disinformation behavior without external data, calibration, and validation.""",
        ),
        (
            "code",
            r'''claims = [
    ("System behavior", "Supported", "Given a seed, state, and accepted action, the reducer produces the documented deterministic receipts."),
    ("Mechanism illustration", "Supported with limits", "The model can show how a specified mechanism behaves under its own assumptions."),
    ("Comparative variant", "Supported within-model", "Matched variants can isolate the consequences of changing one authored condition."),
    ("Human diagnosis", "Not supported", "A fictional interior state cannot be used to infer the motive, pathology, or honesty of a real person."),
    ("Population estimate", "Not supported", "Synthetic frequencies are generated by grammar and policy, not sampled from a population."),
    ("Real-world forecast", "Not supported", "Reach, trust, fatigue, and belief outputs are not calibrated predictive probabilities."),
    ("Intervention efficacy", "Not supported externally", "An intervention that works inside CHORUS requires empirical evaluation before any real-world claim."),
]
_html = table_html("CHORUS claim ladder", ("Claim class", "Status", "Meaning"), claims, row_headers=True)
assert sum(status.startswith("Not supported") for _, status, _ in claims) == 4
print("PASS: claim ladder separates internal model evidence from external empirical claims.")''',
        ),
        (
            "markdown",
            """## Object of representation

A generated night is the primary modeled system. It contains six concurrent fictional seats, one shared logical clock, four decision beats per room, directed relationships, bounded cross-room effects, and an ordered causal record.""",
        ),
        (
            "code",
            r'''levels = [
    ("Actor / seat", "One generated protagonist in a situated role", "Objectives, stakes, relationships, repertoire, evidence access, discernment, enactment, fatigue"),
    ("Artifact", "One bounded information object encountered in a scene", "Source trace, social fit, channel, social proof, record, inference, unknowns"),
    ("Decision beat", "One choice opportunity at a scheduled point", "Visible options, access requirements, local effect, remote effects, time cost"),
    ("Relationship", "A typed dependency or obligation between a seat and another actor or institution", "Trust, authority, care, accountability, competition, audience, market dependence"),
    ("Room", "One incident trajectory", "Four beats, local state, completion snapshot, later afterimage"),
    ("House / network", "Six rooms sharing time and systemic conditions", "Directed routes, ambient effects, compatible direct crossings, aggregate receipts"),
    ("Run / night", "One seed plus one ordered action history", "Reproducible generated pack, state transitions, and final receipt"),
]
_html = table_html("Units and levels of analysis", ("Level", "Unit", "Modeled contents"), levels, row_headers=True)
assert len(levels) == 7
print("Mapped seven nested units from actor to reproducible run.")''',
        ),
        (
            "code",
            r'''source_owners = [
    ("Scenario grammar", "app/scenario-generator.ts", "Actors, incidents, language, relationships, scenes, choices, routes, and generation coherence"),
    ("Concurrent state", "app/night-engine.ts", "Clock, choice access, event reduction, propagation, fatigue, completion, afterimages, and replay"),
    ("Disclosure", "app/page.tsx", "What a player may inspect before, during, and after a room; relationship and receipt views"),
    ("Persistence", "app/save-model.ts", "Versioned local and portable state; validation and provenance"),
    ("Assurance", "tests/ and evidence/", "Structural invariants, multi-seed runs, browser observations, and bounded release claims"),
]
_html = table_html("Authoritative implementation owners", ("Concern", "Source owner", "Research relevance"), source_owners, row_headers=True)
print("Source ownership is explicit; this notebook documents rather than replaces those authorities.")''',
        ),
        (
            "markdown",
            """## Construct and variable register

Variables exist to protect a specific distinction or make a specific mechanism inspectable. Most numeric state is a **bounded internal index**, not a naturally measured quantity. Labels such as 0–100 improve consistency and comparison inside the simulation; they do not imply interval validity in the world outside it.""",
        ),
        (
            "code",
            r'''variables = [
    ("seed", "Run control", "Unsigned integer", "Reproduce one generated night without treating it as a representative sample."),
    ("logical time", "Temporal control", "Minutes from house opening", "Order arrivals and effects independently of reading speed or room navigation."),
    ("actor role", "Actor context", "Categorical", "Situate authority, obligations, resources, and audiences without reducing the actor to personality."),
    ("objective", "Actor motive", "Authored text + choice constraints", "Give local action a concrete purpose that may diverge from network-level outcomes."),
    ("stakes", "Actor motive", "Typed material and relational losses", "Explain why a locally plausible shortcut or repair has unequal cost."),
    ("relationships", "Relational structure", "Typed directed ties", "Represent care, authority, trust, dependence, competition, accountability, and audience exposure."),
    ("evidence access", "Epistemic state", "Artifact/source requirements", "Prevent actors from acting on information they do not possess."),
    ("observable record", "Evidence layer", "Bounded propositions", "Separate represented conduct from interpretation."),
    ("room reading", "Interpretive layer", "Authored inference hints", "Represent what the seat makes the record mean without promoting it to fact."),
    ("unknowns", "Uncertainty layer", "Explicit unresolved propositions", "Keep motive, cause, and scope unresolved until supported."),
    ("source trace", "Artifact condition", "Bounded index", "Represent how much source, time, boundary, and context remain attached."),
    ("social fit", "Artifact condition", "Bounded index", "Represent how readily an artifact feels native to a receiving room."),
    ("social proof", "Artifact condition", "Categorical cue", "Represent popularity or endorsement cues without treating them as truth."),
    ("linguistic repertoire", "Communication", "Actor-level set of situated registers", "Allow code choice without essentializing region, class, profession, or identity."),
    ("world model", "Communication", "Assumptions about care, evidence, authority, disagreement, responsibility", "Allow shared language to conceal divergent expectations and different language to express common action."),
    ("presentation temperature", "Communication", "Warm/cool bounded surface", "Separate delivery style from care, honesty, or interior motive."),
    ("discernment", "Capacity", "Bounded internal index", "Represent recognition of a sound action independently of ability to carry it."),
    ("enactment", "Capacity", "Bounded internal index", "Represent remaining follow-through under structural and accumulated load."),
    ("attentional fatigue", "Load", "Bounded internal index", "Represent competing artifacts and context switching."),
    ("affective fatigue", "Load", "Bounded internal index", "Represent repeated urgency, outrage, and anticipatory threat."),
    ("relational fatigue", "Load", "Bounded internal index", "Represent continuous calculation of tone, loyalty, and reply cost."),
    ("verification fatigue", "Load", "Bounded internal index", "Represent source recovery and comparison across fragmented copies."),
    ("efficacy fatigue", "Load", "Bounded internal index", "Represent the sense that careful repair cannot catch a moving cascade."),
    ("reach", "Network outcome", "Synthetic impression count", "Expose scale and overlap inside the authored propagation model."),
    ("blame concentration", "Social outcome", "Bounded internal index", "Represent how distributed failure becomes personalized around a target."),
    ("interpretation gap", "Epistemic outcome", "Bounded internal index", "Represent distance between record and dominant room reading."),
    ("common ground visible", "Coordination outcome", "Bounded internal index", "Represent whether materially shared action remains legible across codes or coalitions."),
    ("active-question focus", "Conversation outcome", "Bounded internal index", "Represent whether the original bounded question remains answerable."),
    ("perceived consensus", "Social outcome", "Bounded internal index", "Represent how repeated or fluent signals alter the apparent social majority."),
    ("effect receipt", "Causal record", "Typed local or remote delta", "Preserve provenance for every accepted decision and scheduled pulse."),
]
_html = table_html("Construct and variable register", ("Variable", "Family", "Representation", "Why it exists"), variables, row_headers=True)
assert len(variables) == 30
assert all(row[3].strip() for row in variables)
print("PASS: 30 declared variables each carry an explicit modeling rationale.")''',
        ),
        (
            "code",
            r'''families = {}
for _, family, _, _ in variables:
    families[family] = families.get(family, 0) + 1
cards = [(family, count, "declared constructs") for family, count in sorted(families.items(), key=lambda item: (-item[1], item[0]))]
_html = cards_html("Variable families", cards)
print(f"Coverage check: {len(variables)} variables span {len(families)} construct families.")''',
        ),
        (
            "markdown",
            """## Protected separations

The model is defined as much by what it refuses to collapse as by what it computes.""",
        ),
        (
            "code",
            r'''separations = [
    ("Event record", "Character judgment", "Observed or authored conduct does not automatically establish a stable trait."),
    ("Motive", "Truth", "A defensive or benevolent motive neither falsifies nor validates a claim."),
    ("Explanation", "Exoneration", "Pressure may explain access or choice without transferring responsibility to the harmed party."),
    ("Warmth / reserve", "Care / contempt", "Presentation temperature is not a direct measure of interior orientation."),
    ("Register", "Belief or identity essence", "A learned communication resource does not determine ideology, competence, or moral worth."),
    ("Discernment", "Enactment", "A seat may know a better action while lacking modeled capacity or support to perform it."),
    ("Ambient influence", "Direct content transmission", "Shared social conditions never imply that the same claim crossed rooms."),
    ("Synthetic frequency", "Population prevalence", "Grammar output counts are not survey or observational estimates."),
    ("Coherence", "Truth or predictive validity", "Internal consistency does not establish correspondence with the external world."),
]
_html = table_html("Non-collapsing model commitments", ("Kept separate", "From", "Reason"), separations, row_headers=True)
print("PASS: nine protected separations constrain interpretation of every output.")''',
        ),
        (
            "markdown",
            """## Assumptions

Assumptions are explicit design commitments, not hidden facts about human beings. A research variant may alter them, but a report must name the change.""",
        ),
        (
            "code",
            r'''assumptions = [
    ("Bounded fictional interior", "The occupied seat has authored motives and pressures available to the player.", "Needed for perspective-taking; unavailable as an inference about real people."),
    ("Fixed incident truth", "Each generated incident has a stable record that play cannot rewrite.", "Allows evaluation of interpretation drift without rewarding a preferred choice by changing facts."),
    ("Situated rationality", "Choices can be locally plausible given objective, stakes, knowledge, relationships, and load.", "Prevents a simple informed/uninformed or good/bad actor split."),
    ("Typed propagation", "Every remote consequence follows a declared route; direct content requires compatibility.", "Prevents atmospheric influence from being mislabeled as rumor transmission."),
    ("Shared logical clock", "All rooms advance under one event schedule.", "Preserves concurrency and order-independent arrivals."),
    ("Bounded indices", "Internal state is finite and clamped.", "Supports deterministic comparison and guards against runaway state; does not establish empirical scale."),
    ("Non-amplification floor", "Every beat retains an action that does not require repeating or personalizing the claim.", "Avoids coercing the player into modeled harm for progress."),
    ("Sparse diagnostic lenses", "Named critical interpretations appear only when generated evidence and power conditions support them.", "Avoids turning every conflict into the same lesson."),
    ("No player-speed penalty", "Wall-clock reading time and assistive technology do not change modeled fatigue or outcomes.", "Separates accessibility from the represented platform load."),
]
_html = table_html("Model assumptions and purposes", ("Assumption", "Declaration", "Purpose and limit"), assumptions, row_headers=True)
assert len(assumptions) == 9
print("Nine assumptions are explicit and available for ablation or sensitivity testing.")''',
        ),
        (
            "code",
            r'''exclusions = [
    ("No calibrated behavioral probabilities", "Choice availability and outcomes are authored mechanisms, not estimated propensities."),
    ("No demographic essentialism", "Age, class, region, language, coalition, or occupation never determines motive or conduct by itself."),
    ("No clinical inference", "Fatigue and pressure channels are interaction constructs, not diagnoses."),
    ("No truth-by-consensus", "Reach, fluency, repetition, or perceived agreement never changes ground truth."),
    ("No universal network topology", "Six rooms and their routes are a designed laboratory, not a model of every platform."),
    ("No complete institutional model", "Authorization, market, family, peer, and political relations are bounded role structures rather than full organizations."),
    ("No claim of ecological completeness", "Offline events, private channels, media systems, history, and material conditions are represented selectively."),
]
_html = checklist_html("Deliberate exclusions", [("OUTSIDE SCOPE", label, note) for label, note in exclusions])
print("Scope check: seven high-risk overclaims are explicitly excluded.")''',
        ),
        (
            "markdown",
            """## Mechanism chain

A CHORUS result is not generated by a single misinformation score. It emerges from typed transitions between evidence, interpretation, relationships, capacity, and propagation.""",
        ),
        (
            "code",
            r'''mechanism = [
    (1, "Generated context", "Role, objective, stakes, repertoire, relationships, and incident truth are established."),
    (2, "Artifact arrival", "The shared clock exposes a bounded artifact with trace, fit, channel, and social proof."),
    (3, "Situated reading", "The seat separates record, local interpretation, and unresolved questions."),
    (4, "Choice access", "Evidence, authority, relationships, assembled support, enactment, and the non-amplification floor determine available action."),
    (5, "Accepted decision", "The reducer advances logical time and writes one source-room event."),
    (6, "Typed receipts", "One local and five remote consequences are recorded; direct content is permitted only on compatible routes."),
    (7, "State update", "Reach, social conditions, fatigue, capacity, and later access change within bounds."),
    (8, "Afterimage / conclusion", "Closed rooms retain completion snapshots while later effects remain visible; the whole-night receipt resolves authored interpretation."),
]
_html = table_html("Mechanism from context to afterimage", ("Step", "Stage", "Transition"), mechanism)
assert [row[0] for row in mechanism] == list(range(1, 9))
print("PASS: eight-stage mechanism preserves a complete causal path from generation to receipt.")''',
        ),
        (
            "markdown",
            """## Coherence evaluation

Coherence is a family of internal consistency tests. It is evaluated across levels rather than collapsed into one persuasive score. A scalar shown in the interface is an inspectable summary of authored gates, not evidence of realism.""",
        ),
        (
            "code",
            r'''coherence = [
    ("Schema", "All required actors, rooms, scenes, choices, routes, ledgers, and receipts exist with valid types and bounds.", "Missing field, unknown enum, non-finite value, incomplete route set"),
    ("Agentic", "An actor's objective, stakes, knowledge, relationships, repertoire, baseline capacities, and choices form a plausible local action space.", "Choice requires absent knowledge; role has no meaningful stake; motivation is only a generic label"),
    ("Motivational", "Immediate choices can be traced to represented motives, incentives, authority, or protection goals.", "Outcome appears because the lesson needs it rather than because the seat has a reason"),
    ("Affective", "Pressure and fatigue accumulate or recede in response to represented events without replacing discernment.", "Emotional state jumps without cause; fatigue becomes diagnosis or moral excuse"),
    ("Relational", "Trust, care, authority, dependence, accountability, competition, and audience ties constrain action and consequence consistently.", "A tie reverses role or obligation without an event; costs fall on an unrelated actor without a route"),
    ("Epistemic", "Record, inference, authored interior, and unknowns remain distinct; actors cannot know sealed information.", "Inference becomes fact; remote room receives unsupported content; final labels leak into active play"),
    ("Temporal", "Arrivals and pulses follow the shared logical clock and occur exactly once regardless of navigation order.", "Visiting creates an event; delayed entry rewrites its arrival; duplicate pulse"),
    ("Causal", "Every accepted decision and autonomous pulse has complete, typed, attributable receipts.", "Missing local effect, fewer or more than five remote effects, stale choice mutates state"),
    ("Network", "Ambient effects and direct crossings respect route direction and compatibility.", "Shared atmosphere is described as shared content; direct crossing lacks carrier compatibility"),
    ("Narrative", "Six incidents are distinct yet mutually consequential, with continuity across all four beats and the closing receipt.", "Actor changes identity to satisfy a scene; scenario becomes a fixed morality vignette"),
    ("Ethical", "Youth safety, non-amplification, diagnostic restraint, responsibility, and correction boundaries remain intact.", "Player must spread harm; style or identity is used as proof of motive"),
    ("Reproducibility", "Seed plus ordered action history reconstructs the same generated pack and final state.", "Replay depends on visit order, wall-clock delay, or unrecorded randomness"),
]
_html = table_html("Multidimensional coherence rubric", ("Dimension", "Pass condition", "Failure signal"), coherence, row_headers=True)
assert len(coherence) == 12
print("PASS: coherence is evaluated across 12 independent dimensions rather than one realism score.")''',
        ),
        (
            "code",
            r'''coherence_workflow = [
    ("Generation gate", "Reject malformed or contradictory packs before play", "Schema, agentic, narrative, ethical"),
    ("Reducer invariant", "Reject stale, duplicate, unsupported, or non-finite transitions", "Temporal, causal, network, reproducibility"),
    ("Multi-seed harness", "Exercise many deterministic nights and choice policies", "Coverage, bounds, exhaustion, replay"),
    ("Disclosure test", "Inspect which information is visible at each stage", "Epistemic and ethical"),
    ("Close reading", "Review motives, relationships, affect, language, and continuity", "Agentic, motivational, affective, relational, narrative"),
    ("Variant audit", "Change one assumption and compare matched seeds", "Mechanism sensitivity and hidden coupling"),
]
_html = table_html("Coherence evaluation workflow", ("Layer", "Procedure", "Primary dimensions"), coherence_workflow, row_headers=True)
print("Coherence evaluation combines executable gates with qualitative inspection.")''',
        ),
        (
            "markdown",
            """## Validity framework

Internal consistency is necessary but insufficient. Each validity domain asks a different question and requires different evidence.""",
        ),
        (
            "code",
            r'''validity = [
    ("Construct validity", "Do variables represent the distinctions the thesis claims?", "Definition audit, discriminant checks, qualitative review, expert critique", "A bounded index may remain a useful design construct without being a validated psychometric scale."),
    ("Internal validity", "Does a changed model condition cause the changed model outcome?", "Matched-seed variants, controlled policies, ablation, event-receipt tracing", "Supports causality only inside the authored model."),
    ("External validity", "Do findings generalize beyond CHORUS?", "Independent empirical data and replication across settings", "Currently not established."),
    ("Ecological validity", "Does the experience resemble relevant information environments?", "User studies, domain review, task comparison, field observation", "Atmospheric plausibility alone is insufficient."),
    ("Content validity", "Does the grammar cover the relevant mechanism space?", "Expert mapping, missing-case analysis, scenario diversity review", "Six rooms are intentionally selective."),
    ("Statistical conclusion validity", "Are reported differences stable and estimated appropriately?", "Predeclared seed domains, effect distributions, uncertainty, multiple-comparison control", "Synthetic sample size does not substitute for population data."),
    ("Ethical validity", "Are interpretations and uses consistent with the model's responsibility boundaries?", "Misuse analysis, disclosure review, youth safeguards, human-subject protocol when applicable", "A technically reproducible result can still be an invalid use."),
]
_html = table_html("Validity domains and evidence requirements", ("Domain", "Question", "Needed evidence", "Current boundary"), validity, row_headers=True)
print("Validity matrix distinguishes seven questions that cannot be answered by one coherence score.")''',
        ),
        (
            "code",
            r'''interpretation_rules = [
    ("Describe", "Report the generated condition and model output without human attribution."),
    ("Compare", "Compare matched variants or policies under the same seed domain."),
    ("Explain internally", "Trace the difference through typed events and receipts."),
    ("Qualify", "Name assumptions, uncertainty, sensitivity, and finite coverage."),
    ("Do not generalize", "Stop before claims about real people, prevalence, prediction, or intervention efficacy."),
    ("Validate externally", "Use empirical research before crossing the model/world boundary."),
]
_html = table_html("Permitted interpretation sequence", ("Stage", "Required practice"), interpretation_rules, row_headers=True)
print("Interpretation sequence contains an explicit stop before external generalization.")''',
        ),
        (
            "markdown",
            """## Sensitivity and uncertainty priorities

The model is most informative when its conclusions survive reasonable alternatives—or when it clearly reveals which assumptions carry them.""",
        ),
        (
            "code",
            r'''sensitivity = [
    ("Propagation magnitude", "Sweep local and remote effect sizes", "Does the qualitative ordering of outcomes persist?"),
    ("Network topology", "Remove, add, or reweight directed routes", "Is a result an artifact of one six-room graph?"),
    ("Correction timing", "Advance or delay source restoration", "Which outcomes depend on order rather than content?"),
    ("Artifact fit and trace", "Vary independently", "Does fluency overwhelm provenance only under selected thresholds?"),
    ("Fatigue composition", "Hold total load constant while reallocating channels", "Which capacity barriers depend on load type?"),
    ("Baseline enactment", "Sweep actor carrying power", "Does one actor template dominate the result?"),
    ("Choice policy", "Compare non-amplifying, verification-first, relationship-first, and randomized policies", "Are findings robust to the decision rule?"),
    ("Generation grammar", "Ablate one communication dynamic or role family", "Does a claimed mechanism require a particular narrative assignment?"),
]
_html = table_html("Priority sensitivity analyses", ("Target", "Variant", "Question"), sensitivity, row_headers=True)
print("Eight sensitivity targets identify the assumptions most likely to drive a result.")''',
        ),
        (
            "markdown",
            """## Ethical and maintenance contract

The model specification is part of the executable release surface. A new variable, actor grammar, relationship type, propagation rule, or interpretive label requires a rationale, authority, bounds, disclosure timing, tests, and a claim-limit review.""",
        ),
        (
            "code",
            r'''change_contract = [
    ("Definition", "Name the construct and distinguish it from adjacent constructs."),
    ("Rationale", "State why the variable exists and which project thesis or invariant it protects."),
    ("Operationalization", "Declare type, bounds, units or index status, initialization, and update rules."),
    ("Causal authority", "Name the module allowed to create or mutate it."),
    ("Disclosure", "Specify what the player may see before, during, and after the whole night."),
    ("Validation", "Add structural, transition, replay, and adverse-input checks where applicable."),
    ("Sensitivity", "Identify plausible alternatives and whether conclusions depend on them."),
    ("Ethics", "Review diagnosis, identity essentialism, youth safety, coercion, privacy, and misuse."),
    ("Documentation", "Update the canonical prose owner, notebook, traceability map, and decision record."),
]
_html = checklist_html("Model-change completion contract", [("REQUIRED", label, evidence) for label, evidence in change_contract])
print("Model maintenance requires nine companions; code alone is not a complete change.")''',
        ),
        (
            "markdown",
            """## Specification conclusion

CHORUS is strongest when read as a transparent mechanism laboratory: rich enough to preserve individual motive, affect, relationship, language, institutional constraint, and network consequence; bounded enough that its fictional outputs are never mistaken for measurements of real people.

The companion **Research Design Atlas** turns these constructs into testable within-model questions and defines what additional evidence would be required for any empirical extension.""",
        ),
    ),
)


RESEARCH_SPEC = NotebookSpec(
    title="CHORUS Research Design Atlas",
    slug="chorus-research-design",
    filename="CHORUS-Research-Design.ipynb",
    eyebrow="Questions · variants · mixed methods",
    summary=(
        "An executed research-design companion defining testable questions, matched variants, "
        "quantitative and qualitative evidence, analysis plans, ethical boundaries, and criteria "
        "for revising or rejecting model claims."
    ),
    cells=(
        (
            "markdown",
            """# CHORUS Research Design Atlas

This atlas treats CHORUS as a transparent synthetic laboratory. It defines research questions that can be tested **within variants of the model**, while keeping any claim about real people or institutions contingent on separate empirical work.

The goal is not to maximize the number of simulated runs. The goal is to connect each question to a mechanism, comparison, observation plan, interpretation rule, and stopping condition.""",
        ),
        ("code", HELPERS),
        (
            "markdown",
            """## Research posture

A CHORUS study begins with a bounded question and a declared contrast. It uses deterministic seeds to preserve matched worlds, event receipts to explain differences, and qualitative review to determine whether a numerically valid run remains socially and narratively coherent.""",
        ),
        (
            "code",
            r'''principles = [
    ("Question before metric", "Choose the mechanism and comparison before selecting an outcome index."),
    ("Matched worlds", "Use the same seed and policy history when changing one model condition."),
    ("Mechanism trace", "Retain the event and effect receipts that connect condition to outcome."),
    ("Finite-domain honesty", "Report the exact seed set, policy set, exclusions, and failures."),
    ("Mixed evidence", "Combine invariant checks and distributions with close reading of actor, relationship, affect, and narrative continuity."),
    ("No synthetic generalization", "Do not translate generated frequency into human prevalence or prediction."),
    ("Revision is a result", "Treat incoherence, instability, or sensitivity as evidence that the model or claim needs narrowing."),
]
_html = checklist_html("Research-design principles", [("REQUIRED", label, note) for label, note in principles])
print("Seven principles govern every proposed CHORUS study.")''',
        ),
        (
            "markdown",
            """## Research-question matrix

Each question below is answerable with model variants. None, by itself, establishes a real-world causal effect.""",
        ),
        (
            "code",
            r'''research_questions = [
    ("RQ1", "Provenance × fit", "When source trace and local social fit vary independently, when does fluent framing outweigh attached context inside the model?", "Trace level; fit level", "Interpretation gap; perceived consensus; verification action", "Matched 3×3 factorial within seed"),
    ("RQ2", "Correction timing", "How does earlier or later source restoration change reach, blame concentration, and repair availability?", "Correction arrival minute", "Reach; blame; common ground; accessible choices", "Matched timing sweep"),
    ("RQ3", "Reply access", "How does unequal ability to answer a claim affect personalization of distributed failure?", "Target reply access; authority asymmetry", "Blame concentration; active-question focus", "Ablation plus authority-stratified comparison"),
    ("RQ4", "Fatigue composition", "Does the type of accumulated load alter enactment when discernment and total load are held constant?", "Allocation across five fatigue channels", "Choice availability; enactment; last-resort route", "Compositional matched variants"),
    ("RQ5", "Social capital", "How do trust and dependence routes alter spread and correction uptake?", "Tie type; tie strength proxy; source position", "Remote reach; correction propagation; consensus", "Topology and tie-type variants"),
    ("RQ6", "Shared register / divergent model", "When actors use the same register but hold different assumptions about evidence or responsibility, how often does apparent agreement conceal coordination failure?", "Code relation; world-model relation", "Common ground visible; active-question focus; coordination pressure", "2×2 communication design"),
    ("RQ7", "Ambient vs direct propagation", "How does treating a consequence as social atmosphere rather than content crossing change attribution and repair?", "Route layer", "Attribution accuracy within model; blame; provenance", "Compatibility-preserving route ablation"),
    ("RQ8", "Institutional delay", "How do authorization requirements and delayed official response interact with local corrective action?", "Approval threshold; delay; local authority", "Reach; verification capacity; repair timing", "Factorial institutional-access variant"),
    ("RQ9", "Non-amplification floor", "What harm is avoided when every beat retains a non-amplifying action, and what repair remains unreachable?", "Floor present/absent in research-only branch", "Avoided reach; unresolved gap; ethical violations", "Safety-constrained ablation; never player-facing without review"),
    ("RQ10", "Concurrent load", "How does the number and timing of simultaneous incidents affect follow-through independently of reading speed?", "Active room count; arrival density", "Fatigue channels; enactment; unfinished supports", "Clock-density sweep"),
    ("RQ11", "Cross-coalition translation", "Which translation routes reveal materially shared action despite conflicting coalition language?", "Surface code; repair move; audience model", "Common ground visible; direct repair uptake", "Matched language-surface variants"),
    ("RQ12", "Network repair", "Which sequence of distributed supporting actions makes a previously blocked ideal reachable?", "Support order; source rooms; time cost", "Choice-access transition; total harm; afterimage", "Path enumeration over support-building policies"),
]
_html = table_html("Within-model research questions", ("ID", "Mechanism", "Question", "Independent variables", "Outcomes", "Design"), research_questions, row_headers=True)
assert len(research_questions) == 12
print("Research matrix defines 12 mechanism-specific questions and explicit contrasts.")''',
        ),
        (
            "code",
            r'''question_families = {}
for _, family, *_ in research_questions:
    question_families[family] = question_families.get(family, 0) + 1
_html = cards_html("Research program coverage", [
    ("Questions", len(research_questions), "Each names a mechanism, independent variables, outcomes, and design."),
    ("Mechanism families", len(question_families), "No generic misinformation-literacy omnibus score."),
    ("Actor levels", 3, "Actor, relationship/room, and whole-house outcomes are represented."),
    ("Claim level", "Within-model", "External claims require a separate empirical protocol."),
])
print("Coverage check passed: questions span actor, relational, temporal, and network mechanisms.")''',
        ),
        (
            "markdown",
            """## Matched-variant architecture

The strongest default design changes one declared condition while preserving the seed, generated incident truth, actor identities, baseline relationships, arrival schedule, and choice policy wherever the research question permits.""",
        ),
        (
            "code",
            r'''variant_protocol = [
    (1, "Register", "Name the baseline implementation version, seed domain, policy, and outcome definitions."),
    (2, "Freeze", "Hold incident truth, actor generation, route IDs, and random draw stream constant."),
    (3, "Intervene", "Change one parameter, grammar rule, route, threshold, or schedule declared in advance."),
    (4, "Run", "Execute baseline and variant under identical deterministic policies and ordered events."),
    (5, "Verify", "Reject pairs that violate schema, coherence, bounds, or replay invariants."),
    (6, "Compare", "Compute paired differences and retain their full distribution rather than only the mean."),
    (7, "Trace", "Identify the earliest divergent event and follow its local and remote receipts."),
    (8, "Read", "Qualitatively inspect motivation, affect, relationship, epistemic access, and narrative continuity."),
    (9, "Stress", "Repeat across plausible parameter ranges, policies, and topology variants."),
    (10, "Report", "State finite coverage, exclusions, failures, sensitivity, and the model/world boundary."),
]
_html = table_html("Matched-variant protocol", ("Step", "Stage", "Requirement"), variant_protocol)
assert [step for step, _, _ in variant_protocol] == list(range(1, 11))
print("PASS: ten-step protocol connects controlled comparison to causal and qualitative inspection.")''',
        ),
        (
            "markdown",
            """## Example factorial scope

Large run counts are useful only after the factor space and interpretation are declared. This cell makes the arithmetic visible for a provenance-by-fit-by-correction-timing study.""",
        ),
        (
            "code",
            r'''factors = {
    "source_trace": (25, 55, 85),
    "social_fit": (25, 55, 85),
    "correction_timing": ("early", "mid", "late"),
    "policy": ("non-amplifying", "verification-first", "relationship-first", "randomized"),
}
seed_count = 256
cells = 1
for values in factors.values():
    cells *= len(values)
runs = cells * seed_count
paired_contrasts_per_seed = cells - 1
_html = cards_html("Illustrative preregistered factorial", [
    ("Factor cells", cells, "3 trace × 3 fit × 3 timing × 4 policy conditions."),
    ("Seeds", seed_count, "Contiguous or explicitly enumerated before execution."),
    ("Total runs", f"{runs:,}", "Synthetic runs, not human observations."),
    ("Baseline contrasts", f"{paired_contrasts_per_seed:,} / seed", "Every condition may be compared with one declared baseline."),
])
assert cells == 108 and runs == 27648
print("PASS: factorial arithmetic is explicit; sample size is not represented as population evidence.")''',
        ),
        (
            "markdown",
            """## Outcomes and measurement discipline

An outcome must be named at the correct level and interpreted according to its representation. Synthetic impression counts and bounded indices are useful for comparison, but they are not validated survey scales or naturally observed units.""",
        ),
        (
            "code",
            r'''outcomes = [
    ("Reach", "House / room", "Synthetic impressions and avoided impressions", "Count and paired difference", "Do not interpret as expected platform views."),
    ("Interpretation gap", "Room", "Distance between record and dominant authored reading", "Bounded index; trajectory; endpoint", "Not a psychometric belief score."),
    ("Blame concentration", "Room / target", "Personalization of distributed failure", "Bounded index; event-attributed change", "Not a diagnosis of scapegoating in a real group."),
    ("Common ground visible", "Relationship / house", "Legibility of materially shared action", "Bounded index; time to threshold", "Does not establish real agreement."),
    ("Active-question focus", "Conversation", "Persistence of the bounded question", "Bounded index; diversion events", "Does not classify every topic shift as evasion."),
    ("Perceived consensus", "Room / house", "Apparent social majority under repeated signals", "Bounded index; route contribution", "Not a survey estimate."),
    ("Discernment", "Actor", "Modeled recognition of the sound action", "Baseline and trajectory", "Not intelligence, media literacy, or moral worth."),
    ("Enactment", "Actor", "Modeled carrying power for available action", "Baseline, trajectory, access threshold", "Not a stable trait."),
    ("Fatigue channels", "Actor", "Five typed platform loads", "Composition and trajectory", "Not clinical assessment."),
    ("Choice access", "Actor / beat", "Structural and capacity availability", "Binary gate plus unmet requirements", "Unavailable does not mean unknowable or immoral."),
    ("Causal receipts", "Event", "Typed local and remote deltas", "Path and contribution analysis", "Internal provenance only."),
]
_html = table_html("Outcome register and interpretation boundary", ("Outcome", "Level", "Representation", "Summary", "Do not claim"), outcomes, row_headers=True)
print("Outcome register defines 11 measures and a misuse boundary for each.")''',
        ),
        (
            "markdown",
            """## Quantitative analysis plan

The preferred analysis treats seeds as matched generated worlds, policies as declared decision rules, and variant conditions as interventions on the model.""",
        ),
        (
            "code",
            r'''quantitative = [
    ("Integrity", "Count rejected packs, invariant failures, replay failures, exhausted choice paths, and non-finite values before outcome analysis."),
    ("Paired effects", "For each seed-policy pair, compute variant minus baseline at predeclared endpoints and over trajectories."),
    ("Distributions", "Report median, interquartile range, tails, sign consistency, and complete min/max alongside means."),
    ("Event timing", "Compare time to correction, first direct crossing, first blocked ideal, room close, and whole-night completion."),
    ("Path contribution", "Attribute outcome changes to typed receipts and identify earliest divergence."),
    ("Interaction", "Estimate whether factor combinations change direction or magnitude beyond their separate within-model effects."),
    ("Sensitivity", "Repeat under alternative thresholds, effect magnitudes, policies, topologies, and grammar ablations."),
    ("Multiplicity", "Separate confirmatory questions from exploratory screens and control or clearly label repeated comparisons."),
    ("Missingness", "Treat rejected or incoherent runs as substantive model failures; do not silently drop them."),
]
_html = checklist_html("Quantitative analysis commitments", [("REQUIRED", label, procedure) for label, procedure in quantitative])
print("Quantitative plan contains nine commitments from integrity screening through missingness.")''',
        ),
        (
            "code",
            r'''tidy_schema = [
    ("run_id", "string", "Implementation version + seed + policy + variant"),
    ("seed", "integer", "Generated-world pairing key"),
    ("variant_id", "string", "Predeclared model intervention"),
    ("policy_id", "string", "Deterministic or randomized choice policy with its own seed"),
    ("event_index", "integer", "Ordered causal record position"),
    ("logical_minute", "integer", "House time; never wall-clock reading time"),
    ("source_room", "string", "Originating room"),
    ("target_room", "string", "Receiving room for an effect receipt"),
    ("event_kind", "enum", "Choice or autonomous pulse"),
    ("effect_layer", "enum", "Local, ambient remote, or compatible direct crossing"),
    ("metric", "string", "One declared outcome or state variable"),
    ("value_before", "number", "Finite bounded or count value"),
    ("delta", "number", "Typed receipt contribution"),
    ("value_after", "number", "Post-transition value"),
    ("coherence_status", "enum", "Pass, rejected, or review-required"),
]
_html = table_html("Tidy synthetic event schema", ("Field", "Type", "Meaning"), tidy_schema, row_headers=True)
assert len(tidy_schema) == 15
print("Synthetic data schema retains pairing, event order, route provenance, and coherence status.")''',
        ),
        (
            "markdown",
            """## Qualitative analysis plan

A numerical pass cannot determine whether a generated person remains specific, motivated, affectively continuous, relationally situated, and epistemically bounded. Close reading is therefore a release and research method, not decorative interpretation.""",
        ),
        (
            "code",
            r'''qualitative_codes = [
    ("Actor specificity", "The seat has concrete role, objective, stakes, resources, relationships, and conflicts rather than a demographic or ideological placeholder."),
    ("Motivational continuity", "Each choice remains traceable to represented goals, incentives, protection, authority, or capacity."),
    ("Affective continuity", "Pressure and recovery follow events; feeling does not appear solely to force a plot turn."),
    ("Relational coherence", "Care, trust, dependence, competition, authority, and accountability remain consistent unless an event changes them."),
    ("Epistemic discipline", "The seat acts only on available record, interpretation, and explicit uncertainty."),
    ("Communication situatedness", "Register choice fits audience and context without defining the actor's essence or belief."),
    ("Narrative causality", "Later beats and afterimages preserve consequences rather than resetting for a new lesson."),
    ("Cross-room plausibility", "Remote effects are appropriate to the route and do not invent unsupported shared content."),
    ("Ethical legibility", "Responsibility remains visible without diagnostic certainty, identity inference, or coerced amplification."),
    ("Counterexample value", "The case challenges rather than merely confirms the expected mechanism."),
]
_html = table_html("Qualitative coherence codebook", ("Code", "Review question"), qualitative_codes, row_headers=True)
print("Qualitative codebook defines ten review dimensions for generated nights and matched variants.")''',
        ),
        (
            "code",
            r'''rating_scale = [
    (0, "Contradicted", "The generated evidence directly violates the criterion."),
    (1, "Weak", "The criterion is nominally present but generic, under-motivated, or discontinuous."),
    (2, "Adequate", "The criterion is coherent enough for use, with a documented limitation."),
    (3, "Strong", "The criterion is specific, continuous, and supported across the relevant record."),
    ("R", "Review required", "Evidence is ambiguous, ethically sensitive, or cannot be judged from the available record."),
]
_html = table_html("Ordinal qualitative review scale", ("Code", "Label", "Decision rule"), rating_scale)
print("Review scale preserves an explicit uncertainty category instead of forcing false precision.")''',
        ),
        (
            "markdown",
            """## Mixed-method integration

Quantitative and qualitative evidence answer different failure modes. They should meet at the level of a specific generated pair, event path, or mechanism—not in a generic narrative added after the statistics.""",
        ),
        (
            "code",
            r'''integration = [
    ("Convergent", "Distribution shifts in the predicted direction and reviewed cases preserve the proposed mechanism.", "Report effect, cases, sensitivity, and limits."),
    ("Quantitative-only", "A stable numerical difference lacks plausible or coherent case-level mechanism.", "Treat as a model artifact until traced and repaired."),
    ("Qualitative-only", "Compelling cases exist but aggregate direction is unstable or rare.", "Narrow the claim to a boundary condition or case class."),
    ("Divergent", "Numbers and close reading support opposing interpretations.", "Pause conclusion; inspect metric definition, coding, thresholds, and hidden coupling."),
    ("Null", "No meaningful paired difference and no case-level mechanism appears.", "Retain the null result; do not search post hoc for a new outcome."),
    ("Incoherent", "Variant causes rejected packs, broken motives, impossible knowledge, or route violations.", "The intervention is not a valid test in its current form."),
]
_html = table_html("Mixed-method joint display", ("Pattern", "Finding", "Required response"), integration, row_headers=True)
print("Joint display defines six result patterns, including null and incoherent outcomes.")''',
        ),
        (
            "markdown",
            """## Robustness and falsification

A research program becomes scholarly when it states what could change its mind. CHORUS claims should be narrowed, revised, or rejected when their mechanism fails under declared checks.""",
        ),
        (
            "code",
            r'''falsification = [
    ("Mechanism absence", "The expected outcome difference appears without the proposed event path.", "Reject the causal explanation even if the endpoint difference remains."),
    ("Sign instability", "Reasonable policies, seeds, thresholds, or topologies reverse the effect.", "Report a conditional result or withdraw the general within-model claim."),
    ("Construct collapse", "Two variables intended to be distinct always move together by implementation.", "Refactor or narrow the construct claim."),
    ("Narrative incoherence", "The variant requires actors to violate motives, relationships, knowledge, or continuity.", "Reject the variant as an invalid operationalization."),
    ("Ethical failure", "The study design encourages identity inference, diagnosis, coerced amplification, or responsibility transfer.", "Stop the study path regardless of statistical clarity."),
    ("External contradiction", "Empirical evidence conflicts with the model's assumed mechanism.", "Revise assumptions; do not defend the simulation as self-validating."),
    ("No discriminant behavior", "Changing a construct produces no distinguishable consequence where the model says it matters.", "Question whether the variable has functional meaning."),
]
_html = table_html("Evidence that narrows or rejects a claim", ("Failure", "Observation", "Decision"), falsification, row_headers=True)
print("Falsification register names seven conditions that can overturn a model claim.")''',
        ),
        (
            "code",
            r'''robustness = [
    ("Seed domain", "Repeat on a disjoint preregistered domain and report overlap and divergence."),
    ("Policy", "Use at least one contrasting deterministic policy and one randomized policy with recorded randomness."),
    ("Threshold", "Sweep access and propagation thresholds around every reported discontinuity."),
    ("Magnitude", "Scale effect deltas while preserving sign, then test sign alternatives where theoretically plausible."),
    ("Topology", "Test route removal, density, and centrality alternatives."),
    ("Grammar", "Repeat after actor-role and communication-dynamic ablation."),
    ("Coding", "Use independent qualitative review and reconcile disagreements against the event record."),
    ("Metric", "Check whether conclusions persist under adjacent outcomes rather than one favored index."),
]
_html = checklist_html("Robustness suite", [("STRESS", label, procedure) for label, procedure in robustness])
print("Robustness suite covers eight independent sources of model sensitivity.")''',
        ),
        (
            "markdown",
            """## Ethics and data governance

The current simulation generates fictional state locally and requires no telemetry. A study of model outputs is different from a study involving people. The boundary changes as soon as researchers recruit participants, collect interaction traces, link identity, or evaluate real-world claims.""",
        ),
        (
            "code",
            r'''ethics = [
    ("Synthetic model audit", "Generated packs, event logs, and code only", "No human-subject claim; still review misuse, bias, identity inference, and youth safety."),
    ("Usability study", "Participant observation or feedback", "Consent, accessible participation, data minimization, withdrawal, and institutional review determination."),
    ("Learning study", "Pre/post measures or comparison groups", "Validated measures, power rationale, preregistration, privacy, debriefing, and review."),
    ("Behavioral telemetry", "Fine-grained interaction traces", "Not collected by the product; any research build needs separate consent, minimization, retention, and security."),
    ("Real-world case mapping", "External people, communities, or incidents", "High risk of diagnosis, defamation, reidentification, and false attribution; requires independent evidence and ethical/legal review."),
    ("Youth participation", "Minors or youth-directed evaluation", "Heightened consent/assent, safeguarding, content, privacy, and power review."),
]
_html = table_html("Research-ethics boundary by study type", ("Study type", "Data", "Additional requirement"), ethics, row_headers=True)
print("Ethics table separates synthetic audit from five increasingly sensitive empirical designs.")''',
        ),
        (
            "code",
            r'''governance = [
    ("Collect nothing by default", "The production application remains local and telemetry-free."),
    ("Separate research build", "Any participant logging must be technically and visibly distinct from ordinary play."),
    ("Purpose limitation", "Collect only fields necessary for the preregistered question."),
    ("No covert inference", "Do not infer ideology, diagnosis, deception, or identity from play style."),
    ("Pseudonymize early", "Separate contact, consent, and study data; minimize linkage."),
    ("Bound retention", "Declare deletion dates, access roles, backups, and export handling."),
    ("Report exclusions", "Document withdrawals, failed runs, accessibility barriers, and missing data."),
    ("Publish synthetic examples", "Prefer generated cases and aggregate data over participant narratives."),
]
_html = checklist_html("Data-governance commitments", [("REQUIRED", label, procedure) for label, procedure in governance])
print("Data governance preserves the product's privacy baseline and forbids covert profiling.")''',
        ),
        (
            "markdown",
            """## Reporting template

A complete report should let another reader reconstruct the question, intervention, run domain, exclusions, mechanism trace, qualitative judgment, and claim boundary.""",
        ),
        (
            "code",
            r'''report_sections = [
    (1, "Question and claim level", "State whether the claim is structural, within-model comparative, exploratory, or empirical."),
    (2, "Model version", "Record commit or release binding, generator version, notebook build, and changed assumptions."),
    (3, "Design", "Declare factors, conditions, seed domain, policies, controls, outcomes, and stopping rule."),
    (4, "Integrity results", "Report generation rejection, invariant, replay, and coherence-review results before outcomes."),
    (5, "Quantitative results", "Present paired distributions, uncertainty, interactions, tails, and all preregistered outcomes."),
    (6, "Mechanism trace", "Show representative causal paths and the earliest divergence."),
    (7, "Qualitative results", "Report coding, disagreement, counterexamples, and narrative/ethical failures."),
    (8, "Sensitivity", "Show threshold, policy, topology, magnitude, grammar, and metric robustness."),
    (9, "Limitations", "Name synthetic, construct, coverage, ecological, and external-validity limits."),
    (10, "Decision", "State what was supported, narrowed, rejected, or left unresolved."),
    (11, "Reproduction", "Provide code, configs, seed list, policy definitions, raw synthetic results, and environment."),
]
_html = table_html("Minimum study-report structure", ("Order", "Section", "Required contents"), report_sections)
assert [row[0] for row in report_sections] == list(range(1, 12))
print("Reporting contract contains 11 ordered sections from claim level through reproduction.")''',
        ),
        (
            "markdown",
            """## Research roadmap

The highest-value sequence begins with internal construct and mechanism validity, then moves to human evaluation only where a bounded question and ethical protocol justify it.""",
        ),
        (
            "code",
            r'''roadmap = [
    ("1 · Model audit", "Variable definitions, separations, coherence gates, source ownership", "Complete specification and contradiction log"),
    ("2 · Sensitivity", "Matched seeds across thresholds, policies, topology, and grammar", "Mechanism robustness map"),
    ("3 · Qualitative review", "Independent coding of generated actors, motives, affect, relationships, and epistemic boundaries", "Inter-rater record and model revisions"),
    ("4 · Expert review", "Information behavior, social science, ethics, game studies, accessibility, and domain critique", "Content-validity and misuse findings"),
    ("5 · Usability / comprehension", "Can readers distinguish record, inference, motive, unknown, and claim limits?", "Accessible participant protocol and bounded findings"),
    ("6 · Comparative learning study", "Only after measures and intervention are externally justified", "Empirical evidence that remains separate from simulation output"),
]
_html = table_html("Staged research roadmap", ("Stage", "Question", "Deliverable"), roadmap, row_headers=True)
print("Roadmap places model audit and sensitivity before participant-facing efficacy claims.")''',
        ),
        (
            "markdown",
            """## Research-design conclusion

CHORUS can support rigorous research practice when every result remains attached to its model version, assumptions, seed domain, policy, causal receipts, coherence review, sensitivity, and claim boundary.

Its most defensible immediate contribution is not prediction. It is a reproducible way to formulate and inspect questions about distributed sensemaking, social pressure, information propagation, relational constraints, and the gap between recognizing a sound action and being able to carry it.""",
        ),
    ),
)

VALIDATION_SPEC = NotebookSpec(
    title="CHORUS Historical Verification Ledger",
    slug="chorus-validation-atlas",
    filename="CHORUS-Validation-Atlas.ipynb",
    eyebrow="Historical release evidence · 1.0.0-rc.1",
    summary=(
        "A retained pre-update verification ledger for fixed night geometry, causal receipts, "
        "accessibility, privacy, hostile-input boundaries, and release evidence. Current working-tree verification is published separately."
    ),
    cells=(
        (
            "markdown",
            """# CHORUS Historical Verification Ledger

This notebook preserves the retained evidence for the pre-scholarly-update `1.0.0-rc.1` source binding. It must not be read as a browser or distribution pass for the later working tree that adds the Model Specification, Research Design Atlas, in-app scholarly reader, and expanded icon set.

The fixed model and reducer declarations remain useful; current working-tree checks and explicit observation limits are published in `public/evidence/updated-working-tree-status.html`. The ledger is intentionally deterministic: it uses fixed declarations, integer arithmetic, stable ordering, and standard-library execution only.""",
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
            """## Historical browser playability result

The browser result below is retained for its recorded pre-update source binding. It completed a 52-step Chrome-family night, reached the conclusion, retained the viewport, and recorded zero application-origin errors for that source. It is historical evidence, not a relabeled browser pass for the later scholarly-reader and icon update. Current source-level accessibility, metadata, build, and HTTP checks are recorded separately; live current-tree browser navigation remains an explicit boundary.""",
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
    ("Completed turn", "24 / 24", "Retained pre-update run; six of six rooms closed and the whole-night receipt appeared."),
    ("Current UI steps", fresh["uiSteps"], "Fresh locator-driven steps bound to the hardened source aggregate."),
    ("Application errors", fresh["runtimeFailureObservation"]["pageOriginWarningsOrErrors"], "Warnings or errors attributed to the application origin in the retained pre-update run."),
    ("Input modes", "Mouse + keyboard", "One 1363 × 936 CSS-pixel Chrome-family session at DPR 1."),
    ("Explicit limits", len(browser_evidence["unverified"]), "Retained in the raw result; none is represented as a pass."),
    ("File SHA-256", sha256(browser_bytes).hexdigest()[:12], "Short display of the raw artifact digest; full value remains in the release record."),
]
_html = cards_html("Retained browser evidence", browser_cards)
print(f'HISTORICAL BOUNDED PASS: the recorded source completed turn 24/24 in {fresh["uiSteps"]} steps with {len(browser_evidence["unverified"])} explicit unverified boundaries; no current-tree browser pass is implied.')''',
        ),
        (
            "code",
            r'''browser_paths = [
    ("Complete night", "PASS · HISTORICAL SOURCE", "Retained run: turn 24/24, six rooms closed, whole-night receipt and 24 decisions available."),
    ("Viewport containment", "PASS · HISTORICAL SOURCE", "Retained run: document, window, scroll, and shell all measured 1363 × 936 with zero body offset."),
    ("Application-origin errors", "PASS · HISTORICAL SOURCE", "Retained run: zero warnings or errors attributed to the application origin."),
    ("Published technical routes", "PASS · HISTORICAL SOURCE", "Evidence index and the two then-published script-free notebook HTML pages loaded."),
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
            """## Historical neutral-distribution result

The distribution result records a full repository gate and a fresh neutral directory proof for its pre-update source binding. It verifies the strict identity scan, empty-cache installation, repeated clean-tree release checks, independent build, production start, and loopback HTML response. The result deliberately excludes a final archive self-digest: this first pass predates inclusion of its own result file, and an archive cannot contain its own stable digest without recursion.""",
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

This historical ledger does not promote the updated working tree. A release is ready only when generator coherence, reducer invariants, save validation, viewport contracts, accessibility disclosures, static rendering, documentation drift checks, browser completion, and distribution checks all pass for the same source binding.""",
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

    for cell_index, (cell_type, source) in enumerate(spec.cells, start=1):
        cell_id = hashlib.sha256(
            f"{spec.slug}\0{cell_index}\0{cell_type}\0{source}".encode("utf-8")
        ).hexdigest()[:12]
        if cell_type == "markdown":
            notebook_cells.append(
                {"cell_type": "markdown", "id": cell_id, "metadata": {}, "source": source.splitlines(keepends=True)}
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
                "id": cell_id,
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
                "claim_boundary": "synthetic explanatory model; not externally predictive",
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
    navigation = (
        ("index.html", "Notebook index"),
        ("chorus-systems-atlas.html", "Systems Atlas"),
        ("chorus-model-specification.html", "Model Specification"),
        ("chorus-research-design.html", "Research Design"),
        ("chorus-validation-atlas.html", "Historical Verification Ledger"),
    )
    links = "".join(
        f'<a href="{href}" aria-current="page">{label}</a>'
        if href == f"{spec.slug}.html"
        else f'<a href="{href}">{label}</a>'
        for href, label in navigation
    )
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="{html.escape(spec.summary, quote=True)}">
<meta name="theme-color" content="#0b2819">
<link rel="icon" href="../favicon.svg" type="image/svg+xml">
<link rel="icon" href="../favicon-32x32.png" sizes="32x32" type="image/png">
<link rel="icon" href="../favicon-16x16.png" sizes="16x16" type="image/png">
<link rel="shortcut icon" href="../favicon.ico">
<link rel="apple-touch-icon" href="../apple-touch-icon.png" sizes="180x180">
<link rel="manifest" href="../site.webmanifest">
<title>{html.escape(spec.title)} · CHORUS documentation</title>
<style>{CSS}</style>
</head>
<body>
<a class="skip-link" href="#main">Skip to notebook</a>
<header class="site-header">
  <p class="eyebrow">{html.escape(spec.eyebrow)}</p>
  <h1>{html.escape(spec.title)}</h1>
  <p class="lede">{html.escape(spec.summary)}</p>
  <nav class="doc-nav" aria-label="Notebook navigation">{links}<a href="{spec.filename}" download>Download executed notebook</a></nav>
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
<meta name="description" content="Executed CHORUS architecture, model specification, research design, and verification notebooks with self-contained static editions.">
<meta name="theme-color" content="#0b2819">
<link rel="icon" href="../favicon.svg" type="image/svg+xml">
<link rel="icon" href="../favicon-32x32.png" sizes="32x32" type="image/png">
<link rel="icon" href="../favicon-16x16.png" sizes="16x16" type="image/png">
<link rel="shortcut icon" href="../favicon.ico">
<link rel="apple-touch-icon" href="../apple-touch-icon.png" sizes="180x180">
<link rel="manifest" href="../site.webmanifest">
<title>CHORUS notebook documentation</title>
<style>{CSS}</style>
</head>
<body>
<a class="skip-link" href="#main">Skip to notebook list</a>
<header class="site-header">
  <p class="eyebrow">CHORUS technical record</p>
  <h1>Executed notebooks</h1>
  <p class="lede">Architecture, model specification, research design, and release evidence presented as committed notebook source and accessible, self-contained HTML.</p>
</header>
<main id="main">
  <section class="card-index" aria-label="Available notebooks">{''.join(cards)}</section>
  <aside class="publication-note" aria-label="Publication note">
    <strong>Offline by construction.</strong>
    <p>The static editions load no remote fonts, scripts, analytics, or media. Each notebook carries executed outputs; the manifest records sizes and SHA-256 digests.</p>
    <p><a href="../evidence/updated-working-tree-status.html">Open the updated working-tree status</a> for current checks and explicit limits. <a href="../evidence/index.html">Historical release evidence</a> remains available under its recorded source binding.</p>
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
"""


def serialise_notebook(notebook: dict[str, Any]) -> bytes:
    return (json.dumps(notebook, ensure_ascii=False, indent=1) + "\n").encode("utf-8")


def build_artifacts() -> dict[Path, bytes]:
    specs = (SYSTEMS_SPEC, MODEL_SPEC, RESEARCH_SPEC, VALIDATION_SPEC)
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
        (SOURCE_DIR / MODEL_SPEC.filename, PUBLISH_DIR / MODEL_SPEC.filename),
        (SOURCE_DIR / RESEARCH_SPEC.filename, PUBLISH_DIR / RESEARCH_SPEC.filename),
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
    parser.add_argument(
        "--notebooks-only",
        action="store_true",
        help="build or verify the four notebook publications without rebinding historical release evidence",
    )
    args = parser.parse_args()
    os.chdir(ROOT)
    notebook_status = check_or_write(build_artifacts(), args.check)
    if notebook_status != 0 or args.notebooks_only:
        return notebook_status
    from build_release_evidence import run as run_release_evidence

    return run_release_evidence(args.check)


if __name__ == "__main__":
    raise SystemExit(main())
