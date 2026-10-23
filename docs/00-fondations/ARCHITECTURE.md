# Architecture — Cantiques EUJC

> Document technique de référence. Mis à jour : 2026-10-24.

## Vue d'ensemble

Le projet est composé de **3 blocs techniques** indissociables :

1. **Front PWA** — Repo cantiques-eujc, déployé sur Cloudflare Pages
2. **Backend admin** — Repo site-lnk_dt, déployé sur Cloudflare Pages (lnk-studio.com)
3. **Base de données + GitHub** — D1 (signalements) + API GitHub (PR auto)

## Les 3 repos

### cantiques-eujc (ce repo)

- **Rôle** : PWA publique + Worker de routing + JSON canoniques
- **URL prod** : https://cantiques-eujc.lnk-studio.com
- **Branche de prod** : main (déploiement auto au push)
- **Contenu clé** :
  - app/ : tout le front (HTML, CSS, JS, JSON, pages SEO)
  - worker.js : routing Cloudflare
  - wrangler.jsonc : config Worker
  - scripts/ : outils Python (SEO, extraction, journal)

### site-lnk_dt

- **Rôle** : Site vitrine LNK Studio + Admin cantiques + API backend
- **URL prod** : https://lnk-studio.com
- **URL admin** : https://lnk-studio.com/admin-cantiques
- **Branche de prod** : master (déploiement auto au push)
- **Contenu clé (cantiques)** :
  - admin-cantiques.html : interface admin
  - js/admin-cantiques.js : logique admin
  - css/admin-cantiques.css : styles admin
  - functions/api/cantiques-reports.js : endpoint signalements
  - functions/api/_lib/github-cantiques.js : helper PR GitHub

### Cloudflare (infra externe)

- **D1 Database** : table cantiques_reports (signalements)
- **Turnstile** : anti-spam sur signalements publics
- **Secrets** : REVIEW_ADMIN_TOKEN, GITHUB_TOKEN, TURNSTILE_SECRET

## Flux techniques

### Flux 1 — Consultation d'un cantique

    Utilisateur -> https://cantiques-eujc.lnk-studio.com/cantique/lesson-12/111
        |
        v
    Cloudflare reçoit la requête
        |
        v
    Worker (worker.js) : match /cantique/:cat/:num
        |
        v
    Cherche /cantique/lesson-12/111/index.html
        |
        +-- Si existe -> sert la page SEO statique (avec métadonnées, JSON-LD)
        |
        +-- Sinon -> sert cantique.html (fallback JS, pas de SEO)

### Flux 2 — Soumission d'un signalement

    Utilisateur sur signaler.html
        |
        v (POST /api/cantiques-reports)
    site-lnk_dt : functions/api/cantiques-reports.js
        |
        +-- Vérifie Turnstile (anti-spam)
        +-- Valide scope + type
        +-- Insère dans D1 cantiques_reports
        |
        v
    Retourne { ok: true, id: "uuid" }

### Flux 3 — Application d'un signalement (admin)

    Admin clique "Appliquer la correction"
        |
        v (POST /api/cantiques-reports avec action=apply)
    site-lnk_dt : cantiques-reports.js
        |
        +-- Vérifie Bearer token admin
        +-- Récupère le report en D1
        +-- Si edited_proposed_text fourni, l'utilise
        +-- Appelle applyReport()
        |
        v
    github-cantiques.js
        |
        +-- Fetch JSON canonique depuis GitHub
        +-- Applique la modification (selon type)
        +-- Crée branche report/<id>-<type>
        +-- Commit + Push
        +-- Crée PR GitHub
        +-- Enregistre pr_url en D1
        |
        v
    Retourne { ok: true, pr_url, pr_number }

### Flux 4 — Service Worker (offline + cache)

    Navigateur charge index.html
        |
        v
    sw-register.js : enregistre /sw.js
        |
        v
    sw.js (v7.13.0) :
        |
        +-- Install : pre-cache des assets (HTML, CSS, JS)
        +-- Fetch :
            - HTML -> network-first (fallback cache)
            - JSON canoniques -> network-first
            - CSS/JS/images -> cache-first
            - Requêtes API -> bypass (jamais en cache)

## Schéma D1

Table cantiques_reports (site-lnk_dt) :

    id               TEXT PRIMARY KEY
    cantique_id      TEXT NOT NULL
    cantique_title   TEXT NOT NULL
    category_id      TEXT NOT NULL
    language_code    TEXT
    type             TEXT NOT NULL
    target_index     INTEGER
    current_text     TEXT
    proposed_text    TEXT
    message          TEXT NOT NULL
    reporter_name    TEXT
    reporter_contact TEXT
    app_version      TEXT
    platform         TEXT
    status           TEXT DEFAULT 'new'
    admin_note       TEXT
    created_at       TEXT
    updated_at       TEXT
    scope            TEXT
    scope_context    TEXT
    version_id       TEXT
    block_id         TEXT
    pr_url           TEXT
    pr_number        INTEGER

## Sécurité

- **Turnstile** : vérifié côté serveur à chaque soumission publique
- **Bearer token** : REVIEW_ADMIN_TOKEN vérifié dans authorized()
- **GitHub PAT** : fine-grained, permissions Contents + Pull requests
- **CORS** : /data/* autorisé uniquement pour lnk-studio.com (via _headers)

## Déploiement

### cantiques-eujc (front)

    git push origin main
    # -> Cloudflare Pages détecte et redéploie en ~2 min

### site-lnk_dt (backend + admin)

    git push origin master
    # -> Cloudflare Pages détecte et redéploie en ~2 min

### Règle d'or après déploiement

1. Unregister le SW (chrome://serviceworker-internals)
2. Vider le cache navigateur
3. Recharger 2 fois

Sinon le Service Worker sert l'ancienne version (voir DEC-010).

