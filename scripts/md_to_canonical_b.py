#!/usr/bin/env python3
"""Convertit les MD Format B en JSON canoniques. Parser tolérant."""

import re
import json
import uuid
import os
import sys

NAMESPACE = uuid.UUID('d8e3a8f2-1c4b-4a6e-8b1f-9e2d3f4a5b6c')

def make_uuid(*args):
    return str(uuid.uuid5(NAMESPACE, '|'.join(str(a) for a in args)))


def parse_source_file(text):
    """Détecte le fichier source."""
    patterns = [
        r'\*\*Fichier\s*:\s*\*\*\s*`([^`]+)`',
        r'\*\*Source\s*:\s*\*\*\s*`([^`]+)`',
        r'Fichier\s*:\s*`([^`]+)`',
        r'Source\s*:\s*`([^`]+)`',
    ]
    for p in patterns:
        m = re.search(p, text)
        if m:
            return m.group(1).strip()
    return 'unknown'


def parse_blocks(body):
    """Parse les blocs de contenu dans une entrée (tolérant)."""
    # Pattern : ### ou #### suivi du type, OU **TYPE** en gras
    block_pattern = re.compile(
        r'(?:^#{3,4}\s+(SOURCE_BLOCK|REFRAIN|VERSE\s+\d+|COMMENT)\s*$|^\*\*(SOURCE_BLOCK|REFRAIN|VERSE\s+\d+|COMMENT)\*\*\s*$)'
        r'(.*?)'
        r'(?=^(?:#{3,4}\s+(?:SOURCE_BLOCK|REFRAIN|VERSE\s+\d+|COMMENT)\s*$|\*\*(?:SOURCE_BLOCK|REFRAIN|VERSE\s+\d+|COMMENT)\*\*\s*$|\*\*Source\s*:|\*\*Audio\s*:|##\s|\Z))',
        re.MULTILINE | re.DOTALL
    )

    blocks = []
    for m in block_pattern.finditer(body):
        marker = (m.group(1) or m.group(2) or '').strip()
        content = m.group(3)

        if marker == 'SOURCE_BLOCK':
            block_type = 'source_block'
        elif marker == 'REFRAIN':
            block_type = 'refrain'
        elif marker == 'COMMENT':
            block_type = 'comment'
        elif marker.startswith('VERSE'):
            block_type = 'source_block'
        else:
            continue

        lines = []
        for line in content.split('\n'):
            line = line.strip()
            if line.startswith('>'):
                line = line[1:].strip()
                if line:
                    lines.append(line)
            elif line and not line.startswith('#') and not line.startswith('**') and not line.startswith('---'):
                # Ligne sans > mais pas un marqueur
                lines.append(line)

        if lines:
            blocks.append({'type': block_type, 'lines': lines})

    return blocks


def parse_entries(text):
    """Parse les entrées de type '## N. n°X — TITRE'."""
    # Le pattern de séparation d'entrées
    entry_pattern = re.compile(
        r'^##\s+(\d+)\.\s+n°(\d+)\s*—\s*(.+?)$',
        re.MULTILINE
    )

    matches = list(entry_pattern.finditer(text))
    entries = []

    for i, m in enumerate(matches):
        position_seq = int(m.group(1))
        source_number = m.group(2)
        title = m.group(3).strip()

        # Le corps va jusqu'à la prochaine entrée (ou la fin)
        start = m.end()
        end = matches[i+1].start() if i+1 < len(matches) else len(text)
        body = text[start:end]

        # Source position explicite
        m_sp = re.search(r'\*\*Source position\s*:\s*\*\*\s*(\d+)', body)
        position = int(m_sp.group(1)) if m_sp else position_seq

        # Audio
        m_audio = re.search(r'\*\*Audio\s*:\s*\*\*\s*(oui|non|true|false)', body, re.IGNORECASE)
        audio_present = False
        if m_audio:
            val = m_audio.group(1).lower()
            audio_present = val in ('oui', 'true')

        # Langue
        m_lang = re.search(r'\*\*Language\s*:\s*\*\*\s*([^\n]+)', body)
        version_language = m_lang.group(1).strip() if m_lang else None

        # Blocs
        blocks = parse_blocks(body)

        if blocks:
            entries.append({
                'position': position,
                'number': source_number,
                'title': title,
                'audio_present': audio_present,
                'version_language': version_language,
                'blocks': blocks,
            })

    return entries


def detect_language(entries):
    for e in entries:
        if e.get('version_language'):
            lang = e['version_language'].lower()
            if 'tshiluba' in lang:
                return {'code': 'lua', 'label': 'Tshiluba', 'status': 'confirmed', 'detection': 'manual'}
            if 'swahili' in lang:
                return {'code': 'sw', 'label': 'Swahili', 'status': 'confirmed', 'detection': 'manual'}
            if 'lingala' in lang:
                return {'code': 'ln', 'label': 'Lingala', 'status': 'confirmed', 'detection': 'manual'}
            if 'français' in lang or 'francais' in lang:
                return {'code': 'fr', 'label': 'Français', 'status': 'confirmed', 'detection': 'manual'}
    return {'code': 'sw', 'label': 'Swahili', 'status': 'confirmed', 'detection': 'auto'}


def build_canonical_b(source_file, entries, taxonomy):
    hymns = []
    default_language = detect_language(entries)

    for entry in entries:
        hymn_id = make_uuid('hymn', source_file, entry['position'], entry['title'])
        version_id = make_uuid('version', hymn_id, entry['number'])

        lang = default_language
        if entry.get('version_language'):
            lang = detect_language([entry])

        hymn = {
            'schema_version': '1.0',
            'id': hymn_id,
            'title': entry['title'],
            'status': 'review',
            'versions': [{
                'id': version_id,
                'language': lang,
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


def convert_file(md_path, taxonomy, output_path):
    with open(md_path, 'r', encoding='utf-8') as f:
        text = f.read()

    source_file = parse_source_file(text)
    entries = parse_entries(text)

    print(f"  Source : {source_file}")
    print(f"  Entrées trouvées : {len(entries)}")

    canonical = build_canonical_b(source_file, entries, taxonomy)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(canonical, f, ensure_ascii=False, indent=2)

    print(f"  ✅ {output_path} ({len(canonical['hymns'])} cantiques)")


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python3 md_to_canonical_b.py <lesson_id>")
        sys.exit(1)

    lesson_id = sys.argv[1]

    MAPPING = {
        'lesson-7':  ('extracted/validated/extraction_lecon_7_lot.md', 'Lot', 'Leçon 7 — Lot', 'lesson-7-lot.json'),
        'lesson-10': ('extracted/validated/extraction_lecon_10_depart_israel_egypte.md', 'Départ d’Israël pour l’Égypte', 'Leçon 10 — Départ d’Israël pour l’Égypte', 'lesson-10-egypte.json'),
        'lesson-11': ('extracted/validated/extraction_lecon_11_moise.md', 'Moïse', 'Leçon 11 — Moïse', 'lesson-11-moise.json'),
        'lesson-12': ('extracted/validated/extraction_lecon_12_10_plaies.md', 'Les 10 plaies', 'Leçon 12 — Les 10 plaies', 'lesson-12-plaies.json'),
    }

    if lesson_id not in MAPPING:
        print(f"❌ Mapping inconnu pour : {lesson_id}")
        sys.exit(1)

    md_path, cat_label, lesson_label, output_name = MAPPING[lesson_id]

    taxonomy = {
        'domain': 'lessons',
        'category_id': lesson_id,
        'category_label': cat_label,
        'lesson_id': lesson_id,
        'lesson_label': lesson_label
    }

    output = f'app/data/canonical/{output_name}'

    print(f"═══ Conversion : {lesson_id} ═══")
    convert_file(md_path, taxonomy, output)
