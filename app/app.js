// ============================================================
// Cantiques EUJC — Accueil v1 (avec storage.js)
// ============================================================

const etat = {
  cantiques: [],
  recents: []
};

const $recherche  = document.getElementById('recherche');
const $recents    = document.getElementById('recents');
const $voirTout   = document.getElementById('voir-tout');

function echapper(s) {
  const d = document.createElement('div');
  d.textContent = s == null ? '' : String(s);
  return d.innerHTML;
}

function versionPrincipale(cantique) {
  return getPrimaryVersion(cantique);
}

function numero(cantique, index) {
  const sourceNumber = versionPrincipale(cantique)?.source?.number;
  if (sourceNumber != null) return sourceNumber;
  return String(index + 1);
}

function titre(cantique, index) {
  const v = versionPrincipale(cantique);
  return (v && v.title) || cantique?.title || `Cantique ${numero(cantique, index)}`;
}

async function chargerCantiques() {
  try {
    const data = await loadCanonicalLesson();
    etat.cantiques = Array.isArray(data.hymns) ? data.hymns : [];
    await afficherRecents();
  } catch (err) {
    console.error('Erreur de chargement des cantiques :', err);
    await afficherRecents();
  }
}

function chargerHistorique() {
  // Priorité : storage.js (nouveau format d'objets)
  if (typeof getRecents === 'function') {
    return getRecents();
  }
  // Fallback legacy (ancien format de strings)
  try {
    const data = JSON.parse(
      localStorage.getItem('cantiques-eujc-recents') || '[]'
    );
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

// Cache de corpus pour retrouver un cantique hors lesson-1
const _corpusCache = new Map();
async function _getCorpus(category) {
  if (_corpusCache.has(category)) return _corpusCache.get(category);
  try {
    const data = await loadCanonicalLesson(category);
    _corpusCache.set(category, data);
    return data;
  } catch {
    _corpusCache.set(category, null);
    return null;
  }
}

async function afficherRecents() {
  const historique = chargerHistorique();

  // Grouper les ids par catégorie (format {id, category, ts})
  const byCat = new Map();
  historique.forEach(item => {
    const id  = (typeof item === 'string') ? item : item.id;
    const cat = (item && typeof item === 'object' && item.category)
      ? item.category
      : 'lesson-1';
    if (!id) return;
    if (!byCat.has(cat)) byCat.set(cat, []);
    byCat.get(cat).push(id);
  });

  // Résoudre chaque cantique dans SON corpus
  const elements = [];
  for (const [cat, ids] of byCat.entries()) {
    const corpus = (cat === 'lesson-1' && etat.cantiques.length)
      ? { hymns: etat.cantiques }
      : await _getCorpus(cat);
    if (!corpus || !Array.isArray(corpus.hymns)) continue;
    ids.forEach(id => {
      const hymn = corpus.hymns.find(h => h.id === id);
      if (hymn) elements.push({ hymn, category: cat });
    });
  }

  // État vide : proposer une découverte
  if (elements.length === 0) {
    $recents.innerHTML =
      '<div class="recent-empty-cta">' +
        '<p class="recent-empty-cta-title">Nouveau ici ?</p>' +
        '<p class="recent-empty-cta-text">Découvrez le parcours biblique en 27 étapes, du récit de la Création à celui de Job.</p>' +
        '<a href="lessons.html" class="recent-empty-cta-btn">Explorer les Leçons du Chemin <i data-lucide="arrow-right"></i></a>' +
      '</div>';
    if (window.lucide) lucide.createIcons();
    return;
  }

  $recents.innerHTML = '';
  elements.slice(0, 5).forEach(({ hymn, category }) => {
    const index = etat.cantiques.indexOf(hymn);
    const version = versionPrincipale(hymn);
    const lang = (version && version.language && version.language.label)
      ? version.language.label
      : 'Langue à confirmer';

    const button = document.createElement('button');
    button.className = 'recent-item';
    button.dataset.id = hymn.id;

    button.innerHTML =
      '<span class="recent-number">' +
      echapper(numero(hymn, index)) +
      '</span>' +
      '<span class="recent-content">' +
        '<span class="recent-title">' +
        echapper(titre(hymn, index)) +
        '</span>' +
        '<span class="recent-meta">' +
        echapper(lang) +
        '</span>' +
      '</span>' +
      '<span class="recent-arrow" aria-hidden="true"><i data-lucide="chevron-right"></i></span>';

    button.addEventListener('click', () => ouvrirCantique(hymn.id, category));
    $recents.appendChild(button);
  });

  if (window.lucide) lucide.createIcons();
}

function enregistrerRecent(id, category) {
  if (typeof addRecent === 'function') {
    addRecent(id, category || 'lesson-1');
    return;
  }
  // Fallback legacy
  let historiques = chargerHistorique();
  historiques = [id, ...historiques.filter(item => item !== id)].slice(0, 20);
  localStorage.setItem(
    'cantiques-eujc-recents',
    JSON.stringify(historiques)
  );
}

function ouvrirCantique(id, category) {
  const cat = category || 'lesson-1';
  enregistrerRecent(id, cat);

  let cantique = etat.cantiques.find(c => c.id === id);
  if (!cantique) {
    const cached = _corpusCache.get(cat);
    if (cached && Array.isArray(cached.hymns)) {
      cantique = cached.hymns.find(h => h.id === id);
    }
  }
  if (!cantique) return;

  const url = (typeof buildCantiqueUrl === 'function')
    ? buildCantiqueUrl(cantique, cat)
    : `cantique.html?hymn=${encodeURIComponent(cantique.id)}&category=${encodeURIComponent(cat)}`;
  window.location.href = url;
}

function lancerRecherche() {
  const valeur = $recherche.value.trim();
  if (!valeur) { $recherche.focus(); return; }
  window.location.href = `recherche.html?q=${encodeURIComponent(valeur)}`;
}

document.querySelectorAll('.quick-card').forEach(button => {
  button.addEventListener('click', () => {
    const action = button.dataset.action;
    if (action === 'lecons')   { window.location.href = 'lessons.html';   return; }
    if (action === 'dimanche') { window.location.href = 'dimanche.html';  return; }
    if (action === 'priere')   { window.location.href = 'priere.html';    return; }
    if (action === 'a-classer') { window.location.href = 'a-classer.html'; return; }
  });
});

document.querySelectorAll('.nav-item').forEach(button => {
  button.addEventListener('click', () => {
    const destination = button.dataset.nav;

    // Liens déjà gérés par le href natif : on laisse passer
    if (destination === 'accueil') return;
    if (destination === 'bibliotheque') return;
    if (destination === 'recherche') return;

    // 'plus' est géré par un lien <a> natif
  });
});

const $btnParametres = document.getElementById('btn-parametres');
if ($btnParametres) {
  $btnParametres.addEventListener('click', () => {
    window.location.href = 'parametres.html';
  });
}

const $btnFavoris = document.getElementById('btn-favoris');
if ($btnFavoris) {
  $btnFavoris.addEventListener('click', () => {
    window.location.href = 'favoris.html';
  });
}

$voirTout.addEventListener('click', () => {
  window.location.href = 'historique.html';
});

$recherche.addEventListener('keydown', event => {
  if (event.key === 'Enter') lancerRecherche();
});

chargerCantiques();
