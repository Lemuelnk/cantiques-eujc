// ============================================================
// Cantiques EUJC — Page À propos
// ============================================================

const $backButton = document.getElementById('back-button');
const $btnContact = document.getElementById('btn-contact');
const $btnShare   = document.getElementById('btn-share-apropos');

// ------------------------------------------------------------
// Retour
// ------------------------------------------------------------
if ($backButton) {
  $backButton.addEventListener('click', () => {
    if (document.referrer) history.back();
    else window.location.href = 'plus.html';
  });
}

// ------------------------------------------------------------
// Contact
// ------------------------------------------------------------
if ($btnContact) {
  $btnContact.addEventListener('click', () => {
    window.location.href = 'mailto:contact@lnk-studio.com?subject=Cantiques%20EUJC%20-%20Contact';
  });
}

// ------------------------------------------------------------
// Partage de l'app
// ------------------------------------------------------------
if ($btnShare) {
  $btnShare.addEventListener('click', async () => {
    const shareData = {
      title: 'Cantiques EUJC',
      text: 'Découvrez Cantiques EUJC — Le recueil dans votre poche.',
      url: 'https://cantiques-eujc.lnk-studio.com/'
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch(e) {}
    } else {
      try {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        alert('Lien copié !');
      } catch {
        prompt('Copiez ce lien :', shareData.url);
      }
    }
  });
}

// ------------------------------------------------------------
// Charger les statistiques
// ------------------------------------------------------------
async function loadStats() {
  const $hymns = document.getElementById('stat-hymns');
  const $categories = document.getElementById('stat-categories');
  const $languages = document.getElementById('stat-languages');

  try {
    const response = await fetch('data/stats.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const stats = await response.json();
    if ($hymns) $hymns.textContent = stats.total_hymns;
    if ($categories) $categories.textContent = stats.categories;
    if ($languages) $languages.textContent = stats.languages;
  } catch (err) {
    console.error('Erreur de chargement des stats :', err);
  }
}

// ------------------------------------------------------------
// Init
// ------------------------------------------------------------
if (window.lucide) lucide.createIcons();
loadStats();
