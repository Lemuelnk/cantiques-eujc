// ============================================================
// Cantiques EUJC — Page Paramètres
// ============================================================

const $backButton    = document.getElementById('back-button');
const $themeBtns     = document.querySelectorAll('.theme-btn');
const $fontOptions   = document.querySelectorAll('.font-option');
const $slider        = document.getElementById('text-size-slider');
const $shareApp      = document.getElementById('btn-share-app');
const $version       = document.getElementById('settings-version');

const TEXT_SCALES = [0.85, 1, 1.15, 1.3];

// ------------------------------------------------------------
// Thème
// ------------------------------------------------------------
function updateThemeUI() {
  const current = preferences.get('theme') || 'system';
  $themeBtns.forEach(btn => {
    const active = btn.dataset.theme === current;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-checked', String(active));
  });
}

$themeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    preferences.setTheme(btn.dataset.theme);
    updateThemeUI();
  });
});

// ------------------------------------------------------------
// Police
// ------------------------------------------------------------
function updateFontUI() {
  const current = preferences.get('font') || 'open-sans';
  $fontOptions.forEach(opt => {
    const active = opt.dataset.font === current;
    opt.classList.toggle('is-active', active);
    opt.setAttribute('aria-checked', String(active));
  });
}

$fontOptions.forEach(opt => {
  opt.addEventListener('click', () => {
    preferences.setFont(opt.dataset.font);
    updateFontUI();
  });
});

// ------------------------------------------------------------
// Taille du texte
// ------------------------------------------------------------
function updateSliderUI() {
  const current = preferences.get('textScale') || 1;
  const idx = TEXT_SCALES.indexOf(current);
  if ($slider) $slider.value = String(idx >= 0 ? idx : 1);
}

if ($slider) {
  $slider.addEventListener('input', () => {
    const idx = parseInt($slider.value, 10);
    const scale = TEXT_SCALES[idx] || 1;
    preferences.setTextScale(scale);
  });
}

// ------------------------------------------------------------
// Partage de l'application
// ------------------------------------------------------------
if ($shareApp) {
  $shareApp.addEventListener('click', async () => {
    const shareData = {
      title: 'Cantiques EUJC',
      text: 'Découvrez Cantiques EUJC — Le recueil dans votre poche.',
      url: 'https://cantiques-eujc.lnk-studio.com/'
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (e) { /* annulé par l'utilisateur */ }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        alert('Lien copié dans le presse-papier');
      } catch {
        prompt('Copiez ce lien :', shareData.url);
      }
    }
  });
}

// ------------------------------------------------------------
// Version
// ------------------------------------------------------------
if ($version) {
  // Optionnel : lire depuis une constante ou un fichier
  $version.textContent = 'Cantiques EUJC — v1.0.0';
}

// ------------------------------------------------------------
// Navigation retour
// ------------------------------------------------------------
if ($backButton) {
  $backButton.addEventListener('click', () => {
    if (document.referrer) history.back();
    else window.location.href = 'index.html';
  });
}

// ------------------------------------------------------------
// Initialisation
// ------------------------------------------------------------
updateThemeUI();
updateFontUI();
updateSliderUI();

if (window.lucide) lucide.createIcons();
