package com.lnk.cantiques.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.lnk.cantiques.data.Cantique
import com.lnk.cantiques.data.canonical.CanonicalStats
import com.lnk.cantiques.theme.Palette
import com.lnk.cantiques.ui.components.AppIcon
import com.lnk.cantiques.ui.components.AppIconName

/**
 * Android home screen aligned with the PWA home hierarchy:
 * brand header, welcome and canonical stats, search, quick destinations and recents.
 * Navigation and persistence remain owned by the host.
 */
@Composable
fun HomeScreen(
    cantiques: List<Cantique>,
    canonicalStats: CanonicalStats?,
    recentTitles: List<String>,
    searchQuery: String,
    onSearchQueryChange: (String) -> Unit,
    onSearch: () -> Unit,
    onOpenCatalog: () -> Unit,
    onOpenLessons: () -> Unit,
    onOpenSunday: () -> Unit,
    onOpenPrayers: () -> Unit,
    onOpenFavorites: () -> Unit,
    onOpenSettings: () -> Unit,
    onOpenRecent: (String) -> Unit,
    onViewAllRecent: () -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = MaterialTheme.colorScheme
    val page = colors.background
    val card = colors.surface
    val primaryText = colors.onBackground
    val secondaryText = colors.onSurfaceVariant
    val statsText = canonicalStats?.let {
        "${it.totalHymns} cantiques · ${it.languages} langues · ${it.lessons} leçons"
    } ?: "Votre recueil de cantiques"

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(page)
            .verticalScroll(rememberScrollState())
            .padding(start = 20.dp, end = 20.dp, top = 8.dp, bottom = 112.dp)
    ) {
        // Brand header
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(38.dp)
                    .clip(CircleShape)
                    .background(Palette.forest700),
                contentAlignment = Alignment.Center
            ) {
                Text("EUJC", color = Palette.gold400, fontSize = 9.sp, fontWeight = FontWeight.Bold, letterSpacing = 0.5.sp)
            }
            Spacer(Modifier.width(10.dp))
            Text(
                "Cantiques EUJC",
                modifier = Modifier.weight(1f),
                color = primaryText,
                fontSize = 17.sp,
                fontWeight = FontWeight.Bold
            )
            IconButton(onClick = onOpenFavorites) {
                AppIcon(AppIconName.Heart, contentDescription = "Favoris", tint = secondaryText)
            }
            IconButton(onClick = onOpenSettings) {
                AppIcon(AppIconName.Settings, contentDescription = "Paramètres", tint = secondaryText)
            }
        }

        // Welcome
        Spacer(Modifier.height(26.dp))
        Text(
            "CANTIQUES EUJC",
            color = Palette.gold500,
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 2.sp
        )
        Spacer(Modifier.height(10.dp))
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(
                "Bonjour",
                color = primaryText,
                fontSize = 38.sp,
                lineHeight = 42.sp,
                fontWeight = FontWeight.ExtraBold
            )
            Spacer(Modifier.width(9.dp))
            Text("👋", fontSize = 27.sp)
        }
        Text(
            "Que souhaitez-vous\nchanter aujourd’hui ?",
            color = secondaryText,
            fontSize = 19.sp,
            lineHeight = 27.sp
        )
        Spacer(Modifier.height(9.dp))
        Text(
            statsText,
            color = secondaryText,
            fontSize = 12.sp,
            fontWeight = FontWeight.Medium
        )

        // Search
        Spacer(Modifier.height(22.dp))
        OutlinedTextField(
            value = searchQuery,
            onValueChange = onSearchQueryChange,
            modifier = Modifier.fillMaxWidth().height(60.dp),
            placeholder = { Text("Rechercher par titre, numéro ou mot…", fontSize = 13.sp, maxLines = 1) },
            leadingIcon = {
                AppIcon(AppIconName.Search, contentDescription = "Rechercher", tint = colors.primary)
            },
            singleLine = true,
            keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
            keyboardActions = KeyboardActions(onSearch = { onSearch() }),
            shape = RoundedCornerShape(16.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedContainerColor = card,
                unfocusedContainerColor = card,
                focusedBorderColor = colors.primary,
                unfocusedBorderColor = colors.outlineVariant,
                focusedTextColor = primaryText,
                unfocusedTextColor = primaryText
            )
        )

        // Quick access
        Spacer(Modifier.height(26.dp))
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text("Accès rapides", fontSize = 17.sp, fontWeight = FontWeight.Bold, color = primaryText)
            Text(
                "Toutes les catégories",
                color = Palette.gold500,
                fontSize = 12.sp,
                fontWeight = FontWeight.SemiBold,
                modifier = Modifier.clickable(onClick = onOpenCatalog)
            )
        }
        Spacer(Modifier.height(12.dp))
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(9.dp)
        ) {
            QuickAccessCard(
                title = "Leçons",
                subtitle = "du Chemin",
                icon = AppIconName.BookOpen,
                colors = listOf(Color(0xFF0B5145), Color(0xFF267866)),
                modifier = Modifier.weight(1f),
                onClick = onOpenLessons
            )
            QuickAccessCard(
                title = "Cantiques",
                subtitle = "du Dimanche",
                icon = AppIconName.History,
                colors = listOf(Color(0xFF8A651C), Color(0xFFB58B3C)),
                modifier = Modifier.weight(1f),
                onClick = onOpenSunday
            )
        }
        Spacer(Modifier.height(9.dp))
        QuickAccessCard(
            title = "Cantiques de prière",
            subtitle = null,
            icon = AppIconName.Prayer,
            colors = listOf(Palette.forest800, Palette.forest700),
            modifier = Modifier.fillMaxWidth(),
            wide = true,
            onClick = onOpenPrayers
        )

        // Recents
        Spacer(Modifier.height(28.dp))
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text("Récemment consultés", fontSize = 17.sp, fontWeight = FontWeight.Bold, color = primaryText)
            Text(
                "Voir tout",
                color = Palette.gold500,
                fontSize = 12.sp,
                fontWeight = FontWeight.SemiBold,
                modifier = Modifier.clickable(onClick = onViewAllRecent)
            )
        }
        Spacer(Modifier.height(12.dp))
        if (recentTitles.isEmpty()) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = card),
                elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
            ) {
                Column(Modifier.padding(18.dp)) {
                    Text("Nouveau ici ?", fontWeight = FontWeight.Bold, color = primaryText)
                    Spacer(Modifier.height(5.dp))
                    Text(
                        "Découvrez le parcours biblique en cantiques et explorez les différentes catégories du recueil.",
                        color = secondaryText,
                        fontSize = 13.sp,
                        lineHeight = 19.sp
                    )
                    Spacer(Modifier.height(12.dp))
                    Text(
                        "Explorer les Leçons du Chemin  ›",
                        color = colors.primary,
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp,
                        modifier = Modifier.clickable(onClick = onOpenLessons)
                    )
                }
            }
        } else {
            recentTitles.take(5).forEachIndexed { index, rawTitle ->
                val title = rawTitle.substringAfter(": ", rawTitle)
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 8.dp)
                        .clickable { onOpenRecent(rawTitle) },
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = card),
                    elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(horizontal = 14.dp, vertical = 13.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier.size(40.dp).clip(RoundedCornerShape(12.dp)).background(colors.surfaceVariant),
                            contentAlignment = Alignment.Center
                        ) {
                            Text((index + 1).toString(), color = colors.primary, fontWeight = FontWeight.Bold)
                        }
                        Spacer(Modifier.width(12.dp))
                        Column(Modifier.weight(1f)) {
                            Text(
                                title,
                                color = primaryText,
                                fontWeight = FontWeight.SemiBold,
                                fontSize = 14.sp,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                            Text(
                                rawTitle.substringBefore(":").ifBlank { "Cantique" },
                                color = secondaryText,
                                fontSize = 12.sp
                            )
                        }
                        Text("›", color = secondaryText, fontSize = 24.sp)
                    }
                }
            }
        }
    }
}

@Composable
private fun QuickAccessCard(
    title: String,
    subtitle: String?,
    icon: AppIconName,
    colors: List<Color>,
    modifier: Modifier = Modifier,
    wide: Boolean = false,
    onClick: () -> Unit
) {
    Row(
        modifier = modifier
            .height(if (wide) 74.dp else 84.dp)
            .clip(RoundedCornerShape(18.dp))
            .background(Brush.linearGradient(colors))
            .clickable(onClick = onClick)
            .padding(horizontal = 14.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(if (wide) 42.dp else 36.dp)
                .clip(RoundedCornerShape(12.dp))
                .background(Color.White.copy(alpha = 0.15f)),
            contentAlignment = Alignment.Center
        ) {
            AppIcon(icon, contentDescription = null, tint = Palette.gold400, modifier = Modifier.size(21.dp))
        }
        Spacer(Modifier.width(10.dp))
        Column(Modifier.weight(1f)) {
            Text(title, color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Bold, maxLines = 1)
            if (subtitle != null) {
                Text(subtitle, color = Color.White.copy(alpha = 0.9f), fontSize = 11.sp, maxLines = 1)
            }
        }
        Text("›", color = Color.White, fontSize = 24.sp)
    }
}
