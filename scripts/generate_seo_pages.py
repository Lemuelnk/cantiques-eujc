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

def build(template,h,cat,label,n,route):
    v=primary(h) or {}
    title=clean(v.get("title")) or clean(h.get("title")) or "Cantique"
    lang=(v.get("language") or {})
    lang_label=clean(lang.get("label")) or "Langue non identifiée"
    lang_code=clean(lang.get("code")) or "fr"
    url=f"{BASE}/cantique/{quote(slug(cat))}/{quote(route)}"
    desc=f'Paroles du cantique « {title} » en {lang_label} dans le recueil Cantiques EUJC. Consultez le cantique, ses couplets et son refrain.'
    doc=re.sub(r"<title>.*?</title>",f"<title>{esc(title)} — Cantiques EUJC</title>",template,1,flags=re.I|re.S)
    doc=re.sub(r'<link rel="canonical" href="[^"]*">',f'<link rel="canonical" href="{esc(url)}">',doc,1,flags=re.I)
    doc=meta_replace(doc,r'(<meta\s+name="description"\s+content=")[^"]*(")',desc)
    doc=meta_replace(doc,r'(<meta\s+name="robots"\s+content=")[^"]*(")',"index, follow, max-image-preview:large")
    doc=meta_replace(doc,r'(<meta\s+property="og:title"\s+content=")[^"]*(")',f"{title} — Cantiques EUJC")
    doc=meta_replace(doc,r'(<meta\s+property="og:description"\s+content=")[^"]*(")',desc)
    doc=meta_replace(doc,r'(<meta\s+property="og:url"\s+content=")[^"]*(")',url)
    doc=meta_replace(doc,r'(<meta\s+name="twitter:title"\s+content=")[^"]*(")',f"{title} — Cantiques EUJC")
    doc=meta_replace(doc,r'(<meta\s+name="twitter:description"\s+content=")[^"]*(")',desc)
    intro=f'<nav class="seo-breadcrumbs" aria-label="Fil d’Ariane"><a href="/">Cantiques EUJC</a> › <a href="/cantiques.html?category={quote(cat)}">{esc(label)}</a> › <span aria-current="page">{esc(title)}</span></nav><header class="hymn-detail-intro"><p class="hymn-number-label">N° {esc(n)}</p><h1>{esc(title)}</h1><p class="hymn-metadata">{esc(lang_label)} · {esc(label)}</p></header><div class="hymn-lyrics">{lyrics(v)}</div>'
    doc=re.sub(r'<div class="detail-loading">.*?</div>',intro,doc,1,flags=re.I|re.S)
    lines=[str(x) for b in v.get("content") or [] for x in b.get("lines") or []]
    ld={"@context":"https://schema.org","@type":"MusicComposition","name":title,"inLanguage":lang_code,"genre":label,"lyrics":{"@type":"CreativeWork","text":"\n".join(lines)},"isPartOf":{"@type":"MusicAlbum","name":"Cantiques EUJC","url":f"{BASE}/cantiques.html"},"url":url,"alternateName":f"Cantique n° {n}","position":n}
    doc=doc.replace("</head>",f'<script type="application/ld+json" id="hymn-jsonld">{json.dumps(ld,ensure_ascii=False,separators=(",",":"))}</script>\n</head>',1)
    return doc,url,title

def main():
    template=TEMPLATE.read_text(encoding="utf-8")
    urls=[(f"{BASE}/","weekly","1.0"),(f"{BASE}/cantiques.html","weekly","0.9"),(f"{BASE}/categories.html","monthly","0.8"),(f"{BASE}/lessons.html","monthly","0.8"),(f"{BASE}/dimanche.html","monthly","0.8"),(f"{BASE}/priere.html","monthly","0.8"),(f"{BASE}/a-classer.html","monthly","0.6"),(f"{BASE}/apropos.html","monthly","0.5")]
    generated=0; skipped=0; seen=set(x[0] for x in urls); used_routes={}
    for path in sorted(CORPUS.glob("*.json")):
        data=json.loads(path.read_text(encoding="utf-8"))
        tax=data.get("taxonomy") or {}; cat=clean(tax.get("category_id")); label=clean(tax.get("category_label")) or cat
        if not cat: continue
        for h in data.get("hymns") or []:
            n=number(h)
            if not n: skipped+=1; continue
            used = used_routes.setdefault(slug(cat), set())
            route = route_segment(h, cat, used)
            out=APP/"cantique"/slug(cat)/route/"index.html"; out.parent.mkdir(parents=True,exist_ok=True)
            page,url,title=build(template,h,cat,label,n,route)
            out.write_text(page,encoding="utf-8"); generated+=1
            if url not in seen: urls.append((url,"monthly","0.7")); seen.add(url)
    lines=['<?xml version="1.0" encoding="UTF-8"?>','<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for loc,freq,priority in urls: lines += ["  <url>",f"    <loc>{esc(loc)}</loc>",f"    <changefreq>{freq}</changefreq>",f"    <priority>{priority}</priority>","  </url>"]
    lines.append("</urlset>"); (APP/"sitemap.xml").write_text("\n".join(lines)+"\n",encoding="utf-8")
    print(f"Generated {generated} hymn pages; skipped {skipped} hymns without a source number.")

if __name__=="__main__":
    main()
