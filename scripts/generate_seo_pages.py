#!/usr/bin/env python3
"""Generate crawlable static hymn pages and a sitemap from canonical JSON."""
from __future__ import annotations
import html, json, re
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[1]
APP = ROOT / "app"
CORPUS = APP / "data" / "canonical"
TEMPLATE = APP / "cantique.html"
CATEGORY_TEMPLATE = APP / "cantiques.html"
BASE = "https://cantiques-eujc.lnk-studio.com"

def esc(v):
    return html.escape("" if v is None else str(v), quote=True)

def clean(v):
    return " ".join(str(v or "").split())

def slug(v):
    s = clean(v).replace("œ","oe").replace("Œ","OE")
    s = re.sub(r"[^A-Za-z0-9_-]+","-",s)
    return re.sub(r"-+","-",s).strip("-").lower() or "inconnu"

def primary(h):
    return (h.get("versions") or [None])[0]

def number(h):
    for v in h.get("versions") or []:
        n = (v.get("source") or {}).get("number")
        if clean(n): return clean(n)
    return None

def language_code(v):
    code = clean((v or {}).get("language", {}).get("code"))
    return code or "fr"

def language_label(v):
    return clean((v or {}).get("language", {}).get("label")) or "Langue non identifiée"

def lyrics(v):
    out=[]
    for i,b in enumerate(v.get("content") or [],1):
        lines="".join(f"<p>{esc(x)}</p>" for x in b.get("lines") or [])
        if not lines: continue
        kind=clean(b.get("type")) or "source_block"
        if kind=="refrain":
            out.append(f'<section class="lyric-block lyric-block-refrain"><h2>Refrain</h2><div class="lyric-lines">{lines}</div></section>')
        elif kind=="comment":
            out.append(f'<section class="lyric-block lyric-block-comment"><h2>Commentaire</h2><div class="lyric-lines">{lines}</div></section>')
        else:
            n=clean(b.get("number")) or str(i)
            out.append(f'<section class="lyric-block lyric-block-{esc(kind)}"><div class="lyric-number">{esc(n)}.</div><div class="lyric-lines">{lines}</div></section>')
    return "\n".join(out) or '<p class="detail-empty">Aucune parole disponible.</p>'

def meta_replace(doc, pattern, value):
    updated = re.sub(pattern, lambda m:m.group(1)+esc(value)+m.group(2), doc, count=1, flags=re.I)
    return updated

def meta_upsert(doc, selector, attributes, value):
    pattern = rf'<meta\s+{selector}[^>]*>'
    if re.search(pattern, doc, flags=re.I):
        return re.sub(
            pattern,
            lambda m: re.sub(r'content="[^"]*"', f'content="{esc(value)}"', m.group(0), count=1, flags=re.I),
            doc,
            count=1,
            flags=re.I
        )
    attrs = " ".join(f'{k}="{esc(v)}"' for k, v in attributes.items())
    return doc.replace("</head>", f'<meta {attrs} content="{esc(value)}">\n</head>', 1)

def route_segment(h, cat, used):
    n = number(h)
    base = slug(n)
    if base not in used:
        used.add(base)
        return base
    ident = slug(h.get("id")) or "doublon"
    candidate = f"{base}-{ident}"
    suffix = 2
    while candidate in used:
        candidate = f"{base}-{ident}-{suffix}"
        suffix += 1
    used.add(candidate)
    return candidate


def category_page(template, cat, label, hymns):
    category_slug = slug(cat)
    url = f"{BASE}/categorie/{quote(category_slug)}/"
    indexable = not category_slug.startswith("a-classer")
    title = f"{label} — Cantiques EUJC"
    desc = f'Explorez les cantiques de la catégorie « {label} » dans le recueil Cantiques EUJC.'
    links = []
    for h in hymns:
        n = number(h)
        if not n:
            continue
        route = h["_seo_route"]
        v = primary(h) or {}
        hymn_title = clean(v.get("title")) or clean(h.get("title")) or "Cantique"
        links.append(
            f'<a class="hymn-row" href="/cantique/{quote(category_slug)}/{quote(route)}">'
            f'<div class="hymn-number">{esc(n)}</div>'
            f'<div class="hymn-content"><h2>{esc(hymn_title)}</h2>'
            f'<p>Consulter les paroles du cantique</p></div>'
            f'</a>'
        )
    intro = (
        f'<header class="seo-category-heading"><h1 id="category-title">{esc(label)}</h1></header>'
        f'<nav class="seo-breadcrumbs" aria-label="Fil d’Ariane">'
        f'<a href="/">Cantiques EUJC</a> › <span aria-current="page">{esc(label)}</span></nav>'
        f'<div class="seo-category-intro"><p class="eyebrow">CATÉGORIE</p>'
        f'<p>{len(links)} cantique{"s" if len(links) != 1 else ""} à consulter.</p></div>'
        f'<section class="seo-category-list" aria-labelledby="category-hymns-title">'
        f'<h2 id="category-hymns-title">Cantiques de {esc(label)}</h2>'
        f'<div class="hymns-list" id="hymns-list">{"".join(links)}</div></section>'
    )
    doc = re.sub(r"<title>.*?</title>", f"<title>{esc(title)}</title>", template, 1, flags=re.I|re.S)
    doc = re.sub(r'<p id="category-count">.*?</p>', f'<p id="category-count">{len(links)} cantique{"s" if len(links) != 1 else ""}</p>', doc, 1, flags=re.I|re.S)
    doc = re.sub(r'<link rel="canonical" href="[^"]*">', f'<link rel="canonical" href="{esc(url)}">', doc, 1, flags=re.I)
    doc = meta_replace(doc, r'(<meta\s+name="description"\s+content=")[^"]*(")', desc)
    doc = meta_upsert(doc, r'name="robots"', {"name":"robots"}, "index, follow, max-image-preview:large" if indexable else "noindex, follow")
    doc = meta_replace(doc, r'(<meta\s+property="og:title"\s+content=")[^"]*(")', title)
    doc = meta_replace(doc, r'(<meta\s+property="og:description"\s+content=")[^"]*(")', desc)
    doc = meta_replace(doc, r'(<meta\s+property="og:url"\s+content=")[^"]*(")', url)
    doc = meta_replace(doc, r'(<meta\s+name="twitter:title"\s+content=")[^"]*(")', title)
    doc = meta_replace(doc, r'(<meta\s+name="twitter:description"\s+content=")[^"]*(")', desc)
    doc = re.sub(r'<section\b[^>]*\bid="hymns-list"[^>]*>.*?</section>', intro, doc, 1, flags=re.I|re.S)
    breadcrumb = {"@type":"BreadcrumbList","itemListElement":[
        {"@type":"ListItem","position":1,"name":"Cantiques EUJC","item":f"{BASE}/"},
        {"@type":"ListItem","position":2,"name":label,"item":url}
    ]}
    item_list = {"@type":"ItemList","name":label,"numberOfItems":len(links),
                 "itemListElement":[
                     {"@type":"ListItem","position":i+1,"name":clean((primary(h) or {}).get("title")) or clean(h.get("title")) or "Cantique",
                      "url":f"{BASE}/cantique/{quote(category_slug)}/{quote(h['_seo_route'])}"}
                     for i,h in enumerate(hymns) if number(h)
                 ]}
    ld = {"@context":"https://schema.org","@graph":[breadcrumb,item_list]}
    doc = doc.replace("</head>", f'<script type="application/ld+json" id="category-jsonld">{json.dumps(ld,ensure_ascii=False,separators=(",",":"))}</script>\n</head>', 1)
    return doc, url, indexable

def build(template,h,cat,label,n,route):
    v=primary(h) or {}
    title=clean(v.get("title")) or clean(h.get("title")) or "Cantique"
    lang_code=language_code(v)
    lang_label=language_label(v)
    url=f"{BASE}/cantique/{quote(slug(cat))}/{quote(route)}"
    desc=f'Paroles du cantique « {title} » en {lang_label} dans le recueil Cantiques EUJC. Consultez le cantique, ses couplets et son refrain.'
    doc=re.sub(r"<title>.*?</title>",f"<title>{esc(title)} — Cantiques EUJC</title>",template,1,flags=re.I|re.S)
    doc=re.sub(r'<html\b([^>]*)\blang="[^"]*"',f'<html\1 lang="{esc(lang_code)}"',doc,1,flags=re.I)
    doc=re.sub(r'<link rel="canonical" href="[^"]*">',f'<link rel="canonical" href="{esc(url)}">',doc,1,flags=re.I)
    doc=meta_replace(doc,r'(<meta\s+name="description"\s+content=")[^"]*(")',desc)
    doc=meta_upsert(doc,r'name="robots',{"name":"robots"},"index, follow, max-image-preview:large")
    doc=meta_replace(doc,r'(<meta\s+property="og:title"\s+content=")[^"]*(")',f"{title} — Cantiques EUJC")
    doc=meta_replace(doc,r'(<meta\s+property="og:description"\s+content=")[^"]*(")',desc)
    doc=meta_replace(doc,r'(<meta\s+property="og:url"\s+content=")[^"]*(")',url)
    doc=meta_replace(doc,r'(<meta\s+name="twitter:title"\s+content=")[^"]*(")',f"{title} — Cantiques EUJC")
    doc=meta_replace(doc,r'(<meta\s+name="twitter:description"\s+content=")[^"]*(")',desc)

    versions=h.get("versions") or []
    version_summary=[]
    for item in versions:
        vl=language_label(item); vt=clean(item.get("title")) or title
        version_summary.append(f'<li><span class="seo-version-language">{esc(vl)}</span><span class="seo-version-title">{esc(vt)}</span></li>')
    versions_html=(
        '<section class="seo-hymn-versions" aria-labelledby="versions-title">'
        '<h2 id="versions-title">Versions disponibles</h2>'
        '<p>Ce cantique est disponible dans plusieurs langues ou variantes lorsqu’elles sont indiquées dans le recueil.</p>'
        f'<ul>{"".join(version_summary)}</ul></section>' if len(versions)>1 else ''
    )
    intro=(
        f'<nav class="seo-breadcrumbs" aria-label="Fil d’Ariane"><a href="/">Cantiques EUJC</a> › '
        f'<a href="/categorie/{quote(slug(cat))}/">{esc(label)}</a> › <span aria-current="page">{esc(title)}</span></nav>'
        f'<header class="hymn-detail-intro"><p class="hymn-number-label">N° {esc(n)}</p><h1>{esc(title)}</h1>'
        f'<p class="hymn-metadata">{esc(lang_label)} · {esc(label)}</p></header>{versions_html}<div class="hymn-lyrics">{lyrics(v)}</div>'
    )
    doc=re.sub(r'<div class="detail-loading">.*?</div>',intro,doc,1,flags=re.I|re.S)
    lines=[str(x) for b in v.get("content") or [] for x in b.get("lines") or []]
    breadcrumb={"@type":"BreadcrumbList","itemListElement":[
        {"@type":"ListItem","position":1,"name":"Cantiques EUJC","item":f"{BASE}/"},
        {"@type":"ListItem","position":2,"name":label,"item":f"{BASE}/categorie/{quote(slug(cat))}/"},
        {"@type":"ListItem","position":3,"name":title,"item":url}
    ]}
    ld={"@context":"https://schema.org","@type":"MusicComposition","name":title,"inLanguage":lang_code,
        "genre":label,"lyrics":{"@type":"CreativeWork","text":"\n".join(lines)},
        "isPartOf":{"@type":"MusicAlbum","name":"Cantiques EUJC","url":f"{BASE}/"},
        "url":url,"mainEntityOfPage":url,"position":n}
    names=[clean(x.get("title")) for x in versions if clean(x.get("title"))]
    if names: ld["alternateName"]=names
    if versions:
        ld["subjectOf"]={"@type":"CreativeWork","name":"Versions linguistiques",
                         "inLanguage":[language_code(x) for x in versions]}
    graph={"@context":"https://schema.org","@graph":[breadcrumb,ld]}
    doc=doc.replace("</head>",f'<script type="application/ld+json" id="hymn-jsonld">{json.dumps(graph,ensure_ascii=False,separators=(",",":"))}</script>\n</head>',1)
    return doc,url,title

def main():
    template=TEMPLATE.read_text(encoding="utf-8")
    category_template=CATEGORY_TEMPLATE.read_text(encoding="utf-8")
    urls=[(f"{BASE}/","weekly","1.0"),(f"{BASE}/categories.html","monthly","0.8"),(f"{BASE}/lessons.html","monthly","0.8"),(f"{BASE}/dimanche.html","monthly","0.8"),(f"{BASE}/priere.html","monthly","0.8"),(f"{BASE}/apropos.html","monthly","0.5")]
    generated=0; category_generated=0; skipped=0; seen=set(x[0] for x in urls); used_routes={}
    for path in sorted(CORPUS.glob("*.json")):
        data=json.loads(path.read_text(encoding="utf-8"))
        tax=data.get("taxonomy") or {}; cat=clean(tax.get("category_id")); label=clean(tax.get("category_label")) or cat
        if not cat: continue
        hymns = data.get("hymns") or []
        used = used_routes.setdefault(slug(cat), set())
        for h in hymns:
            n=number(h)
            if not n: skipped+=1; continue
            route = route_segment(h, cat, used)
            h["_seo_route"] = route
            out=APP/"cantique"/slug(cat)/route/"index.html"; out.parent.mkdir(parents=True,exist_ok=True)
            page,url,title=build(template,h,cat,label,n,route)
            out.write_text(page,encoding="utf-8"); generated+=1
            if url not in seen: urls.append((url,"monthly","0.7")); seen.add(url)
        category_out=APP/"categorie"/slug(cat)/"index.html"; category_out.parent.mkdir(parents=True,exist_ok=True)
        category_page_html,category_url,indexable=category_page(category_template,cat,label,hymns)
        category_out.write_text(category_page_html,encoding="utf-8"); category_generated+=1
        if indexable and category_url not in seen:
            urls.append((category_url,"monthly","0.8")); seen.add(category_url)
    lines=['<?xml version="1.0" encoding="UTF-8"?>','<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for loc,freq,priority in urls: lines += ["  <url>",f"    <loc>{esc(loc)}</loc>",f"    <changefreq>{freq}</changefreq>",f"    <priority>{priority}</priority>","  </url>"]
    lines.append("</urlset>"); (APP/"sitemap.xml").write_text("\n".join(lines)+"\n",encoding="utf-8")
    print(f"Generated {generated} hymn pages and {category_generated} category pages; skipped {skipped} hymns without a source number.")

if __name__=="__main__":
    main()
