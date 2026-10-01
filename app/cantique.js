// ============================================================
// Cantiques EUJC — Détail d'un cantique
// ============================================================
const detailRoot   = document.getElementById('hymn-detail');
const actionBar    = document.getElementById('action-bar');
const backButton   = document.getElementById('back-button');
const btnFavorite  = document.getElementById('btn-favorite');
const btnShare     = document.getElementById('btn-share');
const btnMenu      = document.getElementById('btn-menu');
const btnReading   = document.getElementById('btn-reading-mode');
const btnTextSize  = document.getElementById('btn-text-size');
const btnNext      = document.getElementById('btn-next');
const btnPrev      = document.getElementById('btn-prev');
const menuBackdrop = document.getElementById('menu-backdrop');
const menuSheet    = document.getElementById('menu-sheet');
const menuCopy     = document.getElementById('menu-copy');
const menuCategory = document.getElementById('menu-open-category');
const menuSignaler = document.getElementById('menu-signaler');
const menuClose    = document.getElementById('menu-close');
const reportCta    = document.getElementById('report-cta');
const reportCtaBtn = document.getElementById('report-cta-btn');

const detailParams = new URLSearchParams(window.location.search);
const hymnId       = detailParams.get('hymn');
const categoryId   = detailParams.get('category') || 'lesson-1';

let currentHymn     = null;
let currentVersion  = null;
let allHymnsInCat   = [];
let currentIndex    = -1;

// ------------------------------------------------------------
// Utilitaires
// ------------------------------------------------------------
function escapeHtml(value) {
  const el = document.createElement('div');
  el.textContent = value == null ? '' : String(value);
  return el.innerHTML;
}

// ------------------------------------------------------------
// Rendu des blocs de paroles
// ------------------------------------------------------------
function renderBlock(block, index) {
  const type = block.type || 'source_block';
  const lines = (block.lines || [])
    .map(line => `<p>${escapeHtml(line)}</p>`)
    .join('');

  if (type === 'refrain') {
    return `<section class="lyric-block lyric-block-refrain">
      <h2>Refrain</h2>
      <div class="lyric-lines">${lines}</div>
    </section>`;
  }

  if (type === 'comment') {
    return `<section class="lyric-block lyric-block-comment">
      <h2>Commentaire</h2>
      <div class="lyric-lines">${lines}</div>
    </section>`;
  }

  // source_block / verse : on affiche un numéro à gauche
  const num = block.number || index + 1;
  return `<section class="lyric-block lyric-block-${escapeHtml(type)}">
    <div class="lyric-number">${escapeHtml(String(num))}.</div>
    <div class="lyric-lines">${lines}</div>
  </section>`;
}

// ------------------------------------------------------------
// Rendu principal
// ------------------------------------------------------------
function renderHymn(hymn, versionIndex) {
  currentHymn = hymn;
  const versions = Array.isArray(hymn.versions) ? hymn.versions : [];
  const version = versions[versionIndex] || versions[0];
  currentVersion = version;

  if (!version) {
    detailRoot.innerHTML =
      '<p class="detail-empty">Aucune version disponible.</p>';
    return;
  }

  const source = version.source || {};
  const numberLabel = source.number ? `N° ${source.number}` : '';
  const langLabel = (version.language && version.language.label) || 'Langue à confirmer';
  const blocks = (version.content || []).map(renderBlock).join('');

  document.title = `${version.title || hymn.title} — Cantiques EUJC`;

  // Onglets des versions (si plus d'une)
  let versionTabs = '';
  if (versions.length > 1) {
    const tabs = versions.map((v, i) => {
      const label = (v.language && v.language.label) || `Version ${i + 1}`;
      const active = i === versionIndex ? ' is-active' : '';
      return `<button class="version-tab${active}" data-index="${i}" type="button">${escapeHtml(label)}</button>`;
    }).join('');
    versionTabs = `<div class="version-tabs" role="tablist">${tabs}</div>`;
  }

  detailRoot.innerHTML = `
    <header class="hymn-detail-intro">
      ${numberLabel ? `<p class="hymn-number-label">${escapeHtml(numberLabel)}</p>` : ''}
      <h1>${escapeHtml(version.title || hymn.title)}</h1>
      <p class="hymn-metadata">${escapeHtml(langLabel)}${categoryId ? ' · ' + escapeHtml(prettyCategory(categoryId)) : ''}</p>
    </header>
    ${versionTabs}
    <div class="hymn-lyrics">
      ${blocks || '<p class="detail-empty">Aucune parole disponible.</p>'}
    </div>
  `;

  // Brancher les onglets de version
  detailRoot.querySelectorAll('.version-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const idx = parseInt(tab.dataset.index, 10);
      renderHymn(hymn, idx);
    });
  });

  // Mettre à jour l'état favori
  updateFavoriteButton(hymn);

  // Afficher la barre d'action
  actionBar.hidden = false;

  // Afficher la barre "Signaler"
  if (reportCta) reportCta.hidden = false;

  if (window.lucide) lucide.createIcons();
}

function prettyCategory(id) {
  if (!id) return '';
  // lesson-1 → Leçon 1
  const lessonMatch = id.match(/^lesson-(\d+)/);
  if (lessonMatch) return `Leçon ${lessonMatch[1]}`;
  if (id.startsWith('dimanche-')) return 'Dimanche';
  if (id.startsWith('priere-')) return 'Prière';
  return id;
}

// ------------------------------------------------------------
// Favoris
// ------------------------------------------------------------
function updateFavoriteButton(hymn) {
  if (!btnFavorite || typeof isFavorite !== 'function') return;
  const fav = isFavorite(hymn.id);
  btnFavorite.classList.toggle('is-active', fav);
  btnFavorite.setAttribute(
    'aria-label',
    fav ? 'Retirer des favoris' : 'Ajouter aux favoris'
  );
  const svg = btnFavorite.querySelector('svg');
  if (svg) svg.setAttribute('fill', fav ? 'currentColor' : 'none');
}

if (btnFavorite) {
  btnFavorite.addEventListener('click', () => {
    if (!currentHymn || typeof toggleFavorite !== 'function') return;
    const nowFav = toggleFavorite(currentHymn.id, categoryId);
    btnFavorite.classList.toggle('is-active', nowFav);
    btnFavorite.setAttribute(
      'aria-label',
      nowFav ? 'Retirer des favoris' : 'Ajouter aux favoris'
    );
    const svg = btnFavorite.querySelector('svg');
    if (svg) svg.setAttribute('fill', nowFav ? 'currentColor' : 'none');
  });
}

// ------------------------------------------------------------
// Partage
// ------------------------------------------------------------
if (btnShare) {
  btnShare.addEventListener('click', async () => {
    if (!currentVersion) return;
    const title = currentVersion.title || currentHymn.title;
    const url = window.location.href;
    const text = `${title} — Cantiques EUJC`;

    if (navigator.share) {
      try {
        await navigator.share({ title: text, text, url });
      } catch (e) { /* annulé */ }
    } else {
      // Fallback : copier le lien
      try {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        alert('Lien copié dans le presse-papier');
      } catch {
        prompt('Copiez ce lien :', url);
      }
    }
  });
}

// ------------------------------------------------------------
// Menu contextuel
// ------------------------------------------------------------
function openMenu() {
  menuBackdrop.hidden = false;
  menuSheet.hidden = false;
}
function closeMenu() {
  menuBackdrop.hidden = true;
  menuSheet.hidden = true;
}

if (btnMenu)   btnMenu.addEventListener('click', openMenu);
if (menuSignaler) {
  menuSignaler.addEventListener('click', () => {
    console.log('[DEBUG] Clic sur Signaler');
    console.log('[DEBUG] hymnId =', hymnId);
    console.log('[DEBUG] categoryId =', categoryId);
    console.log('[DEBUG] openSignaler typeof =', typeof openSignaler);
    closeMenu();
    openSignaler();
  });
}

if (reportCtaBtn) {
  reportCtaBtn.addEventListener('click', openSignaler);
}
if (menuClose) menuClose.addEventListener('click', closeMenu);
if (menuBackdrop) menuBackdrop.addEventListener('click', closeMenu);

if (menuCopy) {
  menuCopy.addEventListener('click', async () => {
    if (!currentVersion) return;
    const text = (currentVersion.content || [])
      .map(b => (b.lines || []).join('\n'))
      .join('\n\n');
    try {
      await navigator.clipboard.writeText(text);
      alert('Paroles copiées');
    } catch {
      alert('Impossible de copier');
    }
    closeMenu();
  });
}

if (menuCategory) {
  menuCategory.addEventListener('click', () => {
    window.location.href = `cantiques.html?category=${encodeURIComponent(categoryId)}`;
  });
}

// ------------------------------------------------------------
// Mode lecture
// ------------------------------------------------------------
if (btnReading) {
  btnReading.addEventListener('click', () => {
    document.body.classList.toggle('is-reading-mode');
    const isDark = document.body.classList.contains('is-reading-mode');
    btnReading.querySelector('span').textContent = isDark ? 'Mode clair' : 'Mode lecture';
    const icon = btnReading.querySelector('i');
    if (icon) icon.setAttribute('data-lucide', isDark ? 'sun' : 'book-open');
    if (window.lucide) lucide.createIcons();
  });
}

// ------------------------------------------------------------
// Taille du texte
// ------------------------------------------------------------
const TEXT_SIZES = [15, 17, 19, 22];
let currentSizeIdx = 1;

// Restaurer la taille sauvegardée
const savedSize = parseInt(localStorage.getItem('cantiques-eujc-text-size'), 10);
if (!isNaN(savedSize) && TEXT_SIZES.includes(savedSize)) {
  currentSizeIdx = TEXT_SIZES.indexOf(savedSize);
}
document.documentElement.style.setProperty(
  '--hymn-font-size',
  TEXT_SIZES[currentSizeIdx] + 'px'
);

if (btnTextSize) {
  btnTextSize.addEventListener('click', () => {
    currentSizeIdx = (currentSizeIdx + 1) % TEXT_SIZES.length;
    const size = TEXT_SIZES[currentSizeIdx];
    document.documentElement.style.setProperty('--hymn-font-size', size + 'px');
    localStorage.setItem('cantiques-eujc-text-size', String(size));
  });
}

// ------------------------------------------------------------
// Navigation "Suivant" / retour
// ------------------------------------------------------------
if (btnNext) {
  btnNext.addEventListener('click', () => {
    if (currentIndex < 0 || allHymnsInCat.length === 0) return;
    const nextIdx = (currentIndex + 1) % allHymnsInCat.length;
    const nextHymn = allHymnsInCat[nextIdx];
    window.location.href = `cantique.html?hymn=${encodeURIComponent(nextHymn.id)}`
                         + `&category=${encodeURIComponent(categoryId)}`;
  });
}
if (btnPrev) {
  btnPrev.addEventListener('click', () => {
    if (currentIndex < 0 || allHymnsInCat.length === 0) return;
    const prevIdx = (currentIndex - 1 + allHymnsInCat.length) % allHymnsInCat.length;
    const prevHymn = allHymnsInCat[prevIdx];
    window.location.href = `cantique.html?hymn=${encodeURIComponent(prevHymn.id)}`
                         + `&category=${encodeURIComponent(categoryId)}`;
  });
}

if (backButton) {
  backButton.addEventListener('click', () => {
    if (document.referrer) history.back();
    else window.location.href = `cantiques.html?category=${encodeURIComponent(categoryId)}`;
  });
}

// ------------------------------------------------------------
// Chargement
// ------------------------------------------------------------
// ------------------------------------------------------------
// Signalement
// ------------------------------------------------------------
function openSignaler() {
  if (!hymnId) return;
  const url = `signaler.html?hymn=${encodeURIComponent(hymnId)}`
            + `&category=${encodeURIComponent(categoryId)}`;
  window.location.href = url;
}

async function loadDetail() {
  if (!hymnId) {
    detailRoot.innerHTML = '<p class="detail-empty">Cantique introuvable.</p>';
    return;
  }

  try {
    const corpus = await loadCanonicalLesson(categoryId);
    const hymns = Array.isArray(corpus.hymns) ? corpus.hymns : [];
    allHymnsInCat = hymns;

    const hymn = hymns.find(h => h.id === hymnId);
    if (!hymn) {
      detailRoot.innerHTML = '<p class="detail-empty">Cantique introuvable.</p>';
      return;
    }

    currentIndex = hymns.indexOf(hymn);
    renderHymn(hymn, 0);

    // Enregistrer dans l'historique
    if (typeof addRecent === 'function') {
      addRecent(hymnId, categoryId);
    }
  } catch (error) {
    console.error('Impossible de charger le cantique :', error);
    detailRoot.innerHTML =
      '<p class="detail-empty">Impossible de charger ce cantique.</p>';
  }
}

loadDetail();
