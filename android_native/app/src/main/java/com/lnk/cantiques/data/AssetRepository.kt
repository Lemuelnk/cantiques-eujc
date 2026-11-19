package com.lnk.cantiques.data

import android.content.res.AssetManager
import kotlinx.serialization.json.Json
import java.io.BufferedReader
import java.io.InputStreamReader

/**
 * Centralise le chargement et le décodage des fichiers JSON embarqués.
 * Les modèles restent dans le package data et l'Activity ne gère plus les flux.
 */
class AssetRepository(
    private val assets: AssetManager
) {
    private val json = Json { ignoreUnknownKeys = true }

    fun loadCantiques(): CantiquesResponse? = load("cantiques.json")
    fun loadLesson(): LessonResponse? = load("lesson-1-creation.json")
    fun loadPrayers(): PrayerResponse? = load("prieres.json")

    private inline fun <reified T> load(fileName: String): T? {
        return try {
            assets.open(fileName).use { input ->
                BufferedReader(InputStreamReader(input)).use { reader ->
                    json.decodeFromString<T>(reader.readText())
                }
            }
        } catch (exception: Exception) {
            exception.printStackTrace()
            null
        }
    }
}
