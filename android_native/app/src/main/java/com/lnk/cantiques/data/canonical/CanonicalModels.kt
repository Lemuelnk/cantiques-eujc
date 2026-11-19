package com.lnk.cantiques.data.canonical

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonElement

@Serializable
data class CanonicalCorpus(
    @SerialName("schema_version") val schemaVersion: String? = null,
    @SerialName("corpus_status") val corpusStatus: String? = null,
    val taxonomy: CanonicalTaxonomy? = null,
    val source: CanonicalSource? = null,
    val hymns: List<CanonicalHymn> = emptyList()
)

@Serializable
data class CanonicalTaxonomy(
    val domain: String? = null,
    @SerialName("category_id") val categoryId: String? = null,
    @SerialName("category_label") val categoryLabel: String? = null,
    @SerialName("lesson_id") val lessonId: String? = null,
    @SerialName("lesson_label") val lessonLabel: String? = null
)

@Serializable
data class CanonicalSource(
    val file: String? = null,
    @SerialName("extraction_file") val extractionFile: String? = null
)

@Serializable
data class CanonicalHymn(
    @SerialName("schema_version") val schemaVersion: String? = null,
    val id: String,
    val title: String,
    val status: String? = null,
    val versions: List<CanonicalVersion> = emptyList()
)

@Serializable
data class CanonicalVersion(
    val id: String? = null,
    val language: CanonicalLanguage? = null,
    val title: String? = null,
    val source: CanonicalVersionSource? = null,
    val taxonomy: CanonicalTaxonomy? = null,
    val content: List<CanonicalContentBlock> = emptyList(),
    val media: CanonicalMedia? = null
)

@Serializable
data class CanonicalLanguage(
    val code: String? = null,
    val label: String? = null,
    val status: String? = null,
    val detection: String? = null,
    val score: Int? = null
)

@Serializable
data class CanonicalVersionSource(
    val file: String? = null,
    val position: Int? = null,
    val number: String? = null,
    val section: String? = null,
    val reference: JsonElement? = null,
    @SerialName("updated_from") val updatedFrom: String? = null
)

@Serializable
data class CanonicalContentBlock(
    val id: String? = null,
    val type: String,
    val number: JsonElement? = null,
    val lines: List<String> = emptyList()
)

@Serializable
data class CanonicalMedia(
    @SerialName("audio_present") val audioPresent: Boolean? = null
)

@Serializable
data class CanonicalStats(
    @SerialName("total_hymns") val totalHymns: Int,
    val languages: Int,
    @SerialName("languages_labels") val languageLabels: List<String> = emptyList(),
    val lessons: Int,
    val categories: Int
)
