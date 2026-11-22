# Contrat des données canoniques — iOS

## Source de vérité

Les données canoniques sont celles du dépôt, dans `app/data/canonical/*.json`, avec les statistiques dans `app/data/stats.json`. Le build iOS devra copier ces fichiers dans le bundle depuis cette source ; aucune copie éditée manuellement n'est autorisée.

Le catalogue Android et iOS doit couvrir les **37 catégories canoniques**. Le chiffre et la liste sont validés automatiquement contre les fichiers réellement présents, pas recopiés comme constantes isolées.

## Structure de haut niveau

Un corpus de catégorie contient :
- `schema_version`
- `corpus_status`
- `taxonomy`
- `source`
- `hymns[]`

Un cantique contient :
- `id`
- `title`
- `status`
- `versions[]`

Une version contient notamment :
- `id`
- `language` : code, label, status, detection et score selon disponibilité
- `title`
- `source` : fichier, position, numéro, section, référence et mise à jour éventuelle
- `taxonomy`
- `content[]`
- `media` (métadonnée seulement ; aucune lecture audio dans l'application)

Les blocs de contenu sont ordonnés et typés. Les champs optionnels, valeurs nulles et types de blocs inconnus doivent être traités sans faire échouer le décodage de tout un corpus.

## Identité et ordre

- Clé métier d'un cantique : `category_id + hymn.id`.
- `source.number` est une référence éditoriale, pas une clé primaire.
- L'ordre de `hymns` et des blocs de contenu doit être préservé.
- L'ordre des versions dans le JSON doit être préservé sauf règle produit explicite.
- Ne jamais fusionner deux hymnes sur la seule base du titre ou du numéro.

## Compatibilité du décodeur

- Clés JSON en snake_case mappées explicitement.
- DTO séparés des entités métier.
- `schema_version` contrôlée ; toute version non prise en charge produit une erreur diagnostique explicite.
- Champs supplémentaires ignorés de façon sûre.
- Champ obligatoire absent : erreur localisée au corpus/élément concerné, pas crash global.
- Type de bloc inconnu : conserver le type et les lignes si possible, avec rendu de repli lisible.
- Les champs souples tels que `number` et `reference` ne doivent pas être forcés dans un seul type si la source admet plusieurs formes.

## Statistiques

Lire `stats.json` pour l'accueil. Vérifier au démarrage la présence des clés attendues et signaler une incohérence ; ne pas afficher de compteurs inventés ou codés en dur.

## Recherche

La recherche doit pouvoir parcourir :
- titre du cantique et titres des versions ;
- numéro source ;
- lignes des blocs de contenu ;
- langue et catégorie.

Normalisation : casse ignorée, diacritiques ignorés pour la comparaison, texte original conservé pour l'affichage. Les résultats doivent toujours conserver la paire d'identité catégorie + ID.

## Distribution

- Bundle offline complet ou découpage de ressources décidé et mesuré avant publication.
- Compression et taille de l'archive suivies en CI.
- Toute mise à jour du canon dans `app/data` doit déclencher validation et synchronisation iOS.
- Les fichiers générés ne doivent jamais être commités comme une source indépendante.
