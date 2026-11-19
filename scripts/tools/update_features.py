import os

main_activity_path = "android_native/app/src/main/java/com/lnk/cantiques/MainActivity.kt"

code_content = """package com.lnk.cantiques

import android.content.Context
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.lnk.cantiques.data.Cantique
import com.lnk.cantiques.data.CantiquesResponse
import kotlinx.serialization.json.Json
import java.io.BufferedReader
import java.io.InputStreamReader

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        val jsonString = loadJsonFromAsset()
        val cantiquesResponse = jsonString?.let {
            Json { ignoreUnknownKeys = true }.decodeFromString<CantiquesResponse>(it)
        }

        val sharedPrefs = getSharedPreferences("cantiques_prefs", Context.MODE_PRIVATE)

        setContent {
            Surface(
                modifier = Modifier.fillMaxSize(),
                color = MaterialTheme.colorScheme.background
            ) {
                CantiquesApp(
                    cantiques = cantiquesResponse?.cantiques ?: emptyList(),
                    sharedPrefs = sharedPrefs
                )
            }
        }
    }

    private fun loadJsonFromAsset(): String? {
        return try {
            val inputStream = assets.open("cantiques.json")
            val reader = BufferedReader(InputStreamReader(inputStream))
            reader.readText()
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CantiquesApp(cantiques: List<Cantique>, sharedPrefs: android.content.SharedPreferences) {
    var searchQuery by remember { mutableStateOf("") }
    var selectedTab by remember { mutableIntStateOf(0) } // 0: Tous, 1: Favoris
    var selectedLanguage by remember { mutableStateOf("fr") } // Langue par défaut
    var selectedCantique by remember { mutableStateOf<Cantique?>(null) }

    // Charger les favoris depuis SharedPreferences
    var favoriteIds by remember {
        mutableStateOf(
            sharedPrefs.getStringSet("favorites", emptySet()) ?: emptySet()
        )
    }

    fun toggleFavorite(id: String) {
        favoriteIds = if (favoriteIds.contains(id)) {
            favoriteIds - id
        } else {
            favoriteIds + id
        }
        sharedPrefs.edit().putStringSet("favorites", favoriteIds).apply()
    }

    // Extraction des langues disponibles dans le dataset
    val availableLanguages = remember(cantiques) {
        cantiques.flatMap { c -> c.versions.map { v -> v.langue } }.distinct()
    }

    val filteredCantiques = cantiques.filter { c ->
        val version = c.versions.find { it.langue.equals(selectedLanguage, ignoreCase = true) } ?: c.versions.firstOrNull()
        val title = version?.titre ?: ""
        val num = c.numero_source ?: ""
        
        val matchesSearch = title.contains(searchQuery, ignoreCase = true) || num.contains(searchQuery, ignoreCase = true)
        val matchesTab = if (selectedTab == 1) favoriteIds.contains(c.id) else true
        
        matchesSearch && matchesTab
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(if (selectedCantique == null) "Cantiques EUJC" else "Détail du Cantique") },
                actions = {
                    if (selectedCantique == null && availableLanguages.isNotEmpty()) {
                        // Sélecteur de langue rapide dans la barre du haut
                        var expanded by remember { mutableStateOf(false) }
                        Box(modifier = Modifier.padding(end = 8.dp)) {
                            TextButton(onClick = { expanded = true }) {
                                Text("Langue: ${selectedLanguage.uppercase()}")
                            }
                            DropdownMenu(expanded = expanded, onDismissRequest = { expanded = false }) {
                                availableLanguages.forEach { lang ->
                                    DropdownMenuItem(
                                        text = { Text(lang.uppercase()) },
                                        onClick = {
                                            selectedLanguage = lang
                                            expanded = false
                                        }
                                    )
                                }
                            }
                        }
                    }
                }
            )
        },
        bottomBar = {
            if (selectedCantique == null) {
                NavigationBar {
                    NavigationBarItem(
                        icon = { Icon(Icons.Default.Favorite, contentDescription = "Tous") },
                        label = { Text("Tous") },
                        selected = selectedTab == 0,
                        onClick = { selectedTab = 0 }
                    )
                    NavigationBarItem(
                        icon = { Icon(Icons.Default.Favorite, contentDescription = "Favoris") },
                        label = { Text("Favoris") },
                        selected = selectedTab == 1,
                        onClick = { selectedTab = 1 }
                    )
                }
            }
        }
    ) { padding ->
        Box(modifier = Modifier.padding(padding).fillMaxSize()) {
            if (selectedCantique == null) {
                Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
                    OutlinedTextField(
                        value = searchQuery,
                        onValueChange = { searchQuery = it },
                        label = { Text("Rechercher par titre ou numéro...") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    LazyColumn(modifier = Modifier.fillMaxSize()) {
                        items(filteredCantiques) { cantique ->
                            val version = cantique.versions.find { it.langue.equals(selectedLanguage, ignoreCase = true) } ?: cantique.versions.firstOrNull()
                            val isFav = favoriteIds.contains(cantique.id)

                            Card(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 4.dp)
                                    .clickable { selectedCantique = cantique },
                                elevation = CardDefaults.cardElevation(2.dp)
                            ) {
                                Row(
                                    modifier = Modifier.padding(16.dp).fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(
                                            text = "N° ${cantique.numero_source ?: "S/N"} - ${version?.titre ?: "Sans titre"}",
                                            style = MaterialTheme.typography.titleMedium
                                        )
                                        Text(
                                            text = "Langue: ${version?.langue?.uppercase() ?: "FR"}",
                                            style = MaterialTheme.typography.bodySmall,
                                            color = MaterialTheme.colorScheme.secondary
                                        )
                                    }
                                    IconButton(onClick = { toggleFavorite(cantique.id) }) {
                                        Icon(
                                            imageVector = if (isFav) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                                            contentDescription = "Favori",
                                            tint = if (isFav) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            } else {
                val cantique = selectedCantique!!
                val version = cantique.versions.find { it.langue.equals(selectedLanguage, ignoreCase = true) } ?: cantique.versions.firstOrNull()
                val isFav = favoriteIds.contains(cantique.id)

                Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Button(onClick = { selectedCantique = null }) {
                            Text("← Retour à la liste")
                        }
                        IconButton(onClick = { toggleFavorite(cantique.id) }) {
                            Icon(
                                imageVector = if (isFav) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                                contentDescription = "Favori",
                                tint = if (isFav) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = version?.titre ?: "",
                        style = MaterialTheme.typography.headlineSmall
                    )
                    Text(
                        text = "Source : ${cantique.numero_source ?: "N/A"} | Langue : ${version?.langue?.uppercase()}",
                        style = MaterialTheme.typography.bodySmall
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    LazyColumn(modifier = Modifier.fillMaxSize()) {
                        version?.refrain?.let { refrainLines ->
                            item {
                                Text(text = "Refrain :", style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.primary)
                                refrainLines.forEach { ligne ->
                                    Text(text = ligne, style = MaterialTheme.typography.bodyMedium)
                                }
                                Spacer(modifier = Modifier.height(12.dp))
                            }
                        }
                        version?.couplets?.let { coupletsList ->
                            items(coupletsList) { couplet ->
                                Text(text = "Couplet ${couplet.ordre}", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.primary)
                                couplet.lignes.forEach { ligne ->
                                    Text(text = ligne, style = MaterialTheme.typography.bodyMedium)
                                }
                                Spacer(modifier = Modifier.height(12.dp))
                            }
                        }
                    }
                }
            }
        }
    }
}
"""

with open(main_activity_path, "w", encoding="utf-8") as f:
    f.write(code_content)

print("MainActivity.kt mis à jour avec succès avec les favoris et la gestion des langues !")
