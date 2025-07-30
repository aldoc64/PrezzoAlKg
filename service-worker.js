const CACHE_NAME = 'price-calculator-v1';
const urlsToCache = [
  '/PrezzoAlKg/', // La root del tuo repository con la capitalizzazione corretta
  '/PrezzoAlKg/index.html',
  '/PrezzoAlKg/manifest.json',
  '/PrezzoAlKg/service-worker.js', // Aggiungi anche il service worker stesso alla cache
  '/PrezzoAlKg/icon-192x192.png',
  '/PrezzoAlKg/icon-512x512.png',
  'https://cdn.tailwindcss.com' // La CDN di Tailwind
];

self.addEventListener('install', event => {
  console.log('Service Worker: Evento Installazione');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Cache aperta, aggiungo URL');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Service Worker: Errore durante il caching degli URL:', error);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          console.log('Service Worker: Servito dalla cache:', event.request.url);
          return response;
        }
        console.log('Service Worker: Richiesta di rete per:', event.request.url);
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', event => {
  console.log('Service Worker: Evento Attivazione');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Eliminazione cache vecchia:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
