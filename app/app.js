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
    afficherRecents();
  } catch (err) {
    console.error('Erreur de chargement des cantiques :', err);
    afficherRecents();
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

function afficherRecents() {
  const historique = chargerHistorique();

  let elements = historique
    .map(item => {
      const id = (typeof item === 'string') ? item : item.id;
      return etat.cantiques.find(c => c.id === id);
    })
    .filter(Boolean);

  // État vide : aucun cantique consulté pour l'instant
  if (elements.length === 0) {
    $recents.innerHTML =
      '<p class="recent-empty">Vos cantiques récemment ouverts apparaîtront ici.</p>';
    if (window.lucide) lucide.createIcons();
    return;
  }

  $recents.innerHTML = '';

  elements.slice(0, 5).forEach((cantique) => {
    const index = etat.cantiques.indexOf(cantique);

    const button = document.createElement('button');
    button.className = 'recent-item';
    button.dataset.id = cantique.id;

    const version = versionPrincipale(cantique);
    const lang = (version && version.language && version.language.label)
      ? version.language.label
      : 'Langue à confirmer';

    button.innerHTML =
      '<span class="recent-number">' +
      echapper(numero(cantique, index)) +
      '</span>' +
      '<span class="recent-content">' +
        '<span class="recent-title">' +
        echapper(titre(cantique, index)) +
        '</span>' +
        '<span class="recent-meta">' +
        echapper(lang) +
        '</span>' +
      '</span>' +
      '<span class="recent-arrow" aria-hidden="true"><i data-lucide="chevron-right"></i></span>';

    button.addEventListener('click', () => ouvrirCantique(cantique.id));
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

function ouvrirCantique(id) {
  enregistrerRecent(id, 'lesson-1');
  const cantique = etat.cantiques.find(c => c.id === id);
  if (!cantique) return;
  window.location.href =
    `cantique.html?hymn=${encodeURIComponent(cantique.id)}&category=lesson-1`;
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
