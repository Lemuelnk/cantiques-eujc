# Android natif — Cantiques EUJC

## Objectif

Application Android native, hors ligne, dédiée aux textes des cantiques EUJC et à leurs versions linguistiques.

## Stack

- Kotlin
- Jetpack Compose + Material 3
- kotlinx.serialization pour le JSON canonique
- AndroidX et APIs natives
- Persistance locale pour favoris, historique et préférences

## Source des données

La source de vérité est :
- `../app/data/canonical/*.json`
- `../app/data/stats.json`

Le build copie les ressources canoniques dans les assets générés sous le namespace `canonical/`. Ne pas éditer une copie d'asset générée à la main.

## Architecture actuelle

```text
com.lnk.cantiques/
├── MainActivity.kt                 # point d'entrée actuel ; à réduire au host
├── data/
│   ├── AssetRepository.kt          # ancien modèle de données, transition à terminer
│   ├── Cantique.kt                 # ancien modèle, transition à terminer
│   ├── Lesson.kt                   # ancien modèle, transition à terminer
│   ├── Prayer.kt                   # ancien modèle, transition à terminer
│   └── canonical/
│       ├── CanonicalModels.kt
│       ├── CanonicalCategoryCatalog.kt
│       └── CanonicalAssetRepository.kt
├── theme/
└── ui/
    ├── components/
    └── screens/
```

Cette structure décrit l'état actuel, pas l'architecture finale. La cible est une séparation navigation / domaine / données / persistance / fonctionnalités UI. Les anciens modèles ne doivent être supprimés qu'après migration des écrans et tests.

## État

- Fondations Compose et composants partagés présents.
- Modèles canoniques et catalogue de 37 catégories présents.
- Assets canoniques intégrés au build.
- Build Android CI réussi sur le dernier commit connu.
- Intégration fonctionnelle des 37 corpus et parité complète PWA encore à réaliser.

Voir [l'audit de parité PWA](PWA_PARITY_AUDIT.md) pour les exigences fonctionnelles et visuelles.
