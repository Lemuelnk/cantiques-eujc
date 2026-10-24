// ============================================================
// Cantiques EUJC — Page Contribuer
// ============================================================

// Bouton retour
const $backButton = document.getElementById('back-button');
if ($backButton) {
  $backButton.addEventListener('click', () => {
    if (document.referrer) history.back();
    else window.location.href = 'plus.html';
  });
}

// Icônes Lucide
if (window.lucide) lucide.createIcons();

console.log('✅ Page Contribuer chargée');
