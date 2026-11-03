/* ==========================================================================
   LOW LIFE LEGENDS™  •  Diabetic Dripwear — Service Worker
   Offline-first: network-first for navigation, cache-first for assets.
   Bump CACHE version whenever assets change.
   ========================================================================== */
const CACHE = 'dripwear-v1';
const ASSETS = [
  './',
  './index.html',
  './css/styles.css',
  './js/store.js',
  './js/app.js',
  './public/manifest.webmanifest',
  './public/icons/icon-192.png',
  './public/icons/icon-512.png',
  './public/icons/icon-512-maskable.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
      .catch(() => {})
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (req.mode === 'navigate') {
    // Network-first navigation: fall back to cached shell
    e.respondWith(
      fetch(req)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put('./', clone));
          return res;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }
  // Cache-first for static assets
  e.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      const reqClone = req.clone();
      return fetch(reqClone).then(res => {
        if (res.ok && new URL(req.url).origin === self.location.origin) {
          const c = caches.open(CACHE);
          c.then(cache => cache.put(req, res.clone()));
        }
        return res;
      });
    })
  );
});
