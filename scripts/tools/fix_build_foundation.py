import os

res_dir = "android_native/app/src/main/res"
os.makedirs(os.path.join(res_dir, "drawable"), exist_ok=True)
os.makedirs(os.path.join(res_dir, "mipmap-anydpi-v26"), exist_ok=True)

# 1. Fond vectoriel de l'icône
with open(os.path.join(res_dir, "drawable", "ic_launcher_background.xml"), "w", encoding="utf-8") as f:
    f.write("""<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path
        android:fillColor="#1B4332"
        android:pathData="M0,0h108v108h-108z" />
</vector>
""")

# 2. Premier plan vectoriel (note / livre stylisé)
with open(os.path.join(res_dir, "drawable", "ic_launcher_foreground.xml"), "w", encoding="utf-8") as f:
    f.write("""<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path
        android:fillColor="#F8F5EE"
        android:pathData="M36,30h36c2.2,0 4,1.8 4,4v40c0,2.2 -1.8,4 -4,4H36c-2.2,0 -4,-1.8 -4,-4V34C32,31.8 33.8,30 36,30zM40,42v4h28v-4H40zM40,52v4h28v-4H40zM40,62v4h18v-4H40z" />
</vector>
""")

# 3. Déclarations Adaptive Icon (standard + round)
adaptive_xml = """<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@drawable/ic_launcher_background" />
    <foreground android:drawable="@drawable/ic_launcher_foreground" />
</adaptive-icon>
"""

with open(os.path.join(res_dir, "mipmap-anydpi-v26", "ic_launcher.xml"), "w", encoding="utf-8") as f:
    f.write(adaptive_xml)

with open(os.path.join(res_dir, "mipmap-anydpi-v26", "ic_launcher_round.xml"), "w", encoding="utf-8") as f:
    f.write(adaptive_xml)

# 4. Mise à jour du workflow GitHub Actions (sans dépendre de ./gradlew)
os.makedirs(".github/workflows", exist_ok=True)
with open(".github/workflows/android-build.yml", "w", encoding="utf-8") as f:
    f.write("""name: Build Android App (Kotlin)

on:
  push:
    branches: [ "main", "master" ]
    paths:
      - 'android_native/**'
      - '.github/workflows/android-build.yml'
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: android_native

    steps:
    - name: Checkout repository
      uses: actions/checkout@v4

    - name: Set up JDK 17
      uses: actions/setup-java@v4
      with:
        distribution: 'temurin'
        java-version: '17'

    - name: Setup Gradle
      uses: gradle/actions/setup-gradle@v4
      with:
        gradle-version: '8.5'

    - name: Build Debug APK
      run: gradle assembleDebug --no-daemon

    - name: Upload APK Artifact
      uses: actions/upload-artifact@v4
      with:
        name: cantiques-eujc-debug-apk
        path: android_native/app/build/outputs/apk/debug/app-debug.apk
""")

print("✅ Icônes Android générées et workflow GitHub Actions sécurisé.")
