package com.lnk.cantiques.data

import kotlinx.serialization.Serializable

@Serializable
data class LessonResponse(
    val category: String,
    val subcategory: String? = null,
    val lesson: LessonInfo,
    val hymns: List<LessonHymn> = emptyList()
)

@Serializable
data class LessonInfo(
    val number: Int,
    val title: String
)

@Serializable
data class LessonHymn(
    val id: String,
    val source_position: Int = 0,
    val source_number: String,
    val title: String,
    val status: String? = null,
    val audio_present: Boolean = false,
    val content: LessonHymnContent,
    val notes_extraction: List<String> = emptyList()
)

@Serializable
data class LessonHymnContent(
    val sections: List<LessonSection> = emptyList()
)

@Serializable
data class LessonSection(
    val type: String,
    val text: String
)
