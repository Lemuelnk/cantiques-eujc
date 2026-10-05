# 🎯 Fonctionnalités — État détaillé

## 1. Écran de démarrage (splash)

**Fichiers** : `splash.html`, `splash.css`

- Logo doré EUJC avec halo pulsant
- Feuillages organiques générés en Python (`generate-leaves.py`)
- 18 particules dorées ascendantes animées
- Cascade d'animations : feuillages → logo → titre → divider → tagline
- Titre en `clamp()` adaptatif (13.5vw / 15vw)
- Redirection auto après 3,2 s ou au toucher

## 2. Accueil

**Fichiers** : `index.html`, `style.css`, `app.js`

- Header sticky avec logo doré rond (38px) + titre
- "Bonjour 👋" (40px) + question rhétorique
- Barre de recherche cliquable (redirige vers recherche.html)
- Cartes d'accès rapides :
  - Cantiques du Chemin (vert)
  - Cantiques du Dimanche (doré)
  - Cantiques de prière (vert forêt, pleine largeur)
- Section "Récemment consultés" avec badges dorés
- Bottom-nav avec 4 onglets

## 3. Catégories

**Fichiers** : `categories.html`, `categories.css`, `categories.js`

- 3 sections : Leçons du Chemin / Dimanche / Prière
- Liens directs vers chaque catégorie
- FAB signalement

## 4. Leçons du Chemin

**Fichiers** : `lessons.html`, `lessons.css`, `lessons.js`

- Liste complète des 21 leçons
- Séparation en 2 : 0-13 + 20-26 + leçons indéterminées
- Chaque leçon mène à ses cantiques

## 5. Cantiques du Dimanche / Prière

**Fichiers** : `dimanche.html` + `priere.html`

- 7 sous-catégories Dimanche
- 4 sous-catégories Prière
- Style harmonisé (classes `lesson-row-wide`)

## 6. Liste des cantiques

**Fichiers** : `cantiques.html`, `cantiques.css`, `cantiques.js`

- Affichage numéro + titre + langue
- Badge "🌐 N langues" si multilingue
- Bouton favori (étoile) sur chaque ligne
- Tri par défaut / alphabétique / favoris
- FAB signalement

## 7. Détail d'un cantique

**Fichiers** : `cantique.html`, `cantique.css`, `cantique.js`

- Header : retour + favoris + partage + menu
- N° + titre + langue + catégorie
- Sélecteur d'onglets de versions linguistiques (si multilingue)
- Blocs de contenu : couplets numérotés, refrain (beige), commentaire
- Barre d'action bas : Précédent / Mode lecture / Texte / Suivant
- Navigation circulaire dans la catégorie
- Enregistrement automatique dans l'historique

## 8. Panneau "Affichage"

**Intégré dans cantique.html/css/js**

- Slider de taille du texte (4 crans)
- Choix parmi 4 polices
- Aperçu live
- Drag-to-dismiss

## 9. Panneau "Partage"

**Intégré dans cantique.html/css/js**

- Partager le cantique (image — générateur v1)
- Partager avec le lien (Web Share API)
- Copier le lien
- Copier les paroles
- Drag-to-dismiss

## 10. Générateur d'image (v1)

**Fichier** : `share-image.js`

- 4 formats : 1:1 / 4:5 / 9:16 / 9:19
- Choix auto du format selon la longueur
- Aperçu live en canvas
- Export PNG + partage natif
- **À refondre** (branche `feature/share-image-v2` prévue)

## 11. Recherche

**Fichiers** : `recherche.html`, `recherche.css`, `recherche.js`

- Recherche par titre, contenu et numéro
- Debounce 150 ms
- Filtres avancés (panneau) :
  - Catégorie
  - Leçon
  - Langue
- Compteurs temps réel par mode (Tous / Titres / Contenu)
- Badge de filtres actifs

## 12. Favoris

**Fichiers** : `favoris.html`, `favoris.css`, `favoris.js`

- Liste des cantiques favoris
- Bouton étoile pour retirer
- État vide propre
- Tri par date d'ajout (récent en premier)

## 13. Historique

**Fichiers** : `historique.html`, `historique.css`, `historique.js`

- Liste des cantiques récemment ouverts
- Temps relatif ("Il y a 5 min")
- Bouton "Vider" avec confirmation

## 14. Signalement

**Fichiers** : `signaler.html`, `signaler.css`, `signaler.js`, `report-fab.css`, `report-fab.js`

- 12 types unifiés
- 3 contextes : cantique / liste / global
- Mode signaler OU proposer une correction
- Stepper 1-2-3
- Aide contextuelle par type
- Bandeau de rassurance
- Turnstile invisible

## 15. Paramètres

**Fichiers** : `parametres.html`, `parametres.css`, `parametres.js`

- Choix du thème (Clair / Sombre / Système)
- Slider de taille du texte
- Choix parmi 4 polices
- Liens vers Favoris / Derniers consultés
- Liens App / Signaler / À propos
- Version

## 16. À propos

**Fichiers** : `apropos.html`, `apropos.js`

- Logo doré dans un cercle vert
- Titre + tagline
- Statistiques dynamiques (cantiques / catégories / langues)
- Liens (site, contact, signaler, partager)
- Crédits

## 17. Menu "Plus"

**Fichiers** : `plus.html`, `plus.js`

- Hub vers : favoris, historique, paramètres, partage, signalement, à propos

## 18. PWA

**Fichiers** : `manifest.webmanifest`, `sw.js`, `sw-register.js`

- Installable sur mobile
- Icônes 192 / 512 / maskable (logo doré sur cercle vert)
- Mode hors-ligne (cache-first)
- Service Worker v7.6.1

## 19. Thème sombre

- Variable CSS globales (`charte.css`)
- Anti-FOUC sur toutes les pages
- Adaptation de toutes les pages
- `<meta name="theme-color">` adaptatif
