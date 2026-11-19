package com.lnk.cantiques.data.canonical

enum class CanonicalCategoryGroup(val title: String) {
    LESSONS("Leçons du Chemin"),
    SUNDAY("Cantiques du Dimanche"),
    PRAYER("Cantiques de prière"),
    UNCLASSIFIED("Cantiques à classer")
}

data class CanonicalCategory(
    val id: String,
    val assetName: String,
    val label: String,
    val group: CanonicalCategoryGroup
)

/**
 * Mirrors the 37 canonical corpus files and category IDs used by the PWA.
 * The source order inside each corpus is intentionally preserved.
 */
object CanonicalCategoryCatalog {
    val categories: List<CanonicalCategory> = buildList {
        fun addLessons() {
            addLesson("lesson-0", "lesson-0-lucifer", "Leçon 0 — Lucifer")
            addLesson("lesson-1", "lesson-1-creation", "Leçon 1 — Création")
            addLesson("lesson-2", "lesson-2-eden", "Leçon 2 — Éden")
            addLesson("lesson-3", "lesson-3-premier-peche", "Leçon 3 — Premier péché")
            addLesson("lesson-4", "lesson-4-fils-adam", "Leçon 4 — Fils d'Adam")
            addLesson("lesson-5", "lesson-5-noe", "Leçon 5 — Noé")
            addLesson("lesson-6", "lesson-6-abraham", "Leçon 6 — Abraham")
            addLesson("lesson-7", "lesson-7-lot", "Leçon 7 — Lot")
            addLesson("lesson-8", "lesson-8-fils-isaac", "Leçon 8 — Fils d'Isaac")
            addLesson("lesson-9", "lesson-9-jacob", "Leçon 9 — Jacob et ses fils")
            addLesson("lesson-10", "lesson-10-egypte", "Leçon 10 — Départ pour l'Égypte")
            addLesson("lesson-11", "lesson-11-moise", "Leçon 11 — Moïse")
            addLesson("lesson-12", "lesson-12-plaies", "Leçon 12 — Les 10 plaies")
            addLesson("lesson-13", "lesson-13-mer-rouge", "Leçon 13 — Mer Rouge")
            addLesson("lesson-20", "lesson-20-samson", "Leçon 20 — Samson")
            addLesson("lesson-21", "lesson-21-david-saul", "Leçon 21 — Royaume de David")
            addLesson("lesson-22", "lesson-22-salomon", "Leçon 22 — Salomon")
            addLesson("lesson-23", "lesson-23-temple", "Leçon 23 — L'office du temple")
            addLesson("lesson-24", "lesson-24-elie-elisee", "Leçon 24 — Élie et Élysée")
            addLesson("lesson-25", "lesson-25-daniel", "Leçon 25 — Daniel")
            addLesson("lesson-26", "lesson-26-job", "Leçon 26 — Job")
        }
        fun addLesson(id: String, asset: String, label: String) {
            add(CanonicalCategory(id, "$asset.json", label, CanonicalCategoryGroup.LESSONS))
        }
        fun addSunday(id: String, label: String) {
            add(CanonicalCategory(id, "$id.json", "Dimanche — $label", CanonicalCategoryGroup.SUNDAY))
        }
        fun addPrayer(id: String, label: String) {
            add(CanonicalCategory(id, "$id.json", "Prière — $label", CanonicalCategoryGroup.PRAYER))
        }
        fun addUnclassified(id: String, label: String) {
            add(CanonicalCategory(id, "$id.json", "Cantiques à classer — $label", CanonicalCategoryGroup.UNCLASSIFIED))
        }

        addLessons()
        addSunday("dimanche-louange", "Louange")
        addSunday("dimanche-croyants", "Croyants")
        addSunday("dimanche-affliges", "Affligés")
        addSunday("dimanche-egares", "Égarés")
        addSunday("dimanche-rois", "Rois")
        addSunday("dimanche-visiteurs", "Visiteurs")
        addSunday("dimanche-divers", "Divers")
        addPrayer("priere-misericorde", "Miséricorde")
        addPrayer("priere-invocation", "Invocation")
        addPrayer("priere-general", "Général")
        addPrayer("priere-bataille", "Bataille")
        addUnclassified("a-classer-francais", "Français")
        addUnclassified("a-classer-swahili", "Swahili")
        addUnclassified("a-classer-tshiluba", "Tshiluba")
        addUnclassified("a-classer-lingala", "Lingala")
        addUnclassified("a-classer-autres", "Autres langues")
    }

    val byId: Map<String, CanonicalCategory> = categories.associateBy(CanonicalCategory::id)
    val groups: Map<CanonicalCategoryGroup, List<CanonicalCategory>> =
        CanonicalCategoryGroup.entries.associateWith { group -> categories.filter { it.group == group } }
}
