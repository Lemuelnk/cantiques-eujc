import java.util.Properties
import java.io.FileInputStream

val keystoreProperties = Properties()
val keystorePropertiesFile = rootProject.file("key.properties")
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(FileInputStream(keystorePropertiesFile))
}

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.serialization")
}

val generatedCanonicalAssetsDir = layout.buildDirectory.dir("generated/canonicalAssets")

val syncCanonicalAssets by tasks.registering(Sync::class) {
    from(rootProject.file("../app/data/canonical")) {
        into("canonical")
    }
    from(rootProject.file("../app/data/stats.json"))
    into(generatedCanonicalAssetsDir)
}

val validateCanonicalAssets by tasks.registering {
    dependsOn(syncCanonicalAssets)

    doLast {
        val generatedRoot = generatedCanonicalAssetsDir.get().asFile
        val canonicalDir = generatedRoot.resolve("canonical")
        check(canonicalDir.isDirectory) {
            "Canonical asset directory is missing: ${canonicalDir.absolutePath}"
        }

        val corpusFiles = canonicalDir.listFiles()
            ?.filter { it.isFile && it.extension == "json" }
            .orEmpty()
        check(corpusFiles.size == 37) {
            "Expected 37 canonical corpus files, found ${corpusFiles.size}"
        }

        val parser = groovy.json.JsonSlurper()
        corpusFiles.forEach { file ->
            val corpus = parser.parse(file) as? Map<*, *>
                ?: error("Invalid canonical corpus JSON: ${file.name}")
            check(corpus["hymns"] is List<*>) {
                "Missing hymns array in ${file.name}"
            }
            val taxonomy = corpus["taxonomy"] as? Map<*, *>
            val categoryId = taxonomy?.get("category_id") as? String
            check(categoryId == file.nameWithoutExtension) {
                "Category ID mismatch in ${file.name}: ${categoryId ?: "missing"}"
            }
        }

        val statsFile = generatedRoot.resolve("stats.json")
        check(statsFile.isFile) { "Canonical stats.json is missing" }
        val stats = parser.parse(statsFile) as? Map<*, *>
            ?: error("Invalid canonical stats.json")
        check((stats["categories"] as? Number)?.toInt() == 37) {
            "stats.json must declare 37 categories"
        }
        check((stats["total_hymns"] as? Number)?.toInt() == 1755) {
            "Unexpected total_hymns in stats.json"
        }
        check((stats["languages"] as? Number)?.toInt() == 4) {
            "Unexpected language count in stats.json"
        }
    }
}

tasks.named("preBuild").configure {
    dependsOn(validateCanonicalAssets)
}

android {
    signingConfigs {
        create("release") {
            if (keystorePropertiesFile.exists()) {
                keyAlias = keystoreProperties["keyAlias"] as String
                keyPassword = keystoreProperties["keyPassword"] as String
                storeFile = file(keystoreProperties["storeFile"] as String)
                storePassword = keystoreProperties["storePassword"] as String
            }
        }
    }

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
            signingConfig = if (keystorePropertiesFile.exists()) {
                signingConfigs.getByName("release")
            } else {
                signingConfigs.getByName("debug")
            }
        }
    }
    sourceSets {
        getByName("main") {
            // Canonical assets are generated under a dedicated namespace to avoid
            // collisions with legacy files in src/main/assets.
            assets.srcDir(layout.buildDirectory.dir("generated/canonicalAssets"))
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

    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.test:runner:1.5.2")
}
