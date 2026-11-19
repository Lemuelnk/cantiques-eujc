package com.lnk.cantiques.ui.components

import androidx.annotation.DrawableRes
import androidx.compose.material3.Icon
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.DefaultTintColor
import androidx.compose.ui.platform.LocalContentColor
import androidx.compose.ui.res.painterResource
import com.lnk.cantiques.R

/**
 * Central Lucide icon vocabulary used by the native app.
 * SVG artwork is bundled as Android VectorDrawable resources.
 */
enum class AppIconName(
    @DrawableRes val outlinedRes: Int,
    @DrawableRes val filledRes: Int = outlinedRes
) {
    Music(R.drawable.ic_lucide_audio_lines),
    Heart(R.drawable.ic_lucide_heart, R.drawable.ic_lucide_heart_filled),
    BookOpen(R.drawable.ic_lucide_book_open),
    Prayer(R.drawable.ic_lucide_hand_heart),
    History(R.drawable.ic_lucide_clock),
    Settings(R.drawable.ic_lucide_settings)
}

@Composable
fun AppIcon(
    name: AppIconName,
    contentDescription: String?,
    modifier: Modifier = Modifier,
    tint: Color = LocalContentColor.current,
    filled: Boolean = false
) {
    Icon(
        painter = painterResource(if (filled) name.filledRes else name.outlinedRes),
        contentDescription = contentDescription,
        modifier = modifier,
        tint = tint
    )
}
