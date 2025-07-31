const CACHE_NAME = 'price-calculator-v4'; // Incrementato la versione della cache
const BASE_PATH = '/PrezzoAlKg/'; // Definisci la base path del tuo repository

const urlsToCache = [
  BASE_PATH, // La root del tuo repository
  BASE_PATH + 'index.html',
  BASE_PATH + 'app.webmanifest', // AGGIORNATO QUI
  BASE_PATH + 'service-worker.js',
  BASE_PATH + 'icon-192x192.png',
  BASE_PATH + 'icon-512x512.png'
  // Rimosso: 'https://cdn.tailwindcss.com' - Le CDN esterne possono causare errori di caching
];

self.addEventListener('install', event => {
  console.log('Service Worker: Evento Installazione (v4)');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Cache aperta, aggiungo URL');
        return Promise.allSettled(
          urlsToCache.map(url => {
            console.log(`Attempting to cache: ${url}`);
            return cache.add(url);
          })
        ).then(results => {
          results.forEach((result, index) => {
            if (result.status === 'rejected') {
              console.error(`Service Worker: Fallimento caching per ${urlsToCache[index]}:`, result.reason);
            } else {
              console.log(`Service Worker: Caching riuscito per ${urlsToCache[index]}`);
            }
          });
          const failed = results.some(result => result.status === 'rejected');
          if (failed) {
            return Promise.reject(new Error('Alcuni URL non sono stati cachati. Controlla gli errori sopra.'));
          }
        });
      })
      .catch(error => {
        console.error('Service Worker: Errore grave durante l\'installazione:', error);
        throw error;
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', event => {
  console.log('Service Worker: Evento Attivazione (v4)');
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
