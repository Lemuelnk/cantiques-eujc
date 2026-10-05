// ============================================================
// Cantiques EUJC — Page Mes Favoris
// ============================================================

const favoritesList    = document.getElementById('favorites-list');
const favoritesEmpty   = document.getElementById('favorites-empty');
const favoritesCount   = document.getElementById('favorites-count');
const favoritesLoading = document.getElementById('favorites-loading');
const backButton       = document.getElementById('back-button');

const corpusCache = new Map();

async function getCorpus(category) {
  if (corpusCache.has(category)) return corpusCache.get(category);
  try {
    const data = await loadCanonicalLesson(category);
    corpusCache.set(category, data);
    return data;
  } catch (err) {
    console.warn(`Corpus "${category}" indisponible :`, err);
    corpusCache.set(category, null);
    return null;
  }
}

function createFavoriteRow(hymn, category) {
  const display = getHymnDisplay(hymn);

  const row = document.createElement('a');
  row.className = 'favorite-row';
  row.href = (typeof buildCantiqueUrl === 'function')
    ? buildCantiqueUrl(hymn, category)
    : `cantique.html?hymn=${encodeURIComponent(display.id)}&category=${encodeURIComponent(category)}`;

  const number = document.createElement('span');
  number.className = 'fav-number';
  number.textContent = display.sourceNumber
    || String(display.sourcePosition || '').padStart(2, '0');

  const content = document.createElement('div');
  content.className = 'fav-content';

  const title = document.createElement('h2');
  title.className = 'fav-title';
  title.textContent = display.title;

  const meta = document.createElement('p');
  meta.className = 'fav-meta';
  const verses = display.verseCount
    ? ` · ${display.verseCount} couplet${display.verseCount > 1 ? 's' : ''}`
    : '';
  meta.textContent = `${display.language}${verses}`;

  content.append(title, meta);

  const removeBtn = document.createElement('button');
  removeBtn.className = 'fav-remove';
  removeBtn.type = 'button';
  removeBtn.setAttribute('aria-label', `Retirer ${display.title} des favoris`);
  removeBtn.innerHTML = '<i data-lucide="star"></i>';

  removeBtn.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    if (typeof toggleFavorite !== 'function') return;
    toggleFavorite(display.id, category);

    row.style.transition = 'opacity 200ms ease, transform 200ms ease';
    row.style.opacity = '0';
    row.style.transform = 'translateX(20px)';

    setTimeout(() => {
      row.remove();
      refreshCounter();
      checkEmptyState();
    }, 200);
  });

  const arrow = document.createElement('span');
  arrow.className = 'fav-arrow';
  arrow.setAttribute('aria-hidden', 'true');
  arrow.innerHTML = '<i data-lucide="chevron-right"></i>';

  row.append(number, content, removeBtn, arrow);
  return row;
}

async function loadFavorites() {
  if (typeof getFavorites !== 'function') {
    favoritesCount.textContent = 'Erreur';
    favoritesLoading.textContent = 'storage.js non chargé.';
    return;
  }

  const favorites = getFavorites();

  if (favorites.length === 0) {
    favoritesLoading.hidden = true;
    favoritesEmpty.hidden = false;
    favoritesCount.textContent = '0 cantique';
    if (window.lucide) lucide.createIcons();
    return;
  }

  favoritesCount.textContent =
    `${favorites.length} cantique${favorites.length > 1 ? 's' : ''}`;

  const byCategory = new Map();
  favorites.forEach(fav => {
    const cat = fav.category || 'lesson-1';
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat).push(fav);
  });

  const rows = [];

  for (const [category, favs] of byCategory.entries()) {
    const corpus = await getCorpus(category);
    if (!corpus || !Array.isArray(corpus.hymns)) continue;

    favs.forEach(fav => {
      const hymn = corpus.hymns.find(h => h.id === fav.id);
      if (hymn) rows.push({ hymn, category, ts: fav.ts || 0 });
    });
  }

  rows.sort((a, b) => (b.ts || 0) - (a.ts || 0));
  favoritesLoading.hidden = true;

  if (rows.length === 0) {
    favoritesEmpty.hidden = false;
    favoritesCount.textContent = '0 cantique';
  } else {
    favoritesEmpty.hidden = true;
    favoritesList.replaceChildren(
      ...rows.map(r => createFavoriteRow(r.hymn, r.category))
    );
    if (window.lucide) lucide.createIcons();
  }
}

function refreshCounter() {
  if (typeof getFavorites !== 'function') return;
  const n = getFavorites().length;
  favoritesCount.textContent = `${n} cantique${n > 1 ? 's' : ''}`;
}

function checkEmptyState() {
  if (favoritesList.children.length === 0) {
    favoritesEmpty.hidden = false;
    favoritesLoading.hidden = true;
  }
}

if (backButton) {
  backButton.addEventListener('click', () => {
    if (document.referrer) history.back();
    else window.location.href = 'index.html';
  });
}

loadFavorites();
