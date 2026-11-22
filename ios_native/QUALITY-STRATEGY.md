# Stratégie qualité — iOS

## Pyramide de tests

### Unitaires
- décodage DTO pour chaque forme canonique rencontrée
- mapping DTO → domaine
- identité catégorie + ID
- normalisation de recherche avec accents
- recherche dans titres, numéros, paroles et langues
- ordre des hymnes, versions et blocs
- règles favoris/historique et limites de rétention
- migrations des formats de stockage

### Intégration
- chargement des 37 corpus depuis le bundle de test
- cohérence stats.json ↔ catégories ↔ total hymnes
- ouverture d'un cantique dans chaque groupe de catégories
- persistance puis relecture après recréation des repositories
- comportement en cas de fichier absent ou JSON invalide

### UI tests
- parcours Accueil → Recherche → Détail
- Bibliothèque → Catégorie → Détail
- changement de version linguistique
- ajout/retrait Favoris
- historique et effacement confirmé
- changement apparence et taille de lecture
- VoiceOver labels principaux et Dynamic Type

## Gates CI obligatoires

1. Formatage/lint Swift sans avertissements nouveaux.
2. Compilation Debug et Release.
3. Tests unitaires et intégration.
4. UI tests sur simulateur iPhone.
5. Validation du nombre et des noms de corpus.
6. Décodage de tous les corpus dans un test dédié.
7. Vérification de l'absence de fichiers Flutter/Dart et de dépendances interdites.
8. Suivi de la taille du bundle et des ressources.
9. Génération d'un rapport de couverture ; seuil à définir après le premier baseline, sans inventer un pourcentage arbitraire.

## Matrice de validation manuelle

- iPhone compact et grand format.
- Version iOS minimale décidée pour le projet.
- Mode clair, sombre et système.
- Hors-ligne dès le premier lancement.
- Langues avec accents et caractères spécifiques.
- Dynamic Type maximal raisonnable.
- VoiceOver.
- Rotation si l'application la prend en charge ; sinon comportement portrait documenté.

## Critères de sortie d'une version

- Aucun crash connu sur parcours P0.
- Aucun corpus canonique manquant ou illisible.
- Favoris/historique ne perdent pas leur identité de catégorie.
- Pas de régression PWA causée par les scripts partagés.
- Build reproductible depuis un clone propre.
- Archive distribuable signée uniquement dans un environnement sécurisé.
