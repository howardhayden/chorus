#!/usr/bin/env python3
"""Check the prospective CHORUS licensing policy and historical boundaries."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
LICENSE_ID = "LicenseRef-Hayden-Proprietary-1.1"
LICENSE_NAME = "Hayden Howard Proprietary Product and Source License 1.1"
CANONICAL_LICENSE_SHA256 = "07b7734eb4da7c79ffdd32d4641ab64eea1922e8149ebf50c430e5f54657628c"
COPY_SPECIFIC_NOTICE = (
    "Permissions validly attached to earlier distributed copies remain governed "
    "by their own terms and do not automatically attach to later copies or snapshots."
)
PACKAGE_LICENSE = "SEE LICENSE IN LICENSE"
BASELINE_PARENT = "a96194f02e9e03082d63d37f5e76ba5bacdc3e6c"
OSI_CUTOFF = "40290f61d5605fbc767abd28f014dd39f2e93fce"
HISTORICAL_LICENSE_HASHES = {
    "LICENSES/HISTORICAL/Hayden-Howard-Proprietary-Product-and-Source-License-1.0.txt":
        "822ce196a020ed2d4e3f077af3f2b49f11f8fc57e4310f3b32ac7cdb461054a0",
    "LICENSES/MIT-2026-08-18.txt":
        "f1ae5d3c15dc06b1cadeabb6c55e1abf095275554875c1d40df41d870f797d72",
    "LICENSES/AGPL-3.0-or-later-2026-08-24.txt":
        "015868165b320fc0351c61233fdc4f5944f2e64c4eb7d9c0042ffa2634a90776",
    "LICENSES/PolyForm-Noncommercial-1.0.0.txt":
        "ffcca38841adb694b6f380647e15f17c446a4d1656fed51a1e2041d064c94cc8",
    "LICENSES/CC-BY-NC-SA-4.0.txt":
        "1349a4b6148492b44f629e64eed676612e234fe9a839e4f3b277c1482c8849f1",
}


def load_json(path: str) -> dict:
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def require(condition: bool, message: str) -> None:
    if not condition:
        raise SystemExit(f"licensing policy check failed: {message}")


def main() -> None:
    license_text = (ROOT / "LICENSE").read_text(encoding="utf-8")
    normalized_license = " ".join(license_text.split())
    require(
        license_text.startswith(f"# {LICENSE_NAME}\n"),
        "root LICENSE title is not the authorized policy",
    )
    require(
        f"SPDX-License-Identifier: {LICENSE_ID}" in license_text,
        "root LICENSE is missing its identifier",
    )
    require(
        hashlib.sha256(license_text.encode("utf-8")).hexdigest()
        == CANONICAL_LICENSE_SHA256,
        "root LICENSE does not match the canonical 1.1 text",
    )
    require(
        "applies prospectively" in normalized_license
        and COPY_SPECIFIC_NOTICE in normalized_license,
        "prospective and historical-grant boundaries are missing",
    )
    require(
        "machine-learning model training, fine-tuning" in normalized_license,
        "machine-learning restriction wording drifted",
    )
    licensing = (ROOT / "LICENSING.md").read_text(encoding="utf-8")
    normalized_licensing = " ".join(licensing.split())
    require(
        COPY_SPECIFIC_NOTICE in normalized_licensing,
        "copy-specific historical-grant boundary is missing from LICENSING.md",
    )

    license_map = load_json("LICENSE-MAP.json")
    require(license_map.get("format") == "howardhayden-license-map-v3", "map format drifted")
    require(license_map.get("audited") == "2026-08-24", "prepared scope-audit date drifted")
    require(license_map.get("default_license") == LICENSE_ID, "map default drifted")
    require(
        license_map.get("commercial_use_granted") is False,
        "commercial implementation-reuse boundary drifted",
    )
    require(license_map.get("implementation_reuse_granted") is False, "reuse boundary drifted")
    require(license_map.get("noncommercial_reuse_granted") is False, "noncommercial boundary drifted")
    require(license_map.get("institutional_reuse_exception") is False, "institutional boundary drifted")
    require(license_map.get("official_product_use_only") is True, "Official Product boundary drifted")
    require(license_map.get("priced_product_requires_entitlement") is True, "priced-product boundary drifted")
    require(
        license_map.get("no_automatic_permissive_exceptions") is True,
        "permissive-exception boundary drifted",
    )
    require(license_map.get("permissive_exceptions") == [], "unexpected permissive exception")
    historical_notice = license_map.get("historical_notice", "")
    require(
        COPY_SPECIFIC_NOTICE in " ".join(historical_notice.split()),
        "license-map copy-specific historical notice drifted",
    )
    require(
        "including unchanged material in later snapshots" not in historical_notice,
        "license-map improperly carries an earlier grant into later snapshots",
    )
    mapped_licenses = {rule.get("license") for rule in license_map.get("rules", [])}
    require("SOURCE-COMPONENT-TERMS" in mapped_licenses, "generated-component boundary drifted")
    require("SOURCE-SPECIFIC-NOTICES" in mapped_licenses, "source-specific notice boundary drifted")

    package = load_json("package.json")
    lock = load_json("package-lock.json")
    require(package.get("private") is True, "package must remain private")
    require(package.get("license") == PACKAGE_LICENSE, "package license pointer drifted")
    require(lock.get("license") == PACKAGE_LICENSE, "lockfile top-level license pointer drifted")
    require(
        lock.get("packages", {}).get("", {}).get("license") == PACKAGE_LICENSE,
        "lockfile root package license pointer drifted",
    )

    readme = (ROOT / "README.md").read_text(encoding="utf-8")
    require(LICENSE_ID in readme, "README does not name the current license")
    require(
        "source-available for noncommercial use" not in readme,
        "README restores the former prospective grant",
    )
    require("PolyForm-Noncommercial-1.0.0" not in readme, "README advertises the former software license")
    require("CC-BY-NC-SA-4.0" not in readme, "README advertises the former documentation license")
    require(
        "## Owner-authorized development" in readme,
        "development commands lack their authorization boundary",
    )

    contributing = (ROOT / "CONTRIBUTING.md").read_text(encoding="utf-8")
    require("This proprietary repository" in contributing, "contribution policy is stale")

    baseline = (ROOT / "COMMERCIAL_BASELINE.md").read_text(encoding="utf-8")
    require(BASELINE_PARENT in baseline, "commercial baseline parent drifted")
    require(OSI_CUTOFF in baseline, "historical OSI cutoff drifted")
    require(LICENSE_ID in baseline, "successor policy is missing from the baseline record")

    for relative in (
        "COMMERCIAL-LICENSE.md",
        "NOTICE",
        "PERMISSIVE-EXCEPTIONS.md",
        "README.md",
        "WORKFLOW-BOUNDARIES.md",
    ):
        surface = " ".join((ROOT / relative).read_text(encoding="utf-8").split())
        require(
            COPY_SPECIFIC_NOTICE in surface,
            f"copy-specific historical boundary is missing from {relative}",
        )

    third_party = (ROOT / "THIRD_PARTY_NOTICES.md").read_text(encoding="utf-8")
    require("package-lock.json" in third_party, "third-party dependency notice is missing")

    for relative, expected in HISTORICAL_LICENSE_HASHES.items():
        actual = hashlib.sha256((ROOT / relative).read_bytes()).hexdigest()
        require(actual == expected, f"historical license text changed: {relative}")

    print("licensing policy check passed (prospective policy; historical texts preserved)")


if __name__ == "__main__":
    main()
