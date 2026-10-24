# Politique de sécurité — Cantiques EUJC

## Signaler une vulnérabilité

**Ne créez PAS d'issue publique pour signaler une vulnérabilité.** Les issues sont visibles publiquement, et une faille exposée pourrait être exploitée avant d'être corrigée.

### Procédure

1. Envoyez un email à l'adresse indiquée dans le profil GitHub du mainteneur
2. Décrivez précisément :
   - Le composant concerné (front, admin, API, worker, base D1)
   - Les étapes pour reproduire
   - L'impact potentiel (accès non autorisé, fuite de données, déni de service, etc.)
   - Si possible, une suggestion de correction
3. Ne divulguez pas publiquement la vulnérabilité tant qu'elle n'est pas corrigée

### Délai de traitement

- **Accusé de réception** : sous 72h
- **Analyse et correction** : sous 7 jours pour les vulnérabilités critiques, sous 30 jours pour les autres
- **Divulgation publique** : après correction, avec votre accord

## Versions supportées

Seule la **dernière version déployée en production** (`main` sur cantiques-eujc, `master` sur site-lnk_dt) est supportée. Les anciennes versions ne reçoivent pas de correctifs de sécurité.

## Bonnes pratiques de sécurité

### Pour les contributeurs

- **Ne jamais commiter de secrets** (tokens, mots de passe, clés API)
- **Ne jamais hardcoder de credentials** dans le code
- **Utiliser les variables d'environnement** pour les données sensibles
- **Ne jamais désactiver** les protections de branche ou le scanning automatique

### Pour les utilisateurs

- **Ne jamais partager votre token admin** (REVIEW_ADMIN_TOKEN)
- **Signaler immédiatement** toute activité suspecte sur le repo
- **Utiliser un gestionnaire de mots de passe** pour les tokens

## Sécurité de l'infrastructure

- **Hébergement** : Cloudflare (Workers, Pages, D1)
- **HTTPS** : obligatoire (HSTS activé)
- **CSP** : Content-Security-Policy stricte (voir `app/_headers`)
- **Anti-spam** : Turnstile sur le formulaire public
- **Admin** : Bearer token + CORS restreint
- **Secrets** : stockés dans Cloudflare Pages, jamais dans le code

## Historique

Aucune vulnérabilité connue à ce jour.

---

*Merci de contribuer à la sécurité du projet.*
