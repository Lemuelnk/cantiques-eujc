// ============================================================
// Cantiques EUJC — Service Worker (mode hors-ligne)
// ============================================================
// Stratégie :
//  - App shell (HTML, CSS, JS, JSON canoniques) : cache-first
//  - Fallback réseau si non trouvé en cache
// ============================================================

const VERSION = 'v1.0.0';
const CACHE_NAME = `cantiques-eujc-${VERSION}`;

// Fichiers essentiels à pré-cacher
const PRECACHE_URLS = [
  './splash.html',
  './splash.css',
  './index.html',
  './style.css',
  './bottom-nav.css',
  './bottom-nav.js',
  './storage.js',
  './canonical-data.js',
  './categories.html',
  './categories.css',
  './categories.js',
  './lessons.html',
  './lessons.css',
  './lessons.js',
  './dimanche.html',
  './dimanche.css',
  './dimanche.js',
  './priere.html',
  './priere.css',
  './priere.js',
  './cantiques.html',
  './cantiques.css',
  './cantiques.js',
  './cantique.html',
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

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;

      return fetch(request).then(response => {
        // Cache dynamique des ressources récupérées
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        }
        return response;
      }).catch(() => {
        // Fallback : si HTML, renvoyer l'accueil
        if (request.headers.get('accept')?.includes('text/html')) {
          return caches.match('./index.html');
        }
      });
    })
  );
});
