#!/usr/bin/env python3
"""Synchronise le canon embarqué dans l'app Flutter avec le canon principal.

Copie app/data/canonical/*.json → flutter_app/assets/data/canonical/
- Exclut volontairement les 5 a-classer-* (l'app mobile n'expose que
  les catégories thématiques : leçons, dimanche, prière).
- Vérifie la compatibilité de schéma avec le modèle Dart
  (lib/models/models.dart) avant chaque copie.

Usage :
    python3 scripts/sync_flutter_canon.py            # dry-run
    python3 scripts/sync_flutter_canon.py --apply    # applique
"""

import argparse
import json
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CANON = ROOT / "app" / "data" / "canonical"
FLUTTER = ROOT / "flutter_app" / "assets" / "data" / "canonical"

# Catégories exposées par categories.dart (cf. lib/data/categories.dart)
EXPOSED_PREFIXES = ("lesson-", "dimanche-", "priere-")

# Champs obligatoires pour le parsing Dart
REQUIRED_HYMN = ["id", "title", "versions"]
REQUIRED_VERSION = ["id", "language", "title", "source", "taxonomy", "content"]
REQUIRED_SOURCE = ["file", "position"]


def is_exposed(filename: str) -> bool:
    return any(filename.startswith(p) for p in EXPOSED_PREFIXES)


def validate_schema(data: dict, filename: str) -> list[str]:
    """Vérifie que les hymnes sont parsables par Hymn.fromJson (Dart)."""
    errors = []
    for h in data.get("hymns", []):
        hid = h.get("id", "?")
        for f in REQUIRED_HYMN:
            if f not in h:
                errors.append(f"{filename}/{hid}: hymn.{f} manquant")
        for v in h.get("versions", []):
            vid = v.get("id", "?")
            for f in REQUIRED_VERSION:
                if f not in v:
                    errors.append(f"{filename}/{hid}/{vid}: version.{f} manquant")
            src = v.get("source", {})
            for f in REQUIRED_SOURCE:
                if f not in src:
                    errors.append(f"{filename}/{hid}/{vid}: source.{f} manquant")
                elif f == "position" and not isinstance(src[f], (int, float)):
                    errors.append(f"{filename}/{hid}/{vid}: source.position={src[f]!r} (pas un number)")
    return errors


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="Applique les copies")
    args = parser.parse_args()

    FLUTTER.mkdir(parents=True, exist_ok=True)

    to_copy = []
    to_delete = []
    schema_errors = []

    # Index des fichiers exposés côté repo
    repo_files = {f.name: f for f in CANON.glob("*.json") if is_exposed(f.name)}
    flutter_files = {f.name: f for f in FLUTTER.glob("*.json")} if FLUTTER.exists() else {}

    # 1. Copier / mettre à jour
    for name, src in sorted(repo_files.items()):
        data = json.loads(src.read_text(encoding="utf-8"))
        errs = validate_schema(data, name)
        schema_errors.extend(errs)
        if errs:
            continue
        to_copy.append((src, FLUTTER / name))

    # 2. Supprimer les fichiers Flutter orphelins (catégorie retirée du repo)
    for name in flutter_files:
        if name not in repo_files:
            to_delete.append(flutter_files[name])

    print(f"=== {len(to_copy)} fichiers à copier, {len(to_delete)} à supprimer ===")
    if schema_errors:
        print(f"\n🔴 {len(schema_errors)} erreurs de schéma :")
        for e in schema_errors[:10]:
            print(f"   - {e}")
        return 1

    if not args.apply:
        for src, dst in to_copy:
            print(f"  • {src.name} → {dst.relative_to(ROOT)}")
        print(f"\n🔍 DRY RUN — pour appliquer : python3 scripts/sync_flutter_canon.py --apply")
        return 0

    print("\n=== Copy ===")
    for src, dst in to_copy:
        shutil.copy2(src, dst)
        print(f"  ✅ {src.name}")
    for dst in to_delete:
        dst.unlink()
        print(f"  🗑️  {dst.name} (orphelin)")

    print(f"\n✅ {len(to_copy)} fichiers synchronisés" + (f", {len(to_delete)} supprimés" if to_delete else ""))
    return 0


if __name__ == "__main__":
    sys.exit(main())
