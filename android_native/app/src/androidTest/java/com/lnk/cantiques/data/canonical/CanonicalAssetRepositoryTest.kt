package com.lnk.cantiques.data.canonical

import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class CanonicalAssetRepositoryTest {

    private val repository by lazy {
        CanonicalAssetRepository(
            InstrumentationRegistry.getInstrumentation().targetContext.assets
        )
    }

    @Test
    fun allThirtySevenCanonicalCorporaAreLoadable() {
        val corpora = repository.loadAllCategories()

        assertEquals(37, CanonicalCategoryCatalog.categories.size)
        assertEquals(37, corpora.size)

        CanonicalCategoryCatalog.categories.forEach { category ->
            val corpus = corpora[category.id]
            assertNotNull("Corpus not loadable: ${category.assetName}", corpus)
            assertEquals(category.id, corpus?.taxonomy?.categoryId)
            assertNotNull("Hymns list missing: ${category.assetName}", corpus?.hymns)
        }
    }

    @Test
    fun canonicalStatisticsAreLoadableAndConsistent() {
        val stats = repository.loadStats()

        assertNotNull(stats)
        assertEquals(1755, stats?.totalHymns)
        assertEquals(4, stats?.languages)
        assertEquals(4, stats?.languageLabels?.size)
        assertEquals(21, stats?.lessons)
        assertEquals(37, stats?.categories)
    }

    @Test
    fun unknownCategoryReturnsNull() {
        assertNull(repository.loadCategory("unknown-category"))
    }
}
