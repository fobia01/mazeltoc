const CACHE_NAME = 'mazeltoc-in-v5';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './audio/applause.mp3',
  './audio/boo.mp3',
  './audio/clock-tick.mp3',
  './audio/buzzer.mp3',
  './audio/crowd-cheer-big.mp3',
  './audio/crowd-boo-big.mp3',
  './images/qtrivia/apple-honey.svg',
  './images/qtrivia/honey-jar.svg',
  './images/qtrivia/fish.svg',
  './images/qtrivia/ram.svg',
  './images/qtrivia/candles.svg',
  './images/qtrivia/torah-scroll.svg',
  './images/qtrivia/challah.svg',
  './images/qtrivia/shofar.svg',
  './images/qtrivia/shofar-iomkipur-1.svg',
  './images/qtrivia/shofar-iomkipur-2.svg'
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

  /* el documento principal (index.html) va primero a la red: así una
     actualización de contenido se ve enseguida, y solo si no hay conexión
     se usa la última copia guardada. Los demás archivos (imágenes, audio,
     manifest) siguen siendo cache-first para que la app cargue rápido y
     funcione offline. */
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

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
