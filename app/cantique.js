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

  // SEO : adapter les métadonnées au cantique réellement affiché.
  // Le canonique conserve l'identifiant du cantique, pas les paramètres d'interface.
  const seoTitle = document.title;
  const seoDescription = `Consultez le cantique « ${version.title || hymn.title} »${langLabel ? ` en ${langLabel}` : ''} dans Cantiques EUJC, le recueil numérique des cantiques du Chemin, du Dimanche et de Prière.`;
  const canonicalUrl = new URL(window.location.href);
  canonicalUrl.hash = '';
  canonicalUrl.searchParams.sort();
  const canonical = canonicalUrl.href;

  function setSeoMeta(selector, attribute, key, value) {
    let element = document.head.querySelector(`${selector}[${attribute}="${key}"]`);
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attribute, key);
      document.head.appendChild(element);
    }
    element.setAttribute('content', value);
  }

  let canonicalLink = document.head.querySelector('link[rel="canonical"]');
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.rel = 'canonical';
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.href = canonical;

  const descriptionTag = document.head.querySelector('meta[name="description"]');
  if (descriptionTag) descriptionTag.content = seoDescription;
  else setSeoMeta('meta', 'name', 'description', seoDescription);

  setSeoMeta('meta', 'name', 'robots', 'index, follow, max-image-preview:large');
  setSeoMeta('meta', 'property', 'og:type', 'article');
  setSeoMeta('meta', 'property', 'og:site_name', 'Cantiques EUJC');
  setSeoMeta('meta', 'property', 'og:locale', 'fr_FR');
  setSeoMeta('meta', 'property', 'og:title', seoTitle);
  setSeoMeta('meta', 'property', 'og:description', seoDescription);
  setSeoMeta('meta', 'property', 'og:url', canonical);
  setSeoMeta('meta', 'property', 'og:image', 'https://cantiques-eujc.lnk-studio.com/assets/icons/icon-512.png');
  setSeoMeta('meta', 'name', 'twitter:card', 'summary');
  setSeoMeta('meta', 'name', 'twitter:title', seoTitle);
  setSeoMeta('meta', 'name', 'twitter:description', seoDescription);
  setSeoMeta('meta', 'name', 'twitter:image', 'https://cantiques-eujc.lnk-studio.com/assets/icons/icon-512.png');

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
// ------------------------------------------------------------
// Panneau de partage
// ------------------------------------------------------------
const $sharePanel         = document.getElementById('share-panel');
const $sharePanelBackdrop = document.getElementById('share-panel-backdrop');
const $sharePanelClose    = document.getElementById('share-panel-close');
const $shareImage         = document.getElementById('share-image');
const $shareLinkApp       = document.getElementById('share-link-app');
const $shareCopyLink      = document.getElementById('share-copy-link');
const $shareCopyLyrics    = document.getElementById('share-copy-lyrics');

function openSharePanel() {
  if (!$sharePanel || !$sharePanelBackdrop) return;
  $sharePanelBackdrop.hidden = false;
  $sharePanel.hidden = false;
}

function closeSharePanel() {
  if ($sharePanelBackdrop) $sharePanelBackdrop.hidden = true;
  if ($sharePanel) {
    $sharePanel.hidden = true;
    $sharePanel.style.transform = '';
  }
}

// --- Drag-to-dismiss du panneau Partager ---
(function enableShareDragToDismiss() {
  if (!$sharePanel) return;

  let startY = 0;
  let currentY = 0;
  let isDragging = false;

  function onTouchStart(e) {
    if ($sharePanel.scrollTop > 0) return;
    startY = e.touches[0].clientY;
    currentY = startY;
    isDragging = true;
    $sharePanel.style.transition = 'none';
  }

  function onTouchMove(e) {
    if (!isDragging) return;
    currentY = e.touches[0].clientY;
    const delta = currentY - startY;
    if (delta > 0) {
      $sharePanel.style.transform = `translateY(${delta}px)`;
    }
  }

  function onTouchEnd() {
    if (!isDragging) return;
    isDragging = false;
    const delta = currentY - startY;
    $sharePanel.style.transition = 'transform 200ms ease';

    if (delta > 100) {
      $sharePanel.style.transform = 'translateY(100%)';
      setTimeout(closeSharePanel, 200);
    } else {
      $sharePanel.style.transform = '';
    }
  }

  $sharePanel.addEventListener('touchstart', onTouchStart, { passive: true });
  $sharePanel.addEventListener('touchmove', onTouchMove, { passive: true });
  $sharePanel.addEventListener('touchend', onTouchEnd);
  $sharePanel.addEventListener('touchcancel', onTouchEnd);
})();

if (btnShare) {
  btnShare.addEventListener('click', openSharePanel);
}

if ($sharePanelClose) {
  $sharePanelClose.addEventListener('click', closeSharePanel);
}

if ($sharePanelBackdrop) {
  $sharePanelBackdrop.addEventListener('click', closeSharePanel);
}

// ------------------------------------------------------------
// Panneau Image
// ------------------------------------------------------------
const $shareImageBackdrop = document.getElementById('share-image-backdrop');
const $shareImagePanel    = document.getElementById('share-image-panel');
const $shareImageBack     = document.getElementById('share-image-back');
const $shareImageClose    = document.getElementById('share-image-close');
const $shareImageCanvas   = document.getElementById('share-image-canvas');
const $shareImageLoading  = document.getElementById('share-image-loading');
const $shareImageGenerate = document.getElementById('share-image-generate');
const $formatBtns         = document.querySelectorAll('.format-btn');

let currentImageFormat = '1:1';

function openImagePanel() {
  if (!$shareImagePanel || !$shareImageBackdrop) return;

  // Déterminer le format automatique selon la longueur
  if (window.ShareImage && currentHymn) {
    currentImageFormat = window.ShareImage.autoFormatFor(currentHymn);
  }

  // Mettre à jour les boutons de format
  $formatBtns.forEach(btn => {
    btn.classList.toggle('is-active', btn.dataset.format === currentImageFormat);
  });

  $shareImageBackdrop.hidden = false;
  $shareImagePanel.hidden = false;

  // Générer l'image après un petit délai (pour que le panneau soit affiché)
  setTimeout(generatePreview, 100);
}

function closeImagePanel() {
  if ($shareImageBackdrop) $shareImageBackdrop.hidden = true;
  if ($shareImagePanel) $shareImagePanel.hidden = true;
}

async function generatePreview() {
  if ($shareImageLoading) $shareImageLoading.hidden = false;

  if (!window.ShareImage) {
    console.error('[Preview] ShareImage non chargé');
    if ($shareImageLoading) $shareImageLoading.textContent = 'Erreur : ShareImage non chargé';
    return;
  }
  if (!currentHymn || !currentVersion) {
    console.error('[Preview] currentHymn ou currentVersion manquant');
    if ($shareImageLoading) $shareImageLoading.textContent = 'Erreur : cantique non chargé';
    return;
  }

  try {
    await window.ShareImage.waitFonts();
    window.ShareImage.generate($shareImageCanvas, currentHymn, currentVersion, currentImageFormat);
    if ($shareImageLoading) $shareImageLoading.hidden = true;
  } catch (err) {
    console.error('[Preview] Erreur de génération :', err);
    if ($shareImageLoading) $shareImageLoading.textContent = 'Erreur : ' + err.message;
  }
}

// Boutons du panneau image
if ($shareImageBack) {
  $shareImageBack.addEventListener('click', () => {
    closeImagePanel();
    openSharePanel();
  });
}

if ($shareImageClose) {
  $shareImageClose.addEventListener('click', closeImagePanel);
}

if ($shareImageBackdrop) {
  $shareImageBackdrop.addEventListener('click', closeImagePanel);
}

// Sélection du format
$formatBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    $formatBtns.forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    currentImageFormat = btn.dataset.format;
    generatePreview();
  });
});

// Option 1 : Partager le cantique (image)
if ($shareImage) {
  $shareImage.addEventListener('click', () => {
    closeSharePanel();
    openImagePanel();
  });
}

// Bouton Générer et partager
if ($shareImageGenerate) {
  $shareImageGenerate.addEventListener('click', async () => {
    if (!window.ShareImage || !$shareImageCanvas) return;

    const blob = await window.ShareImage.toBlob($shareImageCanvas);
    if (!blob) {
      alert('Impossible de générer l\'image');
      return;
    }

    const fileName = `cantique-${currentVersion.source?.number || 'eujc'}.png`;
    const file = new File([blob], fileName, { type: 'image/png' });

    // Essayer le partage natif d'abord
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: currentVersion.title || 'Cantique EUJC',
          text: 'Cantique EUJC — partagé depuis l\'application'
        });
        return;
      } catch (err) {
        // Si l'utilisateur annule, on n'affiche rien
        if (err.name === 'AbortError') return;
      }
    }

    // Fallback : télécharger l'image
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
}

// Drag-to-dismiss du panneau image
(function enableImageDragToDismiss() {
  if (!$shareImagePanel) return;

  let startY = 0, currentY = 0, isDragging = false;

  function onTouchStart(e) {
    if ($shareImagePanel.scrollTop > 0) return;
    startY = e.touches[0].clientY;
    currentY = startY;
    isDragging = true;
    $shareImagePanel.style.transition = 'none';
  }
  function onTouchMove(e) {
    if (!isDragging) return;
    currentY = e.touches[0].clientY;
    const delta = currentY - startY;
    if (delta > 0) $shareImagePanel.style.transform = `translateY(${delta}px)`;
  }
  function onTouchEnd() {
    if (!isDragging) return;
    isDragging = false;
    const delta = currentY - startY;
    $shareImagePanel.style.transition = 'transform 200ms ease';
    if (delta > 100) {
      $shareImagePanel.style.transform = 'translateY(100%)';
      setTimeout(closeImagePanel, 200);
    } else {
      $shareImagePanel.style.transform = '';
    }
  }

  $shareImagePanel.addEventListener('touchstart', onTouchStart, { passive: true });
  $shareImagePanel.addEventListener('touchmove', onTouchMove, { passive: true });
  $shareImagePanel.addEventListener('touchend', onTouchEnd);
  $shareImagePanel.addEventListener('touchcancel', onTouchEnd);
})();

// Option 2 : Partager avec le lien (Web Share API)
if ($shareLinkApp) {
  $shareLinkApp.addEventListener('click', async () => {
    if (!currentVersion) return;
    const title = currentVersion.title || currentHymn.title;
    const url = window.location.href;
    const text = `${title} — Cantiques EUJC`;
    closeSharePanel();
    if (navigator.share) {
      try { await navigator.share({ title: text, text, url }); } catch (e) {}
    } else {
      try {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        alert('Lien copié dans le presse-papier');
      } catch {
        prompt('Copiez ce lien :', url);
      }
    }
  });
}

// Option 3 : Copier le lien
if ($shareCopyLink) {
  $shareCopyLink.addEventListener('click', async () => {
    const url = window.location.href;
    closeSharePanel();
    try {
      await navigator.clipboard.writeText(url);
      alert('Lien copié dans le presse-papier');
    } catch {
      prompt('Copiez ce lien :', url);
    }
  });
}

// Option 4 : Copier les paroles
if ($shareCopyLyrics) {
  $shareCopyLyrics.addEventListener('click', async () => {
    if (!currentVersion) return;
    const title = currentVersion.title || currentHymn.title;
    const number = currentVersion.source && currentVersion.source.number
      ? `N° ${currentVersion.source.number}\n` : '';
    const blocks = (currentVersion.content || [])
      .map(b => (b.lines || []).join('\n'))
      .join('\n\n');
    const text = `${number}${title}\n\n${blocks}\n\n— Cantiques EUJC`;
    closeSharePanel();
    try {
      await navigator.clipboard.writeText(text);
      alert('Paroles copiées dans le presse-papier');
    } catch {
      prompt('Copiez ces paroles :', text);
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
// Panneau "Texte" (taille + police)
// ------------------------------------------------------------
const TEXT_SCALES = [0.85, 1, 1.15, 1.3];

const $textPanel         = document.getElementById('text-panel');
const $textPanelBackdrop = document.getElementById('text-panel-backdrop');
const $textPanelClose    = document.getElementById('text-panel-close');
const $textPanelSlider   = document.getElementById('text-panel-slider');
const $textPanelFonts    = document.querySelectorAll('.text-panel-font');

function updateFontUI() {
  if (!preferences) return;
  const current = preferences.get('font') || 'open-sans';
  $textPanelFonts.forEach(btn => {
    btn.classList.toggle('is-active', btn.dataset.font === current);
  });
}

function openTextPanel() {
  if (!$textPanel || !$textPanelBackdrop) return;

  // Synchroniser le slider avec la préférence actuelle
  const scale = preferences.get('textScale') || 1;
  const idx = TEXT_SCALES.indexOf(scale);
  if ($textPanelSlider) $textPanelSlider.value = String(idx >= 0 ? idx : 1);

  updateFontUI();

  $textPanelBackdrop.hidden = false;
  $textPanel.hidden = false;
}

function closeTextPanel() {
  if ($textPanelBackdrop) $textPanelBackdrop.hidden = true;
  if ($textPanel) {
    $textPanel.hidden = true;
    $textPanel.style.transform = '';
  }
}

// --- Drag-to-dismiss ---
(function enableDragToDismiss() {
  if (!$textPanel) return;

  let startY = 0;
  let currentY = 0;
  let isDragging = false;

  function onTouchStart(e) {
    // Ne draguer que si l'utilisateur est en haut du panneau
    if ($textPanel.scrollTop > 0) return;
    startY = e.touches[0].clientY;
    currentY = startY;
    isDragging = true;
    $textPanel.style.transition = 'none';
  }

  function onTouchMove(e) {
    if (!isDragging) return;
    currentY = e.touches[0].clientY;
    const delta = currentY - startY;
    if (delta > 0) {
      $textPanel.style.transform = `translateY(${delta}px)`;
    }
  }

  function onTouchEnd() {
    if (!isDragging) return;
    isDragging = false;
    const delta = currentY - startY;
    $textPanel.style.transition = 'transform 200ms ease';

    if (delta > 100) {
      // Fermer
      $textPanel.style.transform = 'translateY(100%)';
      setTimeout(closeTextPanel, 200);
    } else {
      // Revenir à la position
      $textPanel.style.transform = '';
    }
  }

  $textPanel.addEventListener('touchstart', onTouchStart, { passive: true });
  $textPanel.addEventListener('touchmove', onTouchMove, { passive: true });
  $textPanel.addEventListener('touchend', onTouchEnd);
  $textPanel.addEventListener('touchcancel', onTouchEnd);
})();

if (btnTextSize) {
  btnTextSize.addEventListener('click', openTextPanel);
}

if ($textPanelClose) {
  $textPanelClose.addEventListener('click', closeTextPanel);
}

if ($textPanelBackdrop) {
  $textPanelBackdrop.addEventListener('click', closeTextPanel);
}

if ($textPanelSlider) {
  $textPanelSlider.addEventListener('input', () => {
    const idx = parseInt($textPanelSlider.value, 10);
    preferences.setTextScale(TEXT_SCALES[idx] || 1);
  });
}

$textPanelFonts.forEach(btn => {
  btn.addEventListener('click', () => {
    preferences.setFont(btn.dataset.font);
    updateFontUI();
  });
});

// ------------------------------------------------------------
// Navigation "Suivant" / retour
// ------------------------------------------------------------
if (btnNext) {
  btnNext.addEventListener('click', () => {
    if (currentIndex < 0 || allHymnsInCat.length === 0) return;
    const nextIdx = (currentIndex + 1) % allHymnsInCat.length;
    const nextHymn = allHymnsInCat[nextIdx];
    // replace() au lieu de href : ne crée pas de nouvelle entrée dans l'historique
    window.location.replace(
      `cantique.html?hymn=${encodeURIComponent(nextHymn.id)}`
      + `&category=${encodeURIComponent(categoryId)}`
    );
  });
}
if (btnPrev) {
  btnPrev.addEventListener('click', () => {
    if (currentIndex < 0 || allHymnsInCat.length === 0) return;
    const prevIdx = (currentIndex - 1 + allHymnsInCat.length) % allHymnsInCat.length;
    const prevHymn = allHymnsInCat[prevIdx];
    // replace() au lieu de href
    window.location.replace(
      `cantique.html?hymn=${encodeURIComponent(prevHymn.id)}`
      + `&category=${encodeURIComponent(categoryId)}`
    );
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
