#!/usr/bin/env python3
"""
Parse les HTML sources EUJC — Parser universel v2.
Gère 3 formats : card/h3, card/p#copy3, card4/p#copy23.
"""

import re
import json
import uuid
import os
import sys
from html import unescape

NAMESPACE = uuid.UUID('d8e3a8f2-1c4b-4a6e-8b1f-9e2d3f4a5b6c')

def make_uuid(*args):
    return str(uuid.uuid5(NAMESPACE, '|'.join(str(a) for a in args)))


def clean_html(text):
    text = re.sub(r'<br\s*/?>', '\n', text, flags=re.IGNORECASE)
    text = re.sub(r'<[^>]+>', ' ', text)
    text = unescape(text)
    text = re.sub(r'[ \t]+', ' ', text)
    return text.strip()


def extract_number_title(text):
    """Extrait 'NUM. TITRE' d'un texte. Retourne (num, titre) ou (None, None)."""
    text = text.strip()
    m = re.match(r'^(\d+)\.\s*(.+?)\s*$', text)
    if m:
        return m.group(1), m.group(2).strip()
    return None, None


def parse_blocks(card_html):
    """
    Parse les blocs d'une card. Gère <ol><li>, <p>Refrain:, <p>Com:, etc.
    Retourne une liste de blocs canoniques.
    """
    # Retirer les <audio>
    card_html = re.sub(r'<audio[^>]*>.*?</audio>', '', card_html, flags=re.DOTALL | re.IGNORECASE)
    # Retirer les <div> container parasite
    card_html = re.sub(r'<div\s+class\s*=\s*"container"[^>]*>.*?</div>', '', card_html, flags=re.DOTALL | re.IGNORECASE)

    # Détecter si audio présent
    audio_present = bool(re.search(r'<audio', card_html, re.IGNORECASE))

    # Normaliser les retours ligne
    card_html = re.sub(r'<br\s*/?>', '\n', card_html, flags=re.IGNORECASE)

    # Séparer les <li>, <p>, etc. en blocs distincts
    # On remplace les balises de bloc par des séparateurs uniques
    card_html = re.sub(r'</li>', '\n@@@BLOCK@@@\n', card_html, flags=re.IGNORECASE)
    card_html = re.sub(r'</p>', '\n@@@BLOCK@@@\n', card_html, flags=re.IGNORECASE)
    card_html = re.sub(r'</ol>', '\n@@@BLOCK@@@\n', card_html, flags=re.IGNORECASE)
    card_html = re.sub(r'<li[^>]*>', '\n@@@START@@@', card_html, flags=re.IGNORECASE)
    card_html = re.sub(r'<p[^>]*>', '\n@@@START@@@', card_html, flags=re.IGNORECASE)
    card_html = re.sub(r'<ol[^>]*>', '\n@@@START@@@', card_html, flags=re.IGNORECASE)

    # Retirer toutes les autres balises HTML
    card_html = re.sub(r'<[^>]+>', '', card_html)
    card_html = unescape(card_html)

    # Splitter sur les marqueurs
    parts = re.split(r'@@@(?:START|BLOCK)@@@', card_html)

    blocks = []
    last_type = 'source_block'

    for part in parts:
        part = part.strip()
        if not part:
            continue

        # Réinitialiser le type : chaque nouveau <li> ou <p> commence en source_block
        last_type = 'source_block'

        # Détecter si ce bloc contient un Refrain: ou Com: à l'intérieur
        # Le marqueur "Refrain:" ou "Ref:" ou "Com:" peut séparer du contenu dans le même part

        # Recherche "Refrain:", "Ref:", "Com:", "Comment:"
        marker_pattern = re.compile(
            r'\b(Refrain\s*:?|Ref\s*:?|Com\s*:?|Comment\s*:?)\s*',
            re.IGNORECASE
        )

        segments = []
        last_end = 0
        last_marker_type = None

        for m in marker_pattern.finditer(part):
            segment = part[last_end:m.start()].strip()
            if segment:
                segments.append({
                    'type': last_marker_type or last_type,
                    'text': segment
                })

            marker = m.group(1).lower().rstrip(':').strip()
            if marker.startswith('ref'):
                last_marker_type = 'refrain'
            elif marker.startswith('com'):
                last_marker_type = 'comment'
            else:
                last_marker_type = 'source_block'
            last_end = m.end()

        # Dernier segment
        segment = part[last_end:].strip()
        if segment:
            segments.append({
                'type': last_marker_type or last_type,
                'text': segment
            })

        # Construire les blocs de CE part séparément
        # (fusion uniquement à l'intérieur du même <li>/<p>, pas entre 2 parts)
        part_blocks = []
        for seg in segments:
            lines = [l.strip() for l in seg['text'].split('\n') if l.strip()]
            if not lines:
                continue

            if part_blocks and part_blocks[-1]['type'] == seg['type']:
                part_blocks[-1]['lines'].extend(lines)
            else:
                part_blocks.append({'type': seg['type'], 'lines': lines})

        # Ajouter les blocs du part à la liste globale SANS fusionner
        # avec les blocs des parts précédents
        blocks.extend(part_blocks)

    return blocks, audio_present


def parse_html(html, number_filter=None):
    """Parse un fichier HTML complet. number_filter = set de numéros à garder."""
    m_title = re.search(r'<h2[^>]*class="slide-title"[^>]*>([^<]+)</h2>', html, re.IGNORECASE)
    source_title = m_title.group(1).strip() if m_title else ''

    # Trouver toutes les cards : <div class="card"> ou <div class="card4">
    cards = re.findall(
        r'<div\s+class\s*=\s*"card\d*"[^>]*>(.*?)(?=<div\s+class\s*=\s*"card\d*"|\s*</body>|\s*<footer|\s*</html>|\s*<div\s+class\s*=\s*"wrapper"[^>]*>\s*<div\s+class\s*=\s*"div1")',
        html,
        re.DOTALL | re.IGNORECASE
    )

    entries = []
    position = 0

    for card_html in cards:
        # Chercher le titre : <h3>, <p id="copy3">, <p id="copy23">, <p id="copy*">
        title_text = None

        m_h3 = re.search(r'<h3[^>]*>(.*?)</h3>', card_html, re.DOTALL | re.IGNORECASE)
        if m_h3:
            title_text = clean_html(m_h3.group(1))
        else:
            m_p = re.search(r'<p\s+id\s*=\s*"copy\d*"[^>]*>(.*?)</p>', card_html, re.DOTALL | re.IGNORECASE)
            if m_p:
                title_text = clean_html(m_p.group(1))

        if not title_text:
            continue

        num, title = extract_number_title(title_text)
        if not num:
            continue

        # Filtre par numéros si spécifié
        if number_filter is not None and num not in number_filter:
            continue

        position += 1

        # Contenu : tout ce qui reste après le titre
        if m_h3:
            content_start = m_h3.end()
        else:
            content_start = m_p.end()

        content_html = card_html[content_start:]

        blocks, audio_present = parse_blocks(content_html)

        if blocks:
            entries.append({
                'position': position,
                'number': num,
                'title': title,
                'audio_present': audio_present,
                'blocks': blocks
            })

    return source_title, entries


def build_canonical(source_file, entries, taxonomy, language=None):
    if language is None:
        language = {'code': 'sw', 'label': 'Swahili', 'status': 'confirmed', 'detection': 'auto'}

    hymns = []
    for entry in entries:
        hymn_id = make_uuid('hymn', source_file, entry['position'], entry['title'])
        version_id = make_uuid('version', hymn_id, entry['number'])

        hymn = {
            'schema_version': '1.0',
            'id': hymn_id,
            'title': entry['title'],
            'status': 'review',
            'versions': [{
                'id': version_id,
                'language': language,
                'title': entry['title'],
                'source': {
                    'file': source_file,
                    'position': entry['position'],
                    'number': entry['number'],
                    'reference': None
                },
                'taxonomy': taxonomy,
                'content': entry['blocks'],
                'media': {'audio_present': entry['audio_present']}
            }]
        }
        hymns.append(hymn)

    return {
        'schema_version': '1.0',
        'corpus_status': 'review',
        'taxonomy': taxonomy,
        'source': {'file': source_file},
        'hymns': hymns
    }


def convert_file(html_path, taxonomy, output_path, language=None, number_filter=None):
    with open(html_path, 'r', encoding='utf-8', errors='replace') as f:
        html = f.read()

    source_file = os.path.basename(html_path)
    source_title, entries = parse_html(html, number_filter)

    print(f"  Fichier   : {source_file}")
    print(f"  Titre     : {source_title}")
    print(f"  Entrées   : {len(entries)}")

    canonical = build_canonical(source_file, entries, taxonomy, language)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(canonical, f, ensure_ascii=False, indent=2)

    print(f"  ✅ {output_path} ({len(canonical['hymns'])} cantiques)")


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python3 html_to_canonical.py <lesson_id>")
        sys.exit(1)

    lesson_id = sys.argv[1]

    # (chemin_html, category_label, lesson_label_or_None, output_filename, domain)
    MAPPING = {
        # Leçons
        'lesson-3':  ('resources/site/chants_de_fils_dadam.html',  "Premier péché",        "Leçon 3 — Premier péché",            'lesson-3-premier-peche.json', 'lessons'),
        'lesson-4':  ('resources/site/chants_de_fils_dadam.html',  "Les fils d'Adam",      "Leçon 4 — Les fils d'Adam",          'lesson-4-fils-adam.json', 'lessons'),
        'lesson-8':  ('resources/site/chants_de_fils_disaac.html', "Les fils d'Isaac",     "Leçon 8 — Les fils d'Isaac",         'lesson-8-fils-isaac.json', 'lessons'),
        'lesson-9':  ('resources/site/chants_de_jacob.html',       "Jacob et ses fils",    "Leçon 9 — Jacob et ses fils",        'lesson-9-jacob.json', 'lessons'),
        'lesson-13': ('resources/site/Chants_de_jourdain.html',    "Le passage de la mer Rouge", "Leçon 13 — Le passage de la mer Rouge", 'lesson-13-mer-rouge.json', 'lessons'),
        'lesson-20': ('resources/site/chants_de_samson.html',      "Samson",               "Leçon 20 — Samson",                  'lesson-20-samson.json', 'lessons'),
        'lesson-21': ('resources/site/chants_de_david.html',       "Le royaume de David",  "Leçon 21 — Le royaume de David est celui de Saül", 'lesson-21-david-saul.json', 'lessons'),
        'lesson-22': ('resources/site/chants_de_salomon.html',     "Salomon",              "Leçon 22 — Salomon",                 'lesson-22-salomon.json', 'lessons'),
        'lesson-23': ('resources/site/chants_de_sac_du_coheleth.html', "L'office du temple", "Leçon 23 — L'office du temple",     'lesson-23-temple.json', 'lessons'),
        'lesson-24': ('resources/site/chants_delie.html',          "Élie et Élysée",       "Leçon 24 — Élie et Élysée",          'lesson-24-elie-elisee.json', 'lessons'),
        'lesson-25': ('resources/site/chants_de_daniel.html',      "Daniel",               "Leçon 25 — Daniel",                  'lesson-25-daniel.json', 'lessons'),
        # Dimanche
        'dimanche-louange':    ('resources/site/chants_de_louange.html',          "Cantiques de louange",         None, 'dimanche-louange.json', 'sunday'),
        'dimanche-croyants':   ('resources/site/chants_de_sac_de_croyants.html',  "Sacrifice des croyants",       None, 'dimanche-croyants.json', 'sunday'),
        'dimanche-affliges':   ('resources/site/chants_de_sac_deprouves.html',    "Sacrifice des affligés",       None, 'dimanche-affliges.json', 'sunday'),
        'dimanche-egares':     ('resources/site/chants_de_sac_degares.html',      "Sacrifice des égarés",         None, 'dimanche-egares.json', 'sunday'),
        'dimanche-rois':       ('resources/site/chants_de_sac_des_rois.html',     "Sacrifice des rois",           None, 'dimanche-rois.json', 'sunday'),
        'dimanche-visiteurs':  ('resources/site/chants_de_sac_de_visiteurs.html', "Sacrifice des visiteurs",      None, 'dimanche-visiteurs.json', 'sunday'),
        'dimanche-divers':     ('resources/site/chants_du_communique.html',       "Communiquer et divers",        None, 'dimanche-divers.json', 'sunday'),
        # Prière
        'priere-general':      ('resources/site/flambeaux_generaux.html',         "Cantiques de prière — général", None, 'priere-general.json', 'prayer'),
        'priere-misericorde':  ('resources/site/chants_de_rehema.html',           "Cantiques de miséricorde",     None, 'priere-misericorde.json', 'prayer'),
        'priere-bataille':     ('resources/site/chants_de_vita.html',             "Cantiques de bataille",        None, 'priere-bataille.json', 'prayer'),
    }

    if lesson_id not in MAPPING:
        print(f"❌ Mapping inconnu pour : {lesson_id}")
        sys.exit(1)

    html_path, cat_label, lesson_label, output_name, domain = MAPPING[lesson_id]

    if domain == 'lessons':
        taxonomy = {
            'domain': 'lessons',
            'category_id': lesson_id,
            'category_label': cat_label,
            'lesson_id': lesson_id,
            'lesson_label': lesson_label
        }
    else:
        taxonomy = {
            'domain': domain,
            'category_id': lesson_id,
            'category_label': cat_label,
            'lesson_id': None,
            'lesson_label': None
        }

    output = f'app/data/canonical/{output_name}'

    print(f"═══ Conversion : {lesson_id} ═══")
    convert_file(html_path, taxonomy, output)
