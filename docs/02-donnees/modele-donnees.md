# Cantiques EUJC — Modèle de données

## 1. Couches

### Source
Ressources originales dans resources/site/.

### RAW
Extraction structurée dans data/raw/eujc/.

Le RAW représente la source sans lui attribuer une interprétation métier supplémentaire.

### Validated
Données examinées et validées manuellement. La structure de validation doit rester traçable jusqu'au RAW et à la source.

### Canonical
Données validées selon le contrat canonique dans docs/02-donnees/contrat-canonique.md.

Cette couche constitue la représentation métier consommée par l'application.

### Corrections
Propositions de corrections dans une couche séparée.

Une correction proposée ne modifie pas directement le texte officiel.

### Application
Données ou projections destinées à l'interface dans app/data/.

Les projections d'application ne doivent pas devenir des sources concurrentes du canonique.

## 2. Provenance

Une version canonique doit pouvoir conserver notamment :
- source.file
- source.position
- source.number
- source.reference
- title
- content
- media
- taxonomy

## 3. Identités

Le modèle distingue :
- hymn.id — identité technique du cantique ;
- version.id — identité technique de la version ;
- source.position — position dans la source ;
- source.number — numéro affiché par la source.

Le numéro source n'est jamais utilisé comme identité universelle.

## 4. Contenu

Types reconnus : verse, refrain, comment, source_block.

Un bloc ne doit pas être transformé en verse uniquement parce qu'il ressemble visuellement à un couplet.

Lorsque la structure de la source ne permet pas d'établir une séparation fiable, utiliser source_block.

## 5. Refrain

Un refrain est identifié lorsqu'une indication explicite de la source permet de l'établir, notamment Refrain ou Ref.

Un bloc ressemblant à un refrain sans indication explicite reste ambigu.

## 6. Commentaires

Les indications Com: sont conservées comme commentaires lorsqu'elles peuvent être séparées du contenu chanté.

Les diagnostics d'extraction ne doivent jamais être injectés dans les paroles.

## 7. Langues

La langue est représentée avec un code lorsqu'il est connu, un label et un statut de connaissance.

Une langue incertaine reste marquée comme incertaine.

Deux versions linguistiques ne sont pas rapprochées automatiquement sur la seule base de leur numéro source.

## 8. Correspondance des versions

Une entrée source est autonome par défaut.

Elle ne devient une version d'un même cantique que lorsqu'une correspondance est explicitement validée.

## 9. Taxonomie

La taxonomie canonique de l'application est indépendante de l'ordre technique des sources.

Elle doit respecter la référence définie dans docs/03-taxonomie/taxonomy.md.

Les leçons dont le titre exact n'est pas encore établi restent indéterminées.

Le Chant du Jourdain est distinct du passage de la mer Rouge et ne doit pas être affecté automatiquement à la Leçon 13.

## 10. Audio

Aucune fonctionnalité audio dans l'application à ce stade.

audio_present peut rester dans le RAW ou dans les métadonnées canoniques comme information descriptive de la source.

## 11. Données dérivées

Les éléments suivants doivent être calculés à partir du canonique plutôt que stockés comme nouvelles sources de vérité :
- index de recherche ;
- texte de partage ;
- titre de partage ;
- HTML de lecture ;
- mise en page de partage image ;
- URL temporaire de partage.

## 12. Corrections

Les corrections proposées sont séparées du canonique publié.

Cycle : proposition → review → validation → mise à jour canonique.

Une proposition ne modifie jamais directement la donnée officielle.

## 13. Référence complète

Pour les types, contraintes, invariants, exemples et règles de consommation, consulter docs/02-donnees/contrat-canonique.md.