# 📖 Cantiques EUJC — Vue d'ensemble du projet

## 🎯 Objectif

Application mobile (PWA) permettant de consulter les cantiques de l'Église
Universelle de Jésus-Christ (EUJC) en plusieurs langues (Swahili, Tshiluba,
Lingala, Français), avec :

- Navigation par catégories (Leçons du Chemin, Dimanche, Prière)
- Recherche par titre, numéro ou contenu
- Favoris et historique de consultation
- Signalement d'erreurs (par les utilisateurs)
- Partage d'images de cantiques sur les réseaux sociaux
- Mode hors-ligne (Service Worker)
- Thème clair / sombre
- Choix de 4 polices de lecture

## 🏗️ Architecture

    cantiques-eujc/
    ├── app/                          # Contenu déployé sur Cloudflare Pages
    │   ├── *.html                    # 17 pages
    │   ├── *.css                     # 13 feuilles de style
    │   ├── *.js                      # 15 scripts
    │   ├── assets/                   # Images, logos, icônes
    │   ├── data/canonical/           # 32 JSON canoniques (379 cantiques)
    │   ├── _headers                  # Headers Cloudflare
    │   ├── _redirects                # Redirections
    │   ├── 404.html                  # Page 404 personnalisée
    │   ├── manifest.webmanifest      # Manifest PWA
    │   └── sw.js                     # Service Worker
    │
    ├── docs/                         # Documentation
    ├── scripts/                      # Scripts de conversion
    ├── resources/site/               # HTML sources originales
    ├── extracted/                    # Extractions MD
    └── flutter_app/                  # App Flutter (phase 1)

## 🌐 Déploiement

- **Domaine production** : cantiques-eujc.lnk-studio.com
- **Hébergement** : Cloudflare Pages
- **Backend** (signalements) : Cloudflare Functions + D1 (sur lnk-studio.com)
- **Repo GitHub** : github.com/Lemuelnk/cantiques-eujc

## 📱 Technologies

| Domaine | Techno |
|---|---|
| Frontend | HTML, CSS, JavaScript vanilla |
| Stockage local | localStorage |
| Hors-ligne | Service Worker (cache-first) |
| PWA | Manifest + icônes + Service Worker |
| Backend signalements | Cloudflare Pages Functions |
| Base de données | Cloudflare D1 (SQLite) |
| Anti-spam | Cloudflare Turnstile |
| Polices | Google Fonts |

## 🎨 Charte graphique

| Rôle | Couleur | Hex |
|---|---|---|
| Vert forêt profond | Fond principal | #081f19 |
| Vert forêt | Fond sombre | #0b2b24 |
| Vert institutionnel | Header, badge | #14392e |
| Or principal | Accents | #b8935a |
| Or clair | Texte sur sombre | #e4c37f |
| Crème | Fond clair | #faf6ec |

Validation WCAG AA sur les 26 paires de couleurs.

