#!/usr/bin/env python3
"""Build and verify the CHORUS release-evidence publication.

The machine-readable source under ``evidence/releases`` owns the release
decision. This standard-library builder validates its bindings, renders an
accessible script-free HTML edition, and publishes a byte-identical JSON copy.
"""

from __future__ import annotations

import argparse
import hashlib
import html
import json
import re
import sys
from pathlib import Path
from typing import Any
from urllib.parse import unquote, urlsplit


ROOT = Path(__file__).resolve().parents[2]
RELEASE_ID = "1.0.0-rc.1"
SOURCE_PATH = ROOT / "evidence" / "releases" / RELEASE_ID / "release.json"
PUBLISH_DIR = ROOT / "public" / "evidence"
PUBLIC_JSON = PUBLISH_DIR / f"release-{RELEASE_ID}.json"
PUBLIC_HTML = PUBLISH_DIR / "index.html"
DEPENDENCY_SOURCE = ROOT / "evidence" / "releases" / RELEASE_ID / "dependency-inventory.json"

SOURCE_PATTERNS = (
    "app/**/*.ts",
    "app/**/*.tsx",
    "app/**/*.css",
    "scripts/*.mjs",
    "tests/**/*.mjs",
    "next.config.ts",
    "postcss.config.mjs",
    "tsconfig.json",
    "worker/**/*.ts",
)

PORTABLE_BINDING_EXCLUSIONS = {
    "scripts/export-source.mjs",
    "tests/distribution-contract.test.mjs",
    "tests/portable-source.test.mjs",
}

STATUS_LABELS = {
    "pass": "Verified",
    "limited": "Limited",
    "pending": "Unverified",
    "fail": "Failed",
    "not-applicable": "Not applicable",
}

RETAINED_STATUS_NORMALIZATION = {
    "pass": "pass",
    "fail": "fail",
    "limited": "limited",
    "pass_with_explicit_limits": "limited",
}

REQUIRED_PROMOTION_GATES = {
    "simulation-scale",
    "end-to-end-play",
    "persistence-privacy",
    "accessibility-layout",
    "dependency-integrity",
    "technical-publication",
    "neutral-distribution",
}

INSTALL_SCRIPT_REVIEWS = {
    "esbuild@0.28.1": {
        "lifecycle": "postinstall",
        "command": "node install.js",
        "purpose": "Select and verify the exact platform compiler binary used by the development build.",
        "platform_boundary": "Runs only during dependency installation; not imported by the simulation core.",
    },
    "fsevents@2.3.3": {
        "lifecycle": "install",
        "command": "node-gyp rebuild",
        "purpose": "Build the optional native filesystem watcher on Darwin hosts.",
        "platform_boundary": "Optional Darwin-only development helper; absent from the Linux installation used for automated verification.",
    },
    "unrs-resolver@1.11.1": {
        "lifecycle": "postinstall",
        "command": "napi-postinstall unrs-resolver 1.11.1 check",
        "purpose": "Verify the resolver's exact native package for the installation platform.",
        "platform_boundary": "Development and build resolution only; not imported by the simulation core.",
    },
    "workerd@1.20260815.1": {
        "lifecycle": "postinstall",
        "command": "node install.js",
        "purpose": "Select and verify the exact local worker-runtime binary used for development and build checks.",
        "platform_boundary": "Development and packaging only; the browser simulation does not invoke it.",
    },
}


def digest_bytes(payload: bytes) -> str:
    return hashlib.sha256(payload).hexdigest()


def stable_json(value: Any) -> bytes:
    return (json.dumps(value, ensure_ascii=False, indent=2) + "\n").encode("utf-8")


def implementation_files() -> list[Path]:
    paths: set[Path] = set()
    for pattern in SOURCE_PATTERNS:
        paths.update(path for path in ROOT.glob(pattern) if path.is_file())
    return sorted(
        (
            path
            for path in paths
            if path.relative_to(ROOT).as_posix() not in PORTABLE_BINDING_EXCLUSIONS
        ),
        key=lambda path: path.relative_to(ROOT).as_posix(),
    )


def implementation_binding() -> dict[str, Any]:
    rows: list[dict[str, Any]] = []
    aggregate = hashlib.sha256()
    for path in implementation_files():
        relative = path.relative_to(ROOT).as_posix()
        payload = path.read_bytes()
        digest = digest_bytes(payload)
        rows.append({"path": relative, "bytes": len(payload), "sha256": digest})
        aggregate.update(len(relative).to_bytes(4, "big"))
        aggregate.update(relative.encode("utf-8"))
        aggregate.update(len(payload).to_bytes(8, "big"))
        aggregate.update(payload)
    return {
        "algorithm": "sha256-path-length-content",
        "digest": aggregate.hexdigest(),
        "file_count": len(rows),
        "files": rows,
    }


def parsed_versions() -> tuple[str, int, int]:
    package = json.loads((ROOT / "package.json").read_text(encoding="utf-8"))
    generator = (ROOT / "app" / "scenario-generator.ts").read_text(encoding="utf-8")
    save_model = (ROOT / "app" / "save-model.ts").read_text(encoding="utf-8")
    generator_match = re.search(r"const\s+GENERATOR_VERSION\s*=\s*(\d+)\s+as\s+const", generator)
    save_match = re.search(
        r"PORTABLE_SAVE_SCHEMA_VERSION\s*=\s*(\d+)\s+as\s+const", save_model
    )
    if generator_match is None or save_match is None:
        raise ValueError("Could not parse generator or save-schema version")
    return package["version"], int(generator_match.group(1)), int(save_match.group(1))


def dependency_inventory() -> dict[str, Any]:
    package_bytes = (ROOT / "package.json").read_bytes()
    lock_bytes = (ROOT / "package-lock.json").read_bytes()
    package = json.loads(package_bytes)
    lock = json.loads(lock_bytes)
    lock_packages = lock.get("packages", {})
    allow_scripts = package.get("allowScripts", {})
    locked_install_scripts = {
        f"{path.removeprefix('node_modules/')}@{metadata.get('version')}"
        for path, metadata in lock_packages.items()
        if path.startswith("node_modules/") and metadata.get("hasInstallScript") is True
    }
    script_rows = []
    for package_key, allowed in sorted(allow_scripts.items()):
        name, version = package_key.rsplit("@", 1)
        locked = lock_packages.get(f"node_modules/{name}", {})
        review = INSTALL_SCRIPT_REVIEWS.get(package_key)
        script_rows.append(
            {
                "package": name,
                "version": version,
                "allowed": allowed is True,
                "lock_has_install_script": locked.get("hasInstallScript") is True,
                "optional": locked.get("optional") is True,
                "development_only": locked.get("dev") is True,
                "reviewed": review is not None,
                **(review or {}),
            }
        )
    inventory = []
    for scope in ("dependencies", "devDependencies"):
        for name, declared in sorted(package.get(scope, {}).items()):
            locked = lock_packages.get(f"node_modules/{name}", {})
            inventory.append(
                {
                    "name": name,
                    "scope": "runtime" if scope == "dependencies" else "development",
                    "declared": declared,
                    "locked": locked.get("version"),
                    "integrity": locked.get("integrity"),
                    "has_install_script": locked.get("hasInstallScript") is True,
                }
            )
    dependency_manifest = {
        field: package.get(field)
        for field in (
            "name",
            "version",
            "engines",
            "dependencies",
            "devDependencies",
            "allowScripts",
            "type",
        )
    }
    return {
        "format": "CHORUS_DEPENDENCY_INVENTORY",
        "schema_version": 1,
        "release": RELEASE_ID,
        "dependency_manifest_sha256": digest_bytes(stable_json(dependency_manifest)),
        "package_lock_sha256": digest_bytes(lock_bytes),
        "lockfile_version": lock.get("lockfileVersion"),
        "direct_dependencies": inventory,
        "reviewed_install_script_allowlist": script_rows,
        "lock_install_script_packages": sorted(locked_install_scripts),
        "unapproved_install_script_packages": sorted(locked_install_scripts - set(allow_scripts)),
        "stale_install_script_approvals": sorted(set(allow_scripts) - locked_install_scripts),
        "notes": [
            "The lockfile is authoritative for the complete transitive graph and registry integrity values.",
            "The allowlist is exact-package and exact-version; no wildcard script approval is present.",
            "Audit status is time-bound and retained as a separate release run rather than embedded in this deterministic inventory.",
        ],
    }


def refresh_record(record: dict[str, Any]) -> dict[str, Any]:
    application_version, generator_version, save_schema = parsed_versions()
    record["release"]["application_version"] = application_version
    record["release"]["generator_version"] = generator_version
    record["release"]["portable_save_schema"] = save_schema
    record["source_binding"] = implementation_binding()
    DEPENDENCY_SOURCE.parent.mkdir(parents=True, exist_ok=True)
    DEPENDENCY_SOURCE.write_bytes(stable_json(dependency_inventory()))
    for artifact in record["artifacts"]:
        path = ROOT / artifact["source_path"]
        if path.is_file():
            payload = path.read_bytes()
            artifact["bytes"] = len(payload)
            artifact["sha256"] = digest_bytes(payload)
    return record


def validate_record(record: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    if record.get("format") != "CHORUS_RELEASE_EVIDENCE" or record.get("schema_version") != 1:
        errors.append("release record: unsupported format or schema")
        return errors

    release = record.get("release", {})
    application_version, generator_version, save_schema = parsed_versions()
    expected = {
        "id": RELEASE_ID,
        "application_version": application_version,
        "generator_version": generator_version,
        "portable_save_schema": save_schema,
    }
    for field, value in expected.items():
        if release.get(field) != value:
            errors.append(f"release record: {field} is {release.get(field)!r}, expected {value!r}")
    if release.get("state") not in {"release-candidate", "held", "superseded"}:
        errors.append("release record: invalid bounded release state")

    current_binding = implementation_binding()
    if record.get("source_binding") != current_binding:
        errors.append("release record: implementation binding has drifted")
    current_inventory = dependency_inventory()
    expected_inventory = stable_json(current_inventory)
    if not DEPENDENCY_SOURCE.is_file() or DEPENDENCY_SOURCE.read_bytes() != expected_inventory:
        errors.append("release record: dependency inventory has drifted")
    for script in current_inventory["reviewed_install_script_allowlist"]:
        if not script["allowed"] or not script["lock_has_install_script"] or not script["reviewed"]:
            errors.append(
                f"release record: lifecycle script review is incomplete for "
                f"{script['package']}@{script['version']}"
            )
    if current_inventory["unapproved_install_script_packages"]:
        errors.append("release record: lockfile contains an unapproved lifecycle script")
    if current_inventory["stale_install_script_approvals"]:
        errors.append("release record: lifecycle-script allowlist contains a stale approval")
    for dependency in current_inventory["direct_dependencies"]:
        if dependency["locked"] != dependency["declared"]:
            errors.append(
                f"release record: direct pin drift for {dependency['name']}: "
                f"declared={dependency['declared']!r}, locked={dependency['locked']!r}"
            )
        if not dependency["integrity"]:
            errors.append(f"release record: direct integrity missing for {dependency['name']}")

    gate_ids: set[str] = set()
    for gate in record.get("gates", []):
        gate_id = gate.get("id")
        if not gate_id or gate_id in gate_ids:
            errors.append(f"release record: invalid or duplicate gate id {gate_id!r}")
        gate_ids.add(gate_id)
        if gate.get("status") not in STATUS_LABELS:
            errors.append(f"release record: invalid gate status for {gate_id!r}")
        if gate.get("release_blocking") and gate.get("status") not in {"pass", "not-applicable"}:
            errors.append(f"release record: blocking gate {gate_id!r} has not passed")
        if not gate.get("evidence"):
            errors.append(f"release record: gate {gate_id!r} has no retained evidence reference")
        if gate.get("status") == "pass" and not any(
            reference.startswith("run:") for reference in gate.get("evidence", [])
        ):
            errors.append(f"release record: passing gate {gate_id!r} has no retained run reference")
    if gate_ids != REQUIRED_PROMOTION_GATES:
        missing = sorted(REQUIRED_PROMOTION_GATES - gate_ids)
        extra = sorted(gate_ids - REQUIRED_PROMOTION_GATES)
        errors.append(f"release record: promotion gate set mismatch; missing={missing}, extra={extra}")
    if release.get("state") == "release-candidate":
        incomplete = sorted(
            gate["id"]
            for gate in record.get("gates", [])
            if gate.get("status") not in {"pass", "not-applicable"}
        )
        if incomplete:
            errors.append(
                "release record: release-candidate state requires every promotion gate "
                f"to pass; incomplete={incomplete}"
            )

    run_ids: set[str] = set()
    for run in record.get("runs", []):
        run_id = run.get("id")
        if not run_id or run_id in run_ids:
            errors.append(f"release record: invalid or duplicate run id {run_id!r}")
        run_ids.add(run_id)
        if run.get("result") not in {"pass", "fail", "limited"}:
            errors.append(f"release record: invalid run result for {run_id!r}")
        if run.get("result") in {"pass", "limited"} and not run.get("result_path"):
            errors.append(f"release record: successful run {run_id!r} has no retained result path")
        if run.get("implementation_digest") != current_binding["digest"]:
            errors.append(f"release record: run {run_id!r} is not bound to this implementation")
        result_path = run.get("result_path")
        if result_path:
            result_file = ROOT / result_path
            if not result_file.is_file():
                errors.append(f"release record: missing retained result {result_path}")
            else:
                payload = result_file.read_bytes()
                if run.get("result_sha256") != digest_bytes(payload):
                    errors.append(f"release record: retained result digest mismatch for {run_id!r}")
                elif result_file.suffix == ".json":
                    try:
                        result_json = json.loads(payload)
                    except json.JSONDecodeError:
                        errors.append(f"release record: retained JSON is invalid for {run_id!r}")
                    else:
                        retained_status = result_json.get("status")
                        if retained_status is None and isinstance(result_json.get("results"), dict):
                            retained_status = result_json["results"].get("status")
                        if retained_status is None:
                            errors.append(
                                f"release record: retained JSON does not expose status for {run_id!r}"
                            )
                        elif RETAINED_STATUS_NORMALIZATION.get(retained_status) != run.get("result"):
                            errors.append(
                                f"release record: run result disagrees with retained JSON for {run_id!r}"
                            )

    artifact_ids: set[str] = set()
    for artifact in record.get("artifacts", []):
        artifact_id = artifact.get("id")
        if not artifact_id or artifact_id in artifact_ids:
            errors.append(f"release record: invalid or duplicate artifact id {artifact_id!r}")
        artifact_ids.add(artifact_id)
        source_path = artifact.get("source_path", "")
        path = ROOT / source_path
        if not path.is_file():
            errors.append(f"release record: missing artifact {source_path}")
            continue
        payload = path.read_bytes()
        if artifact.get("bytes") != len(payload) or artifact.get("sha256") != digest_bytes(payload):
            errors.append(f"release record: artifact binding drifted for {artifact_id!r}")
        publish_as = artifact.get("publish_as")
        if publish_as:
            if Path(publish_as).name != publish_as or publish_as.startswith("."):
                errors.append(f"release record: unsafe publication name for {artifact_id!r}")
            if artifact.get("public_href") != publish_as:
                errors.append(f"release record: publication link mismatch for {artifact_id!r}")

    if release.get("state") == "release-candidate":
        for gate in record.get("gates", []):
            for reference in gate.get("evidence", []):
                if reference.startswith("run:"):
                    if reference.removeprefix("run:") not in run_ids:
                        errors.append(f"release record: unresolved run evidence {reference!r}")
                elif reference.startswith("artifact:"):
                    if reference.removeprefix("artifact:") not in artifact_ids:
                        errors.append(f"release record: unresolved artifact evidence {reference!r}")
                elif not (ROOT / reference).is_file():
                    errors.append(f"release record: unresolved file evidence {reference!r}")

    for section in ("included_scope", "excluded_scope", "limitations", "unverified_matrix"):
        if not record.get(section):
            errors.append(f"release record: {section} must be explicit and nonempty")
    return errors


def status_badge(status: str) -> str:
    label = STATUS_LABELS.get(status, status)
    return f'<span class="status status-{html.escape(status)}">{html.escape(label)}</span>'


def list_html(items: list[str]) -> str:
    return "<ul>" + "".join(f"<li>{html.escape(item)}</li>" for item in items) + "</ul>"


def table_region(caption: str, headers: list[str], rows: list[list[str]]) -> str:
    head = "".join(f'<th scope="col">{html.escape(value)}</th>' for value in headers)
    body = "".join("<tr>" + "".join(cells) + "</tr>" for cells in rows)
    return (
        f'<div class="table-wrap" role="region" aria-label="{html.escape(caption)}" tabindex="0">'
        f'<table><caption>{html.escape(caption)}</caption><thead><tr>{head}</tr></thead>'
        f"<tbody>{body}</tbody></table></div>"
    )


def html_document(record: dict[str, Any]) -> str:
    release = record["release"]
    gate_rows = []
    for gate in record["gates"]:
        evidence = "<ul>" + "".join(
            f"<li><code>{html.escape(item)}</code></li>" for item in gate["evidence"]
        ) + "</ul>"
        gate_rows.append(
            [
                f'<th scope="row">{html.escape(gate["label"])}</th>',
                f"<td>{status_badge(gate['status'])}</td>",
                f"<td>{html.escape(gate['claim'])}</td>",
                f"<td>{evidence}</td>",
                f"<td>{html.escape(gate['limit'])}</td>",
            ]
        )

    run_rows = []
    for run in record["runs"]:
        retained = html.escape(run["result_path"]) if run.get("result_path") else "Recorded in release JSON"
        run_rows.append(
            [
                f'<th scope="row">{html.escape(run["label"])}</th>',
                f"<td>{status_badge(run['result'])}</td>",
                f"<td><code>{html.escape(run['command'])}</code></td>",
                f"<td>{html.escape(run['summary'])}</td>",
                f"<td>{html.escape(run['environment'])}</td>",
                f"<td><code>{retained}</code></td>",
            ]
        )

    verified_rows = [
        [
            f'<th scope="row">{html.escape(item["surface"])}</th>',
            f"<td>{html.escape(item['environment'])}</td>",
            f"<td>{html.escape(item['coverage'])}</td>",
            f"<td><code>{html.escape(item['evidence'])}</code></td>",
        ]
        for item in record["verified_matrix"]
    ]

    unverified_rows = [
        [
            f'<th scope="row">{html.escape(item["combination"])}</th>',
            f"<td>{status_badge('pending')}</td>",
            f"<td>{html.escape(item['boundary'])}</td>",
            f"<td>{html.escape(item['promotion_action'])}</td>",
        ]
        for item in record["unverified_matrix"]
    ]

    artifact_cards = []
    for artifact in record["artifacts"]:
        artifact_cards.append(
            '<article class="card">'
            f'<p class="eyebrow">{html.escape(artifact["media_type"])}</p>'
            f'<h3>{html.escape(artifact["label"])}</h3>'
            f'<p>{html.escape(artifact["description"])}</p>'
            f'<p><a href="{html.escape(artifact["public_href"], quote=True)}">Open artifact</a></p>'
            f'<dl><dt>Bytes</dt><dd>{artifact["bytes"]}</dd>'
            f'<dt>SHA-256</dt><dd><code>{html.escape(artifact["sha256"])}</code></dd></dl>'
            '</article>'
        )

    CSS = r'''
:root{color-scheme:dark;--paper:#07140d;--panel:#0b1f14;--ink:#f2f1e8;--muted:#c7d1c9;--mint:#a7e0bd;--gold:#e2c57f;--line:rgba(213,222,220,.28);--focus:#f1cf78;font-family:Georgia,"Times New Roman",serif}
*{box-sizing:border-box}html{background:var(--paper);color:var(--ink);scroll-behavior:smooth}body{margin:0;min-width:280px;background:radial-gradient(circle at 12% 0%,rgba(37,101,64,.32),transparent 34rem),var(--paper);line-height:1.6}a{color:var(--mint);text-underline-offset:.18em}a:focus-visible,.table-wrap:focus-visible{outline:3px solid var(--focus);outline-offset:4px}.skip{position:absolute;top:-8rem;left:1rem;padding:.75rem 1rem;background:#fff;color:#07140d;z-index:3}.skip:focus{top:1rem}.site-header{padding:clamp(2rem,7vw,5rem) max(1rem,calc((100vw - 78rem)/2));border-bottom:1px solid var(--line);background:rgba(4,18,11,.76)}.eyebrow{margin:0 0 .6rem;color:var(--gold);font:700 .78rem/1.4 ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.13em;text-transform:uppercase}h1,h2,h3{line-height:1.15;text-wrap:balance}h1{max-width:15ch;margin:.2rem 0;font-size:clamp(2.4rem,7vw,5.5rem)}.lede{max-width:74ch;color:var(--muted);font-size:clamp(1rem,2vw,1.23rem)}nav{display:flex;flex-wrap:wrap;gap:.7rem;margin-top:1.3rem}nav a,.artifact-link{display:inline-flex;min-height:44px;align-items:center;padding:.55rem .85rem;border:1px solid var(--line);border-radius:999px;text-decoration:none}main{width:min(78rem,calc(100% - 2rem));margin:auto;padding:2rem 0 5rem}section{margin:0 0 2.5rem}.summary{padding:1.2rem;border-left:4px solid var(--gold);background:rgba(14,54,33,.48)}.identity{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,13rem),1fr));gap:.8rem}.identity div,.card{min-width:0;padding:1rem;border:1px solid var(--line);border-radius:.7rem 1.1rem .8rem 1rem;background:var(--panel)}dt{color:var(--muted);font-size:.85rem}dd{margin:.2rem 0 0;overflow-wrap:anywhere}.identity dd{color:var(--gold);font-size:1.1rem}.table-wrap{max-width:100%;overflow:auto;border:1px solid var(--line);border-radius:.75rem;background:rgba(5,19,11,.82)}table{width:100%;min-width:58rem;border-collapse:collapse}caption{padding:1rem;text-align:left;color:var(--gold);font-size:1.05rem;font-weight:700}th,td{padding:.75rem;vertical-align:top;text-align:left;border-top:1px solid var(--line)}thead th{background:rgba(20,61,39,.72);color:var(--ink)}tbody th{min-width:10rem;color:var(--mint)}td ul{margin:0;padding-left:1.15rem}code{font-family:ui-monospace,SFMono-Regular,Consolas,monospace;overflow-wrap:anywhere}.status{display:inline-block;padding:.16rem .5rem;border:1px solid currentColor;border-radius:999px;font:700 .72rem/1.4 ui-monospace,SFMono-Regular,Consolas,monospace}.status-pass{color:var(--mint)}.status-limited,.status-pending{color:var(--gold)}.status-fail{color:#ffc2ba}.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,20rem),1fr));gap:1rem}.card h3{color:var(--ink)}.card dl{padding-top:.7rem;border-top:1px solid var(--line)}footer{padding:1.5rem max(1rem,calc((100vw - 78rem)/2));border-top:1px solid var(--line);color:var(--muted)}
@media(max-width:40rem){main{width:min(100% - 1rem,78rem)}table{min-width:48rem}.site-header{padding-inline:.75rem}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*{animation:none!important;transition:none!important}}
@media(forced-colors:active){.summary,.identity div,.card,.table-wrap{border:1px solid CanvasText}.status{forced-color-adjust:none}}
@media print{html,body,.site-header,.card,.identity div{background:#fff;color:#111}nav,.skip{display:none}.table-wrap{overflow:visible}table{min-width:0}a{color:#111}}
'''
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="Bounded CHORUS release-candidate evidence, retained results, environment matrix, artifacts, and limitations.">
<title>CHORUS {html.escape(release['id'])} release evidence</title>
<style>{CSS}</style>
</head>
<body>
<a class="skip" href="#main">Skip to release evidence</a>
<header class="site-header">
  <p class="eyebrow">Bounded technical record</p>
  <h1>Release evidence</h1>
  <p class="lede">A retained, implementation-bound record for CHORUS {html.escape(release['id'])}. Verified means a listed result exists; missing browser or assistive-technology coverage remains explicitly unverified.</p>
  <nav aria-label="Evidence navigation">
    <a href="#gates">Gate results</a><a href="#runs">Retained runs</a><a href="#matrix">Environment matrix</a><a href="#artifacts">Raw demonstrations</a><a href="release-{RELEASE_ID}.json">Machine-readable JSON</a>
  </nav>
</header>
<main id="main">
  <section aria-labelledby="decision-title">
    <h2 id="decision-title">Decision</h2>
    <div class="summary"><p><strong>{html.escape(release['state_label'])}.</strong> {html.escape(release['decision'])}</p></div>
    <dl class="identity">
      <div><dt>Release</dt><dd>{html.escape(release['id'])}</dd></div>
      <div><dt>Application manifest</dt><dd>{html.escape(release['application_version'])}</dd></div>
      <div><dt>Generator</dt><dd>{release['generator_version']}</dd></div>
      <div><dt>Save schema</dt><dd>{release['portable_save_schema']}</dd></div>
      <div><dt>Evidence date</dt><dd>{html.escape(release['evidence_date'])}</dd></div>
      <div><dt>Implementation digest</dt><dd><code>{html.escape(record['source_binding']['digest'])}</code></dd></div>
    </dl>
  </section>
  <section aria-labelledby="scope-title"><h2 id="scope-title">Bounded scope</h2><div class="cards"><article class="card"><h3>Included</h3>{list_html(record['included_scope'])}</article><article class="card"><h3>Excluded</h3>{list_html(record['excluded_scope'])}</article></div></section>
  <section id="gates" aria-labelledby="gates-title"><h2 id="gates-title">Release gates</h2>{table_region('Candidate gate results', ['Gate','Status','Verified claim','Retained evidence','Boundary'], gate_rows)}</section>
  <section id="runs" aria-labelledby="runs-title"><h2 id="runs-title">Retained runs</h2>{table_region('Commands run for this implementation digest', ['Run','Result','Command','Observed result','Environment','Retained record'], run_rows)}</section>
  <section id="matrix" aria-labelledby="matrix-title"><h2 id="matrix-title">Environment matrix</h2>{table_region('Verified combinations', ['Surface','Environment','Coverage','Evidence'], verified_rows)}<h3>Explicitly unverified or limited</h3>{table_region('No implied pass outside the verified matrix', ['Combination','Status','Current boundary','Promotion action'], unverified_rows)}</section>
  <section id="artifacts" aria-labelledby="artifacts-title"><h2 id="artifacts-title">Raw demonstrations and artifacts</h2><div class="cards">{''.join(artifact_cards)}</div></section>
  <section aria-labelledby="limits-title"><h2 id="limits-title">Release-specific limitations</h2>{list_html(record['limitations'])}</section>
</main>
<footer><p>Self-contained HTML · no scripts, remote assets, analytics, or hidden pass states · source JSON available above.</p></footer>
</body>
</html>
'''


def validate_html_document(source: str) -> list[str]:
    errors: list[str] = []
    for token in (
        '<html lang="en">', '<meta name="viewport"', '<a class="skip"',
        '<main id="main">', '<table>', '<caption>', 'scope="col"',
        'scope="row"', 'prefers-reduced-motion', 'forced-colors',
    ):
        if token not in source:
            errors.append(f"release HTML: missing {token}")
    if "<script" in source or re.search(r'(?:src|href)=["\']https?://', source):
        errors.append("release HTML: remote resource or script is not allowed")
    return errors


def local_target(base: Path, href: str) -> Path | None:
    parsed = urlsplit(html.unescape(href))
    if parsed.scheme or parsed.netloc or not parsed.path or parsed.path.startswith("/"):
        return None
    return (base.parent / unquote(parsed.path)).resolve()


def validate_links(path: Path, source: str, generated: dict[Path, bytes]) -> list[str]:
    errors: list[str] = []
    for href in re.findall(r'\bhref=["\']([^"\']+)["\']', source, flags=re.IGNORECASE):
        target = local_target(path, href)
        if target is not None and not target.exists() and target not in generated:
            errors.append(f"release HTML: missing local link target {href}")
    return errors


def build_outputs(record: dict[str, Any]) -> dict[Path, bytes]:
    public_record = stable_json(record)
    rendered = html_document(record).encode("utf-8")
    outputs = {
        PUBLIC_JSON: public_record,
        PUBLIC_HTML: rendered,
    }
    for artifact in record["artifacts"]:
        if artifact.get("publish_as"):
            outputs[PUBLISH_DIR / artifact["publish_as"]] = (ROOT / artifact["source_path"]).read_bytes()
    return outputs


def run(check: bool, refresh: bool = False) -> int:
    if not SOURCE_PATH.is_file():
        print(f"Missing release source: {SOURCE_PATH.relative_to(ROOT)}", file=sys.stderr)
        return 1
    record = json.loads(SOURCE_PATH.read_text(encoding="utf-8"))
    if refresh:
        record = refresh_record(record)
        SOURCE_PATH.write_bytes(stable_json(record))

    errors = validate_record(record)
    outputs = build_outputs(record)
    html_source = outputs[PUBLIC_HTML].decode("utf-8")
    errors.extend(validate_html_document(html_source))
    errors.extend(validate_links(PUBLIC_HTML, html_source, outputs))
    if errors:
        for error in errors:
            print(error, file=sys.stderr)
        return 1

    drift: list[str] = []
    for path, payload in outputs.items():
        if check:
            if not path.is_file() or path.read_bytes() != payload:
                drift.append(path.relative_to(ROOT).as_posix())
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(payload)
    if drift:
        print("Release evidence publication drift:", file=sys.stderr)
        for path in drift:
            print(f"  {path}", file=sys.stderr)
        return 1
    verb = "verified" if check else "built"
    print(f"Release evidence {verb}: {len(outputs)} artifacts, {len(record['runs'])} retained runs.")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="verify public artifacts without writing")
    parser.add_argument(
        "--refresh-bindings",
        action="store_true",
        help="refresh implementation and artifact digests before publishing",
    )
    args = parser.parse_args()
    return run(args.check, args.refresh_bindings)


if __name__ == "__main__":
    raise SystemExit(main())
