const CACHE_NAME = 'price-calculator-v1';
const urlsToCache = [
  '/PrezzoAlKg/', // La root del tuo repository
  '/PrezzoAlKg/index.html',
  '/PrezzoAlKg/manifest.json',
  // Aggiungi qui i percorsi delle tue icone
  '/PrezzoAlKg/icon-192x192.png',
  '/PrezzoAlKg/icon-512x512.png',
  // Tailwind CSS CDN (potrebbe non essere sempre cachabile dal service worker, ma proviamo)
  'https://cdn.tailwindcss.com'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

