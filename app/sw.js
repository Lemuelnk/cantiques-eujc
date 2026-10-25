// ============================================================
// Cantiques EUJC — Service Worker (mode hors-ligne)
// ============================================================
// Stratégie :
//  - App shell (HTML, CSS, JS, JSON canoniques) : cache-first
//  - Fallback réseau si non trouvé en cache
// ============================================================

const VERSION = 'v7.15.1';
const CACHE_NAME = `cantiques-eujc-${VERSION}`;

// Fichiers essentiels à pré-cacher
const PRECACHE_URLS = [
  './splash',
  './splash.css',
  './fonts.css',
  './preferences.js',
  './',
  './parametres',
  './parametres.css',
  './parametres.js',
  './recherche',
  './recherche.css',
  './recherche.js',
  './favoris',
  './favoris.css',
  './favoris.js',
  './historique',
  './historique.css',
  './historique.js',
  './signaler',
  './signaler.css',
  './signaler.js',
  './report-fab.css',
  './report-fab.js',
  './style.css',
  './bottom-nav.css',
  './bottom-nav.js',
  './storage.js',
  './canonical-data.js',
  './categories',
  './categories.css',
  './categories.js',
  './lessons',
  './lessons.css',
  './lessons.js',
  './dimanche',
  './dimanche.css',
  './dimanche.js',
  './priere',
  './priere.css',
  './priere.js',
  './cantiques',
  './cantiques.css',
  './cantiques.js',
  './cantique',
  './cantique.css',
  './cantique.js',
  './data/canonical/lesson-1-creation.json',
  './data/canonical/dimanche-louange.json',
  './data/canonical/dimanche-croyants.json',
  './data/canonical/dimanche-affliges.json',
  './data/canonical/dimanche-egares.json',
  './data/canonical/dimanche-rois.json',
  './data/canonical/dimanche-visiteurs.json',
  './data/canonical/dimanche-divers.json',
  './data/canonical/priere-misericorde.json',
  './data/canonical/priere-invocation.json',
  './data/canonical/priere-general.json',
  './data/canonical/priere-bataille.json'
];

// ---- Installation : pré-cache ----
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
      .catch(err => console.warn('[SW] Pré-cache partiel :', err))
  );
});

// ---- Activation : nettoyer les anciens caches ----
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME)
            .map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ---- Fetch : cache-first avec fallback réseau ----
self.addEventListener('fetch', event => {
  const { request } = event;

  // On ne gère que les GET same-origin
  if (request.method !== 'GET') return;
  if (!request.url.startsWith(self.location.origin)) return;

  const url = new URL(request.url);
  const path = url.pathname;

  // ----- Stratégie 1 : NETWORK-FIRST pour les pages HTML et les routes SEO -----
  // (évite de servir du cache périmé si le contenu change côté serveur)
  const isHtmlPage = (
    request.headers.get('accept')?.includes('text/html') ||
    path === '/' ||
    path.endsWith('.html') ||
    path.startsWith('/cantique/') ||
    path.startsWith('/categorie/') ||
    !path.includes('.')  // routes sans extension (= pages HTML)
  );

  // ----- Stratégie 2 : NETWORK-FIRST pour les JSON canoniques -----
  // (les données changent régulièrement via PR)
  const isCanonicalJson = path.startsWith('/data/canonical/') && path.endsWith('.json');

  if (isHtmlPage || isCanonicalJson) {
    event.respondWith(
      fetch(request).then(response => {
        // Mettre à jour le cache avec la version fraîche
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        }
        return response;
      }).catch(() => {
        // En cas d'échec réseau : servir le cache (mode offline)
        return caches.match(request).then(cached => {
          if (cached) return cached;
          // Fallback ultime pour les pages HTML : accueil en cache
          if (isHtmlPage) return caches.match('./');
        });
      })
    );
    return;
  }

  // ----- Stratégie 3 : CACHE-FIRST pour les assets stables (CSS, JS, fonts, images) -----
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;

      return fetch(request).then(response => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        }
        return response;
      });
    })
  );
});
