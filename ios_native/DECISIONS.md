# Décisions d'architecture — iOS

## ADR-001 — Application iOS native SwiftUI
- Statut : accepté.
- Décision : utiliser Swift et SwiftUI pour l'application iOS.
- Rejeté : Flutter, Dart, interface WebView comme produit principal.
- Motif : base native distincte et cohérente avec Android Kotlin.

## ADR-002 — Le JSON canonique reste la source de vérité
- Statut : accepté.
- Décision : lire les mêmes fichiers `app/data/canonical` et `app/data/stats.json`.
- Rejeté : recopies éditées à la main dans le projet iOS.
- Conséquence : synchronisation automatisée et validation de schéma dans CI.

## ADR-003 — Domaine indépendant des DTO et de SwiftUI
- Statut : accepté.
- Décision : séparer DTO Codable, modèles de domaine, repositories et présentation.
- Motif : testabilité, évolution du schéma et parité métier multiplateforme.

## ADR-004 — Identité des hymnes
- Statut : accepté.
- Décision : `categoryID + hymnID` est l'identité stable.
- Rejeté : numéro source ou titre comme clé.

## ADR-005 — Fonctionnement hors ligne
- Statut : accepté.
- Décision : les corpus distribués avec l'application sont consultables sans réseau.
- Conséquence : aucune fonctionnalité P0 ne dépend d'une API distante.

## ADR-006 — Pas d'audio
- Statut : accepté selon la décision produit actuelle.
- Décision : l'application contient les textes et versions linguistiques uniquement.
- Rejeté : lecteur, flux, playlists, audio local ou streaming.

## ADR-007 — Stockage local minimal
- Statut : accepté comme stratégie initiale.
- Décision : préférences dans UserDefaults ; favoris et historique derrière un protocole de stockage avec écritures atomiques et format versionné.
- Réévaluation : seulement si les mesures justifient SQLite ou une autre base.

## ADR-008 — Cible iOS minimale
- Statut : à décider avant génération du projet Xcode.
- Décision : ne pas annoncer de version minimale sans connaître les appareils cibles et les API réellement nécessaires.
