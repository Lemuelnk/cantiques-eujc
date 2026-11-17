package com.lnk.cantiques.data

import kotlinx.serialization.Serializable

@Serializable
data class PrayerResponse(
    val version: Int,
    val prieres: List<Prayer>
)

@Serializable
data class Prayer(
    val id: String,
    val titre: String,
    val contenu: List<String>
)
