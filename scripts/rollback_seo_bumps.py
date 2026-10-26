#!/usr/bin/env python3
"""Rollback les bumps ?v=NNN cosmétiques dans app/cantique/ et app/categorie/.

Après une régénération SEO (scripts/generate_seo_pages.py), tous les fichiers
HTML sont bumpés ?v=425→426. Ce script rollback automatiquement ceux dont
SEUL le cache-buster a changé, en préservant ceux qui ont un vrai changement
(compteurs, contenu, liens, structure...).

Motivation : les PRs #40, #44 et #47 ont toutes rencontré le même bug — les
pages catégorie avec compteurs désynchronisés étaient noyées dans le bruit
des 1800+ bumps ?v=, et oubliées du rollback manuel. Ce script élimine
l'erreur humaine.

Usage :
    python3 scripts/rollback_seo_bumps.py            # dry-run (défaut)
    python3 scripts/rollback_seo_bumps.py --apply    # applique les rollbacks
    python3 scripts/rollback_seo_bumps.py -v         # verbose
"""

import argparse
import re
import subprocess
import sys
from pathlib import Path

VERSION_RE = re.compile(r'\?v=\d+')
SEARCH_PATHS = ('app/cantique/', 'app/categorie/')


def get_modified_files():
    """Liste les fichiers M dans les search paths."""
    result = subprocess.check_output(
        ['git', 'diff', '--name-only', '--diff-filter=M', '--'] + list(SEARCH_PATHS),
        text=True,
    )
    return [f for f in result.strip().split('\n') if f]


def get_head_content(filepath):
    """Version HEAD du fichier."""
    return subprocess.check_output(['git', 'show', f'HEAD:{filepath}'], text=True)


def normalize(content):
    """Remplace ?v=NNN par ?v=X — neutralise le cache-buster."""
    return VERSION_RE.sub('?v=X', content)


def is_cosmetic_only(filepath):
    """True si seul le cache-buster a changé entre HEAD et disque."""
    try:
        head = normalize(get_head_content(filepath))
        current = normalize(Path(filepath).read_text(encoding='utf-8'))
        return head == current
    except Exception as exc:
        # En cas de doute, on considère que ce n'est PAS cosmétique (safe).
        print(f"  ⚠️  Erreur sur {filepath} : {exc}", file=sys.stderr)
        return False


def main():
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument(
        '--apply', action='store_true', help='Applique les rollbacks (défaut : dry-run)'
    )
    parser.add_argument('--verbose', '-v', action='store_true', help='Liste tous les fichiers')
    args = parser.parse_args()

    files = get_modified_files()
    if not files:
        print('Aucun fichier M dans app/cantique/ ou app/categorie/.')
        return 0

    cosmetic, real = [], []
    for f in files:
        if is_cosmetic_only(f):
            cosmetic.append(f)
        else:
            real.append(f)

    print(f'=== {len(files)} fichiers M analysés ===\n')
    print(f'🗑️  Cosmétiques (rollback) : {len(cosmetic)}')
    if args.verbose:
        for f in cosmetic:
            print(f'    • {f}')
    print(f'\n✅ Vrais changements (gardés) : {len(real)}')
    for f in real:
        print(f'    • {f}')

    if not cosmetic:
        print('\nRien à rollback.')
        return 0

    if not args.apply:
        print(f'\n🔍 DRY RUN — pour appliquer : python3 scripts/rollback_seo_bumps.py --apply')
        return 0

    print('\n=== Rollback en cours (batch) ===')
    subprocess.run(['git', 'checkout', '--'] + cosmetic, check=True)
    print(f'✅ {len(cosmetic)} fichiers rollbackés')
    return 0


if __name__ == '__main__':
    sys.exit(main())
