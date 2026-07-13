#!/usr/bin/env python3
"""Parse DHS provider HTML table to JSON rows."""

import json
import re
import sys
from html import unescape
from pathlib import Path

try:
    from bs4 import BeautifulSoup
except ImportError:
    BeautifulSoup = None


def strip_text(html: str) -> str:
    text = re.sub(r"<br\s*/?>", "\n", html, flags=re.I)
    text = re.sub(r"<[^>]+>", " ", text)
    text = unescape(text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def parse_address(html: str) -> tuple[str, str, str, str]:
    lines = [
        unescape(re.sub(r"<[^>]+>", " ", part)).strip()
        for part in re.split(r"<br\s*/?>", html, flags=re.I)
    ]
    lines = [re.sub(r"\s+", " ", line).strip() for line in lines if line.strip()]

    street_parts = []
    city = ""
    state = "MN"
    zip_code = ""

    for line in lines:
        m = re.match(r"^(.+),\s*([A-Z]{2})$", line)
        if m:
            city = m.group(1).strip()
            state = m.group(2).strip()
            continue
        if re.fullmatch(r"\d{5}", line):
            zip_code = line
            continue
        street_parts.append(line)

    return " ".join(street_parts), city, state, zip_code


def extract_link(html: str) -> str:
    m = re.search(r'href=["\']([^"\']+)["\']', html, flags=re.I)
    if m:
        return unescape(m.group(1)).strip()
    text = strip_text(html)
    return "" if text.lower() == "website" else text


def parse_html(html: str) -> list[dict]:
    if BeautifulSoup:
        soup = BeautifulSoup(html, "html.parser")
        rows = []
        for tr in soup.find_all("tr"):
            tds = tr.find_all("td")
            if len(tds) < 4:
                continue
            provider = strip_text(str(tds[0]))
            provider = re.sub(r"\bDBT-A Certified Provider\b", "", provider, flags=re.I)
            provider = re.sub(r"\bDBT-A Certified\b", "", provider, flags=re.I)
            provider = re.sub(r"\s+", " ", provider).strip()
            if not provider or provider.lower() == "provider":
                continue
            address, city, state, zip_code = parse_address(str(tds[1]))
            website = extract_link(str(tds[2]))
            phone = strip_text(str(tds[3]))
            rows.append(
                {
                    "provider": provider,
                    "address": address,
                    "city": city,
                    "state": state,
                    "zip": zip_code,
                    "website": website,
                    "phone": phone,
                }
            )
        return rows

    raise SystemExit("BeautifulSoup required: pip install beautifulsoup4")


def main() -> None:
    path = Path(sys.argv[1] if len(sys.argv) > 1 else "data/mn-dhs-certified-providers.html")
    rows = parse_html(path.read_text(encoding="utf-8", errors="replace"))
    print(json.dumps(rows, indent=2))


if __name__ == "__main__":
    main()
