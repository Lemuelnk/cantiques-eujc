# Cantiques EUJC — Vue d'ensemble du projet

## Produit

Recueil numérique multilingue de l'Église Universelle de Jésus-Christ. La PWA constitue la référence produit et reste distribuée via Cloudflare Pages. Les applications mobiles sont développées nativement, avec un contrat de données partagé.

## Plateformes

| Plateforme | Technologie | Dossier | Rôle |
|---|---|---|---|
| Web / PWA | HTML, CSS, JavaScript vanilla | `app/` | Référence produit et accès universel |
| Android | Kotlin, Jetpack Compose | `android_native/` | Application native Android hors ligne |
| iOS | Swift, SwiftUI | `ios_native/` | Dossier d'architecture ; projet Xcode à initialiser |

## Source de vérité des données

- Corpus : `app/data/canonical/*.json`
- Statistiques : `app/data/stats.json`
- Les applications mobiles consomment ces fichiers sans édition manuelle de copies spécifiques.
- Identité stable d'un cantique : `categoryID + hymnID`.
- Les 37 catégories canoniques doivent être couvertes par les deux applications.

## Arborescence principale

```text
cantiques-eujc/
├── app/                  # PWA et ressources web
├── data/                 # données et sources du projet
├── android_native/       # application Kotlin / Jetpack Compose
├── ios_native/           # architecture Swift / SwiftUI
├── docs/                 # produit, décisions, qualité et journal
├── scripts/              # validation, extraction et génération
├── resources/            # sources documentaires
└── extracted/            # contenus extraits
```

## Périmètre mobile

- Consultation hors ligne des textes.
- Navigation par catégories.
- Recherche dans titres, numéros et paroles.
- Versions linguistiques d'un même cantique.
- Favoris, historique et préférences stockés localement.
- Thèmes clair/sombre et options de lecture accessibles.
- Aucun lecteur audio, aucune playlist, aucun compte obligatoire.

## Documentation de référence

- Produit : `docs/00-fondations/PRD.md`
- Android : `android_native/README.md` et `android_native/PWA_PARITY_AUDIT.md`
- iOS : `ios_native/README.md` et les documents d'architecture associés
- Roadmap : `docs/06-projet/ROADMAP.md`
