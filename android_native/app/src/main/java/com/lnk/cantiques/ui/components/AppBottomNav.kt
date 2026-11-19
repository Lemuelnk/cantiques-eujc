package com.lnk.cantiques.ui.components

import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable

/**
 * Main app navigation. The host owns the selected tab and visibility rules.
 */
@Composable
fun AppBottomNav(
    selectedTab: Int,
    visible: Boolean,
    onTabSelected: (Int) -> Unit
) {
    if (!visible) return

    NavigationBar {
        NavigationBarItem(
            icon = { AppIcon(AppIconName.Music, contentDescription = "Tous") },
            label = { Text("Tous") },
            selected = selectedTab == 0,
            onClick = { onTabSelected(0) }
        )
        NavigationBarItem(
            icon = { AppIcon(AppIconName.Heart, contentDescription = "Favoris", filled = true) },
            label = { Text("Favoris") },
            selected = selectedTab == 1,
            onClick = { onTabSelected(1) }
        )
        NavigationBarItem(
            icon = { AppIcon(AppIconName.BookOpen, contentDescription = "Leçons") },
            label = { Text("Leçons") },
            selected = selectedTab == 2,
            onClick = { onTabSelected(2) }
        )
        NavigationBarItem(
            icon = { AppIcon(AppIconName.Prayer, contentDescription = "Prières") },
            label = { Text("Prières") },
            selected = selectedTab == 3,
            onClick = { onTabSelected(3) }
        )
        NavigationBarItem(
            icon = { AppIcon(AppIconName.History, contentDescription = "Historique") },
            label = { Text("Historique") },
            selected = selectedTab == 4,
            onClick = { onTabSelected(4) }
        )
        NavigationBarItem(
            icon = { AppIcon(AppIconName.Settings, contentDescription = "Paramètres") },
            label = { Text("Réglages") },
            selected = selectedTab == 5,
            onClick = { onTabSelected(5) }
        )
    }
}
