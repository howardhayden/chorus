#!/usr/bin/env python3
"""Build CHORUS concept-map and CSD-matrix documentation editions.

The versioned JSON register is authoritative. This standard-library builder
validates that register, writes canonical Markdown, and publishes progressively
enhanced self-contained HTML. JavaScript may filter and export a view; it may
not alter the register's classifications or become the only path to meaning.
"""

from __future__ import annotations

import argparse
import hashlib
import html
import json
import re
import sys
from pathlib import Path
from typing import Any, Iterable


ROOT = Path(__file__).resolve().parents[2]
SOURCE_PATH = ROOT / "docs" / "discovery" / "CHORUS-DISCOVERY-ATLAS.json"
DOC_CONCEPT = ROOT / "docs" / "CONCEPT-MAP.md"
DOC_CSD = ROOT / "docs" / "CSD-MATRIX.md"
PUBLIC_DIR = ROOT / "public" / "documentation"
PUBLIC_CONCEPT_MD = PUBLIC_DIR / "CHORUS-CONCEPT-MAP.md"
PUBLIC_CSD_MD = PUBLIC_DIR / "CHORUS-CSD-MATRIX.md"
PUBLIC_CONCEPT_HTML = PUBLIC_DIR / "chorus-concept-map.html"
PUBLIC_CSD_HTML = PUBLIC_DIR / "chorus-csd-matrix.html"
PUBLIC_INDEX = PUBLIC_DIR / "index.html"
PUBLIC_DATA = PUBLIC_DIR / "discovery-atlas.json"
SOURCE_MANIFEST = ROOT / "docs" / "discovery" / "artifact-manifest.json"
PUBLIC_MANIFEST = PUBLIC_DIR / "artifact-manifest.json"
BUILD_DATE = "2026-09-08"
REPOSITORY_BLOB = "https://github.com/howardhayden/chorus/blob/main/"
PUBLIC_ROOT = "https://chorus.observer/documentation/"

CLASSIFICATIONS = ("certainty", "supposition", "doubt")
PRIORITIES = ("critical", "high", "medium")


def stable_json(value: Any) -> bytes:
    return (json.dumps(value, ensure_ascii=False, indent=2) + "\n").encode("utf-8")


def sha256(payload: bytes) -> str:
    return hashlib.sha256(payload).hexdigest()


def unique_ids(rows: Iterable[dict[str, Any]], label: str, errors: list[str]) -> dict[str, dict[str, Any]]:
    result: dict[str, dict[str, Any]] = {}
    for row in rows:
        row_id = row.get("id")
        if not isinstance(row_id, str) or not row_id:
            errors.append(f"{label}: row lacks a stable string id")
            continue
        if row_id in result:
            errors.append(f"{label}: duplicate id {row_id}")
        result[row_id] = row
    return result


def local_source_path(raw: str) -> Path:
    return ROOT / raw.split("#", 1)[0]


def rectangles_overlap(first: dict[str, Any], second: dict[str, Any]) -> bool:
    return not (
        first["x"] + first["width"] <= second["x"]
        or second["x"] + second["width"] <= first["x"]
        or first["y"] + first["height"] <= second["y"]
        or second["y"] + second["height"] <= first["y"]
    )


def on_boundary(point: list[int], node: dict[str, Any]) -> bool:
    x, y = point
    left, right = node["x"], node["x"] + node["width"]
    top, bottom = node["y"], node["y"] + node["height"]
    return (
        left <= x <= right
        and y in (top, bottom)
        or top <= y <= bottom
        and x in (left, right)
    )


def segments(points: list[list[int]]) -> list[tuple[tuple[int, int], tuple[int, int]]]:
    return [
        ((first[0], first[1]), (second[0], second[1]))
        for first, second in zip(points, points[1:])
    ]


def segment_axis(segment: tuple[tuple[int, int], tuple[int, int]]) -> str | None:
    (x1, y1), (x2, y2) = segment
    if x1 == x2 and y1 != y2:
        return "vertical"
    if y1 == y2 and x1 != x2:
        return "horizontal"
    return None


def segment_crosses_node(
    segment: tuple[tuple[int, int], tuple[int, int]], node: dict[str, Any]
) -> bool:
    (x1, y1), (x2, y2) = segment
    left, right = node["x"], node["x"] + node["width"]
    top, bottom = node["y"], node["y"] + node["height"]
    if x1 == x2:
        low, high = sorted((y1, y2))
        return left < x1 < right and max(low, top) < min(high, bottom)
    low, high = sorted((x1, x2))
    return top < y1 < bottom and max(low, left) < min(high, right)


def segment_intersection(
    first: tuple[tuple[int, int], tuple[int, int]],
    second: tuple[tuple[int, int], tuple[int, int]],
) -> tuple[int, int] | tuple[str, int, int] | None:
    axis_a, axis_b = segment_axis(first), segment_axis(second)
    if axis_a is None or axis_b is None:
        return None
    (ax1, ay1), (ax2, ay2) = first
    (bx1, by1), (bx2, by2) = second
    if axis_a != axis_b:
        vertical = first if axis_a == "vertical" else second
        horizontal = second if axis_a == "vertical" else first
        vx = vertical[0][0]
        hy = horizontal[0][1]
        if (
            min(vertical[0][1], vertical[1][1]) <= hy <= max(vertical[0][1], vertical[1][1])
            and min(horizontal[0][0], horizontal[1][0]) <= vx <= max(horizontal[0][0], horizontal[1][0])
        ):
            return (vx, hy)
        return None
    if axis_a == "vertical" and ax1 == bx1:
        low = max(min(ay1, ay2), min(by1, by2))
        high = min(max(ay1, ay2), max(by1, by2))
        if low < high:
            return ("overlap", ax1, low)
        if low == high:
            return (ax1, low)
    if axis_a == "horizontal" and ay1 == by1:
        low = max(min(ax1, ax2), min(bx1, bx2))
        high = min(max(ax1, ax2), max(bx1, bx2))
        if low < high:
            return ("overlap", low, ay1)
        if low == high:
            return (low, ay1)
    return None


def validate_registry(data: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    if data.get("format") != "CHORUS_DISCOVERY_ATLAS" or data.get("schemaVersion") != 1:
        errors.append("register: unsupported format or schemaVersion")
        return errors
    authority = data.get("authority", {})
    for key in ("canonicalSource", "builder", "claimBoundary", "classificationPolicy", "supersessionPolicy"):
        if not authority.get(key):
            errors.append(f"register: authority.{key} is required")

    sources = unique_ids(data.get("sources", []), "sources", errors)
    for source_id, source in sources.items():
        has_path = isinstance(source.get("path"), str)
        has_url = isinstance(source.get("url"), str)
        if has_path == has_url:
            errors.append(f"sources: {source_id} must declare exactly one of path or url")
        if has_path:
            path = local_source_path(source["path"])
            try:
                path.relative_to(ROOT)
            except ValueError:
                errors.append(f"sources: {source_id} escapes the repository")
            if not path.is_file():
                errors.append(f"sources: {source_id} missing local file {source['path']}")
        if has_url and not source["url"].startswith("https://"):
            errors.append(f"sources: {source_id} must use https")

    perspectives = unique_ids(data.get("perspectives", []), "perspectives", errors)
    if "all" not in perspectives:
        errors.append("perspectives: all is required")
    groups = unique_ids(data.get("groups", []), "groups", errors)
    edge_kinds = unique_ids(data.get("edgeKinds", []), "edgeKinds", errors)
    if len(groups) != 5:
        errors.append("groups: the concept map must retain five named domains")

    concept = data.get("conceptMap", {})
    canvas = concept.get("canvas", {})
    width, height = canvas.get("width"), canvas.get("height")
    if not isinstance(width, int) or not isinstance(height, int) or width <= 0 or height <= 0:
        errors.append("conceptMap: invalid canvas")
        width = height = 0
    nodes = unique_ids(concept.get("nodes", []), "conceptMap.nodes", errors)
    if concept.get("rootId") not in nodes:
        errors.append("conceptMap: rootId does not resolve")
    for node_id, node in nodes.items():
        if node.get("group") != "root" and node.get("group") not in groups:
            errors.append(f"conceptMap.nodes: {node_id} has unknown group")
        for key in ("label", "caption", "definition", "authority"):
            if not isinstance(node.get(key), str) or not node[key].strip():
                errors.append(f"conceptMap.nodes: {node_id} lacks {key}")
        for key in ("x", "y", "width", "height"):
            if not isinstance(node.get(key), int):
                errors.append(f"conceptMap.nodes: {node_id} has invalid {key}")
        if all(isinstance(node.get(key), int) for key in ("x", "y", "width", "height")):
            if (
                node["width"] <= 0
                or node["height"] <= 0
                or node["x"] < 0
                or node["y"] < 0
                or node["x"] + node["width"] > width
                or node["y"] + node["height"] > height
            ):
                errors.append(f"conceptMap.nodes: {node_id} is outside the canvas")
        if "all" not in node.get("perspectives", []):
            errors.append(f"conceptMap.nodes: {node_id} must belong to all")
        for perspective in node.get("perspectives", []):
            if perspective not in perspectives:
                errors.append(f"conceptMap.nodes: {node_id} has unknown perspective {perspective}")
        if not node.get("sourceIds"):
            errors.append(f"conceptMap.nodes: {node_id} has no source")
        for source_id in node.get("sourceIds", []):
            if source_id not in sources:
                errors.append(f"conceptMap.nodes: {node_id} has unknown source {source_id}")

    node_rows = list(nodes.values())
    for index, first in enumerate(node_rows):
        for second in node_rows[index + 1 :]:
            if rectangles_overlap(first, second):
                errors.append(f"conceptMap.nodes: {first['id']} overlaps {second['id']}")

    edges = unique_ids(concept.get("edges", []), "conceptMap.edges", errors)
    routed_segments: list[tuple[str, tuple[tuple[int, int], tuple[int, int]]]] = []
    for edge_id, edge in edges.items():
        if edge.get("source") not in nodes or edge.get("target") not in nodes:
            errors.append(f"conceptMap.edges: {edge_id} has an unknown endpoint")
            continue
        if edge.get("kind") not in edge_kinds:
            errors.append(f"conceptMap.edges: {edge_id} has unknown kind")
        if not isinstance(edge.get("label"), str) or not edge["label"].strip():
            errors.append(f"conceptMap.edges: {edge_id} lacks a relationship label")
        if edge.get("drawn") is True:
            points = edge.get("points")
            if not isinstance(points, list) or len(points) < 2:
                errors.append(f"conceptMap.edges: {edge_id} lacks a route")
                continue
            if not on_boundary(points[0], nodes[edge["source"]]):
                errors.append(f"conceptMap.edges: {edge_id} does not start on its source boundary")
            if not on_boundary(points[-1], nodes[edge["target"]]):
                errors.append(f"conceptMap.edges: {edge_id} does not end on its target boundary")
            for segment in segments(points):
                if segment_axis(segment) is None:
                    errors.append(f"conceptMap.edges: {edge_id} has a diagonal or zero-length segment")
                    continue
                for node_id, node in nodes.items():
                    if node_id not in (edge["source"], edge["target"]) and segment_crosses_node(segment, node):
                        errors.append(f"conceptMap.edges: {edge_id} crosses node {node_id}")
                routed_segments.append((edge_id, segment))
        elif "points" in edge:
            errors.append(f"conceptMap.edges: non-drawn {edge_id} must not retain route geometry")

    for index, (edge_a, segment_a) in enumerate(routed_segments):
        for edge_b, segment_b in routed_segments[index + 1 :]:
            if edge_a == edge_b:
                continue
            intersection = segment_intersection(segment_a, segment_b)
            if intersection is None:
                continue
            endpoints = {segment_a[0], segment_a[1]} & {segment_b[0], segment_b[1]}
            if isinstance(intersection[0], str) or intersection not in endpoints:
                errors.append(f"conceptMap.edges: {edge_a} crosses or overlaps {edge_b} at {intersection}")

    csd = data.get("csd", {})
    topics = unique_ids(csd.get("topics", []), "csd.topics", errors)
    items = unique_ids(csd.get("items", []), "csd.items", errors)
    method = csd.get("method", {})
    if method.get("sourceId") not in sources:
        errors.append("csd.method: source does not resolve")
    for item_id, item in items.items():
        classification = item.get("classification")
        if classification not in CLASSIFICATIONS:
            errors.append(f"csd.items: {item_id} has invalid classification")
        if item.get("topic") not in topics:
            errors.append(f"csd.items: {item_id} has unknown topic")
        statement = item.get("statement", "")
        if classification == "certainty" and not re.match(r"^We (?:know|understand)\b", statement):
            errors.append(f"csd.items: {item_id} certainty must begin with We know or We understand")
        if classification == "supposition" and not statement.startswith("We believe "):
            errors.append(f"csd.items: {item_id} supposition must begin with We believe")
        if classification == "doubt" and not statement.endswith("?"):
            errors.append(f"csd.items: {item_id} doubt must be a question")
        for key in (
            "basis",
            "evidence",
            "testOrResearch",
            "decisionUse",
            "owner",
            "status",
            "lastReviewed",
            "reviewTrigger",
        ):
            if not isinstance(item.get(key), str) or not item[key].strip():
                errors.append(f"csd.items: {item_id} lacks {key}")
        if item.get("priority") not in PRIORITIES:
            errors.append(f"csd.items: {item_id} has invalid priority")
        if not item.get("sourceIds"):
            errors.append(f"csd.items: {item_id} has no cited source")
        for source_id in item.get("sourceIds", []):
            if source_id not in sources:
                errors.append(f"csd.items: {item_id} has unknown source {source_id}")
        for dependency in item.get("dependencies", []):
            if dependency not in items or dependency == item_id:
                errors.append(f"csd.items: {item_id} has invalid dependency {dependency}")
        for prior in item.get("supersedes", []):
            if prior not in items or prior == item_id:
                errors.append(f"csd.items: {item_id} has invalid supersedes value {prior}")
        history = item.get("history")
        if not isinstance(history, list) or not history or history[-1].get("to") != classification:
            errors.append(f"csd.items: {item_id} history does not end at current classification")

    for topic_id in topics:
        present = {item["classification"] for item in items.values() if item.get("topic") == topic_id}
        if present != set(CLASSIFICATIONS):
            errors.append(f"csd.topics: {topic_id} must contain certainty, supposition, and doubt")
    if len(items) != 28:
        errors.append(f"csd.items: expected 28 atomic entries, found {len(items)}")
    return errors


def source_href(source: dict[str, Any]) -> str:
    return source.get("url") or f"{REPOSITORY_BLOB}{source['path']}"


def source_text(source: dict[str, Any]) -> str:
    location = source.get("path") or source.get("url")
    return f"[{source['label']}]({source_href(source)}) (`{location}`)"


def slug(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def mermaid_id(value: str) -> str:
    return "n" + re.sub(r"[^A-Za-z0-9]", "", value)


def md_cell(items: list[dict[str, Any]]) -> str:
    if not items:
        return "—"
    return "<br><br>".join(f"**{item['id']}** — {item['statement']}" for item in items)


def concept_markdown(data: dict[str, Any], public_copy: bool = False) -> str:
    concept = data["conceptMap"]
    node_by_id = {node["id"]: node for node in concept["nodes"]}
    source_by_id = {source["id"]: source for source in data["sources"]}
    group_by_id = {group["id"]: group for group in data["groups"]}
    interactive = "chorus-concept-map.html" if public_copy else "../public/documentation/chorus-concept-map.html"
    data_link = "discovery-atlas.json" if public_copy else "../public/documentation/discovery-atlas.json"
    lines = [
        "---",
        "title: CHORUS Concept Map",
        f"revision: {data['revision']}",
        "authority: docs/discovery/CHORUS-DISCOVERY-ATLAS.json",
        "---",
        "",
        "# CHORUS concept map",
        "",
        "This map makes CHORUS's knowledge, concurrency, situated agency, consequence, and conclusion architecture readable as one typed system. The visual is supplementary: the concept register and relationship table below are the canonical text equivalent.",
        "",
        f"[Open the interactive HTML edition]({interactive}) · [Download the machine-readable register]({data_link})",
        "",
        "## Authority and claim boundary",
        "",
        data["authority"]["claimBoundary"],
        "",
        data["authority"]["classificationPolicy"],
        "",
        "## Map",
        "",
        "```mermaid",
        "flowchart TB",
        f"  {mermaid_id(concept['rootId'])}[\"CHORUS<br/>Concurrent social meaning\"]",
    ]
    for group in sorted(data["groups"], key=lambda row: row["order"]):
        group_nodes = [node for node in concept["nodes"] if node["group"] == group["id"]]
        lines.extend([f"  subgraph g{slug(group['id'])}[\"{group['label']}\"]", "    direction TB"])
        for node in group_nodes:
            label = html.escape(node["label"], quote=True).replace("&middot;", "·")
            lines.append(f"    {mermaid_id(node['id'])}[\"{label}\"]")
        lines.append("  end")
    for edge in concept["edges"]:
        if edge["drawn"]:
            arrow = "-.->" if edge["kind"] in ("constraint", "interpretive") else "-->"
            lines.append(
                f"  {mermaid_id(edge['source'])} {arrow}|\"{edge['label']}\"| {mermaid_id(edge['target'])}"
            )
    lines.extend([
        "```",
        "",
        "The diagram renders the primary, crossing-free structure. Cross-domain relations remain explicit in the complete relationship table rather than being routed through unrelated nodes.",
        "",
        "## Concept register",
        "",
    ])
    for group in sorted(data["groups"], key=lambda row: row["order"]):
        lines.extend([f"### {group['label']}", "", group["description"], ""])
        for node in concept["nodes"]:
            if node["group"] != group["id"]:
                continue
            related = []
            for edge in concept["edges"]:
                if edge["source"] == node["id"]:
                    related.append(f"{edge['label']} → {node_by_id[edge['target']]['label']} ({edge['id']})")
                elif edge["target"] == node["id"]:
                    related.append(f"{node_by_id[edge['source']]['label']} → {edge['label']} ({edge['id']})")
            sources = "; ".join(source_text(source_by_id[source_id]) for source_id in node["sourceIds"])
            lines.extend([
                f'<details id="{node["id"].lower()}">',
                f'<summary><strong>{node["id"]}</strong> · {node["label"]} — {node["caption"]}</summary>',
                "",
                node["definition"],
                "",
                f"- **Authority:** {node['authority']}",
                f"- **Sources:** {sources}",
                f"- **Typed relations:** {'; '.join(related)}",
                "",
                "</details>",
                "",
            ])
    root = node_by_id[concept["rootId"]]
    lines.extend([
        "### Governing core",
        "",
        f"**{root['id']} · {root['label']}.** {root['definition']}",
        "",
        "## Complete typed relationships",
        "",
        "| ID | Source | Relation | Target | Kind | Visual route |",
        "|---|---|---|---|---|---|",
    ])
    kind_by_id = {kind["id"]: kind for kind in data["edgeKinds"]}
    for edge in concept["edges"]:
        lines.append(
            f"| `{edge['id']}` | {node_by_id[edge['source']]['label']} | {edge['label']} | "
            f"{node_by_id[edge['target']]['label']} | {kind_by_id[edge['kind']]['label']} | "
            f"{'Primary map' if edge['drawn'] else 'Text and interactive selection'} |"
        )
    lines.extend([
        "",
        "## Reading rules",
        "",
        "- A connector names one typed relation; proximity and color do not create an additional claim.",
        "- A node definition is bounded by its cited canonical owner. This map does not replace that owner.",
        "- Search, perspective filters, node selection, and downloaded views alter presentation only.",
        "- The full concept register and relationship table remain available without JavaScript, pointer input, color, or the Mermaid rendering.",
        "",
        "## Maintenance",
        "",
        f"Generated from `{data['authority']['canonicalSource']}` by `{data['authority']['builder']}`. Do not hand-edit this projection. Update the register, preserve stable IDs and supersession history, then rebuild and check both editions.",
        "",
    ])
    return "\n".join(lines)


def csd_markdown(data: dict[str, Any], public_copy: bool = False) -> str:
    csd = data["csd"]
    source_by_id = {source["id"]: source for source in data["sources"]}
    topic_by_id = {topic["id"]: topic for topic in csd["topics"]}
    interactive = "chorus-csd-matrix.html" if public_copy else "../public/documentation/chorus-csd-matrix.html"
    data_link = "discovery-atlas.json" if public_copy else "../public/documentation/discovery-atlas.json"
    method_source = source_by_id[csd["method"]["sourceId"]]
    lines = [
        "---",
        "title: CHORUS CSD Matrix",
        f"revision: {data['revision']}",
        "authority: docs/discovery/CHORUS-DISCOVERY-ATLAS.json",
        "---",
        "",
        "# CHORUS CSD matrix",
        "",
        "This living discovery register separates what the current repository establishes from plausible experience outcomes and unresolved research questions. It follows the Certainties, Suppositions, and Doubts framework described by NN/g; the technique originated with Tennyson Pinheiro, Luis Alt, and the Livework São Paulo team.",
        "",
        f"[Open the interactive HTML edition]({interactive}) · [Download the machine-readable register]({data_link}) · {source_text(method_source)}",
        "",
        "## Classification boundary",
        "",
        "- **Certainty** means a current, cited repository fact, implemented boundary, or source-bound evidence state. It does not mean universal truth about people or proven learning impact.",
        "- **Supposition** means a plausible, testable outcome supported by design rationale or early evidence but not yet established by adequate user research.",
        "- **Doubt** means an open question whose answer could change the design, claim boundary, release decision, or appropriate context of use.",
        "",
        data["authority"]["classificationPolicy"],
        "",
        "## Matrix",
        "",
        "| Topic | Certainties | Suppositions | Doubts |",
        "|---|---|---|---|",
    ]
    for topic in sorted(csd["topics"], key=lambda row: row["order"]):
        by_class = {
            classification: [
                item for item in csd["items"]
                if item["topic"] == topic["id"] and item["classification"] == classification
            ]
            for classification in CLASSIFICATIONS
        }
        lines.append(
            f"| **{topic['label']}**<br>{topic['description']} | {md_cell(by_class['certainty'])} | "
            f"{md_cell(by_class['supposition'])} | {md_cell(by_class['doubt'])} |"
        )
    lines.extend(["", "## Atomic discovery register", ""])
    classification_labels = {
        "certainty": "Certainties",
        "supposition": "Suppositions",
        "doubt": "Doubts",
    }
    for topic in sorted(csd["topics"], key=lambda row: row["order"]):
        lines.extend([f"### {topic['label']}", "", topic["description"], ""])
        for classification in CLASSIFICATIONS:
            lines.extend([f"#### {classification_labels[classification]}", ""])
            for item in csd["items"]:
                if item["topic"] != topic["id"] or item["classification"] != classification:
                    continue
                sources = "; ".join(source_text(source_by_id[source_id]) for source_id in item["sourceIds"])
                history = "; ".join(
                    f"{entry['date']}: {entry.get('from') or 'unclassified'} → {entry['to']} — {entry['basis']}"
                    for entry in item["history"]
                )
                lines.extend([
                    f'<details id="{item["id"].lower()}">',
                    f'<summary><strong>{item["id"]}</strong> · {item["statement"]}</summary>',
                    "",
                    f"- **Basis:** {item['basis']}",
                    f"- **Evidence state:** {item['evidence']}",
                    f"- **Test or research path:** {item['testOrResearch']}",
                    f"- **Decision use:** {item['decisionUse']}",
                    f"- **Owner:** {item['owner']}",
                    f"- **Priority / status:** {item['priority']} / {item['status']}",
                    f"- **Review trigger:** {item['reviewTrigger']}",
                    f"- **Dependencies:** {', '.join(item['dependencies']) or 'None'}",
                    f"- **Sources:** {sources}",
                    f"- **Classification history:** {history}",
                    "",
                    "</details>",
                    "",
                ])
    counts = {
        classification: sum(item["classification"] == classification for item in csd["items"])
        for classification in CLASSIFICATIONS
    }
    lines.extend([
        "## Movement and maintenance contract",
        "",
        f"Current register: **{counts['certainty']} certainties · {counts['supposition']} suppositions · {counts['doubt']} doubts** across {len(csd['topics'])} topics.",
        "",
        "1. New evidence is attached to the existing stable item ID.",
        "2. A changed classification receives a dated history entry; prior wording is not silently erased.",
        "3. A certainty is demoted when its evidence expires, its source binding changes, or a counterexample invalidates it.",
        "4. A supposition moves to certainty only when its stated evidence path is satisfied; plausibility and polish are insufficient.",
        "5. A doubt may become a supposition, a certainty, remain open, or be retired with an explicit rationale.",
        "6. Browser filters and exported views are read-only projections and never constitute evidence or a classification change.",
        "",
        f"Generated from `{data['authority']['canonicalSource']}` by `{data['authority']['builder']}`. Do not hand-edit this projection.",
        "",
    ])
    return "\n".join(lines)


CSS = r'''
:root{
  color-scheme:dark;
  --ink:#f2f1e8;--muted:#c7d1c9;--green:#0b2819;--green-2:#123d27;
  --mint:#a7e0bd;--gold:#e2c57f;--silver:#d5dedc;--line:rgba(213,222,220,.24);
  --paper:#07140d;--panel:#0b1f14;--focus:#f1cf78;--danger:#f1b5a8;
  font-family:Georgia,"Times New Roman",serif;
}
*{box-sizing:border-box}
html{background:var(--paper);color:var(--ink);scroll-behavior:smooth}
body{margin:0;min-width:280px;background:
  radial-gradient(circle at 10% 0%,rgba(37,101,64,.32),transparent 34rem),
  radial-gradient(circle at 92% 12%,rgba(196,155,72,.13),transparent 28rem),var(--paper);line-height:1.65}
a{color:var(--mint);text-underline-offset:.18em}
a:hover{text-decoration-thickness:.15em}
a:focus-visible,button:focus-visible,input:focus-visible,select:focus-visible,summary:focus-visible,
.map-stage:focus-visible,.table-wrap:focus-visible,.concept-node:focus-visible .node-shape{
  outline:3px solid var(--focus);outline-offset:4px
}
.skip-link{position:absolute;left:1rem;top:-8rem;z-index:30;padding:.7rem 1rem;background:#fff;color:#07140d;border-radius:.4rem}
.skip-link:focus{top:1rem}
.site-header{border-bottom:1px solid var(--line);padding:clamp(2rem,7vw,5.5rem) max(1rem,calc((100vw - 76rem)/2));background:rgba(4,18,11,.72)}
.eyebrow{margin:0 0 .8rem;color:var(--gold);font:700 .78rem/1.4 ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.14em;text-transform:uppercase}
h1,h2,h3,h4{line-height:1.15;text-wrap:balance}
h1{margin:0;max-width:17ch;font-size:clamp(2.4rem,7vw,5.8rem);font-weight:600;letter-spacing:-.035em}
.lede{max-width:72ch;margin:1.2rem 0 0;color:var(--silver);font-size:clamp(1rem,2vw,1.24rem)}
.doc-nav{display:flex;flex-wrap:wrap;gap:.65rem;margin-top:1.5rem}
.doc-nav a,.button-link{display:inline-flex;align-items:center;min-height:44px;padding:.55rem .9rem;border:1px solid var(--line);border-radius:999px;background:rgba(11,40,25,.72);text-decoration:none}
.doc-nav a[aria-current=page]{border-color:var(--gold);color:var(--gold)}
main{width:min(76rem,calc(100% - 2rem));margin:0 auto;padding:2rem 0 5rem}
.doc-card{margin:0 0 1.2rem;padding:clamp(1rem,3vw,1.7rem);border:1px solid var(--line);border-radius:.75rem 1.25rem .85rem 1.05rem;background:linear-gradient(145deg,rgba(11,31,20,.96),rgba(8,24,15,.9));box-shadow:0 1rem 3rem rgba(0,0,0,.12)}
.doc-card h2{margin-top:0;font-size:clamp(1.55rem,3.4vw,2.35rem);color:var(--gold)}
.doc-card h3{color:var(--silver)}
.doc-card p,.doc-card li{max-width:82ch}
.boundary{border-left:5px solid var(--gold)}
.toolbar{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,13rem),1fr));gap:.8rem;align-items:end;margin:1rem 0;padding:1rem;border:1px solid var(--line);border-radius:.8rem;background:rgba(5,19,11,.76)}
.toolbar label,.toolbar legend{display:block;color:var(--silver);font-weight:700}
.toolbar input[type=search],.toolbar select{width:100%;min-height:44px;margin-top:.35rem;padding:.55rem .65rem;border:1px solid var(--line);border-radius:.45rem;background:#041009;color:var(--ink);font:inherit}
.toolbar button{min-height:44px;padding:.55rem .8rem;border:1px solid var(--line);border-radius:.45rem;background:var(--green);color:var(--ink);font:inherit;cursor:pointer}
.toolbar button:hover{border-color:var(--gold);color:var(--gold)}
.toolbar fieldset{min-width:0;margin:0;padding:.45rem .65rem;border:1px solid var(--line);border-radius:.45rem}
.check-row{display:flex;flex-wrap:wrap;gap:.3rem .8rem;margin-top:.3rem}
.check-row label{display:flex;gap:.35rem;align-items:center;font-weight:400}
.status-line{min-height:1.65em;color:var(--mint);font-family:ui-monospace,SFMono-Regular,Consolas,monospace}
.map-stage{max-width:100%;overflow:auto;border:1px solid var(--line);border-radius:.8rem;background:rgba(4,16,9,.84);overscroll-behavior:contain}
.map-stage svg{display:block;width:100%;height:auto;min-width:68rem}
.edge{fill:none;stroke:var(--silver);stroke-width:2;marker-end:url(#map-arrow);opacity:.68;vector-effect:non-scaling-stroke}
.edge-kind-constraint{stroke:var(--gold);stroke-dasharray:7 6}
.edge-kind-evidence{stroke:var(--mint)}
.edge-kind-interpretive{stroke:var(--silver);stroke-dasharray:3 5}
.concept-node{cursor:pointer;color:inherit;text-decoration:none}
.node-shape{fill:#0b1f14;stroke:var(--silver);stroke-width:2;rx:14;vector-effect:non-scaling-stroke}
.concept-node[data-group=knowledge] .node-shape{fill:#10291f}
.concept-node[data-group=concurrency] .node-shape{fill:#0d2b22}
.concept-node[data-group=agency] .node-shape{fill:#14281a;stroke:var(--gold)}
.concept-node[data-group=consequence] .node-shape{fill:#0c2520;stroke:var(--mint)}
.concept-node[data-group=conclusion] .node-shape{fill:#1a2519;stroke:var(--gold)}
.concept-node[data-group=root] .node-shape{fill:#123d27;stroke:var(--gold);stroke-width:3}
.concept-node:hover .node-shape,.concept-node:focus-visible .node-shape,.concept-node.is-selected .node-shape{stroke:var(--focus);stroke-width:4;filter:drop-shadow(0 .5rem .7rem rgba(0,0,0,.35))}
.concept-node.is-related .node-shape{stroke:var(--mint);stroke-width:3}
.concept-node.is-dimmed,.edge.is-dimmed{opacity:.16}
.is-filtered{display:none!important}
.node-group{fill:var(--gold);font:700 11px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:1.3px;text-transform:uppercase}
.node-title{fill:var(--ink);font:700 17px Georgia,"Times New Roman",serif}
.node-caption{fill:var(--muted);font:12.5px Georgia,"Times New Roman",serif}
.legend{display:flex;flex-wrap:wrap;gap:.7rem 1.2rem;margin:.8rem 0;color:var(--muted);font-size:.9rem}
.legend span{display:inline-flex;align-items:center;gap:.45rem}
.legend i{display:inline-block;width:1.9rem;border-top:2px solid var(--silver)}
.legend .constraint{border-top-color:var(--gold);border-top-style:dashed}
.legend .evidence{border-top-color:var(--mint)}
.legend .interpretive{border-top-style:dotted}
.selection-panel{margin-top:1rem;padding:1rem;border:1px solid var(--gold);border-radius:.7rem;background:rgba(18,61,39,.38)}
.selection-panel h3{margin-top:0}
.catalog-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,20rem),1fr));gap:.8rem}
.concept-card,.index-card{min-width:0;padding:1rem;border:1px solid var(--line);border-radius:.7rem;background:rgba(14,54,33,.42)}
.concept-card h3,.index-card h2{margin:.2rem 0 .45rem;color:var(--silver)}
.concept-card .identifier,.csd-card .identifier{color:var(--gold);font:700 .75rem ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.07em}
.source-list{padding-left:1.2rem}
.table-wrap{max-width:100%;overflow-x:auto;border:1px solid var(--line);border-radius:.7rem;background:rgba(5,19,11,.8)}
table{width:100%;border-collapse:collapse;min-width:48rem}
caption{padding:1rem;text-align:left;color:var(--gold);font-size:1.04rem;font-weight:700}
th,td{padding:.75rem;vertical-align:top;text-align:left;border-top:1px solid var(--line)}
thead th{color:var(--silver);background:rgba(20,61,39,.72)}
tbody th{color:var(--mint)}
.csd-topic{margin:1rem 0 1.35rem;padding-top:.5rem;border-top:1px solid var(--line)}
.csd-topic>header h3{margin-bottom:.25rem;color:var(--gold);font-size:1.45rem}
.csd-topic>header p{margin-top:0;color:var(--muted)}
.csd-columns{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.8rem;align-items:start}
.csd-column{min-width:0;padding:.8rem;border:1px solid var(--line);border-radius:.7rem;background:rgba(5,19,11,.58)}
.csd-column h4{margin:.1rem 0 .7rem;color:var(--silver);font-size:1rem}
.csd-count{display:inline-block;margin-left:.35rem;padding:.05rem .4rem;border:1px solid currentColor;border-radius:999px;font:700 .7rem ui-monospace,SFMono-Regular,Consolas,monospace}
.csd-card{margin:.6rem 0;border:1px solid var(--line);border-radius:.6rem;background:rgba(14,54,33,.42)}
.csd-card summary{min-height:44px;padding:.8rem;cursor:pointer;color:var(--ink);font-weight:700}
.csd-card summary::marker{color:var(--gold)}
.csd-body{padding:0 .8rem .8rem;border-top:1px solid var(--line)}
.csd-body dl{margin:.7rem 0 0}
.csd-body dt{margin-top:.55rem;color:var(--mint);font-weight:700}
.csd-body dd{margin:.1rem 0 0}
.classification-certainty{border-top:3px solid var(--mint)}
.classification-supposition{border-top:3px dashed var(--gold)}
.classification-doubt{border-top:3px dotted var(--silver)}
.method-note{padding:1rem;border-left:4px solid var(--mint);background:rgba(14,54,33,.38)}
.card-index{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,20rem),1fr));gap:1rem}
.index-card p{color:var(--muted)}
.link-row{display:flex;flex-wrap:wrap;gap:.65rem;margin-top:1rem}
.link-row a{display:inline-flex;align-items:center;min-height:44px;padding:.55rem .85rem;border:1px solid var(--line);border-radius:.5rem;text-decoration:none}
.no-script{color:var(--muted)}
.js .no-script{display:none}
.site-footer{border-top:1px solid var(--line);padding:1.5rem max(1rem,calc((100vw - 76rem)/2));color:var(--muted)}
.sr-only{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}
@media(max-width:52rem){.csd-columns{grid-template-columns:1fr}.map-stage svg{min-width:62rem}}
@media(max-width:42rem){main{width:min(100% - 1rem,76rem)}.doc-card{padding:1rem}.toolbar{grid-template-columns:1fr}table{min-width:42rem}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*{animation:none!important;transition:none!important}}
@media(forced-colors:active){*{box-shadow:none!important}.doc-card,.concept-card,.selection-panel,.map-stage,.table-wrap,.csd-column,.csd-card,.index-card{border:1px solid CanvasText}.node-shape{fill:Canvas!important;stroke:CanvasText!important}.edge{stroke:CanvasText!important}.node-title,.node-caption,.node-group{fill:CanvasText!important}.concept-node.is-dimmed,.edge.is-dimmed{opacity:1}.concept-node.is-dimmed .node-shape{stroke-dasharray:2 5!important}}
@media print{html,body{background:#fff;color:#111}.site-header,.doc-card,.concept-card,.selection-panel,.csd-column,.csd-card,.index-card{background:#fff;color:#111;box-shadow:none}.doc-nav,.skip-link,.toolbar,.selection-panel,.no-script{display:none!important}a{color:#111}.map-stage{overflow:visible}.map-stage svg{min-width:0}.node-shape{fill:#fff!important;stroke:#111!important}.node-title,.node-caption,.node-group{fill:#111!important}.edge{stroke:#111!important}.table-wrap{overflow:visible}table{min-width:0}.csd-columns{grid-template-columns:repeat(3,minmax(0,1fr))}}
'''


def html_sources(source_ids: list[str], source_by_id: dict[str, dict[str, Any]]) -> str:
    links = []
    for source_id in source_ids:
        source = source_by_id[source_id]
        location = source.get("path") or source.get("url")
        links.append(
            f'<li><a href="{html.escape(source_href(source), quote=True)}">{html.escape(source["label"])}</a>'
            f' <code>{html.escape(location)}</code></li>'
        )
    return f'<ul class="source-list">{"".join(links)}</ul>'


def wrap_label(value: str, limit: int = 24) -> list[str]:
    words = value.split()
    lines: list[str] = []
    current = ""
    for word in words:
        candidate = f"{current} {word}".strip()
        if current and len(candidate) > limit and len(lines) == 0:
            lines.append(current)
            current = word
        else:
            current = candidate
    if current:
        lines.append(current)
    if len(lines) > 2:
        lines = [lines[0], " ".join(lines[1:])]
    return lines


def svg_map(data: dict[str, Any]) -> str:
    concept = data["conceptMap"]
    nodes = {node["id"]: node for node in concept["nodes"]}
    groups = {group["id"]: group for group in data["groups"]}
    paths = []
    for edge in concept["edges"]:
        if not edge["drawn"]:
            continue
        command = " ".join(
            ("M" if index == 0 else "L") + f" {point[0]} {point[1]}"
            for index, point in enumerate(edge["points"])
        )
        accessible = f"{nodes[edge['source']]['label']} {edge['label']} {nodes[edge['target']]['label']}"
        paths.append(
            f'<path id="{edge["id"].lower()}" class="edge edge-kind-{edge["kind"]}" '
            f'data-edge-id="{edge["id"]}" data-source="{edge["source"]}" data-target="{edge["target"]}" '
            f'd="{command}"><title>{html.escape(accessible)}</title></path>'
        )
    node_markup = []
    for node in concept["nodes"]:
        group_label = "Governing core" if node["group"] == "root" else groups[node["group"]]["label"]
        title_lines = wrap_label(node["label"])
        title_spans = "".join(
            f'<tspan x="{node["x"] + 14}" dy="{0 if index == 0 else 19}">{html.escape(line)}</tspan>'
            for index, line in enumerate(title_lines)
        )
        node_markup.append(
            f'<a id="map-link-{node["id"].lower()}" class="concept-node" href="#{node["id"].lower()}" '
            f'data-node-id="{node["id"]}" data-group="{node["group"]}" role="button" tabindex="0" '
            f'aria-label="{html.escape(node["label"] + ": " + node["definition"], quote=True)}">'
            f'<rect class="node-shape" x="{node["x"]}" y="{node["y"]}" width="{node["width"]}" height="{node["height"]}" />'
            f'<text class="node-group" x="{node["x"] + 14}" y="{node["y"] + 19}">{html.escape(group_label)}</text>'
            f'<text class="node-title" x="{node["x"] + 14}" y="{node["y"] + 46}">{title_spans}</text>'
            f'<text class="node-caption" x="{node["x"] + 14}" y="{node["y"] + 86}">{html.escape(node["caption"])}</text>'
            '</a>'
        )
    return (
        f'<svg viewBox="0 0 {concept["canvas"]["width"]} {concept["canvas"]["height"]}" '
        'role="img" aria-labelledby="concept-svg-title concept-svg-desc" data-routing="orthogonal-crossing-free">'
        '<title id="concept-svg-title">CHORUS concept map</title>'
        '<desc id="concept-svg-desc">Five concept domains connect CHORUS to its knowledge boundary, concurrent night, situated agency, cross-room consequences, and bounded conclusion. A complete text equivalent follows.</desc>'
        '<defs><marker id="map-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke" /></marker></defs>'
        f'{"".join(paths)}{"".join(node_markup)}</svg>'
    )


def html_shell(title: str, eyebrow: str, summary: str, current: str, body: str, script: str = "") -> str:
    nav = (
        ("index.html", "Documentation maps"),
        ("chorus-concept-map.html", "Concept map"),
        ("chorus-csd-matrix.html", "CSD matrix"),
        ("../notebooks/index.html", "Executed notebooks"),
    )
    links = "".join(
        f'<a href="{href}" aria-current="page">{label}</a>' if href == current else f'<a href="{href}">{label}</a>'
        for href, label in nav
    )
    script_markup = f"\n{script}" if script else ""
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="{html.escape(summary, quote=True)}">
<meta name="theme-color" content="#0b2819">
<link rel="icon" href="../favicon.svg" type="image/svg+xml">
<link rel="icon" href="../favicon-32x32.png" sizes="32x32" type="image/png">
<link rel="shortcut icon" href="../favicon.ico">
<link rel="apple-touch-icon" href="../apple-touch-icon.png" sizes="180x180">
<link rel="manifest" href="../site.webmanifest">
<title>{html.escape(title)} · CHORUS documentation</title>
<style>{CSS}</style>
</head>
<body>
<a class="skip-link" href="#main">Skip to documentation</a>
<header class="site-header">
  <p class="eyebrow">{html.escape(eyebrow)}</p>
  <h1>{html.escape(title)}</h1>
  <p class="lede">{html.escape(summary)}</p>
  <nav class="doc-nav" aria-label="Documentation map navigation">{links}</nav>
</header>
<main id="main">{body}</main>
<footer class="site-footer"><p>Canonical register · deterministic Markdown and HTML projections · {BUILD_DATE} · no analytics, storage, or remote runtime dependencies</p></footer>{script_markup}
</body>
</html>
'''


CONCEPT_SCRIPT = r'''<script>
(() => {
  "use strict";
  document.documentElement.classList.add("js");
  document.querySelectorAll("[data-enhancement]").forEach((element) => { element.hidden = false; });
  const data = JSON.parse(document.getElementById("concept-data").textContent);
  const nodes = new Map(data.nodes.map((node) => [node.id, node]));
  const nodeElements = new Map([...document.querySelectorAll("[data-node-id]")].filter((element) => element.closest("svg")).map((element) => [element.dataset.nodeId, element]));
  const catalogElements = new Map([...document.querySelectorAll(".concept-card[data-node-id]")].map((element) => [element.dataset.nodeId, element]));
  const edgeElements = [...document.querySelectorAll("[data-edge-id]")];
  const search = document.getElementById("map-search");
  const perspective = document.getElementById("map-perspective");
  const status = document.getElementById("map-status");
  const detail = document.getElementById("map-selection");
  const detailTitle = document.getElementById("map-selection-title");
  const detailText = document.getElementById("map-selection-text");
  const detailAuthority = document.getElementById("map-selection-authority");
  const detailRelations = document.getElementById("map-selection-relations");
  const detailSources = document.getElementById("map-selection-sources");
  let selectedId = null;

  const normalized = (value) => value.toLocaleLowerCase("en-US").normalize("NFKC");
  const visibleIds = () => new Set([...nodeElements].filter(([, element]) => !element.classList.contains("is-filtered")).map(([id]) => id));
  const replaceTextList = (element, values) => {
    element.replaceChildren(...values.map((value) => {
      const item = document.createElement("li");
      item.textContent = value;
      return item;
    }));
  };
  const replaceSourceList = (element, values) => {
    element.replaceChildren(...values.map((source) => {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = source.href;
      link.textContent = source.label;
      item.append(link);
      const code = document.createElement("code");
      code.textContent = ` ${source.location}`;
      item.append(code);
      return item;
    }));
  };
  const clearSelection = () => {
    selectedId = null;
    nodeElements.forEach((element) => element.classList.remove("is-selected", "is-related", "is-dimmed"));
    edgeElements.forEach((element) => element.classList.remove("is-related", "is-dimmed"));
    detail.hidden = true;
    if (location.hash) history.replaceState(null, "", location.pathname + location.search);
  };
  const selectNode = (id, announce = true) => {
    const node = nodes.get(id);
    if (!node || !visibleIds().has(id)) return;
    selectedId = id;
    const relatedIds = new Set([id]);
    const relations = [];
    data.edges.forEach((edge) => {
      if (edge.source === id || edge.target === id) {
        relatedIds.add(edge.source === id ? edge.target : edge.source);
        const source = nodes.get(edge.source).label;
        const target = nodes.get(edge.target).label;
        relations.push(`${source} ${edge.label} ${target} · ${edge.id}`);
      }
    });
    nodeElements.forEach((element, nodeId) => {
      element.classList.toggle("is-selected", nodeId === id);
      element.classList.toggle("is-related", nodeId !== id && relatedIds.has(nodeId));
      element.classList.toggle("is-dimmed", !relatedIds.has(nodeId) && !element.classList.contains("is-filtered"));
    });
    edgeElements.forEach((element) => {
      const connected = element.dataset.source === id || element.dataset.target === id;
      element.classList.toggle("is-related", connected);
      element.classList.toggle("is-dimmed", !connected && !element.classList.contains("is-filtered"));
    });
    detailTitle.textContent = `${node.id} · ${node.label}`;
    detailText.textContent = node.definition;
    detailAuthority.textContent = node.authority;
    replaceTextList(detailRelations, relations);
    replaceSourceList(detailSources, node.sources);
    detail.hidden = false;
    history.replaceState(null, "", `#${id.toLocaleLowerCase("en-US")}`);
    if (announce) status.textContent = `${node.label} selected. ${relations.length} typed relations shown.`;
  };
  const applyFilters = () => {
    const query = normalized(search.value.trim());
    const view = perspective.value;
    nodes.forEach((node, id) => {
      const haystack = normalized([node.id, node.label, node.caption, node.definition, node.authority, ...node.aliases].join(" "));
      const visible = (view === "all" || node.perspectives.includes(view)) && (!query || haystack.includes(query));
      nodeElements.get(id).classList.toggle("is-filtered", !visible);
      catalogElements.get(id).classList.toggle("is-filtered", !visible);
    });
    const visible = visibleIds();
    edgeElements.forEach((element) => {
      element.classList.toggle("is-filtered", !visible.has(element.dataset.source) || !visible.has(element.dataset.target));
    });
    document.querySelectorAll(".relationship-row").forEach((row) => {
      row.classList.toggle("is-filtered", !visible.has(row.dataset.source) || !visible.has(row.dataset.target));
    });
    document.querySelectorAll("[data-catalog-section]").forEach((section) => {
      const hasVisible = [...section.querySelectorAll(".concept-card")].some((card) => !card.classList.contains("is-filtered"));
      section.classList.toggle("is-filtered", !hasVisible);
    });
    if (selectedId && !visible.has(selectedId)) clearSelection();
    status.textContent = `${visible.size} of ${nodes.size} concepts shown. Filters change presentation only.`;
  };
  const download = (text, filename) => {
    const url = URL.createObjectURL(new Blob([text], { type: "text/markdown;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };
  const exportVisible = () => {
    const visible = visibleIds();
    const lines = ["# CHORUS concept map · exported view", "", `Register revision: ${data.revision}`, `Perspective: ${perspective.options[perspective.selectedIndex].text}`, `Search: ${search.value.trim() || "None"}`, "", "## Concepts", ""];
    data.nodes.filter((node) => visible.has(node.id)).forEach((node) => {
      lines.push(`### ${node.id} · ${node.label}`, "", node.definition, "", `Authority: ${node.authority}`, "", `Sources: ${node.sources.map((source) => source.location).join(", ")}`, "");
    });
    lines.push("## Typed relationships", "");
    data.edges.filter((edge) => visible.has(edge.source) && visible.has(edge.target)).forEach((edge) => {
      lines.push(`- ${edge.id}: ${nodes.get(edge.source).label} — ${edge.label} → ${nodes.get(edge.target).label} [${edge.kind}]`);
    });
    lines.push("", "This file is a filtered projection. It does not change authoritative state or replace the complete register.", "");
    download(lines.join("\n"), "chorus-concept-map-visible.md");
    status.textContent = `${visible.size}-concept Markdown view exported. Authoritative state was not changed.`;
  };

  search.addEventListener("input", applyFilters);
  perspective.addEventListener("change", applyFilters);
  document.getElementById("map-controls").addEventListener("submit", (event) => event.preventDefault());
  document.getElementById("map-reset").addEventListener("click", () => {
    search.value = "";
    perspective.value = "all";
    clearSelection();
    applyFilters();
    search.focus();
  });
  document.getElementById("map-export").addEventListener("click", exportVisible);
  nodeElements.forEach((element, id) => {
    element.addEventListener("click", (event) => { event.preventDefault(); selectNode(id); });
    element.addEventListener("keydown", (event) => {
      if (event.key === " ") { event.preventDefault(); selectNode(id); }
    });
  });
  applyFilters();
  const hashId = decodeURIComponent(location.hash.slice(1)).toLocaleUpperCase("en-US");
  if (nodes.has(hashId)) selectNode(hashId, false);
})();
</script>'''


CSD_SCRIPT = r'''<script>
(() => {
  "use strict";
  document.documentElement.classList.add("js");
  document.querySelectorAll("[data-enhancement]").forEach((element) => { element.hidden = false; });
  const data = JSON.parse(document.getElementById("csd-data").textContent);
  const itemById = new Map(data.items.map((item) => [item.id, item]));
  const cards = new Map([...document.querySelectorAll(".csd-card[data-item-id]")].map((element) => [element.dataset.itemId, element]));
  const search = document.getElementById("csd-search");
  const topic = document.getElementById("csd-topic");
  const priority = document.getElementById("csd-priority");
  const status = document.getElementById("csd-status");
  const classificationInputs = [...document.querySelectorAll("input[name=classification]")];
  const normalized = (value) => value.toLocaleLowerCase("en-US").normalize("NFKC");
  const visibleItems = () => data.items.filter((item) => !cards.get(item.id).classList.contains("is-filtered"));
  const applyFilters = () => {
    const query = normalized(search.value.trim());
    const enabled = new Set(classificationInputs.filter((input) => input.checked).map((input) => input.value));
    data.items.forEach((item) => {
      const haystack = normalized([item.id, item.statement, item.basis, item.evidence, item.testOrResearch, item.decisionUse, item.owner, item.status].join(" "));
      const visible = enabled.has(item.classification) && (topic.value === "all" || topic.value === item.topic) && (priority.value === "all" || priority.value === item.priority) && (!query || haystack.includes(query));
      cards.get(item.id).classList.toggle("is-filtered", !visible);
    });
    document.querySelectorAll(".csd-topic").forEach((section) => {
      const hasVisible = [...section.querySelectorAll(".csd-card")].some((card) => !card.classList.contains("is-filtered"));
      section.classList.toggle("is-filtered", !hasVisible);
      section.querySelectorAll(".csd-column").forEach((column) => {
        const count = [...column.querySelectorAll(".csd-card")].filter((card) => !card.classList.contains("is-filtered")).length;
        column.classList.toggle("is-filtered", count === 0);
        const counter = column.querySelector(".csd-count");
        if (counter) {
          counter.textContent = String(count);
          counter.setAttribute("aria-label", `${count} ${count === 1 ? "entry" : "entries"}`);
        }
      });
    });
    const visible = visibleItems();
    const counts = Object.fromEntries(["certainty", "supposition", "doubt"].map((classification) => [classification, visible.filter((item) => item.classification === classification).length]));
    status.textContent = `${visible.length} of ${data.items.length} entries shown · ${counts.certainty} certainties · ${counts.supposition} suppositions · ${counts.doubt} doubts. Filters do not reclassify entries.`;
  };
  const setExpanded = (open) => {
    visibleItems().forEach((item) => { cards.get(item.id).open = open; });
    status.textContent = `${visibleItems().length} visible entries ${open ? "expanded" : "collapsed"}.`;
  };
  const download = (text, filename) => {
    const url = URL.createObjectURL(new Blob([text], { type: "text/markdown;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };
  const exportVisible = () => {
    const visible = visibleItems();
    const topicLabels = new Map(data.topics.map((entry) => [entry.id, entry.label]));
    const lines = ["# CHORUS CSD matrix · exported view", "", `Register revision: ${data.revision}`, `Topic filter: ${topic.options[topic.selectedIndex].text}`, `Priority filter: ${priority.options[priority.selectedIndex].text}`, `Search: ${search.value.trim() || "None"}`, ""];
    data.topics.forEach((topicEntry) => {
      const topicItems = visible.filter((item) => item.topic === topicEntry.id);
      if (!topicItems.length) return;
      lines.push(`## ${topicLabels.get(topicEntry.id)}`, "");
      ["certainty", "supposition", "doubt"].forEach((classification) => {
        const classItems = topicItems.filter((item) => item.classification === classification);
        if (!classItems.length) return;
        const heading = classification === "certainty" ? "Certainties" : classification === "supposition" ? "Suppositions" : "Doubts";
        lines.push(`### ${heading}`, "");
        classItems.forEach((item) => {
          lines.push(`- **${item.id}** — ${item.statement}`, `  - Evidence: ${item.evidence}`, `  - Test or research: ${item.testOrResearch}`, `  - Decision use: ${item.decisionUse}`, `  - Sources: ${item.sources.map((source) => source.location).join(", ")}`);
        });
        lines.push("");
      });
    });
    lines.push("This file is a filtered, read-only projection. Classification changes require cited evidence and a dated update to the canonical register.", "");
    download(lines.join("\n"), "chorus-csd-matrix-visible.md");
    status.textContent = `${visible.length}-entry Markdown view exported. No classification changed.`;
  };

  [search, topic, priority, ...classificationInputs].forEach((control) => control.addEventListener(control === search ? "input" : "change", applyFilters));
  document.getElementById("csd-controls").addEventListener("submit", (event) => event.preventDefault());
  document.getElementById("csd-expand").addEventListener("click", () => setExpanded(true));
  document.getElementById("csd-collapse").addEventListener("click", () => setExpanded(false));
  document.getElementById("csd-reset").addEventListener("click", () => {
    search.value = "";
    topic.value = "all";
    priority.value = "all";
    classificationInputs.forEach((input) => { input.checked = true; });
    applyFilters();
    search.focus();
  });
  document.getElementById("csd-export").addEventListener("click", exportVisible);
  applyFilters();
})();
</script>'''


def script_data(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":")).replace("<", "\\u003c")


def concept_html(data: dict[str, Any]) -> str:
    concept = data["conceptMap"]
    nodes = {node["id"]: node for node in concept["nodes"]}
    source_by_id = {source["id"]: source for source in data["sources"]}
    group_by_id = {group["id"]: group for group in data["groups"]}
    kind_by_id = {kind["id"]: kind for kind in data["edgeKinds"]}
    perspectives = "".join(
        f'<option value="{html.escape(row["id"], quote=True)}">{html.escape(row["label"])}</option>'
        for row in data["perspectives"]
    )
    catalog = []
    root = nodes[concept["rootId"]]
    root_relations = []
    for edge in concept["edges"]:
        if edge["source"] == root["id"]:
            root_relations.append(f"{edge['label']} → {nodes[edge['target']]['label']} · {edge['id']}")
        elif edge["target"] == root["id"]:
            root_relations.append(f"{nodes[edge['source']]['label']} → {edge['label']} · {edge['id']}")
    catalog.append(
        '<section data-catalog-section aria-labelledby="catalog-root"><h3 id="catalog-root">Governing core</h3>'
        '<div class="catalog-grid">'
        f'<article class="concept-card" id="{root["id"].lower()}" data-node-id="{root["id"]}">'
        f'<p class="identifier">{root["id"]} · governing core</p><h3>{html.escape(root["label"])}</h3>'
        f'<p><strong>{html.escape(root["caption"])}</strong></p><p>{html.escape(root["definition"])}</p>'
        f'<p><strong>Authority:</strong> {html.escape(root["authority"])}</p><p><strong>Typed relations:</strong></p>'
        f'<ul>{"".join(f"<li>{html.escape(value)}</li>" for value in root_relations)}</ul>'
        f'<p><strong>Sources:</strong></p>{html_sources(root["sourceIds"], source_by_id)}</article></div></section>'
    )
    for group in sorted(data["groups"], key=lambda row: row["order"]):
        cards = []
        for node in concept["nodes"]:
            if node["group"] != group["id"]:
                continue
            relations = []
            for edge in concept["edges"]:
                if edge["source"] == node["id"]:
                    relations.append(f"{edge['label']} → {nodes[edge['target']]['label']} · {edge['id']}")
                elif edge["target"] == node["id"]:
                    relations.append(f"{nodes[edge['source']]['label']} → {edge['label']} · {edge['id']}")
            cards.append(
                f'<article class="concept-card" id="{node["id"].lower()}" data-node-id="{node["id"]}">'
                f'<p class="identifier">{node["id"]} · {html.escape(group["label"])}</p>'
                f'<h3>{html.escape(node["label"])}</h3><p><strong>{html.escape(node["caption"])}</strong></p>'
                f'<p>{html.escape(node["definition"])}</p><p><strong>Authority:</strong> {html.escape(node["authority"])}</p>'
                f'<p><strong>Typed relations:</strong></p><ul>{"".join(f"<li>{html.escape(value)}</li>" for value in relations)}</ul>'
                f'<p><strong>Sources:</strong></p>{html_sources(node["sourceIds"], source_by_id)}</article>'
            )
        catalog.append(
            f'<section data-catalog-section aria-labelledby="catalog-{group["id"]}"><h3 id="catalog-{group["id"]}">{html.escape(group["label"])}</h3>'
            f'<p>{html.escape(group["description"])}</p><div class="catalog-grid">{"".join(cards)}</div></section>'
        )
    relationship_rows = "".join(
        f'<tr class="relationship-row" data-source="{edge["source"]}" data-target="{edge["target"]}">'
        f'<th scope="row"><code>{edge["id"]}</code></th><td>{html.escape(nodes[edge["source"]]["label"])}</td>'
        f'<td>{html.escape(edge["label"])}</td><td>{html.escape(nodes[edge["target"]]["label"])}</td>'
        f'<td>{html.escape(kind_by_id[edge["kind"]]["label"])}</td><td>{"Primary map" if edge["drawn"] else "Text and selection"}</td></tr>'
        for edge in concept["edges"]
    )
    interactive_data = {
        "revision": data["revision"],
        "nodes": [
            {
                **{key: node[key] for key in ("id", "label", "caption", "definition", "authority", "perspectives", "aliases")},
                "sources": [
                    {
                        "label": source_by_id[source_id]["label"],
                        "href": source_href(source_by_id[source_id]),
                        "location": source_by_id[source_id].get("path") or source_by_id[source_id].get("url"),
                    }
                    for source_id in node["sourceIds"]
                ],
            }
            for node in concept["nodes"]
        ],
        "edges": [
            {key: edge[key] for key in ("id", "source", "target", "label", "kind")}
            for edge in concept["edges"]
        ],
    }
    body = f'''
<section class="doc-card boundary" aria-labelledby="authority-title">
  <p class="eyebrow">Authoritative projection · revision {html.escape(data['revision'])}</p>
  <h2 id="authority-title">Read the system without flattening it</h2>
  <p>{html.escape(data['authority']['claimBoundary'])}</p>
  <p>The diagram is supplementary. Its complete concept catalog and typed relationship table remain present when scripts, color, pointer input, or the visual map are unavailable.</p>
</section>
<section class="doc-card" aria-labelledby="map-heading">
  <h2 id="map-heading">Interactive concept map</h2>
  <p>Choose a perspective or search the register. Select a node to isolate its documented relations. The primary SVG routes are orthogonal and crossing-free; cross-domain relations remain in the table so no connector travels through an unrelated concept.</p>
  <form id="map-controls" class="toolbar" data-enhancement hidden aria-label="Concept map controls">
    <label for="map-search">Search concepts<input id="map-search" type="search" autocomplete="off" placeholder="Try evidence, fatigue, or receipt"></label>
    <label for="map-perspective">Perspective<select id="map-perspective">{perspectives}</select></label>
    <button id="map-reset" type="button">Reset view</button>
    <button id="map-export" type="button">Download visible Markdown</button>
  </form>
  <p id="map-status" class="status-line" role="status" aria-live="polite">All {len(concept['nodes'])} concepts shown.</p>
  <p class="no-script">Interactive filtering and selected-node emphasis require JavaScript. All map content and relationships remain below.</p>
  <div class="map-stage" role="region" aria-label="Scrollable CHORUS concept map" tabindex="0">{svg_map(data)}</div>
  <div class="legend" aria-label="Relationship legend"><span><i></i>Organizes or produces</span><span><i class="constraint"></i>Constrains</span><span><i class="evidence"></i>Supplies evidence</span><span><i class="interpretive"></i>Explains without determining</span></div>
  <aside id="map-selection" class="selection-panel" data-enhancement hidden tabindex="-1" aria-labelledby="map-selection-title">
    <h3 id="map-selection-title">Select a concept</h3><p id="map-selection-text"></p>
    <p><strong>Authority:</strong> <span id="map-selection-authority"></span></p>
    <p><strong>Typed relations:</strong></p><ul id="map-selection-relations"></ul>
    <p><strong>Sources:</strong></p><ul id="map-selection-sources" class="source-list"></ul>
  </aside>
</section>
<section class="doc-card" aria-labelledby="catalog-title">
  <h2 id="catalog-title">Complete text equivalent</h2>
  <p>These definitions, owners, sources, and relations—not geometry or color—are the semantic authority of the map.</p>
  {''.join(catalog)}
</section>
<section class="doc-card" aria-labelledby="relations-title">
  <h2 id="relations-title">Typed relationship register</h2>
  <div class="table-wrap" role="region" aria-label="Complete typed concept relationships" tabindex="0"><table>
    <caption>All primary and cross-domain relationships</caption><thead><tr><th scope="col">ID</th><th scope="col">Source</th><th scope="col">Relation</th><th scope="col">Target</th><th scope="col">Kind</th><th scope="col">Rendering</th></tr></thead>
    <tbody>{relationship_rows}</tbody>
  </table></div>
</section>
<section class="doc-card" aria-labelledby="map-downloads-title"><h2 id="map-downloads-title">Sources and exports</h2><p><a class="button-link" href="CHORUS-CONCEPT-MAP.md" download>Download complete Markdown</a> <a class="button-link" href="discovery-atlas.json" download>Download authoritative JSON</a> <a class="button-link" href="artifact-manifest.json">Inspect integrity manifest</a></p><p>Downloaded filtered views are presentation snapshots. They do not revise the register or supersede the complete edition.</p></section>
<script id="concept-data" type="application/json">{script_data(interactive_data)}</script>
'''
    return html_shell(
        "CHORUS concept map",
        "CHORUS documentation · system relations",
        "An interactive, accessible map of CHORUS's knowledge, concurrency, situated agency, consequence, and conclusion architecture.",
        "chorus-concept-map.html",
        body,
        CONCEPT_SCRIPT,
    )


def csd_html(data: dict[str, Any]) -> str:
    csd = data["csd"]
    source_by_id = {source["id"]: source for source in data["sources"]}
    topic_options = '<option value="all">All topics</option>' + "".join(
        f'<option value="{topic["id"]}">{html.escape(topic["label"])}</option>'
        for topic in sorted(csd["topics"], key=lambda row: row["order"])
    )
    priority_options = '<option value="all">All priorities</option>' + "".join(
        f'<option value="{priority}">{priority.title()}</option>' for priority in PRIORITIES
    )
    labels = {"certainty": "Certainties", "supposition": "Suppositions", "doubt": "Doubts"}
    topics_markup = []
    for topic in sorted(csd["topics"], key=lambda row: row["order"]):
        columns = []
        for classification in CLASSIFICATIONS:
            cards = []
            class_items = [
                item for item in csd["items"]
                if item["topic"] == topic["id"] and item["classification"] == classification
            ]
            for item in class_items:
                history = "".join(
                    f'<li>{html.escape(entry["date"])}: {html.escape(entry.get("from") or "unclassified")} → {html.escape(entry["to"])} — {html.escape(entry["basis"])}</li>'
                    for entry in item["history"]
                )
                cards.append(
                    f'<details class="csd-card classification-{classification}" id="{item["id"].lower()}" data-item-id="{item["id"]}">'
                    f'<summary><span class="identifier">{item["id"]} · {classification}</span><br>{html.escape(item["statement"])}</summary>'
                    f'<div class="csd-body"><dl><dt>Basis</dt><dd>{html.escape(item["basis"])}</dd>'
                    f'<dt>Evidence state</dt><dd>{html.escape(item["evidence"])}</dd>'
                    f'<dt>Test or research path</dt><dd>{html.escape(item["testOrResearch"])}</dd>'
                    f'<dt>Decision use</dt><dd>{html.escape(item["decisionUse"])}</dd>'
                    f'<dt>Owner</dt><dd>{html.escape(item["owner"])}</dd>'
                    f'<dt>Priority / status</dt><dd>{html.escape(item["priority"])} / {html.escape(item["status"])}</dd>'
                    f'<dt>Review trigger</dt><dd>{html.escape(item["reviewTrigger"])}</dd>'
                    f'<dt>Dependencies</dt><dd>{html.escape(", ".join(item["dependencies"]) or "None")}</dd>'
                    f'<dt>Sources</dt><dd>{html_sources(item["sourceIds"], source_by_id)}</dd>'
                    f'<dt>Classification history</dt><dd><ul>{history}</ul></dd></dl></div></details>'
                )
            column_id = f"{topic['id']}-{classification}"
            columns.append(
                f'<section class="csd-column" aria-labelledby="{column_id}"><h4 id="{column_id}">{labels[classification]} '
                f'<span class="csd-count" aria-label="{len(class_items)} entries">{len(class_items)}</span></h4>{"".join(cards)}</section>'
            )
        topics_markup.append(
            f'<section class="csd-topic" id="topic-{topic["id"]}" data-topic-id="{topic["id"]}" aria-labelledby="topic-{topic["id"]}-title">'
            f'<header><h3 id="topic-{topic["id"]}-title">{html.escape(topic["label"])}</h3><p>{html.escape(topic["description"])}</p></header>'
            f'<div class="csd-columns">{"".join(columns)}</div></section>'
        )
    counts = {
        classification: sum(item["classification"] == classification for item in csd["items"])
        for classification in CLASSIFICATIONS
    }
    interactive_data = {
        "revision": data["revision"],
        "topics": [{key: topic[key] for key in ("id", "label", "order")} for topic in csd["topics"]],
        "items": [
            {
                **{key: item[key] for key in (
                    "id", "classification", "topic", "statement", "basis", "evidence", "testOrResearch",
                    "decisionUse", "owner", "priority", "status"
                )},
                "sources": [
                    {
                        "label": source_by_id[source_id]["label"],
                        "href": source_href(source_by_id[source_id]),
                        "location": source_by_id[source_id].get("path") or source_by_id[source_id].get("url"),
                    }
                    for source_id in item["sourceIds"]
                ],
            }
            for item in csd["items"]
        ],
    }
    method_source = source_by_id[csd["method"]["sourceId"]]
    body = f'''
<section class="doc-card boundary" aria-labelledby="csd-boundary-title">
  <p class="eyebrow">Living discovery register · revision {html.escape(data['revision'])}</p>
  <h2 id="csd-boundary-title">Keep evidence state visible</h2>
  <p>{html.escape(data['authority']['claimBoundary'])}</p>
  <p>{html.escape(data['authority']['classificationPolicy'])}</p>
</section>
<section class="doc-card" aria-labelledby="method-title"><h2 id="method-title">Method</h2><div class="method-note"><p>{html.escape(csd['method']['attribution'])} <a href="{html.escape(source_href(method_source), quote=True)}">Read the NN/g framework</a>.</p></div><dl><dt><strong>Certainty</strong></dt><dd>Current cited repository fact, implemented boundary, or source-bound evidence state—not a universal claim about people.</dd><dt><strong>Supposition</strong></dt><dd>Plausible, testable experience outcome that still lacks adequate confirming evidence.</dd><dt><strong>Doubt</strong></dt><dd>Open question that can change design, evidence, release, or context of use.</dd></dl></section>
<section class="doc-card" aria-labelledby="matrix-title">
  <h2 id="matrix-title">Interactive matrix</h2>
  <p>The board is read-only. Filter, expand, and export it for review; reclassification requires cited evidence and a dated source-register change.</p>
  <form id="csd-controls" class="toolbar" data-enhancement hidden aria-label="CSD matrix controls">
    <label for="csd-search">Search entries<input id="csd-search" type="search" autocomplete="off" placeholder="Try transfer, privacy, or fatigue"></label>
    <label for="csd-topic">Topic<select id="csd-topic">{topic_options}</select></label>
    <label for="csd-priority">Priority<select id="csd-priority">{priority_options}</select></label>
    <fieldset><legend>Classification</legend><div class="check-row"><label><input type="checkbox" name="classification" value="certainty" checked> Certainties</label><label><input type="checkbox" name="classification" value="supposition" checked> Suppositions</label><label><input type="checkbox" name="classification" value="doubt" checked> Doubts</label></div></fieldset>
    <button id="csd-expand" type="button">Expand visible</button><button id="csd-collapse" type="button">Collapse visible</button><button id="csd-reset" type="button">Reset view</button><button id="csd-export" type="button">Download visible Markdown</button>
  </form>
  <p id="csd-status" class="status-line" role="status" aria-live="polite">{len(csd['items'])} entries · {counts['certainty']} certainties · {counts['supposition']} suppositions · {counts['doubt']} doubts.</p>
  <p class="no-script">Filtering and bulk expansion require JavaScript. Every entry remains available through native disclosure controls.</p>
  <div id="csd-board">{''.join(topics_markup)}</div>
</section>
<section class="doc-card" aria-labelledby="movement-title"><h2 id="movement-title">Movement contract</h2><ol><li>Attach new evidence to the existing stable item ID.</li><li>Add a dated history entry before changing classification.</li><li>Demote a certainty when its evidence expires, its binding changes, or a counterexample defeats it.</li><li>Move a supposition only when its stated evidence path is satisfied; plausibility is insufficient.</li><li>Retain or retire a doubt with an explicit rationale.</li><li>Treat downloaded views as projections, never as evidence.</li></ol></section>
<section class="doc-card" aria-labelledby="csd-downloads-title"><h2 id="csd-downloads-title">Sources and exports</h2><p><a class="button-link" href="CHORUS-CSD-MATRIX.md" download>Download complete Markdown</a> <a class="button-link" href="discovery-atlas.json" download>Download authoritative JSON</a> <a class="button-link" href="artifact-manifest.json">Inspect integrity manifest</a></p></section>
<script id="csd-data" type="application/json">{script_data(interactive_data)}</script>
'''
    return html_shell(
        "CHORUS CSD matrix",
        "CHORUS documentation · discovery state",
        "An interactive Certainties, Suppositions, and Doubts matrix that keeps CHORUS repository evidence, hypotheses, and open research questions distinct.",
        "chorus-csd-matrix.html",
        body,
        CSD_SCRIPT,
    )


def index_html(data: dict[str, Any]) -> str:
    body = f'''
<section class="doc-card boundary"><p class="eyebrow">Two coordinated views · revision {html.escape(data['revision'])}</p><h2>Architecture beside uncertainty</h2><p>The concept map shows how CHORUS's documented concepts relate. The CSD matrix shows which claims are established for the repository, which are testable suppositions, and which remain unresolved. Both editions keep complete text semantics without JavaScript and add read-only filtering and Markdown export when scripting is available.</p></section>
<section class="card-index" aria-label="Available documentation maps">
  <article class="index-card"><p class="eyebrow">Typed system relations</p><h2>Concept map</h2><p>Explore knowledge, concurrency, situated agency, cross-room consequence, and the bounded conclusion without treating visual proximity as evidence.</p><div class="link-row"><a href="chorus-concept-map.html">Open interactive edition</a><a href="CHORUS-CONCEPT-MAP.md" download>Download Markdown</a></div></article>
  <article class="index-card"><p class="eyebrow">NN/g discovery frame</p><h2>CSD matrix</h2><p>Compare current repository certainties, plausible experience outcomes, and open research or release questions by topic and priority.</p><div class="link-row"><a href="chorus-csd-matrix.html">Open interactive edition</a><a href="CHORUS-CSD-MATRIX.md" download>Download Markdown</a></div></article>
</section>
<section class="doc-card"><h2>Authority and integrity</h2><p><a href="discovery-atlas.json">Machine-readable authoritative register</a> · <a href="artifact-manifest.json">Artifact manifest with SHA-256 digests</a> · <a href="../notebooks/index.html">Executed notebooks</a> · <a href="../evidence/updated-working-tree-status.html">Current bounded working-tree status</a></p><p>These pages load no remote fonts, scripts, analytics, or media. Source citations may open the canonical repository or the NN/g method page, but all map and matrix content is embedded.</p></section>
'''
    return html_shell(
        "CHORUS documentation maps",
        "CHORUS technical record",
        "Interactive and downloadable concept-map and CSD-matrix editions generated from one authoritative discovery register.",
        "index.html",
        body,
    )


def relative(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def build_artifacts(data: dict[str, Any]) -> dict[Path, bytes]:
    canonical_bytes = stable_json(data)
    artifacts: dict[Path, bytes] = {
        DOC_CONCEPT: concept_markdown(data).encode("utf-8"),
        DOC_CSD: csd_markdown(data).encode("utf-8"),
        PUBLIC_CONCEPT_MD: concept_markdown(data, public_copy=True).encode("utf-8"),
        PUBLIC_CSD_MD: csd_markdown(data, public_copy=True).encode("utf-8"),
        PUBLIC_CONCEPT_HTML: concept_html(data).encode("utf-8"),
        PUBLIC_CSD_HTML: csd_html(data).encode("utf-8"),
        PUBLIC_INDEX: index_html(data).encode("utf-8"),
        PUBLIC_DATA: canonical_bytes,
    }
    rows = [
        {
            "path": relative(path),
            "mediaType": {
                ".md": "text/markdown",
                ".html": "text/html",
                ".json": "application/json",
            }[path.suffix],
            "bytes": len(payload),
            "sha256": sha256(payload),
        }
        for path, payload in sorted(artifacts.items(), key=lambda item: relative(item[0]))
    ]
    manifest = {
        "format": "CHORUS_DISCOVERY_ARTIFACTS",
        "schemaVersion": 1,
        "revision": data["revision"],
        "buildDate": BUILD_DATE,
        "builder": relative(Path(__file__).resolve()),
        "canonicalSource": relative(SOURCE_PATH),
        "canonicalSourceSha256": sha256(SOURCE_PATH.read_bytes()),
        "deterministic": True,
        "progressiveEnhancement": True,
        "authoritativeStateMutableInBrowser": False,
        "artifacts": rows,
    }
    manifest_bytes = stable_json(manifest)
    artifacts[SOURCE_MANIFEST] = manifest_bytes
    artifacts[PUBLIC_MANIFEST] = manifest_bytes
    return artifacts


def relative_luminance(hex_color: str) -> float:
    channels = [int(hex_color[index : index + 2], 16) / 255 for index in (1, 3, 5)]
    linear = [
        value / 12.92 if value <= 0.04045 else ((value + 0.055) / 1.055) ** 2.4
        for value in channels
    ]
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]


def contrast_ratio(first: str, second: str) -> float:
    light, dark = sorted((relative_luminance(first), relative_luminance(second)), reverse=True)
    return (light + 0.05) / (dark + 0.05)


def validate_artifacts(data: dict[str, Any], artifacts: dict[Path, bytes]) -> list[str]:
    errors: list[str] = []
    for label, foreground, background in (
        ("body text", "#f2f1e8", "#07140d"),
        ("muted text", "#c7d1c9", "#0b1f14"),
        ("links", "#a7e0bd", "#0b1f14"),
        ("gold labels", "#e2c57f", "#0b1f14"),
        ("focus", "#f1cf78", "#07140d"),
    ):
        ratio = contrast_ratio(foreground, background)
        if ratio < 4.5:
            errors.append(f"palette: {label} contrast is {ratio:.2f}:1")

    expected_paths = {
        DOC_CONCEPT, DOC_CSD, PUBLIC_CONCEPT_MD, PUBLIC_CSD_MD,
        PUBLIC_CONCEPT_HTML, PUBLIC_CSD_HTML, PUBLIC_INDEX, PUBLIC_DATA,
        SOURCE_MANIFEST, PUBLIC_MANIFEST,
    }
    if set(artifacts) != expected_paths:
        errors.append("artifacts: output inventory has drifted")

    for path in (DOC_CONCEPT, PUBLIC_CONCEPT_MD):
        source = artifacts[path].decode("utf-8")
        for token in ("```mermaid", "## Concept register", "## Complete typed relationships", "<details"):
            if token not in source:
                errors.append(f"{relative(path)}: missing {token}")
        for node in data["conceptMap"]["nodes"]:
            if node["id"] not in source:
                errors.append(f"{relative(path)}: missing node {node['id']}")
        for edge in data["conceptMap"]["edges"]:
            if edge["id"] not in source:
                errors.append(f"{relative(path)}: missing edge {edge['id']}")

    for path in (DOC_CSD, PUBLIC_CSD_MD):
        source = artifacts[path].decode("utf-8")
        for token in ("| Topic | Certainties | Suppositions | Doubts |", "## Atomic discovery register", "## Movement and maintenance contract", "<details"):
            if token not in source:
                errors.append(f"{relative(path)}: missing {token}")
        for item in data["csd"]["items"]:
            if item["id"] not in source:
                errors.append(f"{relative(path)}: missing item {item['id']}")

    for path in (PUBLIC_CONCEPT_HTML, PUBLIC_CSD_HTML, PUBLIC_INDEX):
        source = artifacts[path].decode("utf-8")
        for token in (
            '<html lang="en">', '<meta name="viewport"', '<a class="skip-link"',
            '<main id="main">', '<footer', "prefers-reduced-motion", "forced-colors", "@media print",
        ):
            if token not in source:
                errors.append(f"{relative(path)}: missing {token}")
        if re.search(r"<(?:script|img)[^>]+\bsrc=[\"']https?://", source, flags=re.IGNORECASE):
            errors.append(f"{relative(path)}: contains a remote runtime asset")
        if re.search(r"@import|\bfetch\s*\(|XMLHttpRequest|WebSocket|localStorage|sessionStorage|indexedDB|\.innerHTML", source):
            errors.append(f"{relative(path)}: contains prohibited network, storage, or unsafe rendering code")

    concept_source = artifacts[PUBLIC_CONCEPT_HTML].decode("utf-8")
    for token in (
        'data-routing="orthogonal-crossing-free"', 'role="img"', '<desc id="concept-svg-desc">',
        'aria-label="Scrollable CHORUS concept map"', 'id="map-search"', 'id="map-perspective"',
        'id="map-export"', 'Complete text equivalent', 'Typed relationship register', 'type="application/json"',
    ):
        if token not in concept_source:
            errors.append(f"{relative(PUBLIC_CONCEPT_HTML)}: missing {token}")
    if concept_source.count('class="concept-node"') != len(data["conceptMap"]["nodes"]):
        errors.append("concept HTML: visual node count does not match register")
    if concept_source.count('class="concept-card"') != len(data["conceptMap"]["nodes"]):
        errors.append("concept HTML: text-equivalent node count does not match register")
    if concept_source.count('class="relationship-row"') != len(data["conceptMap"]["edges"]):
        errors.append("concept HTML: relationship row count does not match register")

    csd_source = artifacts[PUBLIC_CSD_HTML].decode("utf-8")
    for token in (
        'aria-label="CSD matrix controls"', 'id="csd-search"', 'id="csd-topic"',
        'id="csd-priority"', 'name="classification"', 'id="csd-export"',
        'id="csd-expand"', 'id="csd-collapse"', 'Movement contract', 'type="application/json"',
    ):
        if token not in csd_source:
            errors.append(f"{relative(PUBLIC_CSD_HTML)}: missing {token}")
    if csd_source.count('class="csd-card classification-') != len(data["csd"]["items"]):
        errors.append("CSD HTML: card count does not match register")

    if artifacts[PUBLIC_DATA] != stable_json(data):
        errors.append("public data: canonical register copy is not byte-stable")
    if artifacts[SOURCE_MANIFEST] != artifacts[PUBLIC_MANIFEST]:
        errors.append("manifest: source and public copies differ")
    return errors


def check_or_write(artifacts: dict[Path, bytes], check: bool) -> int:
    drift: list[str] = []
    for path, payload in sorted(artifacts.items(), key=lambda item: relative(item[0])):
        if check:
            if not path.is_file() or path.read_bytes() != payload:
                drift.append(relative(path))
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(payload)
    if drift:
        print("Discovery-map publication drift:", file=sys.stderr)
        for path in drift:
            print(f"  {path}", file=sys.stderr)
        return 1
    verb = "verified" if check else "built"
    print(f"Discovery-map publication {verb}: {len(artifacts)} artifacts.")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="validate and compare committed outputs without writing")
    args = parser.parse_args()
    data = json.loads(SOURCE_PATH.read_text(encoding="utf-8"))
    errors = validate_registry(data)
    if errors:
        for error in errors:
            print(error, file=sys.stderr)
        return 1
    artifacts = build_artifacts(data)
    errors = validate_artifacts(data, artifacts)
    if errors:
        for error in errors:
            print(error, file=sys.stderr)
        return 1
    return check_or_write(artifacts, args.check)


if __name__ == "__main__":
    raise SystemExit(main())
