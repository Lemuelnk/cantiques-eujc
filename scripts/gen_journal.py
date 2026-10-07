#!/usr/bin/env python3
"""
Génère le journal de session depuis les commits Git.
Usage :
    python3 scripts/gen_journal.py [DATE]
    python3 scripts/gen_journal.py --summary "..." --summary "..." --next "..."
"""
import subprocess
import sys
import argparse
import datetime
from pathlib import Path

REPOS = [
    ('cantiques-eujc', Path.home() / 'storage/shared/LNK_WORKS/cantiques-eujc'),
    ('site-lnk_dt',   Path.home() / 'storage/shared/LNK_WORKS/site-lnk_dt'),
]

OUTPUT_DIR = Path.home() / 'storage/shared/LNK_WORKS/cantiques-eujc/docs/07-journal'


def get_commits_range(repo_path, since_dt, until_dt):
    """Retourne les commits dans la plage [since_dt, until_dt] sur toutes les branches."""
    try:
        result = subprocess.run(
            ['git', 'log',
             f'--since={since_dt.strftime("%Y-%m-%d %H:%M")}',
             f'--until={until_dt.strftime("%Y-%m-%d %H:%M")}',
             '--pretty=format:%h|%s|%an', '--all'],
            cwd=repo_path, capture_output=True, text=True, timeout=10
        )
    except Exception:
        return []
    commits = []
    for line in result.stdout.strip().split('\n'):
        if not line or '|' not in line:
            continue
        parts = line.split('|', 2)
        if len(parts) < 3:
            continue
        sha, subject, author = parts
        commits.append({'sha': sha, 'subject': subject, 'author': author})
    return commits


def main():
    parser = argparse.ArgumentParser(description='Génère le journal de session.')
    parser.add_argument('date', nargs='?', default=datetime.date.today().isoformat(),
                        help='Date de la session (YYYY-MM-DD, défaut = aujourd\'hui)')
    parser.add_argument('--summary', action='append', default=[],
                        help='Ajoute une ligne dans "Ce qui a été fait" (répétable)')
    parser.add_argument('--next', action='append', default=[],
                        help='Ajoute une ligne dans "Prochaines étapes" (répétable)')
    parser.add_argument('--note', action='append', default=[],
                        help='Ajoute une note libre (répétable)')
    parser.add_argument('--since', default=None,
                        help='Début de la plage (YYYY-MM-DD ou YYYY-MM-DD HH:MM). Défaut : 24h avant "date"')
    parser.add_argument('--until', default=None,
                        help='Fin de la plage. Défaut : fin de journée de "date"')
    args = parser.parse_args()

    # Calculer la plage
    if args.until:
        try:
            until_dt = datetime.datetime.strptime(args.until, '%Y-%m-%d %H:%M')
        except ValueError:
            until_dt = datetime.datetime.strptime(args.until, '%Y-%m-%d').replace(hour=23, minute=59)
    else:
        until_dt = datetime.datetime.strptime(args.date, '%Y-%m-%d').replace(hour=23, minute=59)

    if args.since:
        try:
            since_dt = datetime.datetime.strptime(args.since, '%Y-%m-%d %H:%M')
        except ValueError:
            since_dt = datetime.datetime.strptime(args.since, '%Y-%m-%d').replace(hour=0, minute=0)
    else:
        since_dt = until_dt - datetime.timedelta(hours=24)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    out_file = OUTPUT_DIR / f'{args.date}.md'

    lines = []
    lines.append(f'# Session du {args.date}')
    lines.append('')

    # 1. Ce qui a été fait (manuel d'abord)
    if args.summary:
        lines.append('## Ce qui a été fait')
        lines.append('')
        for s in args.summary:
            lines.append(f'- {s}')
        lines.append('')

    # 2. Commits automatiques
    for repo_name, repo_path in REPOS:
        if not repo_path.exists():
            continue
        commits = get_commits_range(repo_path, since_dt, until_dt)
        if not commits:
            continue
        lines.append(f'## Commits — {repo_name}')
        lines.append('')
        for c in commits:
            lines.append(f'- `{c["sha"]}` {c["subject"]}  ')
        lines.append('')

    # 3. Notes libres
    if args.note:
        lines.append('## Notes')
        lines.append('')
        for n in args.note:
            lines.append(f'- {n}')
        lines.append('')

    # 4. Prochaines étapes
    if args.next:
        lines.append('## Prochaines étapes')
        lines.append('')
        for n in args.next:
            lines.append(f'- [ ] {n}')
        lines.append('')

    out_file.write_text('\n'.join(lines), encoding='utf-8')
    print(f'✅ Journal écrit : {out_file}')
    print(f'   {len(lines)} lignes')
    print()
    print('--- Aperçu ---')
    print('\n'.join(lines))


if __name__ == '__main__':
    main()
