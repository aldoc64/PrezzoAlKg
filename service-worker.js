const CACHE_NAME = 'price-calculator-v2'; // Ho incrementato la versione della cache
const BASE_PATH = '/PrezzoAlKg/'; // Definisci la base path del tuo repository

const urlsToCache = [
  BASE_PATH, // La root del tuo repository
  BASE_PATH + 'index.html',
  BASE_PATH + 'manifest.json',
  BASE_PATH + 'service-worker.js',
  BASE_PATH + 'icon-192x192.png',
  BASE_PATH + 'icon-512x512.png',
  'https://cdn.tailwindcss.com' // La CDN di Tailwind
];

self.addEventListener('install', event => {
  console.log('Service Worker: Evento Installazione (v2)');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Cache aperta, aggiungo URL');
        // Usiamo Promise.allSettled per vedere quale URL fallisce, se ce ne sono
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
          // Se anche solo una fallisce, l'installazione fallisce, quindi re-throw se necessario
          const failed = results.some(result => result.status === 'rejected');
          if (failed) {
            return Promise.reject(new Error('Alcuni URL non sono stati cachati. Controlla gli errori sopra.'));
          }
        });
      })
      .catch(error => {
        console.error('Service Worker: Errore grave durante l\'installazione:', error);
        // Questo errore verrà propagato e impedirà l'attivazione del SW
        throw error;
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          // console.log('Service Worker: Servito dalla cache:', event.request.url);
          return response;
        }
        // console.log('Service Worker: Richiesta di rete per:', event.request.url);
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', event => {
  console.log('Service Worker: Evento Attivazione (v2)');
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

