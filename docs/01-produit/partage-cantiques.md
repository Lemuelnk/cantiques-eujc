# Fonctionnalité — Partage des cantiques

**Projet :** Cantiques EUJC  
**Statut :** Décision produit — à intégrer au périmètre fonctionnel  
**Date :** 2026-09-28

## 1. Objectif

Permettre à l'utilisateur de partager facilement un cantique depuis sa fiche, soit sous forme d'une **image mise en page**, soit sous forme de **texte structuré**, avec la possibilité de partager également un lien vers le cantique dans l'application.

Le partage doit être pensé comme une fonctionnalité de diffusion du contenu et de découverte de l'application, et non comme une simple capture d'écran.

## 2. Point d'entrée

Depuis la fiche d'un cantique :

> **Partager**

Le menu de partage propose au minimum :

- **En image**
- **En texte**
- **Lien du cantique**

Le système de partage natif du téléphone est ensuite utilisé pour envoyer le résultat vers WhatsApp, Telegram, Messenger, e-mail, SMS ou toute autre application compatible.

## 3. Partage en image

### 3.1 Principe

L'application génère automatiquement une fiche graphique contenant les paroles du cantique.

La fiche est générée à partir des données canoniques du cantique. Elle ne doit jamais être une simple capture de l'écran de lecture.

### 3.2 Contenu minimal

La fiche peut contenir :

- nom/logo **Cantiques EUJC** ;
- titre du cantique ;
- numéro source, lorsqu'il est disponible ;
- langue/version ;
- catégorie ou leçon, lorsqu'elle est pertinente ;
- paroles ;
- hiérarchie claire entre couplets et refrains ;
- élément de signature de l'application ;
- lien de téléchargement/découverte de l'application ;
- QR code facultatif si pertinent.

Le contenu des paroles doit rester fidèle aux données validées. Le générateur graphique ne corrige, ne traduit et ne reformule jamais les paroles.

### 3.3 Refrains

Les refrains doivent être visuellement distingués du reste du texte :

- bloc ou encadré dédié ;
- hiérarchie typographique claire ;
- traitement cohérent avec le design system.

La présentation ne doit pas modifier le contenu textuel.

### 3.4 Adaptation automatique du format

Le format de l'image est déterminé automatiquement selon la quantité de contenu.

Formats cibles :

| Format | Usage indicatif |
|---|---|
| **1:1** | Cantique court |
| **4:5** | Cantique moyen |
| **9:16** | Cantique long |
| **9:19** | Très long cantique |

Ces seuils sont indicatifs et pourront être ajustés après expérimentation.

Principe important :

> **La toile s'adapte à la longueur du cantique ; la lisibilité ne doit pas être sacrifiée pour faire rentrer le contenu.**

Le moteur peut utiliser plusieurs variantes de composition afin de conserver une bonne densité visuelle et une taille de texte confortable.

### 3.5 Direction graphique

Les fiches doivent reprendre le design system de Cantiques EUJC :

- vert profond ;
- teal ;
- crème/ivoire ;
- accents dorés ;
- typographie lisible ;
- formes organiques ou motifs discrets ;
- décoration minimale ;
- forte priorité donnée aux paroles.

La fiche doit être identifiable comme provenant de Cantiques EUJC sans donner l'impression d'une publicité intrusive.

## 4. Partage en texte

Le mode **En texte** produit un texte proprement structuré à partir du même contenu canonique.

Exemple de structure :

    🎵 TWAKUSHUKURU EH MUNGU WANGU
    Swahili · Leçon 1 — Création

    1.
    Twakushukuru eh Mungu wangu
    Kwa wema wako kwetu
    ...

    REFRAIN
    Twakushukuru
    Twakushukuru Mungu
    ...

    2.
    ...

    —
    Cantiques EUJC
    Le recueil dans votre poche

Le texte partagé doit être lisible dans une messagerie sans dépendre d'un formatage propriétaire.

### 4.1 Deux usages

Le système doit pouvoir prendre en charge :

- **Texte seul** : paroles structurées ;
- **Texte + lien** : paroles structurées suivies du lien vers l'application ou vers la fiche du cantique.

Le choix exact de l'interface pourra être finalisé lors de l'implémentation.

## 5. Lien du cantique

Le partage du lien permet de partager uniquement l'accès au cantique.

Le lien devra idéalement ouvrir directement la fiche correspondante dans l'application lorsqu'elle est installée.

À terme, prévoir un mécanisme de deep link / universal link / app link permettant :

1. d'ouvrir directement le cantique dans l'application si elle est installée ;
2. sinon, d'ouvrir une page web appropriée ;
3. de proposer naturellement l'installation de l'application.

La forme technique exacte du lien reste à définir.

## 6. Versions linguistiques

Lorsqu'un cantique possède plusieurs versions linguistiques, le partage concerne **la version actuellement sélectionnée**.

Exemple :

> NDJIKUBIKILA MUKALENGA  
> Tshiluba

ou :

> NDJIKUBIKILA MUKALENGA  
> Kiswahili

Le générateur ne doit jamais mélanger les paroles de plusieurs versions.

Le numéro source ne doit pas servir à déduire une correspondance entre langues.

## 7. Architecture fonctionnelle

Le partage doit utiliser une source de données unique :

    Données canoniques du cantique
             │
             ├──> Affichage dans l'application
             │
             ├──> Générateur d'image
             │
             ├──> Générateur de texte
             │
             └──> Générateur de lien

Cela évite de maintenir des contenus différents pour l'écran, l'image et le texte.

Le générateur de partage est une couche de présentation/export ; il ne devient pas une nouvelle source de vérité.

## 8. Contraintes

- Ne jamais modifier les paroles lors de la génération.
- Ne jamais inventer de couplets ou de refrains.
- Respecter la version linguistique sélectionnée.
- Préserver l'ordre et la structure validés.
- Ne pas transformer un numéro source en identité métier.
- Ne pas dépendre d'une capture d'écran de l'interface.
- Ne pas rendre le lien de téléchargement dominant au point de nuire à la lecture.
- Prévoir les très longs cantiques sans rendre le texte illisible.
- Le partage doit utiliser les mécanismes natifs de partage de la plateforme.

## 9. Évolution possible

La fonctionnalité pourra évoluer vers plusieurs thèmes graphiques de fiches, tout en conservant la même structure de contenu :

- thème clair crème ;
- thème vert profond ;
- variantes saisonnières ou institutionnelles ;
- personnalisation légère du style.

Ces variantes ne doivent jamais modifier le contenu canonique du cantique.

## 10. Décision

**Décision : intégrer le partage des cantiques comme fonctionnalité produit officielle.**

Les trois sorties principales sont :

1. **Image** — fiche graphique adaptative ;
2. **Texte** — paroles structurées ;
3. **Lien** — accès direct au cantique.

Cette fonctionnalité fait partie du design et du modèle d'expérience de la fiche d'un cantique, et doit être prise en compte avant l'implémentation finale de l'interface.
