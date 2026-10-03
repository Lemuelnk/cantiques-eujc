// ============================================================
// Cantiques EUJC — Bouton flottant de signalement
// ============================================================
// Lit les attributs data-report-scope et data-report-category sur <body>
// et injecte automatiquement le FAB avec la bonne URL.

(() => {
  const scope = document.body.dataset.reportScope;
  if (!scope) return;

  // La catégorie peut venir soit du data-attribute, soit de l'URL courante
  // (utile pour cantiques.html où la catégorie change selon ?category=xxx)
  const urlParams = new URLSearchParams(window.location.search);
  const category = document.body.dataset.reportCategory
    || urlParams.get('category')
    || '';

  // Construire l'URL cible
  function buildTargetUrl() {
    const params = new URLSearchParams();
    params.set('scope', scope);
    if (category) params.set('category', category);
    return `signaler.html?${params.toString()}`;
  }

  // Créer le bouton
  const fab = document.createElement('button');
  fab.type = 'button';
  fab.className = 'report-fab';
  fab.setAttribute('aria-label', 'Signaler un problème dans cette liste');
  fab.innerHTML = '<i data-lucide="flag"></i>';

  fab.addEventListener('click', () => {
    window.location.href = buildTargetUrl();
  });

  // Injecter dans le DOM
  document.body.appendChild(fab);

  // Convertir l'icône Lucide
  if (window.lucide) {
    // Attendre un micro-délai pour que lucide soit chargé
    if (typeof lucide.createIcons === 'function') {
      lucide.createIcons();
    } else {
      window.addEventListener('load', () => lucide.createIcons());
    }
  }
})();
