const CACHE_NAME = 'mazeltoc-rh-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './audio/applause.mp3',
  './audio/boo.mp3',
  './images/miel/paloma.jpg',
  './images/miel/asiento.jpg',
  './images/miel/celular.jpg',
  './images/miel/tia.jpg',
  './images/miel/ex.jpg',
  './images/miel/politica.jpg',
  './images/miel/pollo.jpg',
  './images/miel/farfalej.jpg',
  './images/miel/mantel.jpg',
  './images/miel/pescado.jpg',
  './images/miel/primo.jpg',
  './images/miel/foto.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => cached);
    })
  );
});
