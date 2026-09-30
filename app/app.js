// ============================================================
// Cantiques EUJC — Accueil v1
// ============================================================

const etat = {
  cantiques: [],
  recents: []
};

const $recherche = document.getElementById('recherche');
const $recents = document.getElementById('recents');
const $voirTout = document.getElementById('voir-tout');

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
    .map(id => etat.cantiques.find(c => c.id === id))
    .filter(Boolean);

  // En attendant que l'historique soit alimenté par l'écran de lecture,
  // on utilise quelques données du corpus pour rendre l'accueil exploitable.
  if (elements.length === 0) {
    elements = etat.cantiques.slice(0, 3);
  }

  $recents.innerHTML = '';

  elements.slice(0, 5).forEach((cantique) => {
    const index = etat.cantiques.indexOf(cantique);

    const button = document.createElement('button');
    button.className = 'recent-item';
    button.dataset.id = cantique.id;

    button.innerHTML =
      '<span class="recent-number">' +
      echapper(numero(cantique, index)) +
      '</span>' +
      '<span class="recent-title">' +
      echapper(titre(cantique, index)) +
      '</span>' +
      '<span class="recent-arrow" aria-hidden="true"><i data-lucide="chevron-right"></i></span>';

    button.addEventListener('click', () => ouvrirCantique(cantique.id));

    $recents.appendChild(button);
  });

  // Les récents sont générés dynamiquement après le chargement initial.
  // On demande donc à Lucide de convertir aussi leurs icônes.
  if (window.lucide) {
    lucide.createIcons();
  }
}

function enregistrerRecent(id) {
  let historiques = chargerHistorique();

  historiques = [
    id,
    ...historiques.filter(item => item !== id)
  ].slice(0, 20);

  localStorage.setItem(
    'cantiques-eujc-recents',
    JSON.stringify(historiques)
  );
}

function ouvrirCantique(id) {
  enregistrerRecent(id);

  const cantique = etat.cantiques.find(c => c.id === id);

  if (!cantique) return;

  window.location.href = `cantique.html?hymn=${encodeURIComponent(cantique.id)}`;
}

function lancerRecherche() {
  const valeur = $recherche.value.trim();

  if (!valeur) {
    $recherche.focus();
    return;
  }

  alert(
    'Recherche : ' +
    valeur +
    '\n\nL’écran de recherche sera raccordé dans la prochaine étape.'
  );
}

document.querySelectorAll('.quick-card').forEach(button => {
  button.addEventListener('click', () => {
    const action = button.dataset.action;

    alert(
      {
        lecons: 'Leçons du Chemin',
        dimanche: 'Cantiques du Dimanche',
        priere: 'Cantiques de prière'
      }[action] +
      '\n\nL’écran correspondant sera raccordé ensuite.'
    );
  });
});

document.querySelectorAll('.nav-item').forEach(button => {
  button.addEventListener('click', () => {
    const destination = button.dataset.nav;

    if (destination === 'accueil') return;

    if (destination === 'bibliotheque') {
      window.location.href = 'categories.html';
      return;
    }

    alert(
      {
        recherche: 'Recherche',
        plus: 'Plus'
      }[destination] +
      '\n\nCette section sera construite ensuite.'
    );
  });
});

document.getElementById('btn-parametres')
  .addEventListener('click', () => {
    alert('Paramètres — écran à construire.');
  });

$voirTout.addEventListener('click', () => {
  alert('Bibliothèque — écran à construire.');
});

$recherche.addEventListener('keydown', event => {
  if (event.key === 'Enter') {
    lancerRecherche();
  }
});

chargerCantiques();
