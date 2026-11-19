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
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.lnk.cantiques.data.Cantique
import com.lnk.cantiques.theme.Palette
import com.lnk.cantiques.ui.components.AppIcon
import com.lnk.cantiques.ui.components.AppIconName

/**
 * Native home screen following the structure and content of the PWA home page.
 * Navigation and data ownership remain in the host.
 */
@Composable
fun HomeScreen(
    cantiques: List<Cantique>,
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
    modifier: Modifier = Modifier
) {
    val languageCount = cantiques.flatMap { hymn -> hymn.versions.map { it.langue.lowercase() } }.distinct().size

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Palette.cream100)
            .verticalScroll(rememberScrollState())
            .padding(start = 20.dp, end = 20.dp, top = 12.dp, bottom = 28.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(42.dp)
                    .clip(CircleShape)
                    .background(Palette.forest700),
                contentAlignment = Alignment.Center
            ) {
                Text("EUJC", color = Palette.gold400, fontSize = 10.sp, fontWeight = FontWeight.Bold)
            }
            Spacer(Modifier.width(12.dp))
            Text(
                "Cantiques EUJC",
                modifier = Modifier.weight(1f),
                color = Palette.ink,
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold
            )
            IconButton(onClick = onOpenFavorites) {
                AppIcon(AppIconName.Heart, contentDescription = "Favoris", tint = Palette.ink)
            }
            IconButton(onClick = onOpenSettings) {
                AppIcon(AppIconName.Settings, contentDescription = "Paramètres", tint = Palette.ink)
            }
        }

        Spacer(Modifier.height(34.dp))
        Text(
            "CANTIQUES EUJC",
            color = Palette.gold500,
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 2.sp
        )
        Spacer(Modifier.height(12.dp))
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(
                "Bonjour",
                color = Palette.ink,
                fontSize = 38.sp,
                lineHeight = 44.sp,
                fontWeight = FontWeight.ExtraBold
            )
            Spacer(Modifier.width(10.dp))
            Text("✋", fontSize = 29.sp)
        }
        Text(
            "Que souhaitez-vous\nchanter aujourd’hui ?",
            color = Palette.textSecondaryLight,
            fontSize = 20.sp,
            lineHeight = 29.sp
        )
        Spacer(Modifier.height(10.dp))
        Text(
            "${cantiques.size} cantiques · ${languageCount} langues · 21 leçons",
            color = Palette.textTertiaryLight,
            fontSize = 13.sp,
            fontWeight = FontWeight.Medium
        )

        Spacer(Modifier.height(26.dp))
        OutlinedTextField(
            value = searchQuery,
            onValueChange = onSearchQueryChange,
            modifier = Modifier.fillMaxWidth().clickable { onSearch() },
            placeholder = { Text("Rechercher par titre, numéro ou mot…") },
            leadingIcon = {
                AppIcon(AppIconName.History, contentDescription = "Rechercher", tint = Palette.forest700)
            },
            singleLine = true,
            shape = RoundedCornerShape(16.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedContainerColor = Color.White,
                unfocusedContainerColor = Color.White,
                focusedBorderColor = Palette.forest500,
                unfocusedBorderColor = Palette.borderSoftLight
            )
        )

        Spacer(Modifier.height(28.dp))
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text("Accès rapides", fontSize = 17.sp, fontWeight = FontWeight.Bold, color = Palette.ink)
            Text(
                "Toutes les catégories",
                color = Palette.gold500,
                fontSize = 13.sp,
                fontWeight = FontWeight.SemiBold,
                modifier = Modifier.clickable(onClick = onOpenCatalog)
            )
        }
        Spacer(Modifier.height(12.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            QuickAccessCard(
                title = "Leçons",
                subtitle = "du Chemin",
                icon = AppIconName.BookOpen,
                colors = listOf(Color(0xFF00695C), Color(0xFF008F80)),
                modifier = Modifier.weight(1f),
                onClick = onOpenLessons
            )
            QuickAccessCard(
                title = "Cantiques",
                subtitle = "du Dimanche",
                icon = AppIconName.History,
                colors = listOf(Color(0xFF9B7414), Color(0xFFC49728)),
                modifier = Modifier.weight(1f),
                onClick = onOpenSunday
            )
        }
        Spacer(Modifier.height(10.dp))
        QuickAccessCard(
            title = "Cantiques de prière",
            subtitle = null,
            icon = AppIconName.Prayer,
            colors = listOf(Palette.forest700, Palette.forest700),
            modifier = Modifier.fillMaxWidth(),
            onClick = onOpenPrayers,
            wide = true
        )

        Spacer(Modifier.height(30.dp))
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text("Récemment consultés", fontSize = 17.sp, fontWeight = FontWeight.Bold, color = Palette.ink)
            Text(
                "Voir tout",
                color = Palette.gold500,
                fontSize = 13.sp,
                fontWeight = FontWeight.SemiBold,
                modifier = Modifier.clickable(onClick = onOpenRecent)
            )
        }
        Spacer(Modifier.height(12.dp))
        if (recentTitles.isEmpty()) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White)
            ) {
                Column(Modifier.padding(18.dp)) {
                    Text("Nouveau ici ?", fontWeight = FontWeight.Bold, color = Palette.ink)
                    Spacer(Modifier.height(5.dp))
                    Text(
                        "Découvrez les cantiques et les Leçons du Chemin.",
                        color = Palette.textSecondaryLight,
                        fontSize = 13.sp
                    )
                    Spacer(Modifier.height(12.dp))
                    Text(
                        "Explorer les Leçons du Chemin  ›",
                        color = Palette.forest700,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.clickable(onClick = onOpenLessons)
                    )
                }
            }
        } else {
            recentTitles.take(5).forEachIndexed { index, rawTitle ->
                val title = rawTitle.substringAfter(": ", rawTitle)
                Card(
                    modifier = Modifier.fillMaxWidth().padding(bottom = 9.dp).clickable { onOpenRecent(rawTitle) },
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(13.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier.size(42.dp).clip(RoundedCornerShape(12.dp)).background(Palette.cream50),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = (index + 1).toString(),
                                color = Palette.forest500,
                                fontWeight = FontWeight.Bold
                            )
                        }
                        Spacer(Modifier.width(12.dp))
                        Column(Modifier.weight(1f)) {
                            Text(title, color = Palette.ink, fontWeight = FontWeight.SemiBold, fontSize = 14.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                            Text(rawTitle.substringBefore(":").ifBlank { "Cantique" }, color = Palette.textSecondaryLight, fontSize = 12.sp)
                        }
                        Text("›", color = Palette.textTertiaryLight, fontSize = 24.sp)
                    }
                }
            }
        }
        Spacer(Modifier.height(12.dp))
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
            .padding(horizontal = 16.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        if (wide) {
            Box(
                modifier = Modifier.size(44.dp).clip(RoundedCornerShape(12.dp)).background(Color.White.copy(alpha = 0.16f)),
                contentAlignment = Alignment.Center
            ) {
                AppIcon(icon, contentDescription = null, tint = Palette.gold400, modifier = Modifier.size(23.dp))
            }
            Spacer(Modifier.width(12.dp))
        } else {
            AppIcon(icon, contentDescription = null, tint = Color.White, modifier = Modifier.size(23.dp))
            Spacer(Modifier.width(12.dp))
        }
        Column(Modifier.weight(1f)) {
            Text(title, color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Bold, maxLines = 1)
            if (subtitle != null) {
                Text(subtitle, color = Color.White.copy(alpha = 0.9f), fontSize = 11.sp)
            }
        }
        Text("›", color = Color.White, fontSize = 25.sp)
    }
}
