# Cantiques EUJC — Règles d'extraction et de validation

## Principe

Le processus distingue :
1. **Extraction** — préserver la source.
2. **Validation / modélisation** — décider ce qui peut être représenté fidèlement.
3. **Application** — présenter les données retenues.

> FIDÉLITÉ À LA SOURCE > NORMALISATION > INTERPRÉTATION

## Règles

### Ne pas corriger silencieusement
L'extraction ne doit pas :
- corriger les fautes ;
- traduire ;
- reformuler ;
- compléter ;
- inventer ;
- dédupliquer ;
- réordonner.

Toute correction doit être identifiable comme telle.

### Numéros source
Conserver séparément :
- la position dans la page ;
- le numéro affiché par la source ;
- le titre ;
- le fichier source.

Le numéro n'est pas l'identifiant métier universel.

### Structure des paroles

**VERSE** : uniquement lorsque la source permet d'établir qu'il s'agit d'un couplet.

**REFRAIN** : lorsqu'une indication explicite permet de l'identifier.

**SOURCE_BLOCK** : lorsqu'un bloc existe mais que sa structure exacte ne peut pas être déterminée sans interprétation.

**COMMENT** : commentaire explicitement introduit par `Com:` lorsqu'il est séparable.

### Cas ambigus

L'ambiguïté doit être conservée.

Il est préférable d'utiliser `source_block` plutôt que de reconstruire artificiellement `verse 1`, `verse 2`, etc.

### Ordre

L'ordre original de la source est conservé dans les données RAW.

L'ordre canonique des leçons est une information métier distincte.

### Langues

Ne pas affirmer une langue comme vérité source si elle n'est pas explicitement déterminée.

Ne pas faire correspondre automatiquement deux versions linguistiques par leur numéro.

### Audio

L'audio n'est pas une fonctionnalité de l'application dans cette phase. Une information `audio_present` peut rester dans le RAW.

### Corrections utilisateur

Une correction proposée doit être :
- traçable ;
- distincte du texte officiel ;
- associée à un statut ;
- révisable.

Elle ne modifie jamais directement la donnée officielle validée.
