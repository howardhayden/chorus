#!/usr/bin/env python3
"""Capture time-bound dependency advisory results as machine-readable evidence."""

from __future__ import annotations

import hashlib
import json
import subprocess
import sys
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "evidence" / "runs" / "dependency-audit.v1.json"


def run_json(command: list[str]) -> dict[str, Any]:
    process = subprocess.run(
        command,
        cwd=ROOT,
        check=False,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )
    try:
        payload = json.loads(process.stdout)
    except json.JSONDecodeError as error:
        raise RuntimeError(f"Could not parse {' '.join(command)} output") from error
    return {
        "command": " ".join(command),
        "exit_code": process.returncode,
        "vulnerabilities": payload.get("metadata", {}).get("vulnerabilities", {}),
        "dependency_counts": payload.get("metadata", {}).get("dependencies", {}),
        "advisory_ids": sorted(payload.get("vulnerabilities", {}).keys()),
    }


def command_text(command: list[str]) -> str:
    process = subprocess.run(
        command,
        cwd=ROOT,
        check=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.DEVNULL,
        text=True,
    )
    return process.stdout.strip()


def main() -> int:
    lock_bytes = (ROOT / "package-lock.json").read_bytes()
    complete = run_json(["npm", "audit", "--json"])
    runtime = run_json(["npm", "audit", "--omit=dev", "--json"])
    report = {
        "format": "CHORUS_DEPENDENCY_AUDIT",
        "schema_version": 1,
        "release": "1.0.0-rc.1",
        "package_lock_sha256": hashlib.sha256(lock_bytes).hexdigest(),
        "environment": {
            "node": command_text(["node", "--version"]),
            "npm": command_text(["npm", "--version"]),
        },
        "results": [complete, runtime],
        "status": (
            "pass"
            if complete["exit_code"] == 0
            and runtime["exit_code"] == 0
            and complete["vulnerabilities"].get("total") == 0
            and runtime["vulnerabilities"].get("total") == 0
            else "fail"
        ),
        "limitations": [
            "Registry advisory data is time-bound; rerunning later may produce different results without a lockfile change.",
            "An empty advisory set is not a proof that every dependency is defect-free.",
        ],
    }
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(f"Dependency audit {report['status']}: {OUTPUT.relative_to(ROOT)}")
    return 0 if report["status"] == "pass" else 1


if __name__ == "__main__":
    raise SystemExit(main())
