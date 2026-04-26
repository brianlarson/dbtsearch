#!/usr/bin/env python3
"""
Convert a CSV file to a single JSON document (array of row objects).

Keys are taken from the CSV header row. UTF-8 in/out.

When the MN provider export columns are present, each row also gets
``sourceLocationId``: a stable SHA-256 hex string derived from
Provider Name + Full Address (DHS) + City + State + ZIP (after strip).
Use this as the Feed Me match field on the Location entry type.

Example:
  python3 scripts/imports/csv_to_json.py \\
    cms/web/imports/mn_dbt_providers_final.csv \\
    cms/web/imports/mn-dbt-providers.json
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import sys
from pathlib import Path

# Columns used for deterministic sourceLocationId (MN DHS + enrichment export).
_MN_SOURCE_ID_COLUMNS = (
    "Provider Name",
    "Full Address (DHS)",
    "City",
    "State",
    "ZIP",
)

_PLACEHOLDERS = {"not found", "unknown", "n/a", "na", "none", "null", "-", "—", "by email"}


def _clean(value: str | None) -> str:
    normalized = str(value or "").strip()
    if normalized.lower() in _PLACEHOLDERS:
        return ""
    return normalized


def _compute_mn_source_location_id(row: dict[str, str]) -> str:
    parts = [_clean(row.get(col)) for col in _MN_SOURCE_ID_COLUMNS]
    payload = "\x1f".join(parts)
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def _enrich_rows(rows: list[dict[str, str]], fieldnames: list[str] | None) -> list[dict[str, str]]:
    if not rows or not fieldnames:
        return rows
    headers = set(fieldnames)
    if not all(col in headers for col in _MN_SOURCE_ID_COLUMNS):
        return rows
    out: list[dict[str, str]] = []
    for row in rows:
        cleaned_row = {k: _clean(v) for k, v in row.items()}
        sid = _compute_mn_source_location_id(row)
        # Put sourceLocationId first for scanning / Feed Me mapping.
        merged: dict[str, str] = {"sourceLocationId": sid}
        merged.update(cleaned_row)
        out.append(merged)
    return out


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input_csv", type=Path, help="Path to source CSV")
    parser.add_argument("output_json", type=Path, help="Path to write JSON array")
    parser.add_argument(
        "--indent",
        type=int,
        default=2,
        help="JSON indent (default 2); use 0 for minified",
    )
    parser.add_argument(
        "--no-source-location-id",
        action="store_true",
        help="Do not add sourceLocationId (MN composite hash)",
    )
    args = parser.parse_args()

    if not args.input_csv.is_file():
        print(f"error: input not found: {args.input_csv}", file=sys.stderr)
        return 1

    args.output_json.parent.mkdir(parents=True, exist_ok=True)

    with args.input_csv.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        rows = list(reader)

    if not args.no_source_location_id:
        rows = _enrich_rows(rows, list(fieldnames) if fieldnames else None)

    indent = None if args.indent <= 0 else args.indent
    with args.output_json.open("w", encoding="utf-8") as out:
        json.dump(rows, out, ensure_ascii=False, indent=indent)
        out.write("\n")

    print(f"wrote {len(rows)} row(s) -> {args.output_json}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
