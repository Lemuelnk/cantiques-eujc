// ============================================================
// Cantiques EUJC — application PWA
// ============================================================

const etat = {
  cantiques: [],
  filtreTexte: '',
  filtreType: '',
  filtreLecon: '',
  cantiqueCourant: null
};

const $liste = document.getElementById('liste-cantiques');
const $vide = document.getElementById('liste-vide');
const $recherche = document.getElementById('recherche');
const $filtreType = document.getElementById('filtre-type');
const $filtreLecon = document.getElementById('filtre-lecon');
const $vueListe = document.getElementById('vue-liste');
const $vueCantique = document.getElementById('vue-cantique');
const $contenu = document.getElementById('contenu-cantique');
const $btnRetour = document.getElementById('btn-retour');
const $titreApp = document.getElementById('titre-app');

async function chargerCantiques() {
  try {
    const reponse = await fetch('data/cantiques.json');
    if (!reponse.ok) throw new Error('HTTP ' + reponse.status);
    const data = await reponse.json();
    etat.cantiques = data.cantiques || [];
    afficherListe();
  } catch (err) {
    $liste.innerHTML = '';
    $vide.hidden = false;
    $vide.textContent = 'Erreur de chargement : ' + err.message;
  }
}

function normaliser(texte) {
  return (texte || '').toString().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function versionFr(cantique) {
  return cantique.versions.find(v => v.langue === 'fr') || cantique.versions[0];
}

function echapper(s) {
  const d = document.createElement('div');
  d.textContent = s == null ? '' : String(s);
  return d.innerHTML;
}

function afficherListe() {
  const q = normaliser(etat.filtreTexte);
  const resultats = etat.cantiques.filter(c => {
    if (etat.filtreType && c.type !== etat.filtreType) return false;
    if (etat.filtreLecon && c.lecon !== etat.filtreLecon) return false;
    if (!q) return true;
    return c.versions.some(v => {
      const texte = normaliser(
        [v.titre]
          .concat(v.refrain || [])
          .concat((v.couplets || []).flatMap(cp => cp.lignes || []))
          .join(' ')
      );
      return texte.includes(q);
    });
  });

  $liste.innerHTML = '';
  if (resultats.length === 0) {
    $vide.hidden = false;
    return;
  }
  $vide.hidden = true;

  resultats.forEach(c => {
    const v = versionFr(c);
    const li = document.createElement('li');
    li.dataset.id = c.id;
    const titres = c.versions.map(x => x.titre).filter(Boolean);
    const titreAffiche = (v && v.titre) || titres[0] || '(sans titre)';
    const metaParts = [];
    if (c.type) metaParts.push('<span class="badge">' + echapper(c.type) + '</span>');
    if (c.lecon) metaParts.push('<span class="badge">' + echapper(c.lecon) + '</span>');
    const langues = c.versions.map(x => x.langue.toUpperCase()).join(' · ');
    metaParts.push('<span>' + langues + '</span>');
    li.innerHTML = '<div class="titre">' + echapper(titreAffiche) + '</div>'
                 + '<div class="meta">' + metaParts.join('') + '</div>';
    li.addEventListener('click', () => ouvrirCantique(c.id));
    $liste.appendChild(li);
  });
}

function ouvrirCantique(id) {
  const c = etat.cantiques.find(x => x.id === id);
  if (!c) return;
  etat.cantiqueCourant = c;
  const v = versionFr(c);
  const titres = c.versions.map(x => x.titre).filter(Boolean);
  const titreAffiche = (v && v.titre) || titres[0] || '(sans titre)';

  let html = '<h2>' + echapper(titreAffiche) + '</h2>';
  html += '<div class="meta-cantique">';
  if (c.type) html += 'Type : ' + echapper(c.type) + ' · ';
  if (c.lecon) html += 'Leçon : ' + echapper(c.lecon) + ' · ';
  html += 'Langues : ' + c.versions.map(x => x.langue.toUpperCase()).join(', ');
  html += '</div>';

  if (v && v.refrain && v.refrain.length) {
    html += '<div class="refrain"><span class="label">Refrain</span>';
    html += v.refrain.map(l => '<div class="ligne">' + echapper(l) + '</div>').join('');
    html += '</div>';
  }
  if (v && v.couplets) {
    v.couplets.forEach(cp => {
      html += '<div class="couplet">';
      html += '<div class="num">' + cp.ordre + '</div>';
      html += (cp.lignes || []).map(l => '<div class="ligne">' + echapper(l) + '</div>').join('');
      html += '</div>';
    });
  }
  if (c.versions.length > 1) {
    html += '<div class="actions"><button disabled>Autres langues (à venir)</button></div>';
  }

  $contenu.innerHTML = html;
  $vueListe.hidden = true;
  $vueCantique.hidden = false;
  $btnRetour.hidden = false;
  $titreApp.textContent = titreAffiche;
  window.scrollTo(0, 0);
}

function fermerCantique() {
  etat.cantiqueCourant = null;
  $vueCantique.hidden = true;
  $vueListe.hidden = false;
  $btnRetour.hidden = true;
  $titreApp.textContent = 'Cantiques EUJC';
  window.scrollTo(0, 0);
}

$recherche.addEventListener('input', e => {
  etat.filtreTexte = e.target.value;
  afficherListe();
});
$filtreType.addEventListener('change', e => {
  etat.filtreType = e.target.value;
  afficherListe();
});
$filtreLecon.addEventListener('change', e => {
  etat.filtreLecon = e.target.value;
  afficherListe();
});
$btnRetour.addEventListener('click', fermerCantique);

chargerCantiques();
