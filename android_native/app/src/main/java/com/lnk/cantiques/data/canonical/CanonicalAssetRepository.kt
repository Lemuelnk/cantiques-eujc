package com.lnk.cantiques.data.canonical

import android.content.res.AssetManager
import kotlinx.serialization.json.Json
import java.io.BufferedReader
import java.io.InputStreamReader

/**
 * Read-only access to the exact canonical JSON assets used by the PWA.
 * Files are loaded on demand so the app does not parse the entire hymnbook at startup.
 */
class CanonicalAssetRepository(
    private val assets: AssetManager
) {
    private val json = Json {
        ignoreUnknownKeys = true
        isLenient = true
        coerceInputValues = true
    }

    fun loadCategory(categoryId: String): CanonicalCorpus? {
        val category = CanonicalCategoryCatalog.byId[categoryId] ?: return null
        return load(category.assetName)
    }

    fun loadAllCategories(): Map<String, CanonicalCorpus> =
        CanonicalCategoryCatalog.categories.mapNotNull { category ->
            loadCategory(category.id)?.let { category.id to it }
        }.toMap()

    fun loadStats(): CanonicalStats? = load("stats.json")

    private inline fun <reified T> load(assetPath: String): T? = try {
        assets.open(assetPath).use { input ->
            BufferedReader(InputStreamReader(input, Charsets.UTF_8)).use { reader ->
                json.decodeFromString<T>(reader.readText())
            }
        }
    } catch (exception: Exception) {
        android.util.Log.e("CanonicalAssets", "Unable to load $assetPath", exception)
        null
    }
}
