# Contribuer à Cantiques EUJC

> Guide général de contribution. Mis à jour : 2026-10-24.

## Bienvenue

Merci de t'intéresser à Cantiques EUJC ! Ce projet est porté par une communauté et ouvert à plusieurs formes de contribution. Tu n'as pas besoin d'être développeur pour aider.

Avant de contribuer, prends le temps de lire :
- `README.md` — vue d'ensemble
- `docs/00-fondations/PRD.md` — vision et priorités
- `docs/00-fondations/ARCHITECTURE.md` — technique (si tu veux coder)

## Types de contribution

Il y a 6 façons de contribuer, chacune avec son guide détaillé :

### 1. Développement (code)

**Si tu sais coder** : PWA, admin, worker, Flutter, scripts Python.

Guide détaillé : `CONTRIBUTING-DEV.md` (à créer quand un dev rejoint)

### 2. Contenu (cantiques)

**Si tu connais les cantiques EUJC** : ajouter, corriger, vérifier les paroles.

Guide détaillé : `CONTRIBUTING-CONTENT.md` (à créer)

### 3. Traduction

**Si tu maîtrises une langue** (anglais, lingala, swahili, tshiluba, kikongo) : traduire l'interface.

Guide détaillé : `CONTRIBUTING-TRANSLATION.md` (à créer)

### 4. Audio (choristes, musiciens)

**Si tu peux enregistrer ou fournir des liens audio** : contribuer à la feature audio (à venir).

Guide détaillé : `CONTRIBUTING-AUDIO.md` (à créer)

### 5. Administration

**Si tu veux gérer les signalements** : valider les corrections, modérer.

Guide détaillé : `CONTRIBUTING-ADMIN.md` (à créer)

### 6. Financement (sponsor)

**Si tu veux soutenir financièrement** : payer l'infra, financer une feature.

Document : `PITCH.md` (à créer)

## Règles générales

### Règle 1 — Lire la doc avant de contribuer

Le projet est documenté. Avant de proposer une modification, vérifie qu'elle n'est pas déjà :
- Dans le PRD (`docs/00-fondations/PRD.md`)
- Dans les décisions (`docs/05-decisions/decision-log.md`)
- Dans la roadmap (`docs/00-fondations/PRD.md` section Roadmap)

### Règle 2 — Respecter les 7 non-objectifs

Le PRD définit 7 non-objectifs verrouillés. Toute contribution qui les contredit sera refusée :
- Pas de réseau social
- Pas de monétisation
- Pas de compte utilisateur
- Pas de playlist/setlist
- Pas de traduction automatique
- Pas d'IA générative
- Pas de version desktop dédiée

### Règle 3 — Documenter ce qu'on fait

Chaque modification importante doit être :
- Commité avec un message clair (format `type(scope): description`)
- Traçable (le journal de session existe pour ça)
- Testable (checklist `TESTS.md`)

### Règle 4 — Tester avant de proposer

Avant de créer une PR, lance la checklist `TESTS.md` sur les pages concernées. Ne pousse jamais du code non testé.

### Règle 5 — Être patient

Le projet est maintenu par 1 personne à 2-5h/semaine. Une PR peut mettre plusieurs semaines à être reviewée. Ce n'est pas un manque d'intérêt, c'est la réalité du rythme.

## Workflow Git

### 1. Fork et clone

    # Sur GitHub : clique sur "Fork" (si tu n'as pas les droits d'écriture)
    git clone https://github.com/<ton-user>/cantiques-eujc.git
    cd cantiques-eujc

    # Si tu as les droits :
    git clone https://github.com/Lemuelnk/cantiques-eujc.git

### 2. Créer une branche

    git checkout main
    git pull origin main
    git checkout -b feat/ma-feature
    # ou fix/mon-fix

Nommage :
- `feat/xxx` — nouvelle fonctionnalité
- `fix/xxx` — correction de bug
- `docs/xxx` — documentation
- `chore/xxx` — tâche technique
- `refactor/xxx` — refactoring

### 3. Développer et tester

    # Lancer le serveur local
    python3 ~/serve_local.py
    # → http://127.0.0.1:8081/

    # Tester manuellement les pages concernées
    # Voir TESTS.md pour la checklist

### 4. Committer

    git add fichier1 fichier2
    git commit -m "feat(signaler): ajoute le type ordre"

Format du message : `type(scope): description`
- `feat` — nouvelle feature
- `fix` — correction
- `docs` — documentation
- `chore` — technique sans impact produit
- `refactor` — refactoring sans changement de comportement

### 5. Push et PR

    git push origin feat/ma-feature

Sur GitHub : crée une Pull Request vers `main`.

Dans la description de la PR :
- **Quoi** : ce que tu as fait
- **Pourquoi** : le problème résolu ou la feature ajoutée
- **Comment tester** : les étapes pour vérifier
- **Screenshots** : si UI

### 6. Review et merge

Le mainteneur (Lemuel) review la PR. Il peut :
- Approuver et merger
- Demander des modifications
- Refuser (avec explication)

## Conventions de code

### JavaScript

- 2 espaces d'indentation
- Pas de `var`, préférer `const` puis `let`
- Pas de point-virgule omis (toujours `;`)
- Noms de fonctions/variables en camelCase
- Commentaires en français
- Pas de framework (vanilla JS uniquement)

### HTML

- 2 espaces d'indentation
- Attributs `alt` sur toutes les images
- Pas de `<style>` inline (tout dans le CSS)
- Pas de `<script>` inline (tout dans le JS)

### CSS

- 2 espaces d'indentation
- BEM light (`.block__element--modifier` si nécessaire)
- Variables CSS pour les couleurs (voir `app/charte.css`)
- Pas de `!important` sauf pour override de tiers (justifier en commentaire)

### Python (scripts)

- PEP 8
- Pas de dépendances externes (sauf stdlib + pypdf/pdftotext)
- Scripts autonomes, commentés

## Communication

### Où poser des questions ?

- **GitHub Issues** : pour les bugs et propositions de features
- **GitHub Discussions** (si activé) : pour les questions ouvertes
- **Contact direct** : pour les sujets sensibles (contenu liturgique, conflits)

### Langues acceptées

- Français (principal)
- Anglais (acceptable)
- Swahili, Lingala, Tshiluba, Kikongo (acceptables, mais réponses en FR/EN)

## Reconnaissance

Tous les contributeurs sont crédités dans le `CONTRIBUTORS.md` (à créer) et dans l'historique Git.

Il n'y a pas de compensation financière (projet bénévole), mais les contributions importantes sont mises en avant :
- Sur la page "À propos" de l'app
- Dans les annonces de l'église

## Droit de refus

Le mainteneur se réserve le droit de refuser toute contribution qui :
- Contredit les 7 non-objectifs
- Introduit de la dette technique majeure
- N'est pas testée
- Ne respecte pas les conventions de code
- Vient en conflit avec la vision liturgique de l'église EUJC

Ce refus sera toujours expliqué et discuté.

## Contact

**Mainteneur** : Lemuel (porteur du projet)
**Email** : voir profil GitHub
**Repo** : https://github.com/Lemuelnk/cantiques-eujc

Merci de contribuer à Cantiques EUJC !
