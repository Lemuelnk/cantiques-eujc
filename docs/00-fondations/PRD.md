# PRD — Cantiques EUJC

> Product Requirements Document. Mis à jour : 2026-10-24.

## Vision

Offrir à l'Église Universelle de Jésus-Christ un recueil numérique **accessible, hors-ligne, multilingue** des cantiques du Chemin, du Dimanche et de Prière.

## Mission

Permettre à chaque fidèle, choriste, et responsable de louange de :
- Trouver un cantique en 3 secondes (recherche, navigation)
- Le lire dans sa langue (Swahili, Tshiluba, Lingala, Français)
- Contribuer à la qualité du recueil (signalement simple)

## Utilisateurs

### Qui utilise l'app ?

- **Fidèle** : consulte pendant le culte, à la maison, en déplacement
- **Choriste / Responsable de louange** : prépare les cultes, cherche des cantiques précis
- **Admin / Mainteneur** : valide les corrections, ajoute des cantiques (toi)
- **Futur contributeur dev** : aide à maintenir ou étendre (Flutter, admin, contenu)

### Contraintes utilisateurs

- **Mobile-first** : 95% d'usage sur téléphone
- **Connexion instable** : doit fonctionner en offline
- **Public mixte** : du jeune au senior, illettré numérique inclus
- **Multilingue** : un même cantique peut exister en 2-4 langues

Détail complet : voir `docs/00-fondations/PERSONAS.md` (à venir)

## Objectifs

### Objectif 1 — Accessibilité universelle (fait)

Toute personne doit pouvoir trouver n'importe quel cantique sans connaître les catégories.

Indicateurs :
- Recherche fonctionne sur titre, numéro, contenu
- Navigation en 3 clics maximum (accueil -> catégorie -> cantique)
- Offline : tous les cantiques accessibles sans réseau

### Objectif 2 — Qualité du corpus (en cours)

Le recueil doit être fiable, corrigé, à jour.

Indicateurs :
- Signalements traités en moins de 7 jours
- Intégration auto (PR GitHub) pour les corrections simples
- 0 doublon d'ID / 0 doublon exact

### Objectif 3 — Ouverture aux contributeurs (à venir)

D'autres devs doivent pouvoir reprendre le projet sans toi.

Indicateurs :
- Documentation complète (README, ARCHITECTURE, CONTRIBUTING)
- Code sans dette technique majeure
- Tests de non-régression automatisés

## Features prioritaires (état actuel)

### P0 — Critique (déjà fait)

- Navigation par catégories (Leçons, Dimanche, Prière, À classer)
- Recherche (titre, numéro, contenu)
- Détail cantique avec paroles structurées
- Favoris + historique persistants
- Multilingue (versions par cantique)
- Mode hors-ligne (Service Worker)
- Thème clair / sombre + polices
- Signalement d'erreurs

### P1 — Important (déjà fait ou presque)

- Partage d'images (8 formats, 4 thèmes)
- Admin web avec bouton Appliquer -> PR GitHub
- Création manuelle de signalements depuis admin
- SEO complet (2406 pages statiques, JSON-LD, sitemap)
- PWA installable

### P2 — Nice-to-have (à faire)

- App Flutter Android/iOS
- Audio des cantiques
- Mode chorale (paroles défilantes)
- Sync favoris entre appareils

## Non-objectifs (ce qu'on ne fera PAS)

Clarifier ce qu'on refuse de faire est aussi important que les objectifs.

- **Pas de réseau social** : pas de commentaires, pas de likes, pas de partage social type Facebook
- **Pas de monétisation** : pas de pub, pas d'abonnement, pas de dons via l'app
- **Pas de gestion de compte utilisateur** : favoris et historique restent locaux (localStorage)
- **Pas de playlist / setlist** : on ne gère pas les cultes, seulement le recueil
- **Pas de traduction automatique** : les versions multilingues sont saisies par des humains
- **Pas d'IA générative dans l'app** : pas de suggestion de cantique par IA, pas de génération de paroles
- **Pas de version web desktop dédiée** : l'app est mobile-first, desktop n'est qu'un bonus

## Métriques de succès

### Métriques techniques

- Temps de chargement (LCP) : < 2,5s sur 4G
- Score Lighthouse Performance : > 90
- Score Lighthouse Accessibilité : > 95
- Score Lighthouse SEO : > 95
- Taux de couverture offline : 100% des cantiques consultés

### Métriques produit

- Nombre de cantiques consultés / mois
- Nombre de signalements reçus / mois
- Délai moyen de traitement d'un signalement (cible : < 7 jours)
- Taux de correction auto (cible : > 60% des signalements)

### Métriques communautaires (à venir)

- Nombre de contributeurs actifs (devs, trad, contenu)
- Nombre de PR mergées par des contributeurs externes
- Nombre de cantiques ajoutés par mois

## Contraintes techniques

### Hébergement
- **Cloudflare Pages** (gratuit, illimité pour ce projet)
- **Worker** pour le routing (cantiques-eujc)
- **Functions** pour l'API (site-lnk_dt)
- **D1** pour la base de signalements

### Stack
- **Front PWA** : HTML / CSS / JS vanilla (pas de framework)
- **Backend** : JavaScript (Cloudflare Functions)
- **App mobile** : Flutter (Dart)
- **Scripts** : Python 3 (extraction, SEO, journal)

### Outils de dev
- **Éditeur** : Acode (Android) + Termux
- **Serveur local** : Python `http.server` custom
- **Git** : GitHub, déploiement auto au push

### Limites actuelles
- Pas de Node.js local (pas de `npm install`, pas de `wrangler dev`)
- Pas de CI de tests unitaires (seulement GitHub Actions pour valider le SEO)
- Pas d'environnement de staging (prod = seul environnement)

## Roadmap

### Phase actuelle : consolidation (Q4 2026)

- [x] SEO complet (2406 pages, sitemap, JSON-LD)
- [x] Admin web avec intégration auto PR GitHub
- [x] Documentation fondations (README, ARCHITECTURE, CARTOGRAPHIE)
- [ ] Types auto supplémentaires (ordre, categorie)
- [ ] Audit PWA Lighthouse

### Prochaine phase : mobile natif (Q1 2027)

- [ ] App Flutter Android + iOS
- [ ] Sync favoris entre appareils (optionnel)
- [ ] Partage natif sur réseaux sociaux

### Phase future : communauté (2027+)

- [ ] Site web public pour contributeurs
- [ ] Contribuer des cantiques depuis l'app
- [ ] Traduction collaborative (Weblate / Crowdin)
- [ ] Audio des cantiques (enregistrements)

### Chantiers en attente

- Finir extraction Swahili (375 cantiques restants)
- Finir extraction Lingala
- Trier les "à classer" vers catégories définitives
- Nettoyer les 577 cantiques dormants

## Références

- ARCHITECTURE.md : technique
- CARTOGRAPHIE.md : routes et pages
- CLEANUP-LOG.md : registre des nettoyages
- 06-projet/FONCTIONNALITES.md : catalogue technique des features
- 05-decisions/decision-log.md : décisions documentées
- 07-journal/ : historique des sessions

