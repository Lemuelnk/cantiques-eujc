import os

readme_path = "android_native/README.md"
readme_content = """# Documentation Technique - Cantiques EUJC (Android Natif Kotlin)

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
"""

with open(readme_path, "w", encoding="utf-8") as f:
    f.write(readme_content)

os.makedirs(".github/workflows", exist_ok=True)
workflow_path = ".github/workflows/android-build.yml"
workflow_content = """name: Build Android App (Kotlin)

on:
  push:
    branches: [ "main", "master" ]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: android_native

    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-java@v4
      with:
        distribution: 'temurin'
        java-version: '17'
        cache: gradle
    - name: Run assembleDebug
      run: ./gradlew assembleDebug
    - uses: actions/upload-artifact@v4
      with:
        name: app-debug-apk
        path: android_native/app/build/outputs/apk/debug/app-debug.apk
"""

with open(workflow_path, "w", encoding="utf-8") as f:
    f.write(workflow_content)

print("Fichiers du projet écrits avec succès !")
