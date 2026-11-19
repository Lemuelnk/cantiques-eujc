import os
import shutil
import json

base_dir = "android_native"
app_dir = os.path.join(base_dir, "app")
src_main = os.path.join(app_dir, "src", "main")
java_base = os.path.join(src_main, "java", "com", "lnk", "cantiques")

print("🚀 Création de l'arborescence du projet Android natif...")
os.makedirs(os.path.join(java_base, "data"), exist_ok=True)
os.makedirs(os.path.join(java_base, "ui"), exist_ok=True)
os.makedirs(os.path.join(src_main, "assets"), exist_ok=True)
os.makedirs(os.path.join(src_main, "res", "values"), exist_ok=True)
os.makedirs(os.path.join(src_main, "res", "mipmap-anydpi-v26"), exist_ok=True)

# 1. Copie du fichier cantiques.json dans les assets
src_json = "app/data/cantiques.json"
dest_json = os.path.join(src_main, "assets", "cantiques.json")
if os.path.exists(src_json):
    shutil.copy(src_json, dest_json)
    print("✅ cantiques.json copié avec succès dans les assets.")
else:
    print("⚠️ Attention : app/data/cantiques.json introuvable.")

# 2. settings.gradle.kts
with open(os.path.join(base_dir, "settings.gradle.kts"), "w") as f:
    f.write("""pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}
rootProject.name = "CantiquesEUJC"
include(":app")
""")

# 3. build.gradle.kts (racine)
with open(os.path.join(base_dir, "build.gradle.kts"), "w") as f:
    f.write("""plugins {
    id("com.android.application") version "8.2.2" apply false
    id("org.jetbrains.kotlin.android") version "1.9.22" apply false
    id("org.jetbrains.kotlin.plugin.serialization") version "1.9.22" apply false
}
""")

# 4. app/build.gradle.kts
with open(os.path.join(app_dir, "build.gradle.kts"), "w") as f:
    f.write("""plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.serialization")
}

android {
    namespace = "com.lnk.cantiques"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.lnk.cantiques"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_1_8
        targetCompatibility = JavaVersion.VERSION_1_8
    }
    kotlinOptions {
        jvmTarget = "1.8"
    }
    buildFeatures {
        compose = true
    }
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.8"
    }
    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.7.0")
    implementation("androidx.activity:activity-compose:1.8.2")
    implementation(platform("androidx.compose:compose-bom:2024.02.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.3")
}
""")

# 5. AndroidManifest.xml
with open(os.path.join(src_main, "AndroidManifest.xml"), "w") as f:
    f.write("""<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="Cantiques EUJC"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.CantiquesEUJC">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:theme="@style/Theme.CantiquesEUJC">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
""")

# 6. res/values/themes.xml
with open(os.path.join(src_main, "res", "values", "themes.xml"), "w") as f:
    f.write("""<resources>
    <style name="Theme.CantiquesEUJC" parent="android:Theme.Material.Light.NoActionBar" />
</resources>
""")

# 7. Modèle de données : Cantique.kt
with open(os.path.join(java_base, "data", "Cantique.kt"), "w") as f:
    f.write("""package com.lnk.cantiques.data

import kotlinx.serialization.Serializable

@Serializable
data class CantiquesResponse(
    val version: Int,
    val genere_le: String,
    val cantiques: List<Cantique>
)

@Serializable
data class Cantique(
    val id: String,
    val numero_source: String?,
    val versions: List<CantiqueVersion>
)

@Serializable
data class CantiqueVersion(
    val langue: String,
    val titre: String,
    val refrain: List<String>? = null,
    val couplets: List<Couplet>
)

@Serializable
data class Couplet(
    val ordre: Int,
    val lignes: List<String>
)
""")

# 8. Interface Jetpack Compose : MainActivity.kt & UI
with open(os.path.join(java_base, "MainActivity.kt"), "w") as f:
    f.write("""package com.lnk.cantiques

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.lnk.cantiques.data.Cantique
import com.lnk.cantiques.data.CantiquesResponse
import kotlinx.serialization.json.Json
import java.io.BufferedReader
import java.io.InputStreamReader

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        val jsonString = loadJsonFromAsset()
        val cantiquesResponse = jsonString?.let {
            Json { ignoreUnknownKeys = true }.decodeFromString<CantiquesResponse>(it)
        }

        setContent {
            Surface(
                modifier = Modifier.fillMaxSize(),
                color = MaterialTheme.colorScheme.background
            ) {
                CantiquesApp(cantiquesResponse?.cantiques ?: emptyList())
            }
        }
    }

    private fun loadJsonFromAsset(): String? {
        return try {
            val inputStream = assets.open("cantiques.json")
            val reader = BufferedReader(InputStreamReader(inputStream))
            reader.readText()
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CantiquesApp(cantiques: List<Cantique>) {
    var searchQuery by remember { mutableStateOf("") }
    var selectedCantique by remember { mutableStateOf<Cantique?>(null) }

    val filteredCantiques = cantiques.filter { c ->
        val title = c.versions.firstOrNull()?.titre ?: ""
        val num = c.numero_source ?: ""
        title.contains(searchQuery, ignoreCase = true) || num.contains(searchQuery, ignoreCase = true)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(if (selectedCantique == null) "Cantiques EUJC" else "Détail du Cantique") }
            )
        }
    ) { padding ->
        Box(modifier = Modifier.padding(padding)) {
            if (selectedCantique == null) {
                Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
                    OutlinedTextField(
                        value = searchQuery,
                        onValueChange = { searchQuery = it },
                        label = { Text("Rechercher un cantique...") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    LazyColumn(modifier = Modifier.fillMaxSize()) {
                        items(filteredCantiques) { cantique ->
                            val version = cantique.versions.firstOrNull()
                            Card(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 4.dp)
                                    .clickable { selectedCantique = cantique },
                                elevation = CardDefaults.cardElevation(2.dp)
                            ) {
                                Column(modifier = Modifier.padding(16.dp)) {
                                    Text(
                                        text = "N° ${cantique.numero_source ?: "S/N"} - ${version?.titre ?: "Sans titre"}",
                                        style = MaterialTheme.typography.titleMedium
                                    )
                                }
                            }
                        }
                    }
                }
            } else {
                val cantique = selectedCantique!!
                val version = cantique.versions.firstOrNull()
                Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
                    Button(onClick = { selectedCantique = null }) {
                        Text("← Retour à la liste")
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = version?.titre ?: "",
                        style = MaterialTheme.typography.headlineSmall
                    )
                    Text(
                        text = "Source : ${cantique.numero_source ?: "N/A"}",
                        style = MaterialTheme.typography.bodySmall
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    LazyColumn(modifier = Modifier.fillMaxSize()) {
                        version?.refrain?.let { refrainLines ->
                            item {
                                Text(text = "Refrain :", style = MaterialTheme.typography.titleMedium)
                                refrainLines.forEach { ligne ->
                                    Text(text = ligne, style = MaterialTheme.typography.bodyMedium)
                                }
                                Spacer(modifier = Modifier.height(12.dp))
                            }
                        }
                        version?.couplets?.let { coupletsList ->
                            items(coupletsList) { couplet ->
                                Text(text = "Couplet ${couplet.ordre}", style = MaterialTheme.typography.titleSmall)
                                couplet.lignes.forEach { ligne ->
                                    Text(text = ligne, style = MaterialTheme.typography.bodyMedium)
                                }
                                Spacer(modifier = Modifier.height(12.dp))
                            }
                        }
                    }
                }
            }
        }
    }
}
""")

print("✨ Projet Android natif généré avec succès dans le dossier 'android_native/' !")
