package com.lnk.cantiques.data

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
