# Registre des nettoyages — Cantiques EUJC

Ce document trace tous les nettoyages de code mort, doublons, et fichiers obsolètes.
Chaque entrée = un commit dédié, daté, avec la raison.

---

## 2026-10-24 — Phase A : suppression code mort

### Contexte
Diagnostic automatique (`~/.diag_cantiques.py`) a révélé :
- 4 fichiers `.bak` (backups d'Oct 3-4)
- 1 fichier `debug.html` (outil de debug perso)
- 1 fichier `cantiques-standalone.html` (49 KB, ancienne version monolithique)
- Aucune référence dans le code (grep vide)

### Fichiers supprimés

| Fichier | Taille | Raison |
|---|---|---|
| `app/index.html.bak` | 6.9 KB | Backup obsolète du 3 oct. |
| `app/sitemap.xml.bak` | 845 B | Backup obsolète du 4 oct. |
| `app/splash.css.bak` | 6.9 KB | Backup obsolète du 3 oct. |
| `app/splash.html.bak` | 4.7 KB | Backup obsolète du 3 oct. |
| `app/debug.html` | 3.7 KB | Outil de debug perso (fond noir, texte vert) |
| `app/cantiques-standalone.html` | 48.2 KB | Ancienne version monolithique (palette obsolète `--bleu`/`--or`), remplacée par `cantiques.html` |

### Bénéfices
- **~72 KB** de code mort supprimé
- 6 fichiers en moins à maintenir
- Réduction de la confusion (cantiques.html vs cantiques-standalone.html)

### Règles ajoutées au `.gitignore`
- `*.bak`, `*.bak-*`, `*.casse`, `*.old`

### Commit
`chore(cleanup): supprime backups .bak, debug.html et cantiques-standalone.html (code mort)`

### Vérifications
- Aucun lien brisé (grep vide)
- Aucun test cassé (à valider en prod après déploiement)
