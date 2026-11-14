const VERSION = 'v7.19.0';
const CACHE_NAME = `cantiques-eujc-${VERSION}`;

const PRECACHE_URLS = [
  './',
  './manifest.webmanifest',
  './404.html',
  './a-classer.html',
  './apropos.html',
  './cantique.html',
  './cantiques.html',
  './categories.html',
  './contribuer.html',
  './dimanche.html',
  './favoris.html',
  './historique.html',
  './index.html',
  './lessons.html',
  './offline.html',
  './parametres.html',
  './plus.html',
  './priere.html',
  './recherche.html',
  './signaler.html',
  './splash.html',
  './a-classer.css',
  './bottom-nav.css',
  './cantique.css',
  './cantiques.css',
  './categories.css',
  './charte.css',
  './dimanche.css',
  './favoris.css',
  './fonts.css',
  './historique.css',
  './lessons.css',
  './parametres.css',
  './priere.css',
  './recherche.css',
  './report-fab.css',
  './sheets.css',
  './signaler.css',
  './splash.css',
  './style.css',
  './a-classer.js',
  './app.js',
  './apropos.js',
  './bottom-nav.js',
  './canonical-data.js',
  './cantique.js',
  './cantiques.js',
  './categories.js',
  './contribuer.js',
  './dimanche.js',
  './favoris.js',
  './historique.js',
  './ios-install-banner.js',
  './lessons.js',
  './parametres.js',
  './plus.js',
  './preferences.js',
  './priere.js',
  './recherche.js',
  './report-fab.js',
  './share-image.js',
  './signaler.js',
  './storage.js',
  './sw-register.js',
  './data/canonical/a-classer-autres.json',
  './data/canonical/a-classer-francais.json',
  './data/canonical/a-classer-lingala.json',
  './data/canonical/a-classer-swahili.json',
  './data/canonical/a-classer-tshiluba.json',
  './data/canonical/dimanche-affliges.json',
  './data/canonical/dimanche-croyants.json',
  './data/canonical/dimanche-divers.json',
  './data/canonical/dimanche-egares.json',
  './data/canonical/dimanche-louange.json',
  './data/canonical/dimanche-rois.json',
  './data/canonical/dimanche-visiteurs.json',
  './data/canonical/lesson-0-lucifer.json',
  './data/canonical/lesson-1-creation.json',
  './data/canonical/lesson-10-egypte.json',
  './data/canonical/lesson-11-moise.json',
  './data/canonical/lesson-12-plaies.json',
  './data/canonical/lesson-13-mer-rouge.json',
  './data/canonical/lesson-2-eden.json',
  './data/canonical/lesson-20-samson.json',
  './data/canonical/lesson-21-david-saul.json',
  './data/canonical/lesson-22-salomon.json',
  './data/canonical/lesson-23-temple.json',
  './data/canonical/lesson-24-elie-elisee.json',
  './data/canonical/lesson-25-daniel.json',
  './data/canonical/lesson-26-job.json',
  './data/canonical/lesson-3-premier-peche.json',
  './data/canonical/lesson-4-fils-adam.json',
  './data/canonical/lesson-5-noe.json',
  './data/canonical/lesson-6-abraham.json',
  './data/canonical/lesson-7-lot.json',
  './data/canonical/lesson-8-fils-isaac.json',
  './data/canonical/lesson-9-jacob.json',
  './data/canonical/priere-bataille.json',
  './data/canonical/priere-general.json',
  './data/canonical/priere-invocation.json',
  './data/canonical/priere-misericorde.json',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/icon-maskable-512.png',
  './vendor/lucide.min.js',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // add() tolérant : une ressource en 404 ne casse pas tout l'install
      let ok = 0, ko = 0;
      for (const url of PRECACHE_URLS) {
        try {
          await cache.add(url);
          ok++;
        } catch (err) {
          ko++;
          console.warn('[SW] Precache skip:', url, err.message);
        }
      }
      console.log(`[SW] Precache : ${ok}/${PRECACHE_URLS.length} OK` + (ko ? ` (${ko} échecs silencieux)` : ''));
    }).then(() => self.skipWaiting())
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

  const getOfflineFallback = async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
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
