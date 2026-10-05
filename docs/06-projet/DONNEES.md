# 📊 Données — Cantiques

## Vue d'ensemble

- **379 cantiques uniques** répartis sur **32 catégories**
- **381 versions** au total (2 cantiques multilingues)

## Répartition par catégorie

### Leçons du Chemin (21 leçons)

| Leçon | Catégorie | Cantiques |
|---|---|---|
| 0 | Lucifer | 17 |
| 1 | Création | 12 |
| 2 | Éden | 15 |
| 3 | Premier péché | 4 |
| 4 | Les fils d'Adam | 4 |
| 5 | NOÉ | 13 |
| 6 | Abraham | 11 |
| 7 | Lot | 6 |
| 8 | Les fils d'Isaac | 9 |
| 9 | Jacob et ses fils | 2 |
| 10 | Départ pour l'Égypte | 5 |
| 11 | Moïse | 5 |
| 12 | Les 10 plaies | 25 |
| 13 | Le passage de la mer Rouge | 12 |
| 20 | Samson | 6 |
| 21 | Le royaume de David | 6 |
| 22 | Salomon | 5 |
| 23 | L'office du temple | 6 |
| 24 | Élie et Élysée | 7 |
| 25 | Daniel | 15 |
| 26 | Job | 7 |

### Cantiques du Dimanche (7 catégories)

| Catégorie | Cantiques |
|---|---|
| Louange | 14 |
| Croyants | 20 |
| Affligés | 19 |
| Égarés | 10 |
| Rois | 14 |
| Visiteurs | 11 |
| Communiquer et divers | 21 |

### Cantiques de prière (4 catégories)

| Catégorie | Cantiques |
|---|---|
| Miséricorde | 5 |
| Invocation | 33 |
| Général | 36 |
| Bataille | 4 |

## Cantiques multilingues

| Cantique | Langues |
|---|---|
| KUKALE MU EDENA (n°40) | Tshiluba + Swahili |
| NDJIKUBIKILA MUKALENGA (n°80) | Tshiluba + Swahili |

## Langues détectées

- **Swahili** (majorité)
- **Tshiluba**

## Structure JSON canonique

Fichiers : `app/data/canonical/*.json`

Chaque fichier contient :

- schema_version : "1.0"
- corpus_status : "review" ou "validated"
- taxonomy : domain, category_id, category_label, lesson_id, lesson_label
- source : fichier source d'origine
- hymns : tableau de cantiques

Chaque cantique (hymn) contient :

- id : UUID v5 déterministe
- title : titre canonique
- status : draft / review / validated / archived
- versions : tableau de versions linguistiques

Chaque version contient :

- id : UUID v5
- language : code + label + status
- title : titre dans cette langue
- source : fichier + position + number
- taxonomy : héritage du cantique
- content : tableau de blocs (source_block / refrain / comment)
- media : audio_present (bool)

## Sources utilisées

| Source | Type | Cantiques extraits |
|---|---|---|
| extracted/validated/*.md (Format A) | MD structuré | 76 |
| extracted/validated/*.md (Format B) | MD header Markdown | 69 |
| resources/site/*.html | HTML | 286 |
| Extraction Job (depuis Daniel) | HTML filtré | 7 |

## Scripts de conversion

| Script | Rôle |
|---|---|
| scripts/md_to_canonical.py | MD Format A vers JSON |
| scripts/md_to_canonical_b.py | MD Format B vers JSON |
| scripts/html_to_canonical.py | HTML vers JSON |
| scripts/fix_multilingual.py | Fusion versions multilingues |
| scripts/generate-leaves.py | Feuillages décoratifs |

