# Cantiques EUJC — Référence canonique

## Objet

Cette documentation constitue la référence de travail pour la structuration des cantiques EUJC dans le projet local.

Le projet distingue :
- les sources originales ;
- les données RAW extraites ;
- les données validées ;
- les données canoniques destinées à l'application ;
- les corrections proposées ;
- les projections dérivées de l'application.

> FIDÉLITÉ À LA SOURCE > NORMALISATION > INTERPRÉTATION

## Contrat canonique

Le contrat complet est défini dans docs/02-donnees/contrat-canonique.md.

Il est la référence pour toute donnée destinée à alimenter l'application.

Le contrat canonique alimente une seule fois les différentes surfaces : fiche, lecture, versions, recherche, partage en image, partage en texte et partage par lien.

Les représentations de recherche et de partage sont dérivées du canonique et ne doivent pas devenir des sources concurrentes.

## Identité d'un cantique

L'identité métier d'un cantique repose sur son nom / titre.

L'identité technique utilisée par l'application est hymn.id.

Le numéro affiché par une source est une référence propre à cette source. Il ne constitue pas une identité universelle.

Une version possède son propre version.id.

## Provenance

Chaque version canonique conserve sa provenance : fichier source, position dans la source, numéro source et référence complémentaire éventuelle.

La position et le numéro source sont deux informations différentes.

## Versions linguistiques

Une entrée source est autonome par défaut.

Deux entrées ne sont regroupées dans versions[] qu'après une correspondance explicitement validée.

Le numéro source ne suffit jamais à établir une correspondance multilingue.

## Sources

Les pages HTML présentes dans resources/site/ constituent les ressources sources locales du site EUJC.

Les données RAW doivent rester fidèles à ces sources.

## Application

L'application se trouve dans app/.

Les données canoniques destinées à l'application doivent suivre le contrat v1.

Les anciennes données de app/data/cantiques.json restent identifiées comme legacy et ne doivent pas servir de modèle pour les nouvelles données.

La migration du legacy sera traitée séparément.

## Corrections

Une correction proposée reste séparée des données officielles.

Elle doit être traçable, révisable et validée avant de modifier une donnée canonique publiée.