# 🚀 Déploiement — Cantiques EUJC

## Vue d'ensemble

- **Hébergement** : Cloudflare Pages
- **Repo source** : github.com/Lemuelnk/cantiques-eujc
- **Branche production** : main
- **Dossier de sortie** : app/
- **Domaine production** : cantiques-eujc.lnk-studio.com

## Procédure initiale (une seule fois)

### 1. Créer le projet Cloudflare Pages

1. Aller sur dash.cloudflare.com
2. Menu gauche : **Workers & Pages**
3. Cliquer **Create** puis onglet **Pages**
4. Choisir **Connect to Git**
5. Autoriser l'accès à GitHub
6. Sélectionner le repo **Lemuelnk/cantiques-eujc**

### 2. Configurer le build

| Champ | Valeur |
|---|---|
| Project name | cantiques-eujc |
| Production branch | main |
| Framework preset | None |
| Build command | (vide) |
| Build output directory | app |

### 3. Lancer le déploiement

Cliquer **Save and Deploy**. Cloudflare va :

1. Cloner le repo
2. Copier le contenu de app/
3. Publier sur une URL temporaire : cantiques-eujc.pages.dev

## Sous-domaine personnalisé

### 4. Ajouter le domaine

1. Projet Pages → onglet **Custom domains**
2. Cliquer **Set up a custom domain**
3. Saisir : **cantiques-eujc.lnk-studio.com**
4. Cloudflare crée automatiquement l'enregistrement DNS

### 5. Attendre la propagation

Le certificat SSL est généré automatiquement (1-5 min).

## Configuration backend (Turnstile)

Le formulaire de signalement utilise Cloudflare Turnstile.
Il faut autoriser le nouveau sous-domaine :

1. Dashboard Cloudflare → **Turnstile**
2. Ouvrir le widget existant
3. **Hostname Management** → Add Hostname
4. Ajouter : cantiques-eujc.lnk-studio.com
5. Sauvegarder

## Mises à jour (workflow quotidien)

Tout est **automatique**. Pour publier une modification :

    cd ~/storage/shared/LNK_WORKS/cantiques-eujc
    git add -A
    git commit -m "description du changement"
    git push origin main

Cloudflare détecte le push et redéploie automatiquement (~1-2 minutes).

## Rollback (retour arrière)

1. Projet Pages → onglet **Deployments**
2. Trouver le déploiement précédent
3. Cliquer les **3 points** → **Rollback to this deployment**

## Fichiers de configuration

### wrangler.jsonc (racine)

    {
      "$schema": "...",
      "name": "cantiques-eujc",
      "pages_build_output_dir": "app",
      "compatibility_date": "2026-10-01"
    }

### app/_headers

Définit pour chaque route :

- CSP stricte (script-src self + unpkg + cdn.jsdelivr + turnstile)
- Cache-Control par type (assets immutable, data revalidate, sw no-cache)
- Sécurité (nosniff, HSTS, X-Frame-Options)
- Content-Type pour le manifest PWA

### app/_redirects

    /  /splash.html  302

La racine redirige vers le splash (point d'entrée par défaut).

## Vérifications post-déploiement

Après le premier déploiement, tester :

### Accès de base

- [ ] https://cantiques-eujc.pages.dev/splash.html s'affiche
- [ ] Redirection vers index.html fonctionne
- [ ] Le logo doré apparaît

### Fonctionnalités

- [ ] Navigation entre les pages (accueil, catégories, cantiques)
- [ ] Recherche par mot et par numéro
- [ ] Favoris (ajouter + persistance)
- [ ] Historique (consulter + persistance)
- [ ] Mode sombre (depuis Paramètres)
- [ ] 4 polices (système, Open Sans, Lora, Atkinson)
- [ ] Multilingue (cantique n°40 Éden)

### PWA

- [ ] Manifest accessible : /manifest.webmanifest
- [ ] Service Worker enregistré
- [ ] Icônes 192 et 512 affichées
- [ ] Ajout à l'écran d'accueil possible

### Backend (signalements)

- [ ] Ouvrir un cantique → Signaler un problème
- [ ] Choisir un type + message
- [ ] Vérifier Turnstile (doit charger)
- [ ] Envoyer → confirmation

## Domaine de test local

Pour tester localement avec le serveur Python :

    cd ~/storage/shared/LNK_WORKS/cantiques-eujc/app
    python3 serve.py

Puis ouvrir : http://localhost:8080/splash.html

## Checklist avant chaque commit

- [ ] Aucune erreur dans la console (Eruda en local)
- [ ] Le mode clair ET sombre fonctionnent
- [ ] Le Service Worker charge sans erreur
- [ ] Les URL des assets sont correctes (chemins relatifs)
- [ ] Le commit message est descriptif

