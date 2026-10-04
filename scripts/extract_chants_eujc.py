#!/usr/bin/env python3
"""Extrait les cantiques de 'CHANTS EUJC.pdf' vers JSON canonique (v2)."""
import json, re, os
from pypdf import PdfReader

PDF = 'pdfs/CHANTS EUJC.pdf'
OUT = 'app/data/canonical/recueil-chants-eujc.json'

reader = PdfReader(PDF)
full = '\n'.join((p.extract_text() or '') for p in reader.pages)
full = re.sub(r'P\s*a\s*g\s*e\s*\|\s*\d+', '', full)

# Regex : Titre = "N) TITRE MAJUSCULES"
title_pat = re.compile(r'^\s*(\d+)\)\s+([A-ZÀ-Ü][A-ZÀ-Ü\s,\'\-\.\(\)]{4,100}?)\s*$', re.MULTILINE)
matches = list(title_pat.finditer(full))
print(f"Cantiques trouves : {len(matches)}")

# Regex marqueurs
RE_REFRAIN = re.compile(r'^\s*R[ée]\s*f\s*\.?\s*/?\s*:?\s*(.*)$', re.IGNORECASE)
RE_VERSE_ROMAN = re.compile(r'^\s*(I{1,3}|IV|V|VI{1,3}|IX|X{1,3}|XI{1,3}|XIV|XV|XVI{0,3}|XIX|XX|XXI{0,3}|XXIV|XXV)\.\s*(.*)$')
RE_VERSE_ARABE = re.compile(r'^\s*(\d+)\)\s*(.*)$')
RE_BULLET = re.compile(r'^\s*[-–—]\s+(.*)$')


def parse_body(body):
    """Parse le corps d'un cantique (v2)."""
    content = []
    cur_type = None
    cur_num = None
    cur_lines = []

    def push():
        if cur_type and cur_lines:
            # Nettoyer les lignes vides et espaces doubles
            cleaned = []
            for l in cur_lines:
                l = re.sub(r'\s+', ' ', l).strip()
                if l:
                    cleaned.append(l)
            if cleaned:
                block = {"type": cur_type, "lines": cleaned}
                if cur_num is not None:
                    block["index"] = cur_num
                content.append(block)

    for raw in body.split('\n'):
        line = raw.strip()
        if not line:
            continue

        # Refrain
        m_ref = RE_REFRAIN.match(line)
        if m_ref:
            push()
            cur_type = "refrain"
            cur_num = None
            cur_lines = []
            rest = m_ref.group(1).strip()
            if rest:
                cur_lines.append(rest)
            continue

        # Verset romain (I. II. III.)
        m_rom = RE_VERSE_ROMAN.match(line)
        if m_rom:
            push()
            cur_type = "verse"
            cur_num = m_rom.group(1)
            cur_lines = []
            rest = m_rom.group(2).strip()
            if rest:
                cur_lines.append(rest)
            continue

        # Verset arabe (1) 2) 3))
        m_ar = RE_VERSE_ARABE.match(line)
        if m_ar:
            push()
            cur_type = "verse"
            cur_num = m_ar.group(1)
            cur_lines = []
            rest = m_ar.group(2).strip()
            if rest:
                cur_lines.append(rest)
            continue

        # Bullet (FLAMBO)
        m_b = RE_BULLET.match(line)
        if m_b:
            # Nouveau verset si on a deja au moins 1 ligne
            if cur_type == "verse" and cur_lines:
                push()
                cur_type = "verse"
                cur_num = (int(cur_num) + 1) if isinstance(cur_num, int) else 1
                cur_lines = []
            elif cur_type is None:
                cur_type = "verse"
                cur_num = 1
                cur_lines = []
            rest = m_b.group(1).strip()
            if rest:
                cur_lines.append(rest)
            continue

        # Ligne normale
        if cur_type is None:
            cur_type = "verse"
            cur_num = 1
        cur_lines.append(line)

    push()
    return content


hymns = []
for i, m in enumerate(matches):
    num = int(m.group(1))
    title = m.group(2).strip()
    # Nettoyer "A) " parasite dans certains titres
    title = re.sub(r'^[A-Z]\)\s+', '', title)

    start = m.end()
    end = matches[i+1].start() if i+1 < len(matches) else len(full)
    body = full[start:end].strip()
    content = parse_body(body)

    hymn_id = f"ceujc-{i+1:03d}"
    hymns.append({
        "schema_version": "1.0",
        "id": hymn_id,
        "title": title,
        "status": "review",
        "versions": [{
            "id": f"{hymn_id}-v1",
            "language": {"code": "sw", "label": "Swahili", "status": "confirmed", "detection": "manual"},
            "title": title,
            "source": {"file": os.path.basename(PDF), "position": i+1, "number": str(num), "reference": None},
            "taxonomy": {"domain": "hymnal", "category_id": "recueil-chants-eujc", "category_label": "Chants EUJC", "lesson_id": "recueil-chants-eujc", "lesson_label": "Chants EUJC"},
            "content": content
        }]
    })

data = {
    "schema_version": "1.0",
    "corpus_status": "review",
    "taxonomy": {"domain": "hymnal", "category_id": "recueil-chants-eujc", "category_label": "Chants EUJC", "lesson_id": "recueil-chants-eujc", "lesson_label": "Chants EUJC"},
    "source": {"file": os.path.basename(PDF)},
    "hymns": hymns
}

os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Ecrit : {OUT} ({len(hymns)} cantiques)")
