# Schéma canonique v1 — Cantiques EUJC

## Fichiers

- `schema-canonique-v1.json` : JSON Schema Draft 2020-12.
- `exemples-canonique-v1.json` : exemple valide et exemple volontairement invalide.

## Règles importantes

- `hymn.id` et `version.id` sont des UUID.
- `source.number` est une référence source et peut être null.
- `source.position` est un entier >= 1.
- `language.status=known` exige un code et un label.
- `language.status=unknown` impose code et label à null.
- `lessons` exige `lesson_id` et `lesson_label` au format canonique.
- `sunday` et `prayer` n'ont pas de leçon associée.
- `content` est ordonné et n'accepte que `verse`, `refrain`, `comment`, `source_block`.
- chaque bloc possède `lines`.
- aucune propriété non prévue par le contrat n'est acceptée.

## Important

Le schéma valide la **forme** et certaines contraintes mécaniques. Il ne peut pas décider à lui seul :

- si deux entrées sont réellement le même cantique ;
- si une langue est correctement identifiée par un humain ;
- si un bloc source doit être `verse` ou `source_block` ;
- si un refrain a été correctement interprété ;
- si une correction textuelle est fidèle à la source.

Ces décisions restent dans le processus de validation métier.
