#!/usr/bin/env python3
"""Extrait les cantiques de 'SYLLABUS CANTIQUES TSHILUBA.pdf' (v1)."""
import json, re, os
from pypdf import PdfReader

PDF = 'pdfs/SYLLABUS CANTIQUES TSHILUBA.pdf'
OUT = 'app/data/canonical/recueil-syllabus-tshiluba.json'

reader = PdfReader(PDF)
print(f"Pages PDF : {len(reader.pages)}")

# Joindre toutes les pages
full = '\n'.join((p.extract_text() or '') for p in reader.pages)

# Nettoyer en-tetes repetitifs
full = re.sub(r'Made By Therese Bilonda G4[^\n]*', '', full)
full = re.sub(r'Email:Theresebilonda[^\n]*', '', full)
full = re.sub(r'^Email:Therese[^\n]*$', '', full, flags=re.MULTILINE)

# Numeros de page seuls sur une ligne
full = re.sub(r'^\s*\d{1,3}\s*$', '', full, flags=re.MULTILINE)

# Trouver tous les candidats titres : "N. Titre..." en debut de ligne
title_pat = re.compile(r'^\s*(\d{1,3})\.\s+([A-ZÀ-Ü][^\n]*)', re.MULTILINE)
candidats = list(title_pat.finditer(full))
print(f"Candidats titres : {len(candidats)}")

# Filtrer les vrais titres : sequence croissante
vrais = []
last_num = 0
for m in candidats:
    num = int(m.group(1))
    if num == last_num + 1:
        vrais.append(m)
        last_num = num
    elif num <= last_num:
        continue
    elif num == last_num + 2:
        # Tolerance pour sauts de 1
        vrais.append(m)
        last_num = num

print(f"Titres valides (sequence croissante) : {len(vrais)}")

# Patterns de corps
RE_VERSE = re.compile(r'^\s*(\d{1,3})[\)\.]\s*(.*)$')
RE_REFRAIN = re.compile(r'^\s*R[ée]f\s*\.?\s*:?\s*(.*)$', re.IGNORECASE)
RE_COMMENT = re.compile(r'^\s*Commentaires?\s*:?\s*(.*)$', re.IGNORECASE)


def extract_title_and_body(block):
    """Separe titre et corps. Le titre s'arrete a la premiere ligne qui
    commence par 1) / Ref: / Ref. / Commentaires."""
    lines = block.split('\n')
    titre_lines = []
    body_lines = []
    in_title = True

    for i, line in enumerate(lines):
        s = line.strip()
        if in_title:
            # Fin du titre si on rencontre un marqueur de corps
            if re.match(r'^\d{1,3}[\)\.]\s', s) or RE_REFRAIN.match(s) or RE_COMMENT.match(s):
                in_title = False
                body_lines.append(line)
                continue
            # Ligne vide : peut marquer la fin du titre si la suivante commence par 1)
            if not s:
                # Regarder la prochaine ligne non vide
                j = i + 1
                while j < len(lines) and not lines[j].strip():
                    j += 1
                if j < len(lines):
                    nxt = lines[j].strip()
                    if re.match(r'^\d{1,3}[\)\.]\s', nxt) or RE_REFRAIN.match(nxt):
                        in_title = False
                        continue
                continue
            titre_lines.append(s)
        else:
            body_lines.append(line)

    titre = ' '.join(titre_lines).strip()
    # Nettoyer le numero et point du titre
    titre = re.sub(r'^\d{1,3}\.\s*', '', titre).strip()
    return titre, '\n'.join(body_lines).strip()


def parse_body(body):
    """Parse le corps en blocs verset/refrain/comment."""
    content = []
    cur_type = None
    cur_num = None
    cur_lines = []

    def push():
        if cur_type and cur_lines:
            cleaned = [re.sub(r'\s+', ' ', l).strip() for l in cur_lines if l.strip()]
            if cleaned:
                block = {"type": cur_type, "lines": cleaned}
                if cur_num is not None:
                    block["index"] = cur_num
                content.append(block)

    for raw in body.split('\n'):
        line = raw.strip()
        if not line:
            continue

        # Bullet (commentaire)
        if line.startswith('\uf0d8'):
            rest = line.lstrip('\uf0d8').strip()
            if cur_type != 'comment' and cur_type is not None:
                push()
                cur_type = 'comment'
                cur_num = None
                cur_lines = []
            elif cur_type is None:
                cur_type = 'comment'
                cur_num = None
                cur_lines = []
            if rest:
                cur_lines.append(rest)
            continue

        # Commentaires explicites
        m_com = RE_COMMENT.match(line)
        if m_com:
            push()
            cur_type = 'comment'
            cur_num = None
            cur_lines = []
            rest = m_com.group(1).strip()
            if rest:
                cur_lines.append(rest)
            continue

        # Refrain
        m_ref = RE_REFRAIN.match(line)
        if m_ref:
            push()
            cur_type = 'refrain'
            cur_num = None
            cur_lines = []
            rest = m_ref.group(1).strip()
            if rest:
                cur_lines.append(rest)
            continue

        # Verset arabe "1)" ou "1."
        m_v = RE_VERSE.match(line)
        if m_v:
            push()
            cur_type = 'verse'
            cur_num = int(m_v.group(1))
            cur_lines = []
            rest = m_v.group(2).strip()
            if rest:
                cur_lines.append(rest)
            continue

        # Ligne normale
        if cur_type is None:
            cur_type = 'verse'
            cur_num = 1
        cur_lines.append(line)

    push()
    return content


hymns = []
for i, m in enumerate(vrais):
    num = int(m.group(1))
    start = m.start()
    end = vrais[i+1].start() if i+1 < len(vrais) else len(full)
    block = full[start:end]

    titre, body = extract_title_and_body(block)
    if not titre:
        continue

    content = parse_body(body)

    hymn_id = f"sy-{num:03d}"
    hymns.append({
        "schema_version": "1.0",
        "id": hymn_id,
        "title": titre,
        "status": "review",
        "versions": [{
            "id": f"{hymn_id}-v1",
            "language": {"code": "lua", "label": "Tshiluba", "status": "confirmed", "detection": "manual"},
            "title": titre,
            "source": {"file": os.path.basename(PDF), "position": num, "number": str(num), "reference": None},
            "taxonomy": {"domain": "hymnal", "category_id": "recueil-syllabus-tshiluba", "category_label": "Syllabus Tshiluba", "lesson_id": "recueil-syllabus-tshiluba", "lesson_label": "Syllabus Tshiluba"},
            "content": content
        }]
    })

data = {
    "schema_version": "1.0",
    "corpus_status": "review",
    "taxonomy": {"domain": "hymnal", "category_id": "recueil-syllabus-tshiluba", "category_label": "Syllabus Tshiluba", "lesson_id": "recueil-syllabus-tshiluba", "lesson_label": "Syllabus Tshiluba"},
    "source": {"file": os.path.basename(PDF)},
    "hymns": hymns
}

os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Ecrit : {OUT} ({len(hymns)} cantiques)")
