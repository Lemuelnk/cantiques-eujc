#!/usr/bin/env python3
"""
Convertit les extractions MD (Format A) en JSON canoniques.
Format A : SOURCE / ENTRY / CONTENT / VERSE N / REFRAIN / COMMENT
"""

import re
import json
import uuid
import os
import sys

# Namespace UUID stable pour tout le projet
NAMESPACE = uuid.UUID('d8e3a8f2-1c4b-4a6e-8b1f-9e2d3f4a5b6c')

def make_uuid(*args):
    return str(uuid.uuid5(NAMESPACE, '|'.join(str(a) for a in args)))


def parse_source_header(text):
    """Parse le bloc SOURCE au début du MD."""
    source = {}
    m = re.match(r'^SOURCE\n(.*?)(?=\nENTRY\n)', text, re.DOTALL)
    if not m:
        return source
    for line in m.group(1).strip().split('\n'):
        if ':' in line:
            key, val = line.split(':', 1)
            source[key.strip()] = val.strip()
    return source


def parse_content_blocks(text):
    """Parse les blocs VERSE N, REFRAIN, COMMENT."""
    parts = re.split(
        r'^(VERSE\s+\d+|REFRAIN|COMMENT)\s*$',
        text,
        flags=re.MULTILINE
    )
    blocks = []
    for i in range(1, len(parts), 2):
        marker = parts[i].strip()
        body = parts[i+1].strip() if i+1 < len(parts) else ''
        if not body:
            continue
        if marker.startswith('VERSE'):
            block_type = 'source_block'
        elif marker == 'REFRAIN':
            block_type = 'refrain'
        elif marker == 'COMMENT':
            block_type = 'comment'
        else:
            continue
        lines = [l.strip() for l in body.split('\n') if l.strip()]
        if lines:
            blocks.append({'type': block_type, 'lines': lines})
    return blocks


def parse_one_entry(text):
    """Parse une ENTRY (contenu après 'ENTRY\\n')"""
    m_pos = re.search(r'^source_position:\s*(\d+)', text, re.MULTILINE)
    m_num = re.search(r'^source_number:\s*(\d+)', text, re.MULTILINE)
    m_title = re.search(r'^title:\s*"([^"]+)"', text, re.MULTILINE)
    m_audio = re.search(r'^audio_present:\s*(true|false)', text, re.MULTILINE)

    if not m_pos:
        return None

    entry = {
        'position': int(m_pos.group(1)),
        'number': m_num.group(1) if m_num else None,
        'title': m_title.group(1).strip() if m_title else '',
        'audio_present': (m_audio and m_audio.group(1) == 'true') or False,
    }

    content_start = text.find('CONTENT')
    if content_start == -1:
        return None

    content_end = text.find('audio_present:', content_start)
    if content_end == -1:
        content_end = len(text)

    content_text = text[content_start + len('CONTENT'):content_end].strip()
    entry['blocks'] = parse_content_blocks(content_text)
    return entry


def parse_format_a(text):
    """Parse un fichier MD Format A complet."""
    source = parse_source_header(text)
    parts = re.split(r'\nENTRY\n', text)
    entries = []
    for part in parts[1:]:
        entry = parse_one_entry(part)
        if entry and entry['blocks']:
            entries.append(entry)
    return source, entries


def build_canonical(source, entries, taxonomy):
    """Construit le JSON canonique final."""
    hymns = []
    source_file = source.get('file', 'unknown')

    for entry in entries:
        hymn_id = make_uuid('hymn', source_file, entry['position'], entry['title'])
        version_id = make_uuid('version', hymn_id, entry['number'] or entry['position'])

        hymn = {
            'schema_version': '1.0',
            'id': hymn_id,
            'title': entry['title'],
            'status': 'review',
            'versions': [
                {
                    'id': version_id,
                    'language': {
                        'code': 'sw',
                        'label': 'Swahili',
                        'status': 'confirmed',
                        'detection': 'auto'
                    },
                    'title': entry['title'],
                    'source': {
                        'file': source_file,
                        'position': entry['position'],
                        'number': entry['number'],
                        'reference': None
                    },
                    'taxonomy': taxonomy,
                    'content': entry['blocks'],
                    'media': {
                        'audio_present': entry['audio_present']
                    }
                }
            ]
        }
        hymns.append(hymn)

    return {
        'schema_version': '1.0',
        'corpus_status': 'review',
        'taxonomy': taxonomy,
        'source': {
            'file': source_file,
            'extraction_file': f'extraction_{os.path.basename(source_file).replace(".html", "")}.md'
        },
        'hymns': hymns
    }


def convert_file(md_path, taxonomy, output_path):
    with open(md_path, 'r', encoding='utf-8') as f:
        text = f.read()

    source, entries = parse_format_a(text)
    print(f"  Source : {source.get('file')}")
    print(f"  Entrées trouvées : {len(entries)}")

    canonical = build_canonical(source, entries, taxonomy)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(canonical, f, ensure_ascii=False, indent=2)

    print(f"  ✅ {output_path} ({len(canonical['hymns'])} cantiques)")


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python3 md_to_canonical.py <lesson_id>")
        print("Exemple: python3 md_to_canonical.py lesson-0")
        sys.exit(1)

    lesson_id = sys.argv[1]

    MAPPING = {
        'lesson-0': {
            'md': 'extracted/validated/extraction_chants_de_lucifer.md',
            'taxonomy': {
                'domain': 'lessons',
                'category_id': 'lesson-0',
                'category_label': 'Lucifer',
                'lesson_id': 'lesson-0',
                'lesson_label': 'Leçon 0 — Lucifer'
            },
            'output': 'app/data/canonical/lesson-0-lucifer.json'
        },
        'priere-invocation': {
            'md': 'extracted/validated/extraction_kualika_daniel_david.md',
            'taxonomy': {
                'domain': 'prayer',
                'category_id': 'priere-invocation',
                'category_label': 'Cantiques d’invocation',
                'lesson_id': None,
                'lesson_label': None
            },
            'output': 'app/data/canonical/priere-invocation.json'
        },
        'lesson-5': {
            'md': 'extracted/validated/_temp_noe.md',
            'taxonomy': {
                'domain': 'lessons',
                'category_id': 'lesson-5',
                'category_label': 'NOÉ',
                'lesson_id': 'lesson-5',
                'lesson_label': 'Leçon 5 — NOÉ'
            },
            'output': 'app/data/canonical/lesson-5-noe.json'
        },
        'lesson-6': {
            'md': 'extracted/validated/_temp_abraham.md',
            'taxonomy': {
                'domain': 'lessons',
                'category_id': 'lesson-6',
                'category_label': 'Abraham',
                'lesson_id': 'lesson-6',
                'lesson_label': 'Leçon 6 — Abraham'
            },
            'output': 'app/data/canonical/lesson-6-abraham.json'
        }
    }

    if lesson_id not in MAPPING:
        print(f"❌ Mapping inconnu pour : {lesson_id}")
        sys.exit(1)

    config = MAPPING[lesson_id]
    print(f"═══ Conversion : {lesson_id} ═══")
    convert_file(config['md'], config['taxonomy'], config['output'])
