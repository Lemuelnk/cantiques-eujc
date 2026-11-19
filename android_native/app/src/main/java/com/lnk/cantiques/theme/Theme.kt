package com.lnk.cantiques.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// ========== SCHEMA LIGHT (aligné sur :root de charte.css) ==========
private val LightColors = lightColorScheme(
    primary = Palette.forest700,
    onPrimary = Palette.inkInverse,
    primaryContainer = Palette.forest500,
    onPrimaryContainer = Palette.inkInverse,

    secondary = Palette.gold500,
    onSecondary = Palette.ink,
    secondaryContainer = Palette.gold400,
    onSecondaryContainer = Palette.ink,

    background = Palette.cream50,
    onBackground = Palette.ink,

    surface = Palette.white,
    onSurface = Palette.ink,
    surfaceVariant = Palette.cream100,
    onSurfaceVariant = Palette.textSecondaryLight,

    outline = Palette.borderSoftLight,
    outlineVariant = Palette.cream200,

    error = Color(0xFFB00020),
    onError = Palette.white
)

// ========== SCHEMA DARK (aligné sur [data-theme=dark]) ==========
private val DarkColors = darkColorScheme(
    primary = Palette.gold400,
    onPrimary = Palette.forest900,
    primaryContainer = Palette.gold500,
    onPrimaryContainer = Palette.forest900,

    secondary = Palette.forest500,
    onSecondary = Palette.inkInverse,
    secondaryContainer = Palette.forest700,
    onSecondaryContainer = Palette.inkInverse,

    background = Palette.forest800,
    onBackground = Palette.textPrimaryDark,

    surface = Palette.forest700,
    onSurface = Palette.textPrimaryDark,
    surfaceVariant = Palette.forest900,
    onSurfaceVariant = Palette.textSecondaryDark,

    outline = Palette.borderSoftDark,
    outlineVariant = Palette.forest900,

    error = Color(0xFFCF6679),
    onError = Palette.forest900
)

// ========== COMPOSABLE THEME ==========
@Composable
fun CantiquesEujcTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = if (darkTheme) DarkColors else LightColors,
        typography = CantiquesTypography,
        content = content
    )
}
