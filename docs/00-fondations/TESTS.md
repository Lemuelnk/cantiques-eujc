# Checklist de tests — Cantiques EUJC

> À utiliser après CHAQUE déploiement en prod. Mis à jour : 2026-10-24.

## Pourquoi cette checklist

Le Service Worker peut servir du contenu périmé (voir DEC-010). Sans tests systématiques, on peut livrer une régression sans s'en rendre compte.

## Étape 0 — Préparation avant déploiement

- [ ] Bumper `?v=N` dans les HTML pour les assets modifiés
- [ ] Bumper `VERSION` dans `app/sw.js`
- [ ] Vérifier `git status` (working tree propre, sauf les bump)
- [ ] Relire le diff avant commit (`git diff --stat`)

## Étape 1 — Vérifications serveur (Termux, sans navigateur)

Après le push, attendre 2 min puis lancer :

    U="https://cantiques-eujc.lnk-studio.com"

    # SW version
    curl -s "$U/sw.js?t=$(date +%s)" | grep "VERSION = "
    # Attendu : v7.14.0 (ou plus récent)

    # Routes critiques
    for URL in "/" "/recherche" "/cantique/lesson-12/111" "/categorie/lesson-12"; do
      CODE=$(curl -s -o /dev/null -w "%{http_code}" "$U${URL}?t=$(date +%s)")
      echo "$CODE $URL"
    done
    # Attendu : 200 partout

    # Fichiers modifiés
    curl -s "$U/nom-du-fichier.js?t=$(date +%s)" | head -5
    # Attendu : version fraîche

Si une vérif échoue : ne pas continuer, creuser d'abord.

## Étape 2 — Vérifications navigateur (mobile, en navigation privée)

Toujours en navigation privée pour éviter le cache SW.

### Page d'accueil

- [ ] `https://cantiques-eujc.lnk-studio.com/` s'affiche
- [ ] Les 4 cartes d'accès rapide apparaissent (sans soulignement)
- [ ] La barre de recherche est cliquable
- [ ] Le bottom-nav (Accueil, Recherche, Bibliothèque, Plus) est visible

### Navigation

- [ ] Bibliothèque → Cantiques du Chemin s'ouvre
- [ ] Leçon 12 → liste des cantiques s'affiche
- [ ] Clic sur un cantique → page cantique avec paroles

### Cantique

- [ ] Les paroles s'affichent avec accents et apostrophes corrects
- [ ] Le badge "N langues" apparaît si multilingue
- [ ] Le bouton favori (cœur) fonctionne
- [ ] Le bouton Précédent/Suivant navigue
- [ ] Le menu ⋮ s'ouvre (Copier, Voir catégorie, Signaler, Fermer)

### Recherche

- [ ] `https://cantiques-eujc.lnk-studio.com/recherche?q=yesu` s'affiche
- [ ] Les résultats apparaissent (avec titre + extrait)
- [ ] Les filtres (catégorie, leçon, langue) s'ouvrent
- [ ] Un clic sur un résultat ouvre le bon cantique

### Signaler

- [ ] Le formulaire s'ouvre depuis un cantique
- [ ] La carte "Bloc en trop" est visible
- [ ] La carte "Nom de la catégorie" est visible (en scope liste)
- [ ] Le bouton Envoyer reste désactivé sans remplissage
- [ ] Turnstile s'affiche (icône Cloudflare)
- [ ] Remplir + envoyer → message de succès

### Favoris / Historique

- [ ] Ajouter un cantique en favori → apparaît dans `/favoris`
- [ ] Consulter un cantique → apparaît dans `/historique`

### Thème / police

- [ ] Paramètres → basculer en mode sombre → tout reste lisible
- [ ] Changer la police → le texte change partout
- [ ] Slider de taille → le texte grandit/rétrécit

## Étape 3 — Tests spécifiques Service Worker

### Test "1ère visite" (nouveau SW)

- [ ] Ouvrir Chrome → `chrome://serviceworker-internals`
- [ ] Chercher `cantiques-eujc.lnk-studio.com`
- [ ] Vérifier la version (`v7.14.0` ou plus récente)
- [ ] Statut : "activated and running"

### Test "update SW"

- [ ] Simuler une mise à jour : bumper `VERSION` dans `sw.js`, push
- [ ] Attendre 2 min, recharger le site 2 fois
- [ ] Vérifier dans `serviceworker-internals` que la nouvelle version est active

### Test offline

- [ ] Visiter 2-3 cantiques (pour les mettre en cache)
- [ ] Activer le mode avion
- [ ] Recharger un cantique déjà visité → doit s'afficher (grâce au SW)
- [ ] Chercher "yesu" → doit afficher les résultats en cache
- [ ] Désactiver le mode avion

## Étape 4 — Tests admin (si modifié)

**Prérequis** : sur https://lnk-studio.com/admin-cantiques, en navigation privée.

### Login

- [ ] La page de login s'affiche
- [ ] Le token invalide est rejeté
- [ ] Le token valide ouvre le panel

### Liste signalements

- [ ] Les signalements apparaissent (avec badge statut)
- [ ] Les filtres (Nouveaux, En cours, Résolus, Rejetés) fonctionnent
- [ ] Le bouton Actualiser recharge la liste

### Modal Nouveau (Feature B)

- [ ] Cliquer sur "+ Nouveau" → modal s'ouvre
- [ ] Le backdrop sombre est visible
- [ ] Cliquer sur ✕ → modal ferme
- [ ] Cliquer sur Annuler → modal ferme
- [ ] Cliquer sur le backdrop → modal ferme
- [ ] Sélectionner Type + Catégorie → cantiques se chargent
- [ ] Taper "111" dans Cantique → suggestion apparaît
- [ ] Sélectionner Cantique → blocs se chargent
- [ ] Sélectionner Bloc → texte actuel s'affiche
- [ ] Remplir correction → bouton Créer s'active
- [ ] Cliquer Créer → modal ferme + signalement apparaît

### Appliquer correction (Feature A)

- [ ] Trouver un signalement avec `proposed_text` non vide
- [ ] Le textarea "Correction à appliquer" est pré-rempli
- [ ] Modifier le texte dans le textarea
- [ ] Cliquer Appliquer → PR créée
- [ ] Vérifier sur GitHub que la PR contient le texte modifié
- [ ] Fermer la PR (sans merger) si c'est un test

## Étape 5 — Tests spécifiques après modif code

### Si `escapeHtml` ou `getCorpus` modifiés

- [ ] Tous les cantiques s'affichent (accents, apostrophes)
- [ ] Les résultats de recherche s'affichent correctement
- [ ] Les favoris s'affichent
- [ ] L'historique s'affiche

### Si `signaler.js` modifié

- [ ] Le formulaire de signalement charge
- [ ] Tous les types de carte apparaissent (selon scope)
- [ ] Le bouton Envoyer s'active au bon moment
- [ ] L'envoi fonctionne (message de succès)

### Si `admin-cantiques.js` modifié

- [ ] Login fonctionne
- [ ] Les signalements s'affichent
- [ ] Les actions (En cours, Résolu, Rejeter, Supprimer) fonctionnent
- [ ] Le bouton Appliquer crée une PR

### Si `worker.js` ou `wrangler.jsonc` modifié

- [ ] `/` → 200 (page d'accueil)
- [ ] `/cantique/lesson-12/111` → 200 (page SEO)
- [ ] `/categorie/lesson-12` → 200 (page catégorie)
- [ ] `/cantique/lesson-12/` → 302 redirect vers `/categorie/lesson-12/`
- [ ] `/cantique/lesson-12/99999` → 200 (fallback JS)

## Étape 6 — Tests PWA installable

- [ ] Sur Chrome Android → Menu ⋮ → "Installer l'application"
- [ ] L'app s'installe sur l'écran d'accueil
- [ ] Ouvrir l'app installée → s'affiche sans barre d'URL
- [ ] Le mode hors-ligne fonctionne (mode avion)

## Étape 7 — Validation finale

- [ ] Aucune erreur console dans Chrome DevTools (onglet Console)
- [ ] Aucun 404 dans l'onglet Network
- [ ] Lighthouse (via PageSpeed Insights) : Perf > 90, A11y > 95, SEO > 95
- [ ] Le site est utilisable en 4G (pas seulement Wi-Fi)

## Si un test échoue

1. **Ne pas merger la PR** si elle n'est pas déjà mergée
2. **Rollback** si la prod est cassée (`git revert` + push)
3. **Documenter** le bug dans `docs/07-journal/` avec :
   - Quel test a échoué
   - Message d'erreur
   - Ce qui a été tenté
4. **Corriger** en branche isolée, retester, merger

## Après un succès

- [ ] Mettre à jour le journal de session (`docs/07-journal/`)
- [ ] Fermer les issues GitHub concernées
- [ ] Annoncer sur le canal de communication (si nouveau déploiement majeur)

---

*Checklist à parcourir intégralement avant chaque déploiement prod. En cas de doute sur un test, mieux vaut décaler le déploiement.*
