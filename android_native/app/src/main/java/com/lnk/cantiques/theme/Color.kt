package com.lnk.cantiques.theme

import androidx.compose.ui.graphics.Color

// ========== PALETTE BRUTE (alignée sur app/charte.css) ==========
object Palette {
    // Forest
    val forest500 = Color(0xFF2D5F4F) // mousse
    val forest700 = Color(0xFF14392E) // institutionnel
    val forest800 = Color(0xFF0B2B24) // fond page sombre
    val forest900 = Color(0xFF081F19) // le plus sombre

    // Teal organique — accents de la charte PWA
    val teal = Color(0xFF3D7A6B)
    val tealDark = Color(0xFF2A5E51)
    val tealLight = Color(0xFF6BA595)

    // Gold
    val gold400 = Color(0xFFE4C37F) // or clair
    val gold500 = Color(0xFFB8935A) // or principal patiné

    // Cream
    val cream50 = Color(0xFFF2EFE6)
    val cream100 = Color(0xFFFAF6EC)
    val cream200 = Color(0xFFEDE7D8)

    // Neutres
    val white = Color(0xFFFFFFFF)
    val ink = Color(0xFF1A1F1D)
    val inkInverse = Color(0xFFF5F0E6)

    // Sémantique light
    val textPrimaryLight = ink
    val textSecondaryLight = Color(0xFF5A6660)
    val textTertiaryLight = Color(0xFF676E69)
    val textInverse = Color(0xFFF5F0E6)
    val borderSoftLight = Color(0x1414392E) // rgba(20,57,46,0.08)
    val shadowSoftLight = Color(0x14081F19) // rgba(8,31,25,0.08)

    // Sémantique dark
    val textPrimaryDark = Color(0xFFF5F0E6)
    val textSecondaryDark = Color(0xFFB0B8B3)
    val textTertiaryDark = Color(0xFF96A19C)
    val borderSoftDark = Color(0x14F5F0E6) // rgba(245,240,230,0.08)
    val shadowSoftDark = Color(0x4D000000) // rgba(0,0,0,0.3)
}
