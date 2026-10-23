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

// Lecture des parametres : priorite au path /cantique/:cat/:num
// Fallback sur query ?hymn=UUID&category=cat pour retrocompat
const detailParams = new URLSearchParams(window.location.search);
let   hymnId       = detailParams.get('hymn');
let   categoryId   = detailParams.get('category') || 'lesson-1';
let   hymnNumber   = null;

(function parsePath() {
  var m = window.location.pathname.match(/^\/cantique\/([^\/]+)\/([^\/]+)\/?$/);
  if (m) {
    categoryId  = decodeURIComponent(m[1]);
    hymnNumber  = decodeURIComponent(m[2]);
    hymnId      = null; // sera resolu par number dans loadDetail
  }
})();

let currentHymn     = null;
let currentCorpus   = null;
let currentVersion  = null;
let allHymnsInCat   = [];
let currentIndex    = -1;

// ------------------------------------------------------------
// Utilitaires
// ------------------------------------------------------------

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
  // Canonical : URL propre /cantique/:cat/:num si possible
  let canonical;
  if (hymnNumber != null && categoryId) {
    canonical = 'https://cantiques-eujc.lnk-studio.com'
      + '/cantique/' + encodeURIComponent(categoryId)
      + '/' + encodeURIComponent(hymnNumber);
  } else {
    const canonicalUrl = new URL(window.location.href);
    canonicalUrl.hash = '';
    canonicalUrl.searchParams.sort();
    canonical = canonicalUrl.href;
  }

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
  // JSON-LD dynamique : MusicComposition pour chaque cantique
  (function setJsonLd() {
    var allLines = [];
    (version.content || []).forEach(function(blk) {
      (blk.lines || []).forEach(function(line) { allLines.push(line); });
    });
    var lyricsPreview = allLines.slice(0, 40).join('\n');

    var oldLd = document.getElementById('hymn-jsonld');
    if (oldLd) oldLd.remove();

    var jsonLd = {
      "@context": "https://schema.org",
      "@type": "MusicComposition",
      "name": version.title || hymn.title,
      "inLanguage": (version.language && version.language.code) || 'fr',
      "genre": prettyCategory(categoryId),
      "lyrics": {
        "@type": "CreativeWork",
        "text": lyricsPreview
      },
      "isPartOf": {
        "@type": "MusicAlbum",
        "name": "Cantiques EUJC",
        "url": "https://cantiques-eujc.lnk-studio.com/cantiques.html"
      },
      "url": canonical
    };

    if (source.number) {
      jsonLd.alternateName = "Cantique n\u00b0 " + source.number;
      jsonLd.position = source.number;
    }

    var script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'hymn-jsonld';
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);
  })();


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

// Le module autonome share/share-ui.js gère le partage.

// ------------------------------------------------------------
// Menu contextuel
// ------------------------------------------------------------
let menuJustOpened = false;
function openMenu() {
  menuJustOpened = true;
  menuBackdrop.hidden = false;
  menuSheet.hidden = false;
  requestAnimationFrame(() => {
    menuBackdrop.classList.add('is-open');
    menuSheet.classList.add('is-open');
    setTimeout(() => { menuJustOpened = false; }, 350);
  });
}
function closeMenu() {
  if (menuJustOpened) return;  // Ignore le ghost-click juste apres l'ouverture
  menuBackdrop.classList.remove('is-open');
  menuSheet.classList.remove('is-open');
  setTimeout(() => {
    menuBackdrop.hidden = true;
    menuSheet.hidden = true;
  }, 250);
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
  menuCopy.addEventListener('click', () => {
    if (!currentVersion) {
      alert('Cantique non chargé, réessayez.');
      return;
    }
    const text = (currentVersion.content || [])
      .map(b => (b.lines || []).join('\n'))
      .join('\n\n');

    // Méthode 1 : execCommand (fiable sur mobile)
    let success = false;
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      ta.style.top = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      ta.setSelectionRange(0, ta.value.length);
      success = document.execCommand('copy');
      document.body.removeChild(ta);
    } catch (e) {
      console.warn('[copy] execCommand échoué :', e);
    }

    // Méthode 2 : Clipboard API (fallback)
    if (!success && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        alert('Paroles copiées');
      }).catch((e) => {
        console.warn('[copy] clipboard API échouée :', e);
        prompt('Copiez manuellement (Ctrl+C) :', text);
      });
      closeMenu();
      return;
    }

    if (success) {
      alert('Paroles copiées');
    } else {
      prompt('Copiez manuellement :', text);
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
    const url = (typeof buildCantiqueUrl === 'function')
      ? buildCantiqueUrl(nextHymn, categoryId, currentCorpus)
      : `cantique.html?hymn=${encodeURIComponent(nextHymn.id)}&category=${encodeURIComponent(categoryId)}`;
    window.location.replace(url);
  });
}
if (btnPrev) {
  btnPrev.addEventListener('click', () => {
    if (currentIndex < 0 || allHymnsInCat.length === 0) return;
    const prevIdx = (currentIndex - 1 + allHymnsInCat.length) % allHymnsInCat.length;
    const prevHymn = allHymnsInCat[prevIdx];
    const url = (typeof buildCantiqueUrl === 'function')
      ? buildCantiqueUrl(prevHymn, categoryId, currentCorpus)
      : `cantique.html?hymn=${encodeURIComponent(prevHymn.id)}&category=${encodeURIComponent(categoryId)}`;
    window.location.replace(url);
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
  if (!hymnId && !hymnNumber) {
    detailRoot.innerHTML = '<p class="detail-empty">Cantique introuvable.</p>';
    return;
  }

  try {
    const corpus = await loadCanonicalLesson(categoryId);
    currentCorpus = corpus;
    const hymns = Array.isArray(corpus.hymns) ? corpus.hymns : [];
    allHymnsInCat = hymns;

    // Priorité : rechercher par clé de route stable, puis par numéro.
    let hymn = null;
    if (hymnNumber != null && typeof findHymnByRouteKey === 'function') {
      hymn = findHymnByRouteKey(corpus, hymnNumber);
    }
    if (!hymn && hymnNumber != null && typeof findHymnByNumber === 'function') {
      hymn = findHymnByNumber(corpus, hymnNumber);
    }
    if (!hymn && hymnId) {
      hymn = hymns.find(h => h.id === hymnId);
    }
    if (!hymn) {
      detailRoot.innerHTML = '<p class="detail-empty">Cantique introuvable.</p>';
      return;
    }

    hymnId = hymn.id;
    currentIndex = hymns.indexOf(hymn);
    renderHymn(hymn, 0);

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
