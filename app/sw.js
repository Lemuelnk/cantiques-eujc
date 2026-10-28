const VERSION = 'v7.18.0'; // Nouveau bump pour forcer la mise à jour
const CACHE_NAME = `cantiques-eujc-${VERSION}`;

const PRECACHE_URLS = [
  './', './index.html', './offline.html', './splash.html', 
  './style.css', './bottom-nav.css', './bottom-nav.js',
  './storage.js', './canonical-data.js', './preferences.js',
  './manifest.webmanifest',
  './assets/icons/icon-192.png', './assets/icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET' || !request.url.startsWith(self.location.origin)) return;

  const url = new URL(request.url);
  const path = url.pathname;

  // Fonction de fallback robuste
  const getOfflineFallback = async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    // Si c'est une navigation HTML, essayer la racine, puis offline.html
    if (request.mode === 'navigate' || path === '/' || path === '/index.html' || !path.includes('.')) {
      return (await caches.match('./')) || (await caches.match('/index.html')) || (await caches.match('./offline.html'));
    }
    return caches.match('./offline.html');
  };

  // 1. JSON : Stale-While-Revalidate
  if (path.startsWith('/data/canonical/') && path.endsWith('.json')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request);
        const fetchPromise = fetch(request).then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => cached || caches.match('./offline.html'));
        return cached || fetchPromise;
      })
    );
    return;
  }

  // 2. Assets : Cache-First
  if (path.match(/\.(css|js|png|jpg|jpeg|svg|woff2|webmanifest|html)$/)) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          if (response && response.status === 200) {
            caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()));
          }
          return response;
        }).catch(() => caches.match('./offline.html'));
      })
    );
    return;
  }

  // 3. HTML / Routes : Network-First avec fallback en cascade
  event.respondWith(
    fetch(request).then(response => {
      if (response && response.status === 200) {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
      }
      return response;
    }).catch(() => getOfflineFallback())
  );
});
