package com.lnk.cantiques.ui.components

import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable

/**
 * Four primary destinations, matching the PWA navigation model.
 * The host owns the selected destination and nested navigation state.
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
            icon = { AppIcon(AppIconName.Home, contentDescription = "Accueil") },
            label = { Text("Accueil") },
            selected = selectedTab == 0,
            onClick = { onTabSelected(0) }
        )
        NavigationBarItem(
            icon = { AppIcon(AppIconName.Search, contentDescription = "Recherche") },
            label = { Text("Recherche") },
            selected = selectedTab == 1,
            onClick = { onTabSelected(1) }
        )
        NavigationBarItem(
            icon = { AppIcon(AppIconName.Library, contentDescription = "Bibliothèque") },
            label = { Text("Bibliothèque") },
            selected = selectedTab == 2,
            onClick = { onTabSelected(2) }
        )
        NavigationBarItem(
            icon = { AppIcon(AppIconName.More, contentDescription = "Plus") },
            label = { Text("Plus") },
            selected = selectedTab == 3,
            onClick = { onTabSelected(3) }
        )
    }
}
