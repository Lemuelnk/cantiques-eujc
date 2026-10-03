#!/usr/bin/env python3
"""
Fusionne les versions multilingues et supprime les vrais doublons.
Règles explicites par fichier + position.
"""
import json

# ============================================================
# RÈGLES
# ============================================================

# FUSIONS MULTILINGUES : (gardée, fusionnée) — par fichier
FUSIONS = {
    'lesson-2-eden.json':       [(4, 5)],   # n°40 : Tshiluba + Swahili
    'lesson-8-fils-isaac.json': [(1, 2)],   # n°80 : Tshiluba + Swahili
}

# SUPPRESSIONS : positions de vrais doublons à supprimer
SUPPRESSIONS = {
    'lesson-0-lucifer.json':   [17, 18],   # Doublons pos11/12 (déjà présents)
    'dimanche-croyants.json':  [10],       # Doublon pos7
}

# CORRECTIONS DE LANGUE : forcer la langue d'une position
LANG_FIXES = {
    'lesson-8-fils-isaac.json': {
        1: {'code': 'lua', 'label': 'Tshiluba', 'status': 'confirmed', 'detection': 'manual'},
    },
}

FOLDER = 'app/data/canonical'


def load(filename):
    with open(f'{FOLDER}/{filename}') as f:
        return json.load(f)


def save(filename, data):
    with open(f'{FOLDER}/{filename}', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def apply_lang_fixes(data, fixes):
    for pos, lang in fixes.items():
        for h in data['hymns']:
            if h['versions'][0]['source']['position'] == pos:
                h['versions'][0]['language'] = lang
                print(f"   ✅ Langue corrigée pos {pos} → {lang['label']}")


def apply_fusion(data, keep_pos, merge_pos):
    keep_hymn = None
    merge_hymn = None
    for h in data['hymns']:
        pos = h['versions'][0]['source']['position']
        if pos == keep_pos:
            keep_hymn = h
        elif pos == merge_pos:
            merge_hymn = h

    if not keep_hymn or not merge_hymn:
        print(f"   ❌ Fusion impossible (pos {keep_pos} ← {merge_pos})")
        return data

    # Ajouter la version du cantique à fusionner
    keep_hymn['versions'].append(merge_hymn['versions'][0])

    # Retirer le cantique fusionné
    data['hymns'] = [h for h in data['hymns'] if h is not merge_hymn]

    print(f"   ✅ Fusion pos{keep_pos} ← pos{merge_pos} ({len(keep_hymn['versions'])} versions)")
    return data


def apply_suppressions(data, positions):
    before = len(data['hymns'])
    data['hymns'] = [
        h for h in data['hymns']
        if h['versions'][0]['source']['position'] not in positions
    ]
    removed = before - len(data['hymns'])
    print(f"   ✅ {removed} doublon(s) supprimé(s)")
    return data


def main():
    all_files = sorted(set(FUSIONS) | set(SUPPRESSIONS) | set(LANG_FIXES))

    for filename in all_files:
        print()
        print(f"═══ {filename} ═══")
        data = load(filename)

        if filename in LANG_FIXES:
            apply_lang_fixes(data, LANG_FIXES[filename])

        if filename in FUSIONS:
            for keep_pos, merge_pos in FUSIONS[filename]:
                data = apply_fusion(data, keep_pos, merge_pos)

        if filename in SUPPRESSIONS:
            data = apply_suppressions(data, SUPPRESSIONS[filename])

        save(filename, data)
        n_hymns = len(data['hymns'])
        n_versions = sum(len(h['versions']) for h in data['hymns'])
        print(f"   → {n_hymns} cantiques / {n_versions} versions")


if __name__ == '__main__':
    main()
