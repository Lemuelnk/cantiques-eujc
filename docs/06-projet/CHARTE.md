# 🎨 Charte graphique — Cantiques EUJC

## Palette de couleurs

### Vert forêt (identité)

| Rôle | Hex | Usage |
|---|---|---|
| forest-900 | #081f19 | Fond le plus sombre |
| forest-800 | #0b2b24 | Fond page sombre |
| forest-700 | #14392e | Institutionnel, header |
| forest-600 | #1f4a3d | Dégradé |
| forest-500 | #2d5f4f | Mousse |
| forest-400 | #4a7c68 | Feuille claire |
| forest-300 | #7ba695 | Sauge |

### Or vieilli (sacré)

| Rôle | Hex | Usage |
|---|---|---|
| gold-600 | #8b6f3d | Bronze profond |
| gold-500 | #b8935a | Or principal |
| gold-400 | #e4c37f | Or clair (sur sombre) |
| gold-300 | #f0dfb5 | Or pâle (fonds) |

### Crème (papier)

| Rôle | Hex | Usage |
|---|---|---|
| cream-50 | #f2efe6 | Fond alternatif |
| cream-100 | #faf6ec | Fond principal clair |
| cream-200 | #ede7d8 | Fond secondaire |
| white | #ffffff | Cartes élevées |

### Accents

| Rôle | Hex | Usage |
|---|---|---|
| bordeaux | #6b2737 | Refrains, moments forts |
| terracotta | #c77a5c | Signalétique |
| navy | #1e2a4a | Bleu nuit sacré |
| teal | #3d7a6b | Teal organique |
| teal-dark | #2a5e51 | Teal foncé |
| teal-light | #6ba595 | Teal clair |

### Statuts

| Rôle | Hex |
|---|---|
| success | #2e6a4f |
| error | #a33030 |
| warning | #b58a17 |
| info | #3a5a80 |

## Polices

### Polices disponibles (paramétrables)

| Police | Style | Cas d'usage |
|---|---|---|
| Système | -apple-system / Roboto | Défaut rapide |
| Open Sans | Sans-serif moderne | Lecture quotidienne |
| Lora | Serif classique | Recueil traditionnel |
| Atkinson Hyperlegible | Accessibilité | Malvoyants, dyslexiques |

### Polices de design (fixes)

| Police | Usage |
|---|---|
| Playfair Display | Titres éditoriaux (splash, accueil) |
| Cormorant Garamond | Taglines italiques |
| Inter | Corps de texte UI |
| Montserrat | Titres app (fallback) |

## Variables CSS (charte.css)

    --p-forest-900    --p-gold-600    --p-cream-50
    --p-forest-800    --p-gold-500    --p-cream-100
    --p-forest-700    --p-gold-400    --p-cream-200
    --p-forest-600    --p-gold-300    --p-white
    --p-forest-500
    --p-forest-400    --p-bordeaux
    --p-forest-300    --p-terracotta
                      --p-navy
                      --p-teal

## Variables sémantiques

### Fonds

    --bg-page              --bg-inverse
    --bg-page-alt          --bg-page-translucent
    --bg-elevated          --bg-elevated-translucent
    --bg-sheet

### Textes

    --text-primary         --text-inverse
    --text-secondary       --text-on-gold
    --text-tertiary

### Bordures et ombres

    --border-soft          --shadow-soft
    --border-strong        --shadow-medium

### Accents sémantiques

    --accent-gold          --hover-teal
    --accent-teal          --hover-teal-light
    --accent-dark          --accent-gold-text

### Statuts

    --status-success       --status-warning
    --status-error         --status-info

## Accessibilité WCAG

La charte a été validée par un audit WCAG sur 26 paires de couleurs.

### Résultat de l'audit

- 0 échec
- 0 avertissement
- Toutes les paires atteignent le niveau AA (>= 4.5:1)

### Paires critiques validées

| Texte | Fond | Ratio |
|---|---|---|
| Texte principal clair | bg-page-alt | 14.52:1 |
| Texte secondaire clair | bg-page-alt | 5.21:1 |
| Texte tertiaire clair | bg-page-alt | 4.55:1 |
| Or en texte clair | bg-page-alt | 5.42:1 |
| Texte principal sombre | bg-page | 13.35:1 |
| Texte secondaire sombre | bg-elevated | 6.26:1 |
| Or en texte sombre | bg-page | 8.96:1 |

### Règles importantes

- L'**or vif** (#b8935a) est réservé aux **icônes et badges** (élément décoratif)
- L'**or accessible en texte** utilise `--accent-gold-text`
  - sur clair : #7d6033
  - sur sombre : #e4c37f
- Le **teal** (#009688) est réservé aux **hovers et icônes**, jamais au texte

## Thème sombre

### Déclenchement

Le thème sombre s'applique via :

1. `body.theme-dark` + `html.theme-dark` (classe CSS)
2. `html[data-theme="dark"]` (attribut)
3. Détection auto via `prefers-color-scheme` si thème = "system"

### Anti-FOUC

Un script inline dans le `<head>` de chaque page lit localStorage
AVANT le premier rendu pour appliquer le thème instantanément.

### Application

Le Service Worker charge les polices et le CSS thème en cache.

## Barre Chrome (mobile)

Le `<meta name="theme-color">` change selon le thème :

- Thème clair : #faf6ec
- Thème sombre : #0b2b24

Mis à jour dynamiquement par `preferences.js` (fonction `updateThemeColor`).

