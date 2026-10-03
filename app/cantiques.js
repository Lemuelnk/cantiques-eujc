// ============================================================
// Cantiques EUJC — Liste des cantiques d'une catégorie
// ============================================================

const params = new URLSearchParams(window.location.search);
const categoryId = params.get('category') || 'lesson-1';

const categoryTitle  = document.getElementById('category-title');
const categoryCount  = document.getElementById('category-count');
const backButton     = document.getElementById('back-button');
const searchButton   = document.getElementById('search-button');
const searchPanel    = document.getElementById('search-panel');
const searchInput    = document.getElementById('hymn-search');
const clearSearch    = document.getElementById('clear-search');
const hymnsList      = document.getElementById('hymns-list');
const emptyState     = document.getElementById('empty-state');
const sortButton     = document.getElementById('sort-button');
const sortSheet      = document.getElementById('sort-sheet');
const sortBackdrop   = document.getElementById('sort-backdrop');
const closeSort      = document.getElementById('close-sort');
const sortOptions    = document.querySelectorAll('.sort-option');

if (categoryCount) categoryCount.textContent = 'Chargement…';

// ------------------------------------------------------------
// Navigation
// ------------------------------------------------------------
function openHymn(hymnOrId) {
  let url;
  if (hymnOrId && typeof hymnOrId === 'object' && typeof buildCantiqueUrl === 'function') {
    url = buildCantiqueUrl(hymnOrId, categoryId);
  } else if (typeof buildCantiqueUrl === 'function') {
    // Compat : ancien appel avec l'id seul -> essayer de retrouver l'hymn
    const found = Array.isArray(allHymns) ? allHymns.find(h => h.id === hymnOrId) : null;
    url = found ? buildCantiqueUrl(found, categoryId)
                : `cantique.html?hymn=${encodeURIComponent(hymnOrId)}&category=${encodeURIComponent(categoryId)}`;
  } else {
    url = `cantique.html?hymn=${encodeURIComponent(hymnOrId)}&category=${encodeURIComponent(categoryId)}`;
  }
  window.location.href = url;
}

// ------------------------------------------------------------
// Création d'une ligne de cantique
// ------------------------------------------------------------
function createHymnRow(hymn) {
  const display = getHymnDisplay(hymn);
  const row = document.createElement('article');
  row.className = 'hymn-row';
  row.tabIndex = 0;
  row.dataset.hymnId = display.id;
  row.dataset.sourcePosition = display.sourcePosition || '';
  row.dataset.sourceNumber = display.sourceNumber || '';
  row.setAttribute('role', 'link');
  row.setAttribute('aria-label', `Ouvrir ${display.title}`);

  const number = document.createElement('div');
  number.className = 'hymn-number';
  number.textContent = display.sourceNumber
    || String(display.sourcePosition || '').padStart(2, '0');

  const content = document.createElement('div');
  content.className = 'hymn-content';

  const title = document.createElement('h2');
  title.textContent = display.title;

  const meta = document.createElement('p');
  const verses = display.verseCount
    ? ` · ${display.verseCount} couplet${display.verseCount > 1 ? 's' : ''}`
    : '';
  meta.textContent = `${display.language}${verses}`;

  content.append(title, meta);

  // ---- Badge "N langues" (si plusieurs versions) ----
  if (display.versionCount > 1) {
    const badge = document.createElement('span');
    badge.className = 'version-badge';
    badge.setAttribute('aria-label',
      `${display.versionCount} versions linguistiques disponibles`);
    badge.innerHTML =
      '<i data-lucide="languages"></i>' +
      `<span>${display.versionCount} langues</span>`;
    content.append(badge);
  }

  // ---- Bouton favori ----
  const favorite = document.createElement('button');
  favorite.className = 'favorite-button';
  favorite.type = 'button';
  favorite.innerHTML = '<i data-lucide="star"></i>';

  const dejaFavori = (typeof isFavorite === 'function') && isFavorite(display.id);
  if (dejaFavori) {
    row.classList.add('is-favorite');
    favorite.setAttribute('aria-label', 'Retirer des favoris');
  } else {
    favorite.setAttribute('aria-label', 'Ajouter aux favoris');
  }

  favorite.addEventListener('click', event => {
    event.stopPropagation();

    const nowFavorite = (typeof toggleFavorite === 'function')
      ? toggleFavorite(display.id, categoryId)
      : !row.classList.contains('is-favorite');

    row.classList.toggle('is-favorite', nowFavorite);
    favorite.setAttribute('aria-label',
      nowFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris');

    requestAnimationFrame(() => {
      const svg = favorite.querySelector('svg');
      if (svg) svg.setAttribute('fill', nowFavorite ? 'currentColor' : 'none');
    });
  });

  // ---- Ouverture du cantique ----
  row.addEventListener('click', () => openHymn(hymn));
  row.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openHymn(hymn);
    }
  });

  row.append(number, content, favorite);
  return row;
}

// ------------------------------------------------------------
// Chargement des cantiques de la catégorie
// ------------------------------------------------------------
async function loadCategoryHymns() {
  try {
    const corpus = await loadCanonicalLesson(categoryId);
    const hymns = Array.isArray(corpus.hymns) ? corpus.hymns : [];
    const taxonomy = corpus.taxonomy || {};
    const seoCategory = taxonomy.category_label || taxonomy.lesson_label || 'Cantiques EUJC';
    const seoTitle = `${seoCategory} — Cantiques EUJC`;
    const seoDescription = `Consultez les paroles des cantiques de la catégorie ${seoCategory} dans le recueil numérique Cantiques EUJC.`;
    document.title = seoTitle;

    const canonicalUrl = new URL(window.location.href);
    canonicalUrl.hash = '';
    canonicalUrl.searchParams.sort();
    let canonicalLink = document.head.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonicalUrl.href;

    const updateMeta = (selector, attribute, key, value) => {
      let meta = document.head.querySelector(`${selector}[${attribute}="${key}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, key);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', value);
    };
    updateMeta('meta', 'name', 'description', seoDescription);
    updateMeta('meta', 'name', 'robots', 'index, follow, max-image-preview:large');
    updateMeta('meta', 'property', 'og:type', 'website');
    updateMeta('meta', 'property', 'og:site_name', 'Cantiques EUJC');
    updateMeta('meta', 'property', 'og:title', seoTitle);
    updateMeta('meta', 'property', 'og:description', seoDescription);
    updateMeta('meta', 'property', 'og:url', canonicalUrl.href);
    updateMeta('meta', 'property', 'og:image', 'https://cantiques-eujc.lnk-studio.com/assets/icons/icon-512.png');
    updateMeta('meta', 'name', 'twitter:card', 'summary');
    updateMeta('meta', 'name', 'twitter:title', seoTitle);
    updateMeta('meta', 'name', 'twitter:description', seoDescription);
    updateMeta('meta', 'name', 'twitter:image', 'https://cantiques-eujc.lnk-studio.com/assets/icons/icon-512.png');

    if (categoryTitle) {
      categoryTitle.textContent =
        taxonomy.category_label || taxonomy.lesson_label || 'Cantiques';
    }
    if (categoryCount) {
      categoryCount.textContent =
        `${hymns.length} cantique${hymns.length > 1 ? 's' : ''}`;
    }

    hymnsList.replaceChildren(...hymns.map(createHymnRow));

    if (window.lucide) lucide.createIcons();
  } catch (error) {
    console.error('Impossible de charger la liste des cantiques :', error);
    if (categoryCount) categoryCount.textContent = 'Catégorie non disponible';
    if (hymnsList) hymnsList.replaceChildren();
    if (emptyState) {
      emptyState.hidden = false;
      const h2 = emptyState.querySelector('h2');
      const p  = emptyState.querySelector('p');
      if (h2) h2.textContent = 'Impossible de charger les cantiques';
      if (p)  p.textContent  = 'Vérifiez la connexion aux données de la leçon.';
    }
  }
}

// ------------------------------------------------------------
// Bouton retour
// ------------------------------------------------------------
if (backButton) {
  backButton.addEventListener('click', () => {
    if (document.referrer) history.back();
    else window.location.href = 'categories.html';
  });
}

// ------------------------------------------------------------
// Recherche (toggle du panneau)
// ------------------------------------------------------------
if (searchButton && searchPanel) {
  searchButton.addEventListener('click', () => {
    const isHidden = searchPanel.hidden;
    searchPanel.hidden = !isHidden;

    if (isHidden && searchInput) searchInput.focus();
    else if (searchInput) {
      searchInput.value = '';
      filterHymns('');
    }
  });
}

if (clearSearch && searchInput) {
  clearSearch.addEventListener('click', () => {
    searchInput.value = '';
    filterHymns('');
    searchInput.focus();
  });
}

if (searchInput) {
  searchInput.addEventListener('input', () => filterHymns(searchInput.value));
}

function filterHymns(query) {
  if (!hymnsList || !emptyState) return;
  const normalizedQuery = normalizeText(query.trim());
  let visible = 0;

  getRows().forEach(row => {
    const match = !normalizedQuery
      || normalizeText(row.textContent).includes(normalizedQuery);
    row.hidden = !match;
    if (match) visible++;
  });

  emptyState.hidden = visible !== 0;
}

// ------------------------------------------------------------
// Tri
// ------------------------------------------------------------
if (sortButton && sortSheet && sortBackdrop && closeSort) {
  sortButton.addEventListener('click', openSort);
  sortBackdrop.addEventListener('click', closeSortSheet);
  closeSort.addEventListener('click', closeSortSheet);
}

function openSort() {
  sortBackdrop.hidden = false;
  sortSheet.setAttribute('aria-hidden', 'false');
  requestAnimationFrame(() => sortSheet.classList.add('open'));
}

function closeSortSheet() {
  sortSheet.classList.remove('open');
  sortSheet.setAttribute('aria-hidden', 'true');
  setTimeout(() => { sortBackdrop.hidden = true; }, 220);
}

sortOptions.forEach(option => {
  option.addEventListener('click', () => {
    sortOptions.forEach(item => item.classList.remove('active'));
    option.classList.add('active');
    const sortType = option.dataset.sort;
    if (sortType === 'alphabetical') sortAlphabetically();
    if (sortType === 'source')       restoreSourceOrder();
    if (sortType === 'favorites')    sortFavorites();
    closeSortSheet();
  });
});

function getRows() {
  return [...hymnsList.querySelectorAll('.hymn-row')];
}

function sortAlphabetically() {
  getRows()
    .sort((a, b) => a.querySelector('h2').textContent
      .localeCompare(b.querySelector('h2').textContent, 'fr', { sensitivity: 'base' }))
    .forEach(row => hymnsList.appendChild(row));
}

function restoreSourceOrder() {
  getRows()
    .sort((a, b) => Number(a.dataset.sourcePosition || 0)
                  - Number(b.dataset.sourcePosition || 0))
    .forEach(row => hymnsList.appendChild(row));
}

function sortFavorites() {
  getRows()
    .sort((a, b) =>
      Number(b.classList.contains('is-favorite'))
      - Number(a.classList.contains('is-favorite')))
    .forEach(row => hymnsList.appendChild(row));
}

// ------------------------------------------------------------
// Lancer
// ------------------------------------------------------------
loadCategoryHymns();
