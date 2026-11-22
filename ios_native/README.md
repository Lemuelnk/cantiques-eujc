# Cantiques EUJC — iOS natif

> Dossier d'architecture de référence pour l'application iOS native.
> Statut : spécification validée comme cible ; projet Xcode et code Swift à créer dans une phase dédiée.

## Objectif

Construire une application iOS native, hors ligne, centrée exclusivement sur la consultation des textes des cantiques EUJC et de leurs versions linguistiques. La PWA reste la référence produit et le corpus canonique JSON reste la source de vérité.

## Principes non négociables

1. **Swift natif** : Swift + SwiftUI. Aucun Flutter, Dart, moteur hybride ou WebView comme interface principale.
2. **Parité métier, adaptation native** : mêmes règles, données, catégories et comportements que la PWA et Android ; interactions et composants adaptés aux conventions iOS.
3. **Offline-first** : les corpus distribués avec l'application restent consultables sans réseau.
4. **Texte uniquement** : aucun lecteur audio, aucune piste, playlist ou dépendance audio.
5. **Source unique** : ne jamais dupliquer ni réécrire manuellement les corpus dans le code Swift.
6. **Identité stable** : un cantique est identifié par la paire `categoryID + hymnID`, jamais par son numéro source ou son titre.
7. **Accessibilité** : Dynamic Type, VoiceOver, contraste suffisant, zones tactiles adaptées et respect de Reduce Motion.
8. **Architecture testable** : logique métier indépendante de SwiftUI, stockage injectable, décodage testable et dépendances explicites.

## Documents

- [Architecture technique](ARCHITECTURE.md)
- [Contrat des données canoniques](DATA-CONTRACT.md)
- [Modèle de domaine](DOMAIN-MODEL.md)
- [Spécification UX/UI](UI-SPEC.md)
- [Stratégie de tests et qualité](QUALITY-STRATEGY.md)
- [Décisions d'architecture](DECISIONS.md)

## Arborescence cible

```text
ios_native/
├── README.md
├── ARCHITECTURE.md
├── DATA-CONTRACT.md
├── DOMAIN-MODEL.md
├── UI-SPEC.md
├── QUALITY-STRATEGY.md
├── DECISIONS.md
├── CantiquesEUJC.xcodeproj/          # à générer avec Xcode
├── CantiquesEUJC/
│   ├── App/                          # @main, composition root, lifecycle
│   ├── Core/
│   │   ├── DesignSystem/             # tokens, typographie, composants
│   │   ├── Navigation/               # routes, destinations, coordinations
│   │   ├── Localization/             # chaînes UI, langues d'interface
│   │   ├── Accessibility/            # helpers d'accessibilité
│   │   └── Utilities/                # extensions sans logique métier
│   ├── Domain/
│   │   ├── Models/                   # entités métier indépendantes du JSON
│   │   ├── Repositories/             # protocoles
│   │   └── UseCases/                 # cas d'utilisation
│   ├── Data/
│   │   ├── Canonical/                # DTO Codable + décodeur + mapping
│   │   ├── Repositories/             # implémentations
│   │   ├── Persistence/              # favoris, historique, préférences
│   │   └── BundledResources/         # corpus JSON copiés depuis app/data
│   ├── Features/
│   │   ├── Home/
│   │   ├── Search/
│   │   ├── Library/
│   │   ├── Category/
│   │   ├── HymnDetail/
│   │   ├── Favorites/
│   │   ├── History/
│   │   └── Settings/
│   └── Resources/
│       ├── Assets.xcassets/
│       ├── Fonts/
│       └── Localizable.xcstrings
├── CantiquesEUJCTests/
│   ├── Unit/
│   ├── Integration/
│   └── Fixtures/
├── CantiquesEUJCUITests/
└── BuildSupport/
    └── Scripts/                      # vérifications et synchronisation contrôlées
```

Cette arborescence est une cible. Les groupes Xcode seront créés lors de l'initialisation du projet ; ce commit ne prétend pas fournir un projet Xcode compilable.
