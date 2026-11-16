# Documentation Technique - Cantiques EUJC (Android Natif Kotlin)

## 1. Vue d'ensemble & Philosophie
* **Objectif :** Fournir une application Android native ultra-légère, rapide, et 100 % hors-ligne pour la consultation des cantiques de l'EUJC.
* **Stack technologique :** 
  * **Langage :** Kotlin 1.9+
  * **UI Toolkit :** Jetpack Compose
  * **Parsing :** kotlinx-serialization-json
  * **Stockage :** Fichier JSON local dans les assets.

## 2. Arborescence
android_native/
├── build.gradle.kts
├── settings.gradle.kts
└── app/
    ├── build.gradle.kts
    └── src/main/
        ├── AndroidManifest.xml
        ├── assets/cantiques.json
        └── java/com/lnk/cantiques/
            ├── MainActivity.kt
            └── data/Cantique.kt
