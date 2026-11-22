# Applications natives — Architecture multiplateforme

Ce dossier relie les deux implémentations mobiles natives au contrat canonique commun.

- Android : [Kotlin / Jetpack Compose](../../android_native/README.md)
- iOS : [Swift / SwiftUI](../../ios_native/README.md)
- Source de vérité : `app/data/canonical/` et `app/data/stats.json`
- Règle d'identité : `categoryID + hymnID`
- Périmètre : textes et versions linguistiques, sans audio.

Les applications partagent les données et les règles métier, pas le code d'interface. Chaque plateforme suit ses conventions natives.
