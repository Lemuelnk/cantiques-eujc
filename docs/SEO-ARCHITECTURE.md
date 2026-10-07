# Cantiques EUJC — SEO architecture

## Source de vérité
Le corpus `app/data/canonical/*.json` reste la source de vérité. Les pages HTML générées ne doivent jamais devenir une seconde base de données.

## Génération
Depuis la racine du dépôt:
```bash
python3 scripts/generate_seo_pages.py
```

Le générateur crée une page statique par cantique numéroté sous:
```text
/cantique/<categorie>/<numero>
```

Chaque page contient dans le HTML initial un title unique, une description, canonical, Open Graph/Twitter, H1, langue, catégorie, paroles, fil d’Ariane et JSON-LD. Le JavaScript existant reste responsable des fonctions interactives.

## Indexation
Indexables: accueil, navigation éditoriale, catégories publiques et pages individuelles de cantiques.

Non indexables: recherche, favoris, historique, paramètres, signalement, debug, splash et interfaces techniques.

## Contrôles
Avant déploiement: vérifier les collisions de chemins, les cantiques sans numéro, les canonicals, le sitemap, les données structurées, les liens cassés, Lighthouse/Core Web Vitals puis Search Console.

Le générateur ne modifie jamais les JSON canoniques. Toute correction de contenu doit être faite dans le corpus puis régénérée.
