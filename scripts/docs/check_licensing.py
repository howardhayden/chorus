#!/usr/bin/env python3
"""Check the prospective CHORUS licensing policy and historical boundaries."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
LICENSE_ID = "LicenseRef-Hayden-Proprietary-1.0"
PACKAGE_LICENSE = "SEE LICENSE IN LICENSE"
HISTORICAL_LICENSE_HASHES = {
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
        license_text.startswith("# Hayden Howard Proprietary Product and Source License 1.0\n"),
        "root LICENSE title is not the authorized policy",
    )
    require(
        f"SPDX-License-Identifier: {LICENSE_ID}" in license_text,
        "root LICENSE is missing its identifier",
    )
    require(
        "applies prospectively" in normalized_license
        and "does not revoke or narrow valid earlier grants" in normalized_license,
        "prospective and historical-grant boundaries are missing",
    )

    license_map = load_json("LICENSE-MAP.json")
    require(license_map.get("format") == "howardhayden-license-map-v3", "map format drifted")
    require(license_map.get("default_license") == LICENSE_ID, "map default drifted")
    require(
        license_map.get("commercial_implementation_reuse_granted") is False,
        "commercial implementation-reuse boundary drifted",
    )
    require(license_map.get("implementation_reuse_granted") is False, "reuse boundary drifted")
    require(license_map.get("noncommercial_reuse_granted") is False, "noncommercial boundary drifted")
    require(license_map.get("institutional_reuse_exception") is False, "institutional boundary drifted")
    require(license_map.get("priced_product_requires_entitlement") is True, "priced-product boundary drifted")
    require(
        license_map.get("no_automatic_permissive_exceptions") is True,
        "permissive-exception boundary drifted",
    )
    require(license_map.get("permissive_exceptions") == [], "unexpected permissive exception")
    require("commercial_use_granted" not in license_map, "ambiguous commercial-use field returned")
    require("official_product_use_only" not in license_map, "ambiguous Official Product field returned")
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

    for relative, expected in HISTORICAL_LICENSE_HASHES.items():
        actual = hashlib.sha256((ROOT / relative).read_bytes()).hexdigest()
        require(actual == expected, f"historical license text changed: {relative}")

    print("licensing policy check passed (prospective policy; historical texts preserved)")


if __name__ == "__main__":
    main()
