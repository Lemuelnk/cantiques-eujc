# 🗺️ Roadmap — Cantiques EUJC

## ✅ Terminé

### Contenu
- [x] 379 cantiques extraits (MD + HTML sources)
- [x] 32 catégories JSON canoniques
- [x] 2 cantiques multilingues (Tshiluba + Swahili)
- [x] Nettoyage des doublons

### Fonctionnalités
- [x] Splash screen premium (logo + halo + particules)
- [x] Accueil refondu
- [x] Bibliothèque (Leçons + Dimanche + Prière)
- [x] Liste des cantiques avec badge multilingue
- [x] Détail cantique avec onglets de versions
- [x] Recherche avec filtres (catégorie / leçon / langue)
- [x] Recherche par numéro
- [x] Favoris persistants (localStorage)
- [x] Historique persistant
- [x] Signalement multi-contextes (12 types)
- [x] Panneau Partager (4 options)
- [x] Génération d'image v1
- [x] Paramètres (thème + taille + police)
- [x] À propos avec stats dynamiques
- [x] Menu Plus (hub)

### Design
- [x] Charte V2 formalisée
- [x] Validation WCAG AA (26 paires)
- [x] Thème sombre complet (15 pages)
- [x] 4 polices de lecture
- [x] Mode lecture (noir profond)
- [x] Icônes PWA dorées
- [x] Feuillages organiques générés
- [x] Meta theme-color adaptatif

### Technique
- [x] PWA installable (manifest + SW)
- [x] Service Worker cache-first
- [x] Eruda conditionnel (dev only)
- [x] Backend Cloudflare D1 + Turnstile
- [x] Admin page pour signalements
- [x] Préparation Cloudflare Pages

## 🚧 En cours

- [ ] Déploiement Cloudflare Pages
  - [ ] Créer projet Pages
  - [ ] Connecter repo GitHub
  - [ ] Sous-domaine cantiques-eujc.lnk-studio.com
  - [ ] Ajouter hostname à Turnstile

## 📋 À venir

### Priorité haute (après déploiement)
- [ ] Branche feature/share-image-v2 : générateur d'image style Spotify
  - [ ] Sélection de contenu (couplet / refrain / complet)
  - [ ] Intégration feuillages + badges stores
  - [ ] QR code vers le cantique
  - [ ] Format auto intelligent

- [ ] Nettoyage final avant prod
  - [ ] Retirer fichiers .bak restants
  - [ ] Retirer scripts temporaires
  - [ ] Optimiser images restantes

- [ ] SEO niveau 1
  - [ ] robots.txt
  - [ ] sitemap.xml
  - [ ] Meta OG / Twitter Cards
  - [ ] Descriptions uniques

### Priorité moyenne
- [ ] Application des signalements (Option B)
  - [ ] Table overrides D1
  - [ ] Endpoint GET overrides
  - [ ] Fusion JSON + overrides dans l'app
  - [ ] Interface admin pour appliquer

- [ ] Refonte design des autres pages
  - [ ] Catégories (écran 3)
  - [ ] Liste cantiques (écran 4)
  - [ ] Favoris / Historique
  - [ ] Recherche

- [ ] Personnalisation des select de la recherche
  - [ ] Bottom-sheets custom

### Priorité basse
- [ ] Application Flutter complète
  - [ ] Rattraper les 379 cantiques
  - [ ] Thème clair/sombre
  - [ ] Recherche
  - [ ] Favoris
  - [ ] Signalement
  - [ ] Build APK / IPA

- [ ] Fonctionnalités bonus
  - [ ] Lecture audio
  - [ ] Mode présentation (grand écran)
  - [ ] Export PDF
  - [ ] Reconnaissance par caméra (paroles)

## 💡 Décisions architecturales

### Stockage des signalements
- **Choisi** : Cloudflare D1 (base SQLite serverless)
- **Raison** : déjà présent sur lnk-studio.com, même écosystème que Pages

### Application des corrections
- **Choisi** : Option B (overrides D1 + fusion à la volée)
- **Raison** : publication instantanée, compatible PWA + Flutter
- **Reporté** : après déploiement initial

### Structure des données
- **Choisi** : 1 JSON par catégorie (32 fichiers)
- **Raison** : chargement à la demande, cache ciblé

### Multilingue
- **Choisi** : 1 cantique = N versions dans un seul hymn
- **Raison** : fidélité au contrat canonique
- **Avantage** : un seul badge 🌐, onglets de bascule

### Polices
- **Choisi** : Google Fonts CDN (dev + prod)
- **Alternative future** : hébergement local pour offline complet

### Framework
- **Choisi** : HTML/CSS/JS vanilla pour la PWA
- **Raison** : léger, aucun build, déployable direct sur Cloudflare Pages
- **Alternative rejetée** : React, Vue (overhead inutile)

## 📞 Points de contact

- **Développeur** : LNK Studio (Lemuel Nk)
- **Repo** : github.com/Lemuelnk/cantiques-eujc
- **Site** : lnk-studio.com
- **Email** : contact@lnk-studio.com

## 📅 Historique des versions

| Version | Date | Changements majeurs |
|---|---|---|
| 1.0.0 | Oct 2026 | Version initiale (379 cantiques) |
| 7.x | Oct 2026 | Charte V2, thème sombre, 4 polices, partage |

