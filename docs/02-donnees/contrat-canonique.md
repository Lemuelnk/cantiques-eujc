# Cantiques EUJC — Contrat de données canonique v1

**Statut :** contrat canonique de référence
**Version :** 1.0
**Objet :** définir la structure unique qui alimente la fiche, la lecture, les versions linguistiques, la recherche et les trois modes de partage.

## 1. Objet du contrat

Le contrat canonique définit la seule représentation métier consommée par l'application pour un cantique validé.

Cette même donnée alimente, sans duplication du contenu :
- la fiche du cantique ;
- le mode lecture ;
- le sélecteur de versions linguistiques ;
- la recherche ;
- le partage en image ;
- le partage en texte ;
- le partage par lien.

Le contrat ne remplace pas les couches RAW, Validated ou Corrections. Il constitue la représentation canonique après validation, destinée à l'application.

> FIDÉLITÉ À LA SOURCE > NORMALISATION > INTERPRÉTATION

Le contrat ne doit jamais devenir un endroit où l'application améliore silencieusement une source.

## 2. Architecture des identités

| Notion | Rôle |
|---|---|
| hymn.id | identité technique stable du cantique |
| version.id | identité technique d'une version |
| source.position | position de l'entrée dans la source |
| source.number | numéro affiché par la source |

Règles :
1. hymn.id est l'identifiant technique stable utilisé par l'application.
2. version.id identifie une version précise.
3. source.position indique où l'entrée apparaît dans la source.
4. source.number conserve le numéro affiché par la source.
5. Aucun numéro source ne devient un identifiant universel.
6. Deux sources peuvent utiliser le même numéro pour des contenus différents.
7. Deux versions linguistiques ne doivent jamais être rapprochées automatiquement uniquement parce qu'elles ont le même numéro.
8. Les liens profonds utilisent hymn.id et, lorsque nécessaire, version.id.

## 3. Règle fondamentale : une entrée source reste autonome

Lorsqu'une entrée est extraite d'une source, elle est d'abord considérée comme une unité autonome.

Elle ne devient une version d'un même cantique multilingue qu'après une correspondance explicitement validée.

Exemple : si deux sources contiennent toutes deux un cantique portant le numéro 25, le numéro 25 ne suffit pas à conclure qu'il s'agit du même cantique.

Sans correspondance validée, les deux entrées restent autonomes.

## 4. Structure générale

Objet racine : Hymn.

Champs obligatoires de haut niveau :
- schema_version
- id
- title
- status
- versions

Exemple minimal :

    {
      schema_version: 1.0,
      id: UUID,
      title: Titre canonique,
      status: validated,
      versions: [ ... ]
    }

Chaque élément de versions possède au minimum :
- id
- language
- title
- source
- taxonomy
- content
- media

## 5. Racine du cantique

### schema_version
Version du contrat utilisé par l'objet. Version actuelle : 1.0.

Une évolution incompatible doit produire une nouvelle version majeure du contrat.

### id
UUID unique et stable du cantique.

Il ne doit dépendre ni du numéro source, ni de la position, ni du titre brut.

### title
Nom canonique utilisé par l'application pour désigner le cantique.

Le titre exact de chaque source reste dans versions[].title.

Le titre canonique ne doit donc pas être utilisé pour réécrire silencieusement un titre source.

### status
Valeurs autorisées : draft, review, validated, archived.

- draft : objet en construction ;
- review : objet structuré nécessitant encore validation ;
- validated : objet approuvé pour l'application ;
- archived : objet conservé pour traçabilité mais retiré du corpus actif.

## 6. Versions linguistiques

versions contient uniquement les versions explicitement validées comme appartenant au même cantique métier.

Une version comprend sa langue, son titre, sa provenance, sa taxonomie, son contenu et ses métadonnées.

### version.id
UUID unique et stable de la version.

### language
Structure logique :

    language: {
      code: ... ou null,
      label: ... ou null,
      status: known | uncertain | unknown
    }

Le code est renseigné lorsqu'il est suffisamment établi.
Le label est destiné à l'affichage.
Le statut exprime le niveau de certitude.

Une langue incertaine reste incertaine dans les données.

### versions[].title
Titre exact de l'entrée source retenue pour cette version.

Le système ne corrige pas automatiquement l'orthographe, les accents, la casse, les mots collés ou la formulation.

## 7. Provenance

Structure logique :

    source: {
      file: ... ,
      position: ... ,
      number: ... ou null,
      reference: ... ou null
    }

### file
Nom de la ressource source locale, par exemple chants_de_la_creation.html.

### position
Position de l'entrée dans la source. Elle représente l'ordre source, pas un numéro métier.

### number
Numéro affiché par la source. Il peut être numérique, alphanumérique, romain ou absent.

### reference
Référence source complémentaire lorsqu'elle existe.

## 8. Taxonomie

Structure logique :

    taxonomy: {
      domain: ... ,
      category_id: ... ,
      category_label: ... ,
      lesson_id: ... ,
      lesson_label: ...
    }

Les identifiants servent aux relations internes, à la navigation et à la recherche. Les labels servent à l'affichage.

Une modification de label ne doit pas casser les identifiants internes.

Les domaines canoniques sont : lessons, sunday, prayer.

Les ressources hors de ces domaines ne doivent pas être injectées arbitrairement dans le corpus des cantiques.

## 9. Ordre canonique des leçons

- Leçon 0 — Lucifer
- Leçon 1 — Création
- Leçon 2 — Éden
- Leçon 3 — Premier péché
- Leçon 4 — Les fils d’Adam
- Leçon 5 — NOÉ
- Leçon 6 — Abraham
- Leçon 7 — Lot
- Leçon 8 — Les fils d’Isaac
- Leçon 9 — Jacob et ses fils
- Leçon 10 — Départ d’Israël pour l’Égypte
- Leçon 11 — Moïse
- Leçon 12 — Les 10 plaies
- Leçon 13 — Le passage de la mer Rouge
- Leçon 14 — indéterminée
- Leçon 15 — indéterminée
- Leçon 16 — indéterminée
- Leçon 17 — indéterminée
- Leçon 18 — indéterminée
- Leçon 19 — indéterminée
- Leçon 20 — Samson
- Leçon 21 — Le royaume de David est celui de Saül
- Leçon 22 — Salomon
- Leçon 23 — L’office du temple
- Leçon 24 — Élie et Élysée
- Leçon 25 — Daniel
- Leçon 26 — Job

Le Chant du Jourdain est distinct du passage de la mer Rouge. Il ne doit pas être affecté à la Leçon 13. Tant que son emplacement canonique exact n'est pas validé, il reste indéterminé.

## 10. Contenu des paroles

content est un tableau ordonné.

Types autorisés :
- verse
- refrain
- comment
- source_block

### verse
Un bloc devient verse uniquement lorsque la source ou une validation explicite permet d'établir qu'il s'agit d'un couplet.

Il est interdit de créer artificiellement verse 1, verse 2, etc. simplement parce que plusieurs blocs sont visibles.

### refrain
Un bloc devient refrain lorsqu'une indication explicite de la source permet de l'établir, notamment Refrain ou Ref.

Un bloc qui ressemble à un refrain mais qui reste ambigu demeure source_block.

### comment
Les indications explicitement introduites comme commentaires, notamment Com:, peuvent être conservées comme comment lorsqu'elles sont séparables du contenu chanté.

### source_block
source_block est le mécanisme officiel de conservation de l'ambiguïté structurelle.

Il doit être utilisé lorsqu'il existe un bloc de texte mais que sa nature exacte ne peut pas être déterminée sans interprétation.

> Il vaut mieux conserver une structure ambiguë que fabriquer une structure fausse.

## 11. Lignes et ordre

Chaque bloc porte un tableau lines.

Les lignes doivent conserver :
- leur ordre ;
- leur contenu validé ;
- leurs séparations lorsque celles-ci sont établies.

Ne pas joindre artificiellement des lignes, en créer, les traduire ou les reformuler.

L'ordre des blocs dans content est significatif et doit être respecté par la lecture et les exports.

## 12. Médias

media peut contenir audio_present.

audio_present est une information descriptive sur la source. Il ne signifie pas que l'application propose une fonctionnalité audio.

Aucune fonctionnalité audio ne fait partie du périmètre actuel.

## 13. Ce qui ne doit pas être stocké comme vérité canonique

Ne pas stocker comme nouvelles sources de vérité :
- search_text
- share_text
- share_title
- display_html
- formatted_lyrics
- traduction automatique
- résumé
- extrait généré
- score de recherche
- classement de recherche
- URL temporaire de partage.

Ces valeurs sont des projections dérivées du canonique.

## 14. Fiche

La fiche doit pouvoir être reconstruite uniquement depuis Hymn.

Elle peut afficher : titre, langue/version, numéro source lorsqu'il existe, catégorie, leçon, paroles, refrains, commentaires, actions de partage et sélection de version.

La fiche ne doit pas conserver sa propre copie des paroles.

## 15. Lecture

Le lecteur consomme le contenu de la version sélectionnée.

Il respecte :
- la langue sélectionnée ;
- l'ordre des blocs ;
- les types de blocs ;
- les lignes ;
- les refrains explicitement identifiés.

Il ne reconstruit pas une autre structure à partir du texte.

## 16. Sélecteur de versions

Le sélecteur affiche uniquement les versions réellement associées au cantique.

Une version linguistique incertaine peut rester accessible, mais l'interface ne doit pas présenter sa langue comme certaine.

Une sélection de version ne doit jamais mélanger les paroles de deux versions.

## 17. Recherche

La recherche consomme le corpus canonique.

Elle peut indexer :
- titre canonique ;
- titre de version ;
- langue connue ;
- catégorie ;
- leçon ;
- paroles ;
- numéro source lorsqu'il est recherché explicitement.

Un index de recherche est une projection dérivée et régénérable. Il ne devient jamais une source de vérité.

## 18. Partage en image

Le générateur reçoit le cantique et la version sélectionnée.

Il génère une représentation graphique sans modifier le contenu.

Il peut afficher :
- identité Cantiques EUJC ;
- titre ;
- numéro source s'il existe ;
- langue/version ;
- catégorie ou leçon ;
- paroles ;
- hiérarchie des couplets et refrains ;
- signature de l'application ;
- lien de découverte ;
- QR facultatif.

Le générateur ne corrige, ne traduit, ne reformule et ne mélange jamais les versions.

## 19. Partage en texte

Le texte partagé est généré à partir du même objet canonique.

Il peut contenir le titre, la langue, la catégorie ou leçon, puis le contenu structuré, avec éventuellement la signature et le lien.

Le texte partagé est une projection temporaire, pas une deuxième donnée canonique.

## 20. Partage par lien

Le lien identifie le cantique par hymn.id.

Lorsqu'une version précise doit être ciblée, il peut également utiliser version.id.

Le numéro source, la position source et le titre brut ne doivent pas servir d'identifiant de lien.

## 21. Corrections

Les corrections proposées restent externes au canonique publié.

Cycle :

    proposition
        ↓
      review
        ↓
     validation
        ↓
 nouvelle donnée canonique

Une proposition ne modifie jamais directement les paroles officielles.

## 22. Invariants obligatoires

### Identité
- hymn.id unique ;
- version.id unique ;
- aucun numéro source utilisé comme identité universelle.

### Provenance
- toute version possède une provenance identifiable ;
- position et numéro restent distincts ;
- le fichier source reste identifiable.

### Contenu
- content est ordonné ;
- les types sont autorisés ;
- les ambiguïtés restent source_block ;
- aucun refrain n'est inventé ;
- aucun couplet n'est inventé.

### Langue
- une langue incertaine reste incertaine ;
- une correspondance multilingue est explicitement validée.

### Fidélité
- aucune traduction automatique ;
- aucune reformulation ;
- aucune correction silencieuse ;
- aucune déduplication silencieuse ;
- aucun réordonnancement silencieux.

### Application
- l'interface ne possède pas une copie concurrente des paroles ;
- les exports sont dérivés du canonique ;
- la recherche est une projection dérivée.

## 23. Validation avant publication

Avant publication, vérifier :
1. identité technique présente ;
2. titre présent ;
3. statut valide ;
4. au moins une version ;
5. identité technique de version présente ;
6. provenance identifiable ;
7. taxonomie cohérente ;
8. contenu ordonné ;
9. types de blocs autorisés ;
10. aucune structure inventée ;
11. langue correctement qualifiée ;
12. correspondances multilingues explicitement validées ;
13. aucune correction silencieuse ;
14. aucune dépendance à un numéro source comme identifiant.

## 24. Compatibilité avec l'ancien modèle

app/data/cantiques.json utilise un modèle legacy différent.

Il ne doit pas être prolongé pour les nouvelles données canoniques.

Sa migration doit être une opération dédiée, avec mapping explicite et revue. Une structure ambiguë doit être conservée sous forme source_block plutôt que reconstruite artificiellement.

## 25. Contrat de consommation

| Module | Entrée canonique |
|---|---|
| Fiche | Hymn |
| Lecture | Hymn + version.id |
| Versions | Hymn.versions |
| Recherche | corpus canonique |
| Partage image | Hymn + version sélectionnée |
| Partage texte | Hymn + version sélectionnée |
| Partage lien | Hymn.id, éventuellement version.id |

## 26. Règle de non-duplication

Une information canonique ne doit être stockée qu'une seule fois.

Les projections de recherche, de lecture, de partage et de présentation doivent pouvoir être régénérées à partir du canonique.

## 27. Règle de stabilité

Une modification d'interface ne doit pas obliger à modifier le contenu canonique.

Une modification validée du contenu doit pouvoir alimenter toutes les surfaces qui le consomment.

Le contrat doit rester indépendant du HTML, du CSS, des composants de fiche, du moteur de partage et du moteur de recherche.

## 28. Décision finale

Le présent contrat devient la référence pour toute nouvelle donnée destinée à alimenter l'application.

Toute nouvelle fonctionnalité manipulant les cantiques doit vérifier sa compatibilité avec ce contrat avant de créer un nouveau modèle.

> Une entrée source est autonome par défaut. Le regroupement en versions linguistiques n'est créé qu'après correspondance explicitement validée.

Cette règle protège la fidélité des sources et empêche les rapprochements artificiels fondés sur les numéros de cantiques.