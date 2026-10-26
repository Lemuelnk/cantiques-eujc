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

---

## 2026-10-26 — Suppression des 3 recueils orphelins

### Contexte
Après audit, 3 fichiers JSON canoniques n'étaient **référencés nulle part** dans l'app (ni recherche, ni navigation, ni menus). Leurs cantiques étaient invisibles pour l'utilisateur.

### Recueils supprimés

| Fichier | Cantiques | Raison |
|---|---|---|
| recueil-francais.json | 27 | 25 doublons exacts avec a-classer-francais + 2 variantes moins propres |
| recueil-chants-eujc.json | 133 | 128 doublons exacts avec a-classer-swahili + 5 faux uniques |
| recueil-syllabus-tshiluba.json | 417 | Extraction PDF corrompue |
| **TOTAL** | **577** | |

### Détail recueil-syllabus-tshiluba
Le PDF SYLLABUS CANTIQUES TSHILUBA.pdf a été mal parsé :
- sy-002 : 0 bloc, titre = tout le texte collé
- sy-003 : 1765 blocs mélangés (tout le PDF)
- Majorité des titres contiennent du texte au lieu du vrai titre

**À faire plus tard** : réextraire ce PDF avec un parser plus robuste.

### Impact
- 577 cantiques invisibles supprimés
- Sitemap : 2443 → 1863 URLs
- Aucune régression (les cantiques supprimés n'étaient accessibles nulle part)

### Commits
- #35 : supprime recueil-francais
- #36 : supprime recueil-chants-eujc
- #38 : supprime recueil-syllabus-tshiluba

### Note pour futures reprises
- recueil-francais et recueil-chants-eujc : doublons stricts, contenu préservé dans les catégories branchées
- recueil-syllabus-tshiluba : PDF source conservé dans pdfs/, à réextraire proprement
