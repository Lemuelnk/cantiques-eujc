# Architecture iOS — Cantiques EUJC

## 1. Vue d'ensemble

Architecture en couches, modulaire par fonctionnalité, avec dépendances orientées vers le domaine :

```text
SwiftUI Features
      │
      ▼
Presentation Models (@Observable / ViewModel)
      │
      ▼
Domain Use Cases ───── Domain Models
      │
      ▼
Repository Protocols
      │
      ▼
Data Implementations
  ├── Canonical JSON bundle
  ├── Local persistence
  └── Preferences
```

Les vues ne décodent jamais le JSON, n'accèdent jamais directement à `Bundle.main` et ne manipulent pas les clés de stockage.

## 2. Stack cible

- Langage : Swift 6 (mode de concurrence strict activé progressivement).
- Interface : SwiftUI.
- Cycle de vie : SwiftUI App lifecycle.
- Modèles de présentation : Observation (`@Observable`) ou `ObservableObject` si une contrainte de déploiement le nécessite ; ne pas mélanger arbitrairement les deux.
- Sérialisation : `Codable` pour les DTO de transport JSON.
- Concurrence : `async/await`, tâches annulables, chargement des corpus hors du MainActor.
- Persistance : protocole de stockage local, implémentation initiale simple et versionnée (fichiers JSON atomiques pour favoris/historique, UserDefaults pour préférences). Évaluer SQLite uniquement si les volumes/écritures le justifient.
- Dépendances tierces : aucune obligatoire au démarrage.

La version minimale d'iOS sera fixée au moment de la création du projet Xcode après vérification des appareils cibles. Ne pas annoncer de compatibilité iOS avant cette décision.

## 3. Modules et responsabilités

### App
- Composition root : construit les dépendances et injecte les repositories.
- Configure les préférences d'apparence et le cycle de vie.
- Ne contient aucune règle métier.

### Core
- Design tokens alignés sur la charte PWA.
- Navigation typée, destinations et deep links.
- Localisation de l'interface distincte des langues des paroles.
- Accessibilité et utilitaires transversaux.

### Domain
- Entités Swift indépendantes du schéma JSON.
- Protocoles de repositories.
- Cas d'utilisation : charger les statistiques, lister catégories, rechercher, ouvrir un cantique, basculer de version, gérer favoris/historique/préférences.
- Aucune importation SwiftUI, UIKit, Foundation JSON DTO ou code de persistance dans les règles métier (Foundation reste admis pour les types de base).

### Data
- DTO Codable qui reflètent exactement le contrat canonique.
- Décodeur configuré pour les clés snake_case sans transformation ambiguë.
- Mapper explicite DTO → domaine ; ne pas faire fuiter les DTO dans les vues.
- Repository canonique avec chargement paresseux par catégorie et cache mémoire borné.
- Dépôt local isolant le format de stockage et gérant migrations/versionnement.

### Features
Chaque feature contient ses vues, son modèle de présentation et ses composants privés. Les composants réutilisables vont dans Core/DesignSystem seulement lorsqu'ils ont plusieurs usages réels.

## 4. Flux de démarrage

1. Construire le conteneur de dépendances.
2. Charger les préférences locales.
3. Lire `stats.json` et vérifier sa cohérence.
4. Afficher l'accueil sans bloquer sur le décodage de tous les corpus.
5. Charger chaque catégorie à la demande.
6. Exécuter le décodage et l'indexation de recherche hors du MainActor.
7. Publier des états explicites : idle, loading, loaded, empty, failed.
8. Conserver les erreurs techniques dans les logs de diagnostic sans exposer de détails internes à l'utilisateur.

## 5. Navigation cible

- Accueil
- Recherche
- Bibliothèque
- Plus
  - Favoris
  - Historique
  - Préférences
- Liste d'une catégorie
- Détail d'un cantique

La navigation doit être pilotée par des routes typées. Les états de présentation (sheet, alert, confirmation) ne doivent pas être encodés comme des chaînes magiques.

## 6. Règles de performance

- Ne pas charger les 37 corpus synchroniquement au lancement.
- Charger les catégories à la demande, décoder hors du MainActor.
- Indexer progressivement les champs utiles à la recherche.
- Éviter les copies répétées de grands tableaux de lignes.
- Annuler une recherche obsolète quand la requête change.
- Mesurer cold launch, mémoire, temps de recherche et ouverture du détail sur appareils réels.

## 7. Sécurité et confidentialité

- Aucun compte utilisateur requis.
- Favoris, historique et préférences restent sur l'appareil.
- Pas de collecte analytique personnelle par défaut.
- Ne jamais embarquer de secret API, mot de passe ou clé privée dans le bundle.
- Les rapports d'erreur éventuels doivent être explicitement déclenchés par l'utilisateur et minimiser les données envoyées.

## 8. Frontières de dépendances

- Features → Domain + Core.
- Domain → types Foundation uniquement.
- Data → Domain + Foundation.
- App → tous les modules pour assembler l'application.
- Domain ne dépend jamais de Data ou de SwiftUI.
- Une feature ne lit jamais les assets ou UserDefaults directement.
