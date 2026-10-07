#!/usr/bin/env python3
"""Validate the SEO page set generated from the canonical hymn corpus."""
from __future__ import annotations
import json, re, sys
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
APP = ROOT / "app"
CORPUS = APP / "data" / "canonical"
PAGES = APP / "cantique"
SITEMAP = APP / "sitemap.xml"
BASE = "https://cantiques-eujc.lnk-studio.com"

def clean(value):
    return " ".join(str(value or "").split())

def slug(value):
    s = clean(value).replace("œ", "oe").replace("Œ", "OE")
    s = re.sub(r"[^A-Za-z0-9_-]+", "-", s)
    return re.sub(r"-+", "-", s).strip("-").lower() or "inconnu"

def source_number(hymn):
    for version in hymn.get("versions") or []:
        number = clean((version.get("source") or {}).get("number"))
        if number:
            return number
    return None

def has_h1(html):
    return "<h1" in html.lower()

def route_segment(hymn, used):
    base = slug(source_number(hymn))
    if base not in used:
        used.add(base)
        return base
    ident = slug(hymn.get("id")) or "doublon"
    candidate = f"{base}-{ident}"
    suffix = 2
    while candidate in used:
        candidate = f"{base}-{ident}-{suffix}"
        suffix += 1
    used.add(candidate)
    return candidate

def main():
    errors, warnings = [], []
    route_keys, used_routes = {}, {}
    expected_urls = {
        f"{BASE}/", f"{BASE}/cantiques.html", f"{BASE}/categories.html",
        f"{BASE}/lessons.html", f"{BASE}/dimanche.html",
        f"{BASE}/priere.html", f"{BASE}/a-classer.html", f"{BASE}/apropos.html"
    }
    total_hymns = total_versions = missing_numbers = 0

    for path in sorted(CORPUS.glob("*.json")):
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except Exception as exc:
            errors.append(f"{path.name}: invalid JSON: {exc}")
            continue

        taxonomy = data.get("taxonomy") or {}
        category = clean(taxonomy.get("category_id"))
        if not category:
            errors.append(f"{path.name}: missing taxonomy.category_id")
            continue

        for hymn in data.get("hymns") or []:
            total_hymns += 1
            versions = hymn.get("versions") or []
            total_versions += len(versions)
            number = source_number(hymn)
            if not number:
                missing_numbers += 1
                continue

            used = used_routes.setdefault(slug(category), set())
            route = route_segment(hymn, used)
            key = f"{category}/{route}"
            route_keys[key] = path.name
            expected_urls.add(f"{BASE}/cantique/{slug(category)}/{route}")

    generated_pages = sorted(PAGES.glob("*/*/index.html")) if PAGES.exists() else []
    category_pages = sorted((APP / "categorie").glob("*/index.html")) if (APP / "categorie").exists() else []
    generated_urls = set()
    for page in generated_pages:
        parts = page.relative_to(PAGES).parts
        if len(parts) != 3:
            warnings.append(f"unexpected generated path: {page}")
            continue
        category, number, _ = parts
        generated_urls.add(f"{BASE}/cantique/{category}/{number}")
        html = page.read_text(encoding="utf-8", errors="replace")
        if not has_h1(html):
            errors.append(f"{page}: missing h1; prefix={html[:500]!r}")
        if 'rel="canonical"' not in html: errors.append(f"{page}: missing canonical")
        if 'id="hymn-jsonld"' not in html: errors.append(f"{page}: missing JSON-LD")
        if 'class="hymn-lyrics"' not in html: errors.append(f"{page}: missing visible hymn lyrics")

    expected_hymn_urls = {u for u in expected_urls if "/cantique/" in u}
    if generated_urls != expected_hymn_urls:
        if expected_hymn_urls - generated_urls:
            errors.append(f"missing generated pages: {len(expected_hymn_urls - generated_urls)}")
        if generated_urls - expected_hymn_urls:
            errors.append(f"unexpected generated pages: {len(generated_urls - expected_hymn_urls)}")

    for page in category_pages:
        category = page.parent.name
        html = page.read_text(encoding="utf-8", errors="replace")
        if "category-jsonld" not in html: errors.append(f"{page}: missing category JSON-LD")
        if "<h1>" not in html: errors.append(f"{page}: missing h1")
        if category.startswith("a-classer"):
            if "noindex" not in html: errors.append(f"{page}: uncurated category must be noindex")
        else:
            expected_urls.add(f"{BASE}/categorie/{category}/")

    sitemap_urls = set()
    if SITEMAP.exists():
        try:
            root = ET.fromstring(SITEMAP.read_text(encoding="utf-8"))
            ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
            sitemap_urls = {loc.text for loc in root.findall("sm:url/sm:loc", ns) if loc.text}
        except Exception as exc:
            errors.append(f"sitemap.xml: invalid XML: {exc}")
    else:
        errors.append("sitemap.xml: missing")

    if sitemap_urls != expected_urls:
        errors.append(f"sitemap mismatch: expected {len(expected_urls)} URLs, found {len(sitemap_urls)}")

    print(f"Canonical files : {len(list(CORPUS.glob('*.json')))}")
    print(f"Hymns           : {total_hymns}")
    print(f"Versions        : {total_versions}")
    print(f"Without number  : {missing_numbers}")
    print(f"Generated pages : {len(generated_pages)}")
    print(f"Category pages  : {len(category_pages)}")
    print(f"Sitemap URLs    : {len(sitemap_urls)}")
    print(f"Warnings        : {len(warnings)}")
    print(f"Errors          : {len(errors)}")
    for item in warnings: print(f"WARNING: {item}")
    for item in errors: print(f"ERROR: {item}")
    return 1 if errors else 0

if __name__ == "__main__":
    sys.exit(main())
