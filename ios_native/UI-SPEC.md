# Spécification UX/UI iOS

## Intention

Reprendre la hiérarchie visuelle et les capacités de la PWA tout en adoptant les conventions iOS : navigation native, gestes, feuilles de présentation, Dynamic Type et accessibilité VoiceOver. Ne pas reproduire pixel par pixel une interface web.

## Navigation principale

Tab bar à quatre destinations :
1. Accueil
2. Recherche
3. Bibliothèque
4. Plus

La tab bar reste stable pendant la navigation racine. Les écrans de détail utilisent une navigation empilée et un retour natif.

## Écrans

### Accueil
- identité EUJC et raccourcis Favoris/Préférences
- message d'accueil
- statistiques lues depuis stats.json
- champ de recherche qui ouvre Recherche avec la requête préremplie
- accès rapide aux groupes de catégories
- derniers cantiques consultés, résolus avec categoryID + hymnID

### Recherche
- recherche globale dans les titres, numéros et paroles
- filtres catégorie, leçon et langue
- états vide, chargement, aucun résultat et erreur
- surlignage des correspondances sans modifier le texte source
- annulation des requêtes obsolètes

### Bibliothèque
- groupes Leçons du Chemin, Dimanche, Prière et À classer
- compteurs issus des corpus
- catégories et listes triées selon l'ordre canonique
- recherche locale dans une catégorie

### Détail d'un cantique
- titre et numéro source s'ils existent
- sélecteur de versions linguistiques clairement identifié
- contenu structuré (couplets, refrains, commentaires et types connus)
- mise en page de lecture confortable
- favoris
- précédent/suivant dans le corpus courant
- options typographiques accessibles
- aucun bouton audio, aucun lecteur audio

### Favoris et historique
- persistance locale
- suppression individuelle et effacement avec confirmation
- ordre récent cohérent
- états vides soignés
- navigation vers le cantique via son identité stable

### Préférences
- apparence système / clair / sombre
- police de lecture et taille du texte
- préférences accessibles et persistées localement

## Design system

- Palette de référence issue de la PWA : verts forêt, crème, or et couleurs sémantiques.
- UI : Open Sans ou police système selon licences et disponibilité ; lecture : Lora ; accessibilité : Atkinson Hyperlegible, sous réserve de validation des licences et intégration.
- Espacements, rayons, élévations et tailles tactiles définis comme tokens.
- Support des apparences clair/sombre via couleurs sémantiques.
- Ne pas figer les tailles de texte : respecter Dynamic Type et proposer une préférence de lecture compatible avec les tailles système.
- Animations discrètes, désactivables et respectueuses de Reduce Motion.

## Accessibilité et ergonomie

- VoiceOver : labels, hints, ordre de focus et annonces d'état.
- Dynamic Type sans troncature critique.
- Contraste WCAG AA comme minimum de conception.
- Zones tactiles conformes aux recommandations Apple.
- Ne pas utiliser la couleur seule pour distinguer langue, statut ou sélection.
- Tests sur petits écrans et tailles de texte agrandies.
