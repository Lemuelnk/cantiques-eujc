package com.lnk.cantiques.ui.components

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

/**
 * Shared search field for filtering the cantique catalogue.
 * Keeps the existing Material 3 appearance and behavior unchanged.
 */
@Composable
fun SearchBar(
    value: String,
    onValueChange: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        label = { Text("Rechercher par titre ou numéro...") },
        modifier = modifier
    )
}
