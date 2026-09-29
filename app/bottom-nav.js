// ============================================================
// Cantiques EUJC — Bottom Navigation partagé
// ============================================================

(() => {
  const mount = document.getElementById('bottom-nav');

  if (!mount) return;

  mount.innerHTML = `
    <nav class="bottom-nav" aria-label="Navigation principale">

      <a class="nav-item" href="index.html" data-nav="accueil">
        <span class="nav-icon" aria-hidden="true">
          <i data-lucide="house"></i>
        </span>
        <span>Accueil</span>
      </a>

      <button class="nav-item" type="button" data-nav="recherche">
        <span class="nav-icon" aria-hidden="true">
          <i data-lucide="search"></i>
        </span>
        <span>Recherche</span>
      </button>

      <a class="nav-item" href="categories.html" data-nav="bibliotheque">
        <span class="nav-icon" aria-hidden="true">
          <i data-lucide="library"></i>
        </span>
        <span>Bibliothèque</span>
      </a>

      <button class="nav-item" type="button" data-nav="plus">
        <span class="nav-icon" aria-hidden="true">
          <i data-lucide="ellipsis"></i>
        </span>
        <span>Plus</span>
      </button>

    </nav>
  `;

  const page = window.location.pathname.split('/').pop() || 'index.html';

  let activeSection = 'accueil';

  if (['categories.html', 'lessons.html', 'cantiques.html'].includes(page)) {
    activeSection = 'bibliotheque';
  } else if (page === 'search.html') {
    activeSection = 'recherche';
  } else if (page === 'plus.html') {
    activeSection = 'plus';
  }

  mount
    .querySelectorAll('.nav-item')
    .forEach(item => {
      item.classList.toggle(
        'active',
        item.dataset.nav === activeSection
      );

      if (item.dataset.nav === activeSection) {
        item.setAttribute('aria-current', 'page');
      }
    });

  if (window.lucide) {
    lucide.createIcons();
  }
})();
