#!/usr/bin/env python3
"""Extrait les cantiques de 'Chants en Francais.pdf' vers JSON canonique."""
import json, re, os
from pypdf import PdfReader

PDF = 'pdfs/Chants en Francais.pdf'
OUT = 'app/data/canonical/recueil-francais.json'

reader = PdfReader(PDF)
full = '\n'.join((p.extract_text() or '') for p in reader.pages)
full = re.sub(r'=+\s*PAGE\s+\d+\s*\([^)]*\)\s*=+', '', full)

ROMANS = ['I','II','III','IV','V','VI','VII','VIII','IX','X',
          'XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX',
          'XXI','XXII','XXIII','XXIV','XXV','XXVI','XXVII','XXVIII','XXIX','XXX']

pattern = re.compile(r'^(' + '|'.join(ROMANS) + r')\.\s+(.+?)$', re.MULTILINE)
matches = list(pattern.finditer(full))
print(f"Cantiques trouves : {len(matches)}")


def parse_body(body):
    """Parse le corps d'un cantique en liste de blocs verse/refrain."""
    content = []
    cur_type = None
    cur_num = None
    cur_lines = []

    def push():
        if cur_type and cur_lines:
            block = {"type": cur_type, "lines": [l for l in cur_lines if l]}
            if cur_num is not None:
                block["index"] = cur_num
            content.append(block)

    for raw in body.split('\n'):
        line = raw.strip()
        if not line:
            continue

        if re.match(r'^R[ée]\s*f\s*:', line, re.IGNORECASE):
            push()
            cur_type = "refrain"
            cur_num = None
            cur_lines = []
            rest = re.sub(r'^R[ée]\s*f\s*:\s*', '', line, flags=re.IGNORECASE).strip()
            if rest:
                cur_lines.append(rest)
            continue

        sm = re.match(r'^(\d+)\.\s*(.*)$', line)
        if sm:
            push()
            cur_type = "verse"
            cur_num = int(sm.group(1))
            cur_lines = []
            rest = sm.group(2).strip()
            if rest:
                cur_lines.append(rest)
            continue

        if cur_type is None:
            cur_type = "verse"
            cur_num = 1
            cur_lines = []
        cur_lines.append(line)

    push()
    return content


hymns = []
for i, m in enumerate(matches):
    roman = m.group(1)
    title = m.group(2).strip()
    start = m.end()
    end = matches[i+1].start() if i+1 < len(matches) else len(full)
    body = full[start:end].strip()
    content = parse_body(body)

    hymn_id = f"fr-{i+1:03d}"
    hymns.append({
        "schema_version": "1.0",
        "id": hymn_id,
        "title": title,
        "status": "review",
        "versions": [{
            "id": f"{hymn_id}-v1",
            "language": {
                "code": "fr",
                "label": "Français",
                "status": "confirmed",
                "detection": "manual"
            },
            "title": title,
            "source": {
                "file": os.path.basename(PDF),
                "position": i+1,
                "number": roman,
                "reference": None
            },
            "taxonomy": {
                "domain": "hymnal",
                "category_id": "recueil-francais",
                "category_label": "Recueil français",
                "lesson_id": "recueil-francais",
                "lesson_label": "Recueil français"
            },
            "content": content
        }]
    })

data = {
    "schema_version": "1.0",
    "corpus_status": "review",
    "taxonomy": {
        "domain": "hymnal",
        "category_id": "recueil-francais",
        "category_label": "Recueil français",
        "lesson_id": "recueil-francais",
        "lesson_label": "Recueil français"
    },
    "source": {"file": os.path.basename(PDF)},
    "hymns": hymns
}

os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Ecrit : {OUT}")
print(f"Total cantiques : {len(hymns)}")
