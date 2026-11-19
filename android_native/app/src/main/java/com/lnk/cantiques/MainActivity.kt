package com.lnk.cantiques

import android.content.Context
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.clickable
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Book
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.MusicNote
import androidx.compose.material.icons.filled.SelfImprovement
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.lnk.cantiques.theme.CantiquesEujcTheme
import com.lnk.cantiques.data.Cantique
import com.lnk.cantiques.data.CantiquesResponse
import com.lnk.cantiques.data.LessonHymn
import com.lnk.cantiques.data.LessonResponse
import com.lnk.cantiques.data.Prayer
import com.lnk.cantiques.data.PrayerResponse
import kotlinx.serialization.json.Json
import java.io.BufferedReader
import java.io.InputStreamReader

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        val cantiquesResponse = loadJsonFromAsset("cantiques.json")?.let {
            Json { ignoreUnknownKeys = true }.decodeFromString<CantiquesResponse>(it)
        }

        val lessonResponse = loadJsonFromAsset("lesson-1-creation.json")?.let {
            Json { ignoreUnknownKeys = true }.decodeFromString<LessonResponse>(it)
        }

        val prayerResponse = loadJsonFromAsset("prieres.json")?.let {
            Json { ignoreUnknownKeys = true }.decodeFromString<PrayerResponse>(it)
        }

        val sharedPrefs = getSharedPreferences("cantiques_prefs", Context.MODE_PRIVATE)

        setContent {
            var darkTheme by remember {
                mutableStateOf(sharedPrefs.getBoolean("dark_theme", isSystemInDarkTheme()))
            }

            CantiquesEujcTheme(darkTheme = darkTheme) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    CantiquesApp(
                        cantiques = cantiquesResponse?.cantiques ?: emptyList(),
                        lesson = lessonResponse,
                        prieres = prayerResponse?.prieres ?: emptyList(),
                        sharedPrefs = sharedPrefs,
                        darkTheme = darkTheme,
                        onDarkThemeChange = { enabled ->
                            darkTheme = enabled
                            sharedPrefs.edit().putBoolean("dark_theme", enabled).apply()
                        }
                    )
                }
            }
        }
    }

    private fun loadJsonFromAsset(fileName: String): String? {
        return try {
            val inputStream = assets.open(fileName)
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
fun CantiquesApp(
    cantiques: List<Cantique>, 
    lesson: LessonResponse?, 
    prieres: List<Prayer>,
    sharedPrefs: android.content.SharedPreferences,
    darkTheme: Boolean,
    onDarkThemeChange: (Boolean) -> Unit
) {
    var searchQuery by remember { mutableStateOf("") }
    var selectedTab by remember { mutableIntStateOf(0) } // 0: Tous, 1: Favoris, 2: Leçons, 3: Prières, 4: Historique, 5: Paramètres
    var selectedLanguage by remember { mutableStateOf("fr") }
    var selectedCantique by remember { mutableStateOf<Cantique?>(null) }
    var selectedLessonHymn by remember { mutableStateOf<LessonHymn?>(null) }
    var selectedPrayer by remember { mutableStateOf<Prayer?>(null) }

    var fontSizeScale by remember { mutableFloatStateOf(sharedPrefs.getFloat("font_size", 16f)) }

    var favoriteIds by remember {
        mutableStateOf(sharedPrefs.getStringSet("favorites", emptySet()) ?: emptySet())
    }

    var historyList by remember {
        mutableStateOf(sharedPrefs.getStringSet("history", linkedSetOf())?.toList() ?: emptyList())
    }

    fun toggleFavorite(id: String) {
        favoriteIds = if (favoriteIds.contains(id)) favoriteIds - id else favoriteIds + id
        sharedPrefs.edit().putStringSet("favorites", favoriteIds).apply()
    }

    fun addToHistory(title: String) {
        val newHistory = (listOf(title) + historyList.filter { it != title }).take(20)
        historyList = newHistory
        sharedPrefs.edit().putStringSet("history", newHistory.toSet()).apply()
    }

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
                title = { 
                    Text(
                        when {
                            selectedCantique != null || selectedLessonHymn != null || selectedPrayer != null -> "Détail"
                            selectedTab == 5 -> "Paramètres"
                            selectedTab == 4 -> "Historique"
                            selectedTab == 3 -> "Prières"
                            selectedTab == 2 -> "Leçons du Chemin"
                            else -> "Cantiques EUJC"
                        }
                    ) 
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    titleContentColor = MaterialTheme.colorScheme.onPrimary,
                    actionIconContentColor = MaterialTheme.colorScheme.onPrimary
                ),
                actions = {
                    if (selectedCantique == null && selectedLessonHymn == null && selectedPrayer == null && selectedTab == 0 && availableLanguages.isNotEmpty()) {
                        var expanded by remember { mutableStateOf(false) }
                        Box(modifier = Modifier.padding(end = 8.dp)) {
                            TextButton(onClick = { expanded = true }) {
                                Text(
                                    text = "Langue: ${selectedLanguage.uppercase()}",
                                    color = MaterialTheme.colorScheme.onPrimary
                                )
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
            if (selectedCantique == null && selectedLessonHymn == null && selectedPrayer == null) {
                NavigationBar {
                    NavigationBarItem(
                        icon = { Icon(Icons.Default.MusicNote, contentDescription = "Tous") },
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
                    NavigationBarItem(
                        icon = { Icon(Icons.Default.Book, contentDescription = "Leçons") },
                        label = { Text("Leçons") },
                        selected = selectedTab == 2,
                        onClick = { selectedTab = 2 }
                    )
                    NavigationBarItem(
                        icon = { Icon(Icons.Default.SelfImprovement, contentDescription = "Prières") },
                        label = { Text("Prières") },
                        selected = selectedTab == 3,
                        onClick = { selectedTab = 3 }
                    )
                    NavigationBarItem(
                        icon = { Icon(Icons.Default.History, contentDescription = "Historique") },
                        label = { Text("Historique") },
                        selected = selectedTab == 4,
                        onClick = { selectedTab = 4 }
                    )
                    NavigationBarItem(
                        icon = { Icon(Icons.Default.Settings, contentDescription = "Paramètres") },
                        label = { Text("Réglages") },
                        selected = selectedTab == 5,
                        onClick = { selectedTab = 5 }
                    )
                }
            }
        }
    ) { padding ->
        Box(modifier = Modifier.padding(padding).fillMaxSize()) {
            if (selectedCantique != null) {
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
                            Text("← Retour")
                        }
                        IconButton(onClick = { toggleFavorite(cantique.id) }) {
                            Icon(
                                imageVector = if (isFav) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                                contentDescription = "Favori",
                                tint = if (isFav) MaterialTheme.colorScheme.secondary else MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = version?.titre ?: "",
                        style = MaterialTheme.typography.headlineSmall.copy(fontSize = (fontSizeScale + 6).sp),
                        color = MaterialTheme.colorScheme.primary
                    )
                    Text(
                        text = "Source : ${cantique.numero_source ?: "N/A"} | Langue : ${version?.langue?.uppercase()}",
                        style = MaterialTheme.typography.bodySmall
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    LazyColumn(modifier = Modifier.fillMaxSize()) {
                        version?.refrain?.let { refrainLines ->
                            item {
                                Text(
                                    text = "Refrain :", 
                                    style = MaterialTheme.typography.titleMedium.copy(fontSize = (fontSizeScale + 2).sp), 
                                    color = MaterialTheme.colorScheme.secondary
                                )
                                refrainLines.forEach { ligne ->
                                    Text(text = ligne, style = MaterialTheme.typography.bodyMedium.copy(fontSize = fontSizeScale.sp))
                                }
                                Spacer(modifier = Modifier.height(12.dp))
                            }
                        }
                        version?.couplets?.let { coupletsList ->
                            items(coupletsList) { couplet ->
                                Text(
                                    text = "Couplet ${couplet.ordre}", 
                                    style = MaterialTheme.typography.titleSmall.copy(fontSize = (fontSizeScale + 1).sp), 
                                    color = MaterialTheme.colorScheme.secondary
                                )
                                couplet.lignes.forEach { ligne ->
                                    Text(text = ligne, style = MaterialTheme.typography.bodyMedium.copy(fontSize = fontSizeScale.sp))
                                }
                                Spacer(modifier = Modifier.height(12.dp))
                            }
                        }
                    }
                }
            } else if (selectedLessonHymn != null) {
                val hymn = selectedLessonHymn!!
                Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
                    Button(onClick = { selectedLessonHymn = null }) {
                        Text("← Retour aux leçons")
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = hymn.title,
                        style = MaterialTheme.typography.headlineSmall.copy(fontSize = (fontSizeScale + 6).sp),
                        color = MaterialTheme.colorScheme.primary
                    )
                    Text(
                        text = "Source N° ${hymn.source_number}",
                        style = MaterialTheme.typography.bodySmall
                    )
                    Spacer(modifier = Modifier.height(16.dp))

                    LazyColumn(modifier = Modifier.fillMaxSize()) {
                        items(hymn.content.sections) { section ->
                            Text(
                                text = section.text,
                                style = MaterialTheme.typography.bodyMedium.copy(fontSize = fontSizeScale.sp),
                                modifier = Modifier.padding(vertical = 6.dp),
                                color = if (section.type == "REFRAIN") MaterialTheme.colorScheme.secondary else MaterialTheme.colorScheme.onBackground
                            )
                        }
                    }
                }
            } else if (selectedPrayer != null) {
                val prayer = selectedPrayer!!
                Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
                    Button(onClick = { selectedPrayer = null }) {
                        Text("← Retour aux prières")
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = prayer.titre,
                        style = MaterialTheme.typography.headlineSmall.copy(fontSize = (fontSizeScale + 6).sp),
                        color = MaterialTheme.colorScheme.primary
                    )
                    Spacer(modifier = Modifier.height(16.dp))

                    LazyColumn(modifier = Modifier.fillMaxSize()) {
                        items(prayer.contenu) { ligne ->
                            Text(
                                text = ligne,
                                style = MaterialTheme.typography.bodyLarge.copy(fontSize = fontSizeScale.sp),
                                modifier = Modifier.padding(vertical = 8.dp)
                            )
                        }
                    }
                }
            } else if (selectedTab == 5) {
                Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
                    Text(text = "Préférences d'affichage", style = MaterialTheme.typography.titleLarge)
                    Spacer(modifier = Modifier.height(24.dp))
                    
                    Text(text = "Taille du texte des paroles : ${fontSizeScale.toInt()} sp")
                    Slider(
                        value = fontSizeScale,
                        onValueChange = { 
                            fontSizeScale = it
                            sharedPrefs.edit().putFloat("font_size", it).apply()
                        },
                        valueRange = 12f..28f,
                        steps = 8
                    )
                    
                    Spacer(modifier = Modifier.height(24.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(text = "Mode Sombre (Vert Forêt Profond)")
                        Switch(
                            checked = darkTheme,
                            onCheckedChange = onDarkThemeChange
                        )
                    }
                }
            } else if (selectedTab == 4) {
                Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
                    Text(text = "Historique de lecture", style = MaterialTheme.typography.titleLarge, color = MaterialTheme.colorScheme.primary)
                    Spacer(modifier = Modifier.height(16.dp))
                    if (historyList.isEmpty()) {
                        Text(text = "Aucun historique pour le moment.", style = MaterialTheme.typography.bodyMedium)
                    } else {
                        LazyColumn(modifier = Modifier.fillMaxSize()) {
                            items(historyList) { itemTitle ->
                                Card(
                                    modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                                ) {
                                    Text(
                                        text = itemTitle,
                                        modifier = Modifier.padding(16.dp),
                                        style = MaterialTheme.typography.bodyMedium
                                    )
                                }
                            }
                        }
                    }
                }
            } else if (selectedTab == 3) {
                Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
                    Text(text = "Prières et Recueillement", style = MaterialTheme.typography.titleLarge, color = MaterialTheme.colorScheme.primary)
                    Spacer(modifier = Modifier.height(16.dp))

                    LazyColumn(modifier = Modifier.fillMaxSize()) {
                        items(prieres) { prayer ->
                            Card(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 4.dp)
                                    .clickable { 
                                        selectedPrayer = prayer
                                        addToHistory("Prière : ${prayer.titre}")
                                    },
                                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                                elevation = CardDefaults.cardElevation(2.dp)
                            ) {
                                Column(modifier = Modifier.padding(16.dp)) {
                                    Text(
                                        text = prayer.titre,
                                        style = MaterialTheme.typography.titleMedium,
                                        color = MaterialTheme.colorScheme.primary
                                    )
                                }
                            }
                        }
                    }
                }
            } else if (selectedTab == 2) {
                Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
                    Text(
                        text = lesson?.category ?: "Leçons",
                        style = MaterialTheme.typography.titleLarge,
                        color = MaterialTheme.colorScheme.primary
                    )
                    Text(
                        text = "Leçon ${lesson?.lesson?.number}: ${lesson?.lesson?.title}",
                        style = MaterialTheme.typography.titleMedium,
                        color = MaterialTheme.colorScheme.secondary
                    )
                    Spacer(modifier = Modifier.height(16.dp))

                    LazyColumn(modifier = Modifier.fillMaxSize()) {
                        items(lesson?.hymns ?: emptyList()) { hymn ->
                            Card(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 4.dp)
                                    .clickable { 
                                        selectedLessonHymn = hymn
                                        addToHistory("Leçon : ${hymn.title}")
                                    },
                                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                                elevation = CardDefaults.cardElevation(2.dp)
                            ) {
                                Column(modifier = Modifier.padding(16.dp)) {
                                    Text(
                                        text = "N° ${hymn.source_number} - ${hymn.title}",
                                        style = MaterialTheme.typography.titleMedium,
                                        color = MaterialTheme.colorScheme.primary
                                    )
                                    Text(
                                        text = "Chant de la Création",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            }
                        }
                    }
                }
            } else {
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
                                    .clickable { 
                                        selectedCantique = cantique
                                        addToHistory("Cantique : ${version?.titre ?: cantique.id}")
                                    },
                                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
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
                                            style = MaterialTheme.typography.titleMedium,
                                            color = MaterialTheme.colorScheme.primary
                                        )
                                        Text(
                                            text = "Langue: ${version?.langue?.uppercase() ?: "FR"}",
                                            style = MaterialTheme.typography.bodySmall,
                                            color = MaterialTheme.colorScheme.onSurfaceVariant
                                        )
                                    }
                                    IconButton(onClick = { toggleFavorite(cantique.id) }) {
                                        Icon(
                                            imageVector = if (isFav) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                                            contentDescription = "Favori",
                                            tint = if (isFav) MaterialTheme.colorScheme.secondary else MaterialTheme.colorScheme.onSurfaceVariant
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
