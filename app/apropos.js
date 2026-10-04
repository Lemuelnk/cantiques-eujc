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
    const { CANONICAL_FILE_MAP } = window;
    const CATS = [
      'lesson-0','lesson-1','lesson-2','lesson-3','lesson-4','lesson-5','lesson-6',
      'lesson-7','lesson-8','lesson-9','lesson-10','lesson-11','lesson-12','lesson-13',
      'lesson-20','lesson-21','lesson-22','lesson-23','lesson-24','lesson-25','lesson-26',
      'dimanche-louange','dimanche-croyants','dimanche-affliges','dimanche-egares',
      'dimanche-rois','dimanche-visiteurs','dimanche-divers',
      'priere-misericorde','priere-invocation','priere-general','priere-bataille'
    ];

    let totalHymns = 0;
    const languages = new Set();
    let activeCategories = 0;

    for (const cat of CATS) {
      try {
        const corpus = await loadCanonicalLesson(cat);
        const hymns = Array.isArray(corpus.hymns) ? corpus.hymns : [];
        if (hymns.length > 0) {
          activeCategories++;
          totalHymns += hymns.length;
          hymns.forEach(h => {
            (h.versions || []).forEach(v => {
              if (v.language && v.language.label) languages.add(v.language.label);
            });
          });
        }
      } catch(e) {}
    }

    if ($hymns) $hymns.textContent = totalHymns;
    if ($categories) $categories.textContent = activeCategories;
    if ($languages) $languages.textContent = languages.size;
  } catch (err) {
    console.error('Erreur de chargement des stats :', err);
  }
}

// ------------------------------------------------------------
// Init
// ------------------------------------------------------------
if (window.lucide) lucide.createIcons();
loadStats();
