# Cantiques EUJC — Référence canonique

## Objet

Cette documentation constitue la référence de travail pour la structuration des cantiques EUJC dans le projet local.

Le projet distingue :
- les sources originales ;
- les données RAW extraites ;
- les données validées ;
- les corrections proposées ;
- les données destinées à l'application.

**Principe directeur :**

> FIDÉLITÉ À LA SOURCE > NORMALISATION > INTERPRÉTATION

## Identité d'un cantique

L'identité métier d'un cantique repose sur son **nom / titre**.

Le numéro affiché par une source est une référence propre à cette source. Il ne constitue pas une identité universelle.

L'identité technique pourra utiliser un UUID.

## Versions linguistiques

Un même cantique peut exister en plusieurs versions linguistiques.

Les versions ne doivent pas être rapprochées automatiquement sur la seule base de leur numéro source.

## Sources

Les pages HTML présentes dans `resources/site/` constituent les ressources sources locales du site EUJC.

Les données RAW doivent rester fidèles à ces sources.

## Application

L'application se trouve dans `app/`.

La phase documentaire ne modifie pas automatiquement l'application. Les données validées seront intégrées après validation de leur structure et de leur contenu.
