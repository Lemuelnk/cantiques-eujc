# Changelog — Cantiques EUJC

> Historique des versions majeures. Pour le détail, voir `docs/07-journal/`.

Format basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/).

## [Non publié]

### En cours
- Types auto restants : ordre, categorie (5/13 implémentés sur 13 prévus)
- Audit PWA Lighthouse
- Multilingue interface (EN puis langues locales)

## [7.14.0] — 2026-10-24

### Ajouté
- PRD v1 complet (vision, publics, risques, roadmap réaliste)
- CONTRIBUTING.md (guide de contribution généraliste)
- TESTS.md (checklist déploiement exhaustive)
- README.md racine (point d'entrée)
- ARCHITECTURE.md (3 repos, flux, D1)
- CARTOGRAPHIE.md (routes et pages)
- CLEANUP-LOG.md (registre des nettoyages)

### Modifié
- Phase C : `escapeHtml` centralisé dans `canonical-data.js` (3 versions → 1)
- Phase C : `getCorpus` + `corpusCache` centralisés (2 versions → 1)
- Modal admin : édition du texte avant application
- Modal admin : création manuelle de signalement (Feature B)

### Corrigé
- Fix UX : listener input sur "Correction proposée" (bouton ne s'activait pas)
- Fix UX : `nom_incorrect` affiche le Nom actuel, masque le toggle mode
- Fix backend : `nom_incorrect` rendu file-scoped (plus de recherche hymn/version)

### Supprimé (Phase A)
- 4 fichiers `.bak` (index, splash, splash.css, sitemap)
- `debug.html` (outil de dev)
- `cantiques-standalone.html` (ancienne version monolithique)

## [7.13.0] — 2026-10-09

### Ajouté
- Type `bloc_a_supprimer` (suppression automatique via PR)
- Type `nom_incorrect` (renommage de catégorie)
- Admin : bouton "Appliquer la correction" + lien PR GitHub

### Corrigé
- Bug `hymnNumberSlug` : regex Unicode retournait vide sur Chrome Android
- Fix `share-image` : `'F.body'` avec guillemets (police bidon)

### Technique
- DEC-009 : helpers JS critiques en ASCII pur
- DEC-010 : règles de déploiement (bump `?v=`, unregister SW)

## [7.12.0] — 2026-10-09

### Ajouté
- SEO complet : 2406 pages cantique + 40 catégories + sitemap 2447 URLs
- JSON-LD MusicComposition + BreadcrumbList
- Worker routing : `/` → `/index.html`, routes sans extension
- CORS sur `/data/*` (via `_headers`)

### Technique
- Passage de `html_handling: auto-trailing-slash` à `none` + worker complet

## [7.10.1] — 2026-10-07

### Ajouté
- Type `bloc_a_supprimer` UI (carte "Bloc en trop")
- Intégration auto signalements → PR GitHub (premiers types)

## [7.0.0] — Avant 2026-10

Version de base : PWA fonctionnelle avec navigation, recherche, favoris, historique, signalement manuel, thème, polices.

---

*Ce changelog est tenu manuellement pour les versions majeures. Les commits quotidiens ne sont pas listés ici (voir `git log` et `docs/07-journal/`).*
