# Cantiques EUJC — Flutter (Android + iOS)

> Application mobile native pour les cantiques EUJC.
> Mis à jour : 2026-10-24.

## État actuel

**Phase** : embryonnaire (9 fichiers Dart, base de structure)
**Priorité** : Q3-Q4 2027 (après finalisation PWA)

Voir la roadmap dans `docs/00-fondations/PRD.md` (section Roadmap réaliste).

## Prérequis (sur PC)

- **Flutter SDK** : https://flutter.dev/docs/get-started/install
- **Android Studio** (pour Android) ou **Xcode** (pour iOS, macOS requis)
- **Git**

⚠️ **Non compatible Termux** — le développement Flutter nécessite un PC.

## Installation

    # Clone
    git clone https://github.com/Lemuelnk/cantiques-eujc.git
    cd cantiques-eujc/flutter_app

    # Dépendances
    flutter pub get

    # Lancer
    flutter run

## Architecture

### Stack

- **State** : Provider (state management simple)
- **Routing** : go_router (routes déclaratives)
- **Storage** : shared_preferences (favoris, historique locaux)
- **Partage** : share_plus
- **URLs** : url_launcher
- **Polices** : google_fonts

### Structure

    flutter_app/
    ├── lib/
    │   ├── main.dart          # Point d'entrée
    │   ├── models/            # Modèles (Hymn, Version, Block)
    │   ├── providers/         # Providers (CorpusProvider, FavoritesProvider...)
    │   ├── screens/           # Écrans (Home, Categorie, Cantique...)
    │   ├── widgets/           # Widgets réutilisables
    │   └── services/          # Services (CanonicalService...)
    ├── assets/
    │   └── data/canonical/    # JSON canoniques (copie de ../app/data/canonical/)
    └── pubspec.yaml

### Source de vérité des données

Les JSON canoniques sont dans `../app/data/canonical/` (repo principal).
Ils sont copiés dans `flutter_app/assets/data/canonical/` pour être embarqués dans l'app.

**Attention** : à chaque modification des JSON, il faut **resynchroniser** :
    cp ../app/data/canonical/*.json assets/data/canonical/

Script à créer : `flutter_app/sync-canonical.sh` (TODO).

## Charte graphique

- **Vert forêt** : `#0b2b24` / `#001A17`
- **Or** : `#c9a961`
- **Fond clair** : `#faf6ec`
- Voir `docs/00-fondations/PALETTE.md` (à créer) pour la charte complète

## Roadmap Flutter

### Q3-Q4 2027 — Android alpha

- [ ] SPEC complète (`docs/02-flutter/SPEC.md`)
- [ ] Écran d'accueil
- [ ] Navigation par catégories
- [ ] Liste des cantiques
- [ ] Détail cantique avec paroles
- [ ] Recherche
- [ ] Favoris + historique
- [ ] Publication Play Store (alpha)

### 2028 — iOS + parité

- [ ] Portage iOS
- [ ] Sync favoris/historique avec la PWA (si possible sans compte)
- [ ] Publication App Store
- [ ] Audio mode 1 et 2

## Dépendances actuelles (pubspec.yaml)

    go_router: ^14.6.0
    provider: ^6.1.2
    shared_preferences: ^2.3.3
    share_plus: ^10.1.2
    url_launcher: ^6.3.1
    google_fonts: ^6.2.1

## Contribution

Voir `docs/00-fondations/CONTRIBUTING.md`.

Pour Flutter spécifiquement :
- Respecter les conventions Flutter (`flutter analyze` doit passer)
- Pas de dépendances lourdes sans justification
- Tester sur Android physique si possible (pas seulement émulateur)

## Liens utiles

- Documentation Flutter : https://docs.flutter.dev/
- Material Design 3 : https://m3.material.io/
- go_router : https://pub.dev/packages/go_router
- provider : https://pub.dev/packages/provider
