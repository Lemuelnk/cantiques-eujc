# Modèle de domaine — iOS

Les types de domaine ne sont pas les DTO Codable. Ils représentent les concepts consommés par les cas d'utilisation et l'interface.

## Entités

### HymnIdentity
- `categoryID: String`
- `hymnID: String`
- Égalité et hash basés sur les deux champs.

### Hymn
- identité stable
- titre canonique
- statut éditorial
- versions ordonnées

### HymnVersion
- identifiant de version
- langue
- titre de version
- source éditoriale
- taxonomie
- blocs de contenu ordonnés

### HymnContentBlock
- identifiant si fourni
- type brut conservé
- numéro optionnel et flexible
- lignes de texte ordonnées

### HymnLanguage
- code, libellé, statut et métadonnées de détection facultatives

### HymnCategory
- identifiant, nom de fichier source, libellé, groupe et ordre d'affichage

### CanonicalStatistics
- total hymnes
- langues et libellés
- nombre de leçons
- nombre de catégories

## Valeurs et états

Les modèles doivent être immuables autant que possible (`struct`). Les identifiants persistés sont stables. Les chaînes d'affichage ne sont jamais utilisées comme identifiants.

## Cas d'utilisation

- `LoadHomeSummary`
- `ListCategories`
- `LoadCategoryHymns(categoryID)`
- `GetHymn(identity)`
- `SearchHymns(query, scope, filters)`
- `ToggleFavorite(identity)`
- `ListFavorites()`
- `RecordHymnOpened(identity)`
- `ListHistory(limit)`
- `UpdatePreferences(value)`

Les cas d'utilisation retournent des résultats explicites (succès, absence, erreur de données) et ne dépendent d'aucune vue.
