# Cantiques EUJC — Journal des décisions

## DEC-001 — Identité métier

L'identité métier d'un cantique repose sur son nom / titre.

Le numéro source ne constitue pas une identité universelle.

## DEC-002 — Numéros source

Les numéros sont conservés comme références propres aux sources.

Ils ne servent pas seuls à rapprocher des versions linguistiques.

## DEC-003 — Fidélité à la source

> FIDÉLITÉ À LA SOURCE > NORMALISATION > INTERPRÉTATION

## DEC-004 — Structure ambiguë

Lorsqu'une structure de couplets n'est pas explicitement établie par la source, conserver source_block plutôt que reconstruire des verse.

## DEC-005 — Refrains

Seuls les refrains explicitement identifiables comme tels sont classés refrain.

## DEC-006 — Audio

Aucune fonctionnalité audio dans l'application à ce stade.

## DEC-007 — Corrections

Les corrections proposées sont séparées des données officielles et restent traçables.

## DEC-008 — Leçons

L'ordre canonique fourni pour le projet constitue la référence métier.

Les emplacements encore indéterminés restent vides. Aucune leçon manquante n'est inventée.

Le Chant du Jourdain est distinct du passage de la mer Rouge et ne doit pas être affecté automatiquement à la Leçon 13.

## DEC-009 — Catégories vides

Une catégorie ou une leçon sans cantique reste conservée et pourra être alimentée ultérieurement.

## DEC-010 — Application

La phase actuelle prépare et documente les données avant leur intégration dans l'interface.

Les fichiers de app/ ne sont pas modifiés pendant cette phase documentaire.

## DEC-011 — Contrat canonique

Le contrat canonique v1 est défini dans docs/02-donnees/contrat-canonique.md.

Il constitue la représentation métier unique destinée à alimenter la fiche, la lecture, les versions, la recherche et les trois modes de partage.

## DEC-012 — Entrée source autonome

Chaque entrée source est autonome par défaut.

Elle ne devient une version d'un même cantique que lorsqu'une correspondance multilingue a été explicitement validée.

Un numéro source identique ne constitue jamais à lui seul une preuve de correspondance.

## DEC-013 — Identités techniques

Le contrat distingue hymn.id, version.id, source.position et source.number.

Aucune référence source ne remplace l'identité technique.

## DEC-014 — Données dérivées

Les index de recherche et les représentations de partage sont des projections dérivées du contrat canonique.

Ils ne constituent pas des sources de vérité concurrentes.

## DEC-015 — Ancien modèle

app/data/cantiques.json est considéré comme un modèle legacy.

Les nouvelles données ne doivent pas prolonger ce modèle. Sa migration vers le contrat canonique fera l'objet d'une opération distincte et validée.
## DEC-007 — Identifiants stables sur les blocs

Chaque bloc de contenu (verse, refrain, comment, source_block) porte un `id` unique du type `blk-XXXXXXXX`.

Ces identifiants sont **aléatoires, stables à vie, jamais régénérés**. Ils servent de cible fiable pour l'intégration automatique des corrections, indépendamment de la position du bloc dans le tableau.

## DEC-008 — Intégration automatique via PR GitHub

Les signalements validés depuis l'admin déclenchent la création d'une Pull Request sur `Lemuelnk/cantiques-eujc` via l'API GitHub.

- Types auto-appliquables : `titre`, `couplet`, `refrain`, `orthographe`, `traduction`, `commentaire`
- Types manuels : `doublon`, `cantique_manquant`, `categorie_manquante`, `autre`, `nom_incorrect`, `categorie`, `ordre`
- Aucun commit direct sur `main` : toujours une PR review avant merge
- Le worker utilise un token GitHub fine-grained stocké comme secret Cloudflare (`GITHUB_TOKEN`)
