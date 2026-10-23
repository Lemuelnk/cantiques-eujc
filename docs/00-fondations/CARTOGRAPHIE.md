# Cartographie — Cantiques EUJC

> Map complète des routes, pages et assets. Mis à jour : 2026-10-24.

## Routes publiques (utilisateur)

### Pages principales

    URL                          Fichier source            Rôle
    /                            index.html                Accueil (splash si 1ère visite)
    /cantiques                   cantiques.html            Liste des cantiques d'une catégorie
    /cantique/:cat/:num          cantique/<cat>/<num>/     Page SEO d'un cantique (2406 générées)
    /categorie/:cat              categorie/<cat>/          Page SEO d'une catégorie (40 générées)
    /cantique.html               cantique.html             Fallback JS (route non générée)
    /categories                  categories.html           Liste des grandes catégories
    /lessons                     lessons.html              Liste des leçons du Chemin
    /dimanche                    dimanche.html             Cantiques du Dimanche
    /priere                      priere.html               Cantiques de prière
    /a-classer                   a-classer.html            Cantiques à classer
    /recherche                   recherche.html            Recherche globale
    /favoris                     favoris.html              Cantiques favoris
    /historique                  historique.html           Historique de consultation
    /signaler                    signaler.html             Formulaire de signalement
    /parametres                  parametres.html           Paramètres (thème, police, taille)
    /apropos                     apropos.html              À propos
    /plus                        plus.html                 Menu "Plus"
    /splash                      splash.html               Écran de démarrage
    /404                        404.html                  Page introuvable

### Assets principaux

    URL                          Fichier                   Rôle
    /sw.js                       sw.js                     Service Worker (v7.13.0)
    /manifest.webmanifest        manifest.webmanifest      Manifest PWA
    /sitemap.xml                 sitemap.xml               Sitemap (2447 URLs)
    /style.css                   style.css                 Styles globaux
    /charte.css                  charte.css                Variables couleurs + typo
    /data/canonical/*.json       data/canonical/*.json     40 JSON canoniques

## Routes API

### Worker cantiques-eujc (worker.js)

    /cantique/:cat/:num       Sert la page SEO ou fallback cantique.html
    /categorie/:cat           Sert la page catégorie SEO ou fallback cantiques.html
    /cantique/:cat/           Redirection 302 vers /categorie/:cat/
    /*                        Sert les assets statiques

### Backend site-lnk_dt (Cloudflare Functions)

    /api/cantiques-reports

    POST sans admin :
        Crée un signalement public (vérifie Turnstile)

    POST avec admin_create: true + Bearer token :
        Crée un signalement depuis l'admin (skip Turnstile)

    POST avec action (apply, resolved, etc.) + Bearer token :
        Modifie le statut ou applique la correction (crée PR GitHub)

    GET + Bearer token :
        Liste les signalements (filtre par status)

## Diagramme de navigation

    Accueil (/)
        |
        +-- Cantiques du Chemin (/lessons)
        |       |
        |       +-- Leçon 0 à 26 (/cantiques?category=lesson-X)
        |               |
        |               +-- Cantique (/cantique/lesson-X/num)
        |
        +-- Cantiques du Dimanche (/dimanche)
        |       |
        |       +-- 7 catégories (dimanche-louange, dimanche-croyants...)
        |
        +-- Cantiques de prière (/priere)
        |       |
        |       +-- 4 catégories (priere-misericorde, priere-invocation...)
        |
        +-- Cantiques à classer (/a-classer)
        |       |
        |       +-- 5 langues (francais, swahili, tshiluba, lingala, autres)
        |
        +-- Recherche (/recherche)
        |       |
        |       +-- Résultat -> /cantique/:cat/:num
        |
        +-- Favoris (/favoris)
        +-- Historique (/historique)
        +-- Paramètres (/parametres)
        +-- Signaler (/signaler)

## Nombre de fichiers

    HTML : 15 pages principales
    CSS  : 18 feuilles de style
    JS   : 24 scripts
    JSON : 40 canoniques
    SEO  : 2406 pages cantique + 40 pages catégorie

