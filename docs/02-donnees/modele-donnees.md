# Cantiques EUJC — Modèle de données

## 1. Couches

### Source
Ressources originales dans `resources/site/`.

### RAW
Extraction structurée dans `data/raw/eujc/`.

Le RAW représente la source sans lui attribuer une interprétation métier supplémentaire.

### Validated
Données examinées et validées manuellement dans `data/validated/eujc/`.

### Corrections
Propositions de corrections dans `corrected/`.

Une correction proposée ne modifie pas directement le texte officiel.

### Application
Données destinées à l'interface dans `app/data/`.

## 2. Provenance

Un enregistrement doit pouvoir conserver notamment :
- `source_position`
- `source_reference`
- `title`
- `content`
- `media`
- `taxonomy`

La provenance doit rester traçable.

## 3. Contenu

Types reconnus :
- `verse`
- `refrain`
- `comment`
- `source_block`

### Règle essentielle

Un bloc ne doit pas être transformé en `verse` uniquement parce qu'il ressemble visuellement à un couplet.

Lorsque la structure de la source ne permet pas d'établir une séparation fiable, utiliser `source_block`.

## 4. Refrain

Un refrain est identifié lorsqu'une indication explicite de la source permet de l'établir, notamment `Refrain` ou `Ref`.

Un bloc ressemblant à un refrain sans indication explicite reste ambigu.

## 5. Commentaires

Les indications `Com:` sont conservées comme commentaires lorsqu'elles peuvent être séparées du contenu chanté.

Les diagnostics d'extraction ne doivent jamais être injectés dans les paroles.

## 6. Audio

Aucune fonctionnalité audio dans l'application à ce stade.

`audio_present` peut rester dans le RAW comme information descriptive de la source.
