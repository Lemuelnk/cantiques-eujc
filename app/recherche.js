// ============================================================
// Cantiques EUJC — Page Recherche
// ============================================================

const $searchInput   = document.getElementById('search-input');
const $searchClear   = document.getElementById('search-clear');
const $searchResults = document.getElementById('search-results');
const $searchEmpty   = document.getElementById('search-empty');
const $searchHint    = document.getElementById('search-hint');
const $searchLoading = document.getElementById('search-loading');
const $searchEmptyQ  = document.getElementById('search-empty-query');
const $backButton    = document.getElementById('back-button');
const $chipCounts    = {
  all:     document.getElementById('count-all'),
  title:   document.getElementById('count-title'),
  content: document.getElementById('count-content')
};

// Filtres avancés
const $filterBtn        = document.getElementById('filter-btn');
const $filterBadge      = document.getElementById('filter-badge');
const $filtersBackdrop  = document.getElementById('filters-backdrop');
const $filtersSheet     = document.getElementById('filters-sheet');
const $filtersReset     = document.getElementById('filters-reset');
const $filtersApply     = document.getElementById('filters-apply');
const $filtersCount     = document.getElementById('filters-count');
const $filterCategory   = document.getElementById('filter-category');
const $filterLesson     = document.getElementById('filter-lesson');
const $filterLanguage   = document.getElementById('filter-language');

// ------------------------------------------------------------
// État
// ------------------------------------------------------------
let allHymns      = [];   // index complet
let currentMode   = 'all';
let debounceTimer = null;
const DEBOUNCE_MS = 150;

// État des filtres avancés
let activeFilters = {
  category: '',
  lesson:   '',
  language: ''
};

// ------------------------------------------------------------
// Catégories connues
// ------------------------------------------------------------
const CATEGORIES = [
  'lesson-0', 'lesson-1', 'lesson-2', 'lesson-3', 'lesson-4',
  'lesson-5', 'lesson-6', 'lesson-7', 'lesson-8', 'lesson-9',
  'lesson-10', 'lesson-11', 'lesson-12', 'lesson-13',
  'lesson-20', 'lesson-21', 'lesson-22', 'lesson-23',
  'lesson-24', 'lesson-25', 'lesson-26',
  'dimanche-louange', 'dimanche-croyants', 'dimanche-affliges',
  'dimanche-egares', 'dimanche-rois', 'dimanche-visiteurs',
  'dimanche-divers',
  'priere-misericorde', 'priere-invocation',
  'priere-general', 'priere-bataille'
];

const CATEGORY_LABELS = {
  'lesson-0':  'Leçon 0 — Lucifer',
  'lesson-1':  'Leçon 1 — Création',
  'lesson-2':  'Leçon 2 — Éden',
  'lesson-3':  'Leçon 3 — Premier péché',
  'lesson-4':  'Leçon 4 — Fils d\'Adam',
  'lesson-5':  'Leçon 5 — NOÉ',
  'lesson-6':  'Leçon 6 — Abraham',
  'lesson-7':  'Leçon 7 — Lot',
  'lesson-8':  'Leçon 8 — Fils d\'Isaac',
  'lesson-9':  'Leçon 9 — Jacob et ses fils',
  'lesson-10': 'Leçon 10 — Départ pour l\'Égypte',
  'lesson-11': 'Leçon 11 — Moïse',
  'lesson-12': 'Leçon 12 — Les 10 plaies',
  'lesson-13': 'Leçon 13 — Mer Rouge',
  'lesson-20': 'Leçon 20 — Samson',
  'lesson-21': 'Leçon 21 — Royaume de David',
  'lesson-22': 'Leçon 22 — Salomon',
  'lesson-23': 'Leçon 23 — L\'office du temple',
  'lesson-24': 'Leçon 24 — Élie et Élysée',
  'lesson-25': 'Leçon 25 — Daniel',
  'lesson-26': 'Leçon 26 — Job',
  'dimanche-louange':     'Dimanche — Louange',
  'dimanche-croyants':    'Dimanche — Croyants',
  'dimanche-affliges':    'Dimanche — Affligés',
  'dimanche-egares':      'Dimanche — Égarés',
  'dimanche-rois':        'Dimanche — Rois',
  'dimanche-visiteurs':   'Dimanche — Visiteurs',
  'dimanche-divers':      'Dimanche — Divers',
  'priere-misericorde':   'Prière — Miséricorde',
  'priere-invocation':    'Prière — Invocation',
  'priere-general':       'Prière — Général',
  'priere-bataille':      'Prière — Bataille'
};

// ------------------------------------------------------------
// Utilitaires
// ------------------------------------------------------------
function normalize(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function escapeHtml(v) {
  const d = document.createElement('div');
  d.textContent = v == null ? '' : String(v);
  return d.innerHTML;
}

function highlight(text, query) {
  if (!query) return escapeHtml(text);
  const norm = normalize(text);
  const q = normalize(query);
  const idx = norm.indexOf(q);
  if (idx === -1) return escapeHtml(text);
  return escapeHtml(text.slice(0, idx))
    + '<mark>' + escapeHtml(text.slice(idx, idx + query.length)) + '</mark>'
    + escapeHtml(text.slice(idx + query.length));
}

// ------------------------------------------------------------
// Construction de l'index
// ------------------------------------------------------------
async function buildIndex() {
  const promises = CATEGORIES.map(async (cat) => {
    try {
      const corpus = await loadCanonicalLesson(cat);
      if (!corpus || !Array.isArray(corpus.hymns)) return [];
      return corpus.hymns.map(h => ({
        hymn: h,
        category: cat,
        searchTitle: normalize(h.title || ''),
        searchContent: buildContentText(h)
      }));
    } catch (e) {
      return [];
    }
  });

  const results = await Promise.all(promises);
  allHymns = results.flat();
}

function buildContentText(hymn) {
  const versions = Array.isArray(hymn.versions) ? hymn.versions : [];
  const parts = [];
  versions.forEach(v => {
    const blocks = Array.isArray(v.content) ? v.content : [];
    blocks.forEach(b => {
      if (Array.isArray(b.lines)) parts.push(b.lines.join(' '));
    });
  });
  return normalize(parts.join(' '));
}

// ------------------------------------------------------------
// Rendu
// ------------------------------------------------------------
function renderResult(item, query) {
  const display = getHymnDisplay(item.hymn);
  const version = display.version || {};
  const lang = (version.language && version.language.label) || '';

  const number = display.sourceNumber
    || String(display.sourcePosition || '').padStart(2, '0');

  const title = escapeHtml(display.title || item.hymn.title || '');

  const catLabel = CATEGORY_LABELS[item.category] || item.category;
  const metaParts = [lang, catLabel].filter(Boolean);
  const meta = metaParts.map(escapeHtml).join(' · ');

  let excerpt = '';
  if (query && currentMode === 'all' && !item.searchTitle.includes(normalize(query))) {
    const realText = getFirstMatchingLine(item.hymn, query);
    if (realText) {
      excerpt = '<p class="search-result-excerpt">…' + highlight(realText, query) + '…</p>';
    }
  }

  return `
    <a class="search-result" href="cantique.html?hymn=${encodeURIComponent(display.id)}&category=${encodeURIComponent(item.category)}">
      <span class="search-result-number">${escapeHtml(number)}</span>
      <span class="search-result-content">
        <span class="search-result-title">${title}</span>
        <span class="search-result-meta">${meta}</span>
        ${excerpt}
      </span>
      <span class="search-result-arrow" aria-hidden="true">
        <i data-lucide="chevron-right"></i>
      </span>
    </a>
  `;
}

function getFirstMatchingLine(hymn, query) {
  const q = normalize(query);
  const versions = Array.isArray(hymn.versions) ? hymn.versions : [];
  for (const v of versions) {
    const blocks = Array.isArray(v.content) ? v.content : [];
    for (const b of blocks) {
      for (const line of (b.lines || [])) {
        if (normalize(line).includes(q)) return line;
      }
    }
  }
  return '';
}

// ------------------------------------------------------------
// Peuplement des dropdowns de filtres
// ------------------------------------------------------------
function populateCategoryFilter() {
  if (!$filterCategory) return;

  // Grouper par type : Leçons, Dimanche, Prière
  const groups = {
    lessons:   [],
    dimanche:  [],
    priere:    []
  };

  CATEGORIES.forEach(id => {
    const label = CATEGORY_LABELS[id] || id;
    if (id.startsWith('lesson-'))        groups.lessons.push({ id, label });
    else if (id.startsWith('dimanche-')) groups.dimanche.push({ id, label });
    else if (id.startsWith('priere-'))   groups.priere.push({ id, label });
  });

  const groupLabels = {
    lessons:  'Leçons du Chemin',
    dimanche: 'Cantiques du Dimanche',
    priere:   'Cantiques de prière'
  };

  let html = '<option value="">Toutes les catégories</option>';
  Object.entries(groups).forEach(([key, items]) => {
    if (items.length === 0) return;
    html += `<optgroup label="${groupLabels[key]}">`;
    items.forEach(item => {
      html += `<option value="${item.id}">${escapeHtml(item.label)}</option>`;
    });
    html += '</optgroup>';
  });

  $filterCategory.innerHTML = html;
}

function populateLessonFilter() {
  if (!$filterLesson) return;

  const lessons = CATEGORIES.filter(id => id.startsWith('lesson-'));

  let html = '<option value="">Toutes les leçons</option>';
  lessons.forEach(id => {
    const label = CATEGORY_LABELS[id] || id;
    html += `<option value="${id}">${escapeHtml(label)}</option>`;
  });

  $filterLesson.innerHTML = html;
}

function populateLanguageFilter() {
  if (!$filterLanguage) return;

  // Détecter les langues présentes dans allHymns
  const langs = new Set();
  allHymns.forEach(item => {
    const versions = Array.isArray(item.hymn.versions) ? item.hymn.versions : [];
    versions.forEach(v => {
      const lbl = v && v.language && v.language.label;
      if (lbl) langs.add(lbl);
    });
  });

  const sorted = [...langs].sort((a, b) => a.localeCompare(b, 'fr'));

  let html = '<option value="">Toutes les langues</option>';
  sorted.forEach(lang => {
    html += `<option value="${escapeHtml(lang)}">${escapeHtml(lang)}</option>`;
  });

  $filterLanguage.innerHTML = html;
}

// ------------------------------------------------------------
// Filtrage par catégorie / leçon / langue
// ------------------------------------------------------------
function matchesFilters(item) {
  // Filtre catégorie
  if (activeFilters.category && item.category !== activeFilters.category) {
    return false;
  }

  // Filtre leçon (redondant avec catégorie pour lesson-*, mais utile si filtre leçon seul)
  if (activeFilters.lesson && item.category !== activeFilters.lesson) {
    return false;
  }

  // Filtre langue (au moins une version doit correspondre)
  if (activeFilters.language) {
    const versions = Array.isArray(item.hymn.versions) ? item.hymn.versions : [];
    const hasLang = versions.some(v => v && v.language && v.language.label === activeFilters.language);
    if (!hasLang) return false;
  }

  return true;
}

function countActiveFilters() {
  let n = 0;
  if (activeFilters.category) n++;
  if (activeFilters.lesson)   n++;
  if (activeFilters.language) n++;
  return n;
}

function updateFilterBadge() {
  const n = countActiveFilters();
  if (!$filterBadge) return;
  if (n === 0) {
    $filterBadge.hidden = true;
  } else {
    $filterBadge.textContent = n;
    $filterBadge.hidden = false;
  }
}

// ------------------------------------------------------------
// Recherche
// ------------------------------------------------------------
function performSearch(query) {
  const q = normalize(query.trim());

  // Reset
  $searchResults.innerHTML = '';
  $searchEmpty.hidden = true;
  $searchHint.hidden = true;
  $searchLoading.hidden = true;

  // Aucune requête → hint
  if (!q) {
    $searchHint.hidden = false;
    updateCounts(0, 0, 0);
    return;
  }

  // Étape 1 : filtrer d'abord par catégorie/leçon/langue
  const filtered = allHymns.filter(matchesFilters);

  // Étape 2 : filtrer selon le mode (titre/contenu/tous)
  let matches;
  if (currentMode === 'title') {
    matches = filtered.filter(it => it.searchTitle.includes(q));
  } else if (currentMode === 'content') {
    matches = filtered.filter(it => it.searchContent.includes(q));
  } else {
    matches = filtered.filter(it =>
      it.searchTitle.includes(q) || it.searchContent.includes(q)
    );
  }

  // Compteurs (sur les items déjà filtrés par catégorie/leçon/langue)
  const countTitle = filtered.filter(it => it.searchTitle.includes(q)).length;
  const countContent = filtered.filter(it => it.searchContent.includes(q)).length;
  const countAll = filtered.filter(it =>
    it.searchTitle.includes(q) || it.searchContent.includes(q)
  ).length;
  updateCounts(countAll, countTitle, countContent);

  // Aucun résultat
  if (matches.length === 0) {
    $searchEmptyQ.textContent = query;
    $searchEmpty.hidden = false;
    return;
  }

  // Limiter à 100 pour la perf
  const limited = matches.slice(0, 100);
  $searchResults.innerHTML = limited.map(it => renderResult(it, query)).join('');
  if (window.lucide) lucide.createIcons();
}

function updateCounts(all, title, content) {
  if ($chipCounts.all)     $chipCounts.all.textContent = all;
  if ($chipCounts.title)   $chipCounts.title.textContent = title;
  if ($chipCounts.content) $chipCounts.content.textContent = content;
}

function debouncedSearch() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    performSearch($searchInput.value);
  }, DEBOUNCE_MS);
}

// ------------------------------------------------------------
// Événements
// ------------------------------------------------------------
$searchInput.addEventListener('input', () => {
  const hasValue = $searchInput.value.length > 0;
  $searchClear.hidden = !hasValue;
  debouncedSearch();
});

$searchClear.addEventListener('click', () => {
  $searchInput.value = '';
  $searchClear.hidden = true;
  $searchInput.focus();
  performSearch('');
});

document.querySelectorAll('.search-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.search-chip').forEach(c => c.classList.remove('is-active'));
    chip.classList.add('is-active');
    currentMode = chip.dataset.mode;
    performSearch($searchInput.value);
  });
});

if ($backButton) {
  $backButton.addEventListener('click', () => {
    if (document.referrer) history.back();
    else window.location.href = 'index.html';
  });
}

// ------------------------------------------------------------
// Panneau filtres : ouverture / fermeture
// ------------------------------------------------------------
function openFilters() {
  if (!$filtersBackdrop || !$filtersSheet) return;
  $filtersBackdrop.hidden = false;
  $filtersSheet.hidden = false;
  // Pré-remplir avec les valeurs actuelles
  if ($filterCategory) $filterCategory.value = activeFilters.category;
  if ($filterLesson)   $filterLesson.value   = activeFilters.lesson;
  if ($filterLanguage) $filterLanguage.value = activeFilters.language;
  updateFiltersCount();
}

function closeFilters() {
  if ($filtersBackdrop) $filtersBackdrop.hidden = true;
  if ($filtersSheet) $filtersSheet.hidden = true;
}

function updateFiltersCount() {
  if (!$filtersCount) return;
  // Compter les résultats qui matcheraient avec les filtres actuels du panneau
  const draft = {
    category: $filterCategory ? $filterCategory.value : '',
    lesson:   $filterLesson   ? $filterLesson.value   : '',
    language: $filterLanguage ? $filterLanguage.value : ''
  };

  const q = normalize($searchInput.value.trim());
  const count = allHymns.filter(item => {
    // Filtres (version draft)
    if (draft.category && item.category !== draft.category) return false;
    if (draft.lesson   && item.category !== draft.lesson)   return false;
    if (draft.language) {
      const versions = Array.isArray(item.hymn.versions) ? item.hymn.versions : [];
      const hasLang = versions.some(v => v && v.language && v.language.label === draft.language);
      if (!hasLang) return false;
    }
    // Texte (si recherche en cours)
    if (q) {
      if (!item.searchTitle.includes(q) && !item.searchContent.includes(q)) return false;
    }
    return true;
  }).length;

  $filtersCount.textContent = count;
}

if ($filterBtn) {
  $filterBtn.addEventListener('click', openFilters);
}
if ($filtersBackdrop) {
  $filtersBackdrop.addEventListener('click', closeFilters);
}
if ($filtersReset) {
  $filtersReset.addEventListener('click', () => {
    if ($filterCategory) $filterCategory.value = '';
    if ($filterLesson)   $filterLesson.value   = '';
    if ($filterLanguage) $filterLanguage.value = '';
    updateFiltersCount();
  });
}
if ($filtersApply) {
  $filtersApply.addEventListener('click', () => {
    activeFilters.category = $filterCategory ? $filterCategory.value : '';
    activeFilters.lesson   = $filterLesson   ? $filterLesson.value   : '';
    activeFilters.language = $filterLanguage ? $filterLanguage.value : '';
    updateFilterBadge();
    closeFilters();
    performSearch($searchInput.value);
  });
}
// Mettre à jour le compteur à chaque changement de select
[$filterCategory, $filterLesson, $filterLanguage].forEach(sel => {
  if (sel) sel.addEventListener('change', updateFiltersCount);
});

// ------------------------------------------------------------
// Démarrage
// ------------------------------------------------------------
(async () => {
  $searchLoading.hidden = false;
  $searchHint.hidden = true;

  await buildIndex();

  // Peupler les dropdowns de filtres
  populateCategoryFilter();
  populateLessonFilter();
  populateLanguageFilter();
  updateFilterBadge();

  $searchLoading.hidden = true;

  // Pré-remplir depuis ?q= (si on vient de l'accueil)
  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q');
  if (initialQuery) {
    $searchInput.value = initialQuery;
    $searchClear.hidden = false;
    performSearch(initialQuery);
    // Retirer le focus auto pour ne pas ouvrir le clavier
  } else {
    $searchHint.hidden = false;
    // Focus automatique uniquement si vide
    $searchInput.focus();
  }

  if (window.lucide) lucide.createIcons();
})();
