# Android / PWA parity audit

Date: 2026-11-19
Reference: current `app/` implementation on `main`

## Executive finding

The native application should not be treated as a visual reskin of its current catalogue screen. The PWA is a multi-screen product with four primary destinations, 37 canonical content categories, shared persistence rules, a reusable design system, and a richer hymn-detail/search experience.

The largest architectural gap is data, not styling: Android currently loads the legacy `cantiques.json`, one lesson JSON, and one prayer JSON. The PWA's canonical repository contains 37 JSON corpora under `app/data/canonical/`, accessed through `canonical-data.js`. The Android legacy models (`langue`, `titre`, `refrain`, `couplets`) do not represent the canonical PWA schema (`language`, `source.number`, ordered `content` blocks, taxonomy, etc.).

## PWA structure observed

### Shared application shell

- `charte.css`: source palette and semantic light/dark tokens.
- `fonts.css`: Open Sans (default UI), Lora (hymn reading), Atkinson Hyperlegible (accessibility), and a system fallback. The settings UI can change the active family.
- `style.css`: home layout, shared brand header, cards, recent items, interactions, desktop constraints, safe-area support.
- `bottom-nav.js` + `bottom-nav.css`: four persistent destinations: Accueil, Recherche, Bibliothèque, Plus. The active destination is inferred from the current page.
- `preferences.js`: theme, font family and text scale persisted in localStorage.
- `storage.js`: favorites and recents persisted as records containing `id`, `category`, and timestamp. Recents are capped at 20 and old string entries are migrated.
- Lucide icons are rendered from the bundled `vendor/lucide.min.js`.

### Main destinations and screens

1. **Accueil** — `index.html`, `app.js`
   - Brand logo and app name; quick links to favorites and settings.
   - Welcome block, corpus statistics, search entry, three quick-access cards, recent hymns.
   - Recent items are resolved by both hymn ID and category, not by title alone.
2. **Recherche** — `recherche.html`, `recherche.js`
   - Builds a search index across all 37 canonical categories.
   - Search modes: all fields, title, content.
   - Accent-insensitive normalization and highlighted matches.
   - Filters for category, lesson and language, presented in bottom sheets/pickers.
   - Debounced input (150 ms).
3. **Bibliothèque** — `categories.html`, `categories.js`
   - Groups content into Leçons du Chemin, Cantiques du Dimanche, Cantiques de prière, and Cantiques à classer.
   - Child screens: `lessons.html`, `dimanche.html`, `priere.html`, `a-classer.html`, category hymn lists.
4. **Plus** — `plus.html`, `plus.js`
   - Favorites, history, settings, share app, report, contribution, about/community links.
   - Favorites and history are separate content screens.
   - Settings include light/dark/system theme, four font choices, and text scaling.

### Content screens

- **Category hymn list** — `cantiques.html`, `cantiques.js`: category title/count, search panel, sort sheet (source order, alphabetical, favorites), favorite toggles, empty state.
- **Hymn detail** — `cantique.html`, `cantique.js`: language/version tabs, typed content blocks, favorite, previous/next within the corpus, reading mode, text-size/font sheet, report flow, share.
- **Share experience** — `share/share-ui.js` and `share-image.js`: share text/link, or generate a designed image with 8 aspect ratios and 4 visual themes.
- **Favorites/history** — dedicated screens with empty/loading states, counts, ordering and clear/remove actions.
- **Secondary utility pages** — about, contribute, report, splash/offline, unclassified hymns.

## PWA design tokens and measurements

Source: `charte.css`, `fonts.css`, `style.css`, `bottom-nav.css`.

### Palette

- Forest: `#081F19`, `#0B2B24`, `#14392E`, `#2D5F4F`.
- Gold: `#B8935A`, `#E4C37F`.
- Cream: `#F2EFE6`, `#FAF6EC`, `#EDE7D8`.
- Ink: `#1A1F1D`; teal accents: `#3D7A6B`, `#2A5E51`, `#6BA595`.
- Semantic tokens change under dark theme; components should use semantic colors rather than hardcoded light colors.

### Home geometry

- Header: 68 px, horizontal padding 20 px; round logo 38 px.
- Home content: 24 px top, 20 px horizontal, 110 px bottom padding for fixed navigation.
- Welcome title: 40 px, line-height 1.05; supporting copy 20 px / 1.45.
- Search: 56 px high, 16 px radius, 18 px horizontal padding.
- Quick cards: two-column grid, 9 px gap; standard card minimum height 84 px and 18 px radius; full-width prayer card minimum height 74 px.
- Recent item: minimum height 72 px, 16 px radius, 12–14 px padding.
- Bottom navigation: fixed, four equal columns, 66 px plus bottom safe-area inset; 7 px top padding.

### Responsive behavior

- Content pages generally cap at 680 px on wider screens.
- Home shell has wider-screen rules and safe-area padding.
- Native implementation should support Android edge-to-edge insets and scroll content above a fixed bottom bar without overlap.

## Data model and repository gap

PWA canonical data is stored in 37 files under `app/data/canonical/`:
- 21 lesson categories
- 7 Sunday categories
- 4 prayer categories
- 5 unclassified-language categories

The PWA's canonical hymn shape includes:
- hymn `id`, title/status, versions;
- per-version language code/label/status;
- source file, position, number and taxonomy;
- ordered content blocks (verse, refrain, comment, etc.) with lines and optional numbering.

Important identity rule in the canonical data: a source hymn number is not a globally unique identity. Persist favorites/history using the stable hymn ID plus category ID. Never use source number as the database key.

PWA stats are supplied by `app/data/stats.json` (1755 hymns, 4 languages, 21 lessons, 37 categories). The home UI should read this data instead of embedding counts in Kotlin.

## Android refactor target

Suggested package boundaries:

```
com.lnk.cantiques/
  MainActivity.kt                 # Activity, theme, root host only
  navigation/
    AppDestination.kt
    AppNavHost.kt
    AppBottomNavigation.kt
  data/
    canonical/
      CanonicalModels.kt
      CanonicalAssetRepository.kt
      CategoryCatalog.kt
      AppStatistics.kt
    local/
      PreferencesRepository.kt
      LibraryStorage.kt
  theme/
    Color.kt
    Type.kt
    Theme.kt
  ui/
    components/                    # shared cards, headers, search, sheets
    screens/
      HomeScreen.kt
      SearchScreen.kt
      LibraryScreen.kt
      CategoriesScreen.kt
      LessonsScreen.kt
      SundayScreen.kt
      PrayerCategoriesScreen.kt
      HymnListScreen.kt
      HymnDetailScreen.kt
      FavoritesScreen.kt
      HistoryScreen.kt
      MoreScreen.kt
      SettingsScreen.kt
```

### Implementation order

1. **Stabilize build** — remove the invalid explicit Compose `weight` import from `HomeScreen.kt`; wait for CI before merging the fix.
2. **Canonical data foundation** — port all 37 canonical JSON files and `stats.json` to Android assets; implement canonical Kotlin models and repository; verify counts and category loading.
3. **Navigation shell** — implement four PWA destinations and nested destinations, with proper back stack and selected-tab behavior.
4. **Design system parity** — map semantic PWA tokens to Compose color schemes, use bundled Open Sans/Lora/Atkinson fonts, match dimensions, safe areas, typography, cards and sheets.
5. **Home parity** — use actual PWA logo asset; dynamic stats; search handoff; exact quick-access destinations; recent item resolution by ID+category.
6. **Library parity** — categories grouped by the four PWA groups; category lists and source-order behavior.
7. **Search parity** — 37-category index, accent-insensitive title/content search, modes, filters and result navigation.
8. **Reading/detail parity** — language tabs, typed content blocks, favorite/history, previous/next, reading controls, share and report.
9. **Persistence/settings parity** — theme (light/dark/system), font, scale, favorites and recents; migrate current SharedPreferences carefully.
10. **Verification** — CI build, data-integrity checks, navigation tests, then install on a physical device and compare screenshots.

## Current native limitations confirmed

- `MainActivity.kt` owns most navigation, state and screen rendering.
- Native data currently loads only the legacy hymn JSON, the Creation lesson JSON and prayers; it does not load the 37 canonical corpora.
- Current Kotlin hymn models cannot decode the PWA canonical structure without a dedicated model layer.
- The native detail view has no language-tab/canonical content-block parity, image-share flow, previous/next corpus navigation, reading mode or PWA font/scale controls.
- The recent list currently stores display titles, whereas the PWA stores stable IDs with category and timestamps.
- The previous home-screen PR added a first visual scaffold, but did not solve the canonical data and complete navigation gaps.

## Validation notes

The post-merge Android workflow for commit `25232edb8765f6064455cd8c7536c2979764e58a` failed at Kotlin compilation. The reported error is:

```
HomeScreen.kt:16:43 Cannot access 'weight':
it is internal in 'androidx.compose.foundation.layout'
```

The cause is the direct import of `androidx.compose.foundation.layout.weight`; remove that import while retaining the scoped `Modifier.weight(...)` calls inside Row/Column content lambdas. A separate fix PR (#67) has been opened; its Android workflow must pass before merge.

This document records source-derived structure and a proposed implementation plan. It does not claim that the native application already has feature parity.
