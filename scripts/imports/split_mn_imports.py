#!/usr/bin/env python3
"""
Split MN provider CSV into provider and location JSON feeds.

Outputs:
  - providers JSON (deduped by sourceProviderId)
  - locations JSON (one row per location)

Both feeds include deterministic immutable IDs:
  - sourceProviderId: SHA-256 of normalized Provider Name only (same org must share one id even
    when Website/Phone differ per CSV row — hashing those fields caused duplicate providers in Feed Me)
  - sourceLocationId: SHA-256 of Provider Name + Full Address (DHS) + City + State + ZIP
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
from pathlib import Path


LOCATION_ID_COLUMNS = ("Provider Name", "Full Address (DHS)", "City", "State", "ZIP")


def _norm(value: str | None) -> str:
    return (value or "").strip()


_PLACEHOLDERS = {"not found", "unknown", "n/a", "na", "none", "null", "-", "—", "by email"}


def _clean(value: str | None) -> str:
    normalized = _norm(value)
    if normalized.lower() in _PLACEHOLDERS:
        return ""
    return normalized


def _sha256_for_columns(row: dict[str, str], columns: tuple[str, ...]) -> str:
    payload = "\x1f".join(_clean(row.get(col)) for col in columns)
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def _compute_source_provider_id(row: dict[str, str]) -> str:
    """One id per organization name; do not include phone/website (they vary across location rows)."""
    name = _clean(row.get("Provider Name")).lower()
    return hashlib.sha256(name.encode("utf-8")).hexdigest()


def _street_from_row(row: dict[str, str]) -> str:
    full = _norm(row.get("Full Address (DHS)"))
    city = _norm(row.get("City"))
    state = _norm(row.get("State"))
    zip_code = _norm(row.get("ZIP"))

    if full == "":
        return ""

    suffix = ", ".join(part for part in (city, state, zip_code) if part != "")
    if suffix and full.endswith(suffix):
        return full[: -len(suffix)].rstrip(", ").strip()

    return full


def _is_meaningful(value: str) -> bool:
    lower = value.strip().lower()
    return lower not in {"", "not found", "unknown", "n/a", "na", "none"}


def _best(current: str, incoming: str) -> str:
    if _is_meaningful(current):
        return current
    return incoming


def split_rows(rows: list[dict[str, str]]) -> tuple[list[dict[str, str]], list[dict[str, str]]]:
    providers_by_id: dict[str, dict[str, str]] = {}
    locations: list[dict[str, str]] = []

    for row in rows:
        source_provider_id = _compute_source_provider_id(row)
        source_location_id = _sha256_for_columns(row, LOCATION_ID_COLUMNS)

        provider_row = {
            "sourceProviderId": source_provider_id,
            "Provider Name": _clean(row.get("Provider Name")),
            "DBT-A Certified": _clean(row.get("DBT-A Certified")),
            "Adherent Team Only": _clean(row.get("Adherent Team Only")),
            "Website (DHS)": _clean(row.get("Website (DHS)")),
            "Email": _clean(row.get("Email")),
            "Phone (DHS)": _clean(row.get("Phone (DHS)")),
            "Phone (Website)": _clean(row.get("Phone (Website)")),
            "Specialties": _clean(row.get("Specialties")),
            "Staff Credentials": _clean(row.get("Staff Credentials")),
            "Staff Names": _clean(row.get("Staff Names")),
            "Services Offered": _clean(row.get("Services Offered")),
            "DBT Services Description": _clean(row.get("DBT Services Description")),
            "Ages Served": _clean(row.get("Ages Served")),
            "Accepts Insurance": _clean(row.get("Accepts Insurance")),
            "Telehealth Available": _clean(row.get("Telehealth Available")),
            "In-Person Available": _clean(row.get("In-Person Available")),
            "Sliding Scale": _clean(row.get("Sliding Scale")),
            "Accepting New Clients": _clean(row.get("Accepting New Clients")),
            "Logo File": _clean(row.get("Logo File")),
            "Logo URL (CDN)": _clean(row.get("Logo URL (CDN)")),
            "Data Source": _clean(row.get("Data Source")),
        }

        existing = providers_by_id.get(source_provider_id)
        if existing is None:
            providers_by_id[source_provider_id] = provider_row
        else:
            for key, value in provider_row.items():
                if key == "sourceProviderId":
                    continue
                existing[key] = _best(existing.get(key, ""), value)

        location_row: dict[str, str] = {
            "sourceLocationId": source_location_id,
            "sourceProviderId": source_provider_id,
            "Street Address": _street_from_row(row),
        }
        location_row.update(row)
        locations.append(location_row)

    providers = sorted(providers_by_id.values(), key=lambda p: p.get("Provider Name", "").lower())
    return providers, locations


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input_csv", type=Path, help="Path to source CSV")
    parser.add_argument("providers_json", type=Path, help="Path to output providers JSON")
    parser.add_argument("locations_json", type=Path, help="Path to output locations JSON")
    parser.add_argument("--indent", type=int, default=2, help="JSON indent (default 2)")
    args = parser.parse_args()

    if not args.input_csv.is_file():
        raise SystemExit(f"error: input not found: {args.input_csv}")

    args.providers_json.parent.mkdir(parents=True, exist_ok=True)
    args.locations_json.parent.mkdir(parents=True, exist_ok=True)

    with args.input_csv.open(newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))

    providers, locations = split_rows(rows)

    indent = None if args.indent <= 0 else args.indent
    with args.providers_json.open("w", encoding="utf-8") as out:
        json.dump(providers, out, ensure_ascii=False, indent=indent)
        out.write("\n")

    with args.locations_json.open("w", encoding="utf-8") as out:
        json.dump(locations, out, ensure_ascii=False, indent=indent)
        out.write("\n")

    print(f"wrote {len(providers)} provider row(s) -> {args.providers_json}")
    print(f"wrote {len(locations)} location row(s) -> {args.locations_json}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
