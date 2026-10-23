# Cantiques EUJC

> Le recueil de cantiques de l'Eglise Universelle de Jesus-Christ, dans votre poche.

**Production** : https://cantiques-eujc.lnk-studio.com
**Repo** : https://github.com/Lemuelnk/cantiques-eujc (branche main)

---

## A propos

PWA (Progressive Web App) permettant de consulter les cantiques de l'Eglise Universelle de Jesus-Christ (EUJC) en plusieurs langues (Swahili, Tshiluba, Lingala, Francais).

### Fonctionnalites principales

- **Navigation** par categories (Lecons du Chemin, Dimanche, Priere, A classer)
- **Recherche** par titre, numero ou contenu
- **Favoris et historique** persistants (localStorage)
- **Signalement d'erreurs** avec integration auto en PR GitHub
- **Partage d'images** de cantiques sur les reseaux sociaux (8 formats, 4 themes)
- **Mode hors-ligne** (Service Worker avec fallback cache)
- **Theme clair / sombre** avec detection systeme
- **4 polices de lecture** + slider de taille de texte

### Chiffres actuels

- ~1830 cantiques (dont ~1450 a classer)
- 40 fichiers JSON canoniques
- 2406 pages SEO statiques + 40 pages categorie
- 2447 URLs dans le sitemap
- 5 langues : Francais, Swahili, Tshiluba, Lingala, + detection auto

---

## Architecture

Le projet est indissociable de site-lnk_dt (backend admin). 3 composants :

    UTILISATEUR (telephone / navigateur)
        |
        v
    Cloudflare Worker (cantiques-eujc/worker.js)
      - /cantique/:cat/:num -> page SEO statique
      - /categorie/:cat -> page categorie
      - sinon -> assets statiques
        |
        v
    Assets Cloudflare Pages (cantiques-eujc/app/)
      - HTML, CSS, JS, JSON canoniques
      - 2406 pages SEO + 40 categories
      - Service Worker (cache + offline)
    
    ADMIN (site-lnk_dt, lnk-studio.com/admin-cantiques)
      - Liste des signalements
      - Bouton Appliquer -> cree une PR GitHub auto
      - Creation manuelle
        |
        v (via Cloudflare Functions)
    D1 Database + GitHub API
      - Table cantiques_reports
      - Branches / PR sur cantiques-eujc

### Flux d'une requete

1. Utilisateur ouvre cantiques-eujc.lnk-studio.com
2. Cloudflare Worker intercepte
3. Si /cantique/:cat/:num -> page SEO statique
4. Si /categorie/:cat -> page categorie SEO
5. Sinon -> assets Cloudflare Pages

### Flux admin (signalements)

1. User signale -> POST /api/cantiques-reports
2. Cloudflare Function stocke dans D1
3. Admin (lnk-studio.com/admin-cantiques) affiche
4. Clic Appliquer -> Cloudflare Function cree une PR GitHub
5. Merge PR -> Cloudflare redeploie en 2 min

Detail complet : docs/00-fondations/ARCHITECTURE.md

---

## Structure du repo

    cantiques-eujc/
    ├── app/                        # Racine deployee sur Cloudflare Pages
    │   ├── *.html                  # 15 pages principales
    │   ├── *.css                   # 18 feuilles de style
    │   ├── *.js                    # 24 scripts
    │   ├── assets/                 # Images, logos, icones
    │   ├── data/canonical/         # 40 JSON canoniques
    │   ├── cantique/               # 2406 pages SEO (generees)
    │   ├── categorie/              # 40 pages categorie (generees)
    │   ├── sitemap.xml             # Sitemap (2447 URLs)
    │   ├── sw.js                   # Service Worker
    │   └── _headers                # Headers Cloudflare (CORS, CSP, cache)
    ├── worker.js                   # Cloudflare Worker (routing)
    ├── wrangler.jsonc              # Config Cloudflare Worker
    ├── scripts/                    # Scripts Python
    ├── docs/                       # Documentation
    └── pdfs/                       # PDFs sources (gitignored)

---

## Quick start (local)

**Prerequis** : Python 3.x (pas de Node requis)

    git clone https://github.com/Lemuelnk/cantiques-eujc.git
    cd cantiques-eujc
    python3 ~/serve_local.py
    # -> http://127.0.0.1:8081/

Le serveur local gere le rewrite /cantique/:cat/:num vers cantique.html (test sans build).

**Tester en prod** : toujours unregister le SW + vider le cache (voir DEC-010).

---

## Documentation

- docs/00-fondations/ARCHITECTURE.md : systeme technique complet
- docs/00-fondations/CARTOGRAPHIE.md : map des routes et pages
- docs/00-fondations/CLEANUP-LOG.md : registre des nettoyages
- docs/05-decisions/decision-log.md : decisions techniques
- docs/06-projet/README-PROJET.md : vue d'ensemble detaillee
- docs/06-projet/DEPLOIEMENT.md : procedure de deploiement
- docs/06-projet/ROADMAP.md : feuille de route
- docs/07-journal/ : journaux de session

---

## Conventions de dev

### Bumper les versions de cache

Apres toute modification d'un asset (JS, CSS, HTML) :

1. Bumper ?v=N dans les HTML concernes
2. Bumper VERSION dans sw.js

Sans ca, le Service Worker sert l'ancienne version (voir DEC-010).

### Service Worker

Apres chaque deploiement :

1. Unregister le SW (chrome://serviceworker-internals)
2. Vider le cache navigateur
3. Recharger 2 fois

### Helpers JS critiques

Les helpers d'URL (slugs, routes) doivent etre en ASCII pur (pas de normalize() ni regex Unicode) -> voir DEC-009.

### Branches

- main = production (deploiement auto)
- feat/xxx ou fix/xxx = branches de travail
- Toujours passer par une PR pour merger dans main

### Commits

Format : type(scope): description

- feat(signaler): ...
- fix(admin): ...
- docs: ...
- chore(cleanup): ...

---

## Workflow integration auto (signalements -> PR)

1. Formulaire (signaler.html) -> POST /api/cantiques-reports
2. Cloudflare Function (site-lnk_dt) stocke dans D1
3. Admin (lnk-studio.com/admin-cantiques) affiche le signalement
4. Clic Appliquer la correction -> la Function :
   - Recupere le JSON canonique depuis GitHub
   - Applique la modification
   - Cree une branche + commit + PR GitHub
5. Merge de la PR -> Cloudflare redeploie en ~2 min

Types auto-appliques : titre, couplet, refrain, orthographe, traduction, commentaire, bloc_a_supprimer, nom_incorrect

Types manuels : doublon, cantique_manquant, categorie_manquante, autre, ordre, categorie

---

## Scripts utiles

- scripts/generate_seo_pages.py : regenere les 2406 pages SEO
- scripts/validate_seo.py : valide les pages generees
- scripts/gen_journal.py : genere un journal de session
- ~/serve_local.py : serveur local de dev

---

## Securite

- Turnstile cote signalement public (anti-spam)
- Bearer token pour l'admin (REVIEW_ADMIN_TOKEN)
- GitHub PAT fine-grained pour creer les PR (GITHUB_TOKEN)
- CORS sur /data/* (autorise uniquement pour lnk-studio.com)

Tous les secrets sont dans Cloudflare Pages -> Settings -> Variables and secrets.

---

## License

Projet prive - Eglise Universelle de Jesus-Christ (EUJC).

