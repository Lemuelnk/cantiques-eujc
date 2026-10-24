# PRD — Cantiques EUJC

> Product Requirements Document v1. Mis à jour : 2026-10-24.
> Basé sur la vision du porteur de projet (interview 2026-10-24).
> Version précédente (technico-fonctionnelle) : voir PRD-v0-baseline.md

## Vision à 5 ans (2031)

Un recueil numérique **complet, propre et multilingue** des cantiques EUJC. Accessible à tous (Web, PWA, Android, iOS). Interface épurée. Audio pour coller le texte au rythme du cantique. Une œuvre durable qui sert l'église, apprend, et comble un manque réel.

Détail de la vision :

- **Contenu** : recueil complet, sans doublon, versions linguistiques bien identifiées et fusionnées
- **Plateformes** : multiplateforme (Web, PWA, Android, iOS), accessible à tous
- **Interface** : multilingue (français, anglais, lingala, swahili, tshiluba, kikongo), épurée, propre
- **Audio** : écoute du cantique (via YouTube API ou alternative) ou musique locale avec mini-lecteur visible

## Mission

Permettre à chaque fidèle, choriste et responsable de louange de :
- Trouver un cantique en 3 secondes
- Le lire dans sa langue avec précision
- Contribuer à la qualité du recueil

## Positionnement

**Cantiques EUJC est un recueil enrichi, PAS une plateforme de louange.**

- L'app reste fondamentalement un **recueil de cantiques** centré sur le **texte**
- Les features (audio, multilingue, partage) servent la **lecture**, pas l'inverse
- L'audio n'est **pas un lecteur de musique** : c'est un outil pour coller le texte au rythme du cantique
- L'app est **ouverte mais EUJC-first** : celle de l'Église Universelle de Jésus-Christ, mais d'autres églises peuvent l'utiliser
- Le contenu reste strictement EUJC (pas de cantiques d'autres églises)

## Publics

### Publics prioritaires (dans l'ordre)

#### 1. La communauté EUJC (choristes, fidèles engagés)

**Qui** : connaît les cantiques, les chante régulièrement, veut la précision du texte.

**Besoins** :
- Fidélité à la source (pas de faute, pas de mauvaise version)
- Versions linguistiques bien séparées et identifiables
- Navigation rapide entre cantiques connus
- Accès hors-ligne

**Critère de succès** : "Je peux faire confiance à cette app pour préparer un culte."

#### 2. Ceux qui veulent apprendre

**Qui** : nouveaux convertis, fidèles curieux, choristes en apprentissage.

**Besoins** :
- Découverte de nouveaux cantiques (recherche, suggestions)
- Contexte (à quelle catégorie, quel moment du culte)
- Interface claire pour explorer

**Critère de succès** : "Je découvre des cantiques que je ne connaissais pas."

#### 3. Ceux qui découvrent l'église EUJC

**Qui** : visiteurs, personnes extérieures, curieux du répertoire.

**Besoins** :
- Accès facile sans inscription
- Présentation claire du répertoire
- Pas de jargon EUJC non expliqué

**Critère de succès** : "Je comprends ce qu'est ce recueil et j'ai envie d'explorer."

### Publics secondaires

#### Pasteurs / prédicateurs

Usage occasionnel mais critique. Ont besoin de recherche avancée (par thème, mot-clé) pour trouver un cantique qui appuie un message.

#### Seniors

Accès à l'app mais moins à l'aise avec la technologie. Implique : gros textes, contrastes élevés, simplicité, WCAG AA minimum.

#### Enfants / ados (école du dimanche, chorale enfants)

Interface intuitive, pas de contenu inapproprié, possibilité de navigation autonome.

### Publics explicitement hors-périmètre

- **Autres églises en tant que communauté cible** : on partage, mais on ne construit pas pour eux
- **Artistes / musiciens professionnels** : pas de fonction de production musicale
- **Chercheurs / académiques** : pas de fonction d'analyse textuelle

## Objectifs

### Objectif 1 — Qualité du corpus (P0, critère n°1)

Le recueil doit être fiable, complet, sans doublon, à jour.

Indicateurs :
- 0 doublon d'ID global
- 0 doublon exact (titre + contenu identique)
- 0 version linguistique mal identifiée
- Signalements traités en moins de 7 jours
- Intégration auto (PR GitHub) pour 13/13 types de signalements

### Objectif 2 — Accessibilité universelle (P0)

Toute personne doit pouvoir trouver et lire un cantique sans friction.

Indicateurs :
- Recherche fonctionnelle (titre, numéro, contenu)
- Navigation en 3 clics maximum (accueil → catégorie → cantique)
- Offline : tous les cantiques consultés restent accessibles
- WCAG AA minimum (seniors)

### Objectif 3 — Multiplateforme (P1, moyen terme)

L'app doit exister sur toutes les plateformes où les fidèles en ont besoin.

Indicateurs :
- PWA fonctionnelle (aujourd'hui)
- App Android (Flutter, dans 12-18 mois)
- App iOS (Flutter, dans 18-24 mois)
- Web desktop (bonus, pas prioritaire)

### Objectif 4 — Multilingue interface (P1, moyen terme)

L'interface doit être accessible dans les langues de la communauté.

Indicateurs :
- Interface FR (aujourd'hui)
- Interface EN (dans 6-12 mois)
- Interface Lingala, Swahili, Tshiluba, Kikongo (progressif, 12-24 mois)

### Objectif 5 — Audio pour la lecture (P1, moyen terme)

Permettre d'écouter un cantique pendant qu'on lit le texte, pour coller au rythme.

Indicateurs :
- Mode 1 : lien audio du cantique (YouTube API ou alternative)
- Mode 2 : mini-lecteur de musique locale (position configurable, pas en fond)
- Pas de bibliothèque audio, pas de playlist, pas de file d'attente

### Objectif 6 — Œuvre durable et transmissible (P1)

Le projet doit pouvoir vivre sans son créateur.

Indicateurs :
- Documentation complète (README, ARCHITECTURE, PRD, CONTRIBUTING, TESTS)
- Code sans dette technique majeure
- Reprise possible par un autre dev en moins d'une semaine
- Au moins 1 contributeur externe d'ici 12 mois

## Non-objectifs (verrouillés)

Ce que le projet ne fera **pas**, pour éviter la dérive :

1. **Pas de réseau social** — pas de commentaires, pas de likes, pas de partage type Facebook
2. **Pas de monétisation** — pas de pub, pas d'abonnement, pas de dons via l'app
3. **Pas de compte utilisateur** — favoris et historique restent locaux (localStorage)
4. **Pas de playlist / setlist** — on ne gère pas les cultes, seulement le recueil
5. **Pas de traduction automatique** — les versions multilingues sont saisies par des humains
6. **Pas d'IA générative** — pas de suggestion par IA, pas de génération de paroles
7. **Pas de version desktop dédiée** — l'app est mobile-first, desktop n'est qu'un bonus d'accès

Toute demande de feature qui contredit un de ces points est refusée par défaut. Si la communauté insiste, discussion documentée dans decision-log.md.

## Features prioritaires

### P0 — Critique (déjà fait ou en cours)

- Navigation par catégories (Leçons, Dimanche, Prière, À classer)
- Recherche (titre, numéro, contenu)
- Détail cantique avec paroles structurées et versions linguistiques
- Favoris + historique persistants
- Mode hors-ligne (Service Worker)
- Thème clair / sombre + 4 polices de lecture
- Signalement d'erreurs (13 types)
- Intégration auto signalements → PR GitHub (8/13 types aujourd'hui, 13/13 visé)

### P1 — Important (moyen terme, dans la vision 5 ans)

- **Audio mode 1** : lien audio du cantique (YouTube API ou alternative)
- **Audio mode 2** : mini-lecteur musique locale (position configurable, pas en fond)
- **Multilingue interface** : EN puis Lingala, Swahili, Tshiluba, Kikongo
- **App Flutter** Android (12-18 mois) + iOS (18-24 mois)
- **SEO complet** : pages statiques, JSON-LD, sitemap (déjà fait, à maintenir)
- **Admin web complet** : liste, filtres, édition avant apply, création manuelle (déjà fait)
- **Documentation complète** : README, ARCHITECTURE, PRD, CONTRIBUTING, TESTS
- **Tests de non-régression** : checklist avant déploiement

### P2 — Nice-to-have (bonus si le temps le permet)

- Partage d'images (8 formats, 4 thèmes) — déjà là, à maintenir sans prioriser
- Audio synchronisé karaoké (paroles défilantes au rythme)
- Recherche avancée (par thème, mot-clé biblique)
- Mode chorale (affichage en grand pour un groupe)

### P3 — Explicitement reporté (pas dans les 2 ans)

- Sync favoris entre appareils (nécessite un compte, contredit non-objectif n°3)
- Recommandations personnalisées (nécessite un profil utilisateur)
- Autres églises avec leurs propres cantiques (contredit positionnement EUJC-first)

## Contraintes

### Contraintes techniques

- **Hébergement** : Cloudflare Pages + Worker + Functions + D1 (gratuit ou quasi)
- **Front PWA** : HTML / CSS / JS vanilla (pas de framework)
- **Backend** : JavaScript (Cloudflare Functions)
- **App mobile** : Flutter (Dart), charge `assets/data/canonical/`
- **Scripts** : Python 3 (extraction, SEO, journal)
- **Éditeur** : Acode (Android) + Termux
- **Pas de Node.js local** (pas de `npm`, pas de `wrangler dev`)
- **Pas d'environnement de staging** (prod = seul environnement)

### Contraintes humaines

- **1 développeur, seul** (aujourd'hui)
- **2-5h/semaine** en moyenne
- **Projet en plus** du travail et des engagements personnels
- **Contributeurs possibles** : devs, contenu, traducteurs, choristes, admins, sponsors (à horizon variable)

### Contraintes financières

- **Budget < 20€/mois** (domaine déjà payé)
- **Possibilité de payer** si feature vraiment utile (ex : R2 pour audio)
- **Sponsors possibles** pour features coûteuses (église, association, fondation)
- **Pas de SaaS de dev payant** (Copilot, Cursor...)

### Contraintes spirituelles et communautaires

- **Identité EUJC** de l'app à préserver
- **Validation par l'église** sur les cantiques ajoutés
- **Respect du contexte liturgique** dans les catégories

## Risques et mitigations

### Risque 1 — Manque de temps (probabilité : élevée)

**Description** : la vie pro/perso prend le dessus, le projet stagne, la motivation baisse.

**Mitigations** :
- Petites unités livrables (2-5h max par tâche)
- Journal de session pour visualiser le progrès
- Pas de deadline stricte (roadmap souple)
- Pauses assumées (2 mois/an) sans culpabilité
- Documenter pour pouvoir reprendre rapidement après une pause

### Risque 2 — Conflit humain avec l'église (probabilité : moyenne)

**Description** : désaccord sur les cantiques, les priorités, la présentation. Le projet ne correspond plus à la vision portée.

**Mitigations** :
- Décisions documentées dans decision-log.md (traçabilité)
- PRD clair sur les non-objectifs (cadre la discussion)
- Transparence régulière avec l'église (démo, retour)
- Pas de décision unilatérale sur le contenu liturgique

### Risque 3 — Épuisement (probabilité : moyenne)

**Description** : tu portes tout seul, tu t'épuises, tu abandonnes.

**Mitigations** :
- Documentation pour déléguer (CONTRIBUTING)
- Prioriser les features "plaisir" régulièrement (éviter le tunnel)
- Célébrer les petites victoires (journal)
- Chercher activement 1 contributeur dès que possible
- Se rappeler que c'est une œuvre durable, pas un sprint

### Risque 4 — Complexité technique (probabilité : moyenne)

**Description** : Flutter, multilingue interface, audio = trop dur, ça bloque.

**Mitigations** :
- Découper en petites étapes (1 feature à la fois)
- Privilégier la simplicité technique (pas de framework inutile)
- Documentation de chaque décision
- Accepter l'aide si un contributeur dev rejoint

### Risque 5 — Infra qui coûte (probabilité : faible à moyen terme)

**Description** : D1/R2 dépassent le free tier, ou un service devient payant.

**Mitigations** :
- Surveillance des quotas Cloudflare
- Budget < 20€/mois prévu
- Chercher un sponsor si dépassement
- Architecture qui permet de migrer (JSON canoniques restent la source de vérité)

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

### Métriques communautaires

- Nombre de contributeurs actifs (devs, trad, contenu)
- Nombre de PR mergées par des contributeurs externes
- Nombre de cantiques ajoutés par mois
- Nombre de langues d'interface disponibles

## Roadmap réaliste (2-5h/semaine, 1 dev)

### Q4 2026 — Fondations (en cours)

**Objectif principal** : documentation complète + types auto finis

- [x] Nettoyage code mort (Phase A)
- [x] Documentation fondations (Phase B)
- [x] Déduplication JS (Phase C)
- [ ] PRD finalisé (ce document)
- [ ] CONTRIBUTING.md généraliste
- [ ] TESTS.md (checklist déploiement)
- [ ] CHANGELOG.md
- [ ] Mise à jour ROADMAP.md et flutter_app/README.md
- [ ] Types auto restants : ordre, categorie (5 restants sur 13)
- [ ] Préparer CONTRIBUTING-DEV.md (pour attirer un dev)

**Objectif secondaire** : 1er contributeur externe (dev ou contenu)

### Q1 2027 — Qualité et accessibilité

**Objectif principal** : audit PWA complet + corrections

- [ ] Lighthouse audit complet (Performance, A11y, Best Practices, SEO)
- [ ] Corrections issues de l'audit
- [ ] WCAG AA vérifié (seniors)
- [ ] Premier contributeur espéré (CONTRIBUTING-DEV prêt)

**Objectif secondaire** : démarrage multilingue interface (EN)

### Q2 2027 — Contenu et ouverture

**Objectif principal** : trier les "à classer" (en commençant par les catégories simples)

- [ ] Script Python pour suggérer un classement par catégorie
- [ ] Validation manuelle des 1450 cantiques "à classer"
- [ ] Fusion des versions linguistiques si nécessaire

**Objectif secondaire** : EN interface complété

### Q3-Q4 2027 — Flutter

**Objectif principal** : app Android v1 (alpha)

- [ ] Spec Flutter (docs/02-flutter/SPEC.md)
- [ ] Premier écran Flutter fonctionnel
- [ ] Navigation cantiques
- [ ] Publication Play Store (alpha)

**Objectif secondaire** : démarrage iOS

### 2028+ — Consolidation

- iOS sur App Store
- Multilingue interface complet (EN + Lingala + Swahili + Tshiluba + Kikongo)
- Audio mode 1 et 2
- 2-3 contributeurs réguliers

## Gouvernance

### Qui décide quoi

- **Décisions produit** (features, priorités) : porteur du projet, en concertation avec l'église
- **Décisions techniques** (architecture, choix d'outils) : porteur du projet
- **Décisions liturgiques** (contenu cantiques, catégories) : église EUJC, porteur du projet en exécution
- **Décisions financières** (sponsors, dépenses) : porteur du projet

### Comment les décisions sont prises

- **Documentées** dans `docs/05-decisions/decision-log.md` (format DEC-XXX)
- **Réversibles** si nouvelles infos (revert documenté)
- **Transparentes** : le journal des sessions trace tout

### Ce qui est verrouillé

- Les **7 non-objectifs** (voir section Non-objectifs)
- Le **positionnement "recueil enrichi"** (pas plateforme)
- L'**identité EUJC** de l'app

Toute remise en cause de ces 3 piliers nécessite une révision formelle du PRD.

## Références

### Documentation interne

- `README.md` — Point d'entrée
- `docs/00-fondations/ARCHITECTURE.md` — Technique (3 repos, flux, D1)
- `docs/00-fondations/CARTOGRAPHIE.md` — Routes et pages
- `docs/00-fondations/CLEANUP-LOG.md` — Registre des nettoyages
- `docs/00-fondations/PRD-v0-baseline.md` — Baseline technico-fonctionnelle (archive)
- `docs/05-decisions/decision-log.md` — Décisions techniques
- `docs/06-projet/FONCTIONNALITES.md` — Catalogue technique des features
- `docs/06-projet/DEPLOIEMENT.md` — Procédure de déploiement
- `docs/06-projet/ROADMAP.md` — Feuille de route (à mettre à jour)
- `docs/07-journal/` — Journaux de session

### Documentation externe

- **Cloudflare Pages** : https://developers.cloudflare.com/pages/
- **Cloudflare Workers** : https://developers.cloudflare.com/workers/
- **Cloudflare D1** : https://developers.cloudflare.com/d1/
- **Cloudflare Turnstile** : https://developers.cloudflare.com/turnstile/
- **GitHub API** : https://docs.github.com/en/rest
- **Flutter** : https://docs.flutter.dev/

### Charte graphique

- Couleurs : `docs/00-fondations/PALETTE.md` (à créer)
- Typographie : voir `app/charte.css`
- Logo EUJC : `app/assets/logo/`

---

Fin du PRD v1.

*Ce document vit et évolue. Toute modification doit être commitée avec un message clair et, si nécessaire, discutée avec l'église.*
