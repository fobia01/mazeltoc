/* Service worker de Mazeltoc — Edición Simjat Torá.
   Guarda una copia de la app para que funcione sin internet.
   Cuando cambies archivos, subí el número de versión (v2, v3...) para
   que los celulares que la tienen instalada bajen la copia nueva. */

const CACHE_NAME = 'mazeltoc-simjat-tora-v6';
const ASSETS = [
  './',
  './audio/boo.mp3',
  './audio/buzzer.mp3',
  './audio/clock-tick.mp3',
  './audio/crowd-boo-big.mp3',
  './audio/crowd-cheer-big.mp3',
  './audio/festejo-1.mp3',
  './audio/festejo-2.mp3',
  './audio/festejo-3.mp3',
  './audio/festejo-ganador.mp3',
  './css/estilos.css',
  './fonts/atkinson-hyperlegible-400.woff2',
  './fonts/atkinson-hyperlegible-700.woff2',
  './fonts/baloo-2-800.woff2',
  './datos/ahorcado.js',
  './datos/canciones.js',
  './datos/emojis.js',
  './datos/memoria.js',
  './datos/mimica.js',
  './datos/ordenar.js',
  './datos/palabra-prohibida.js',
  './datos/personalidades.js',
  './datos/quien-soy.js',
  './datos/rabino.js',
  './datos/trivia.js',
  './datos/verdadero-falso.js',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './images/personalidades/ada-yonath.jpg',
  './images/personalidades/albert-einstein.jpg',
  './images/personalidades/alejandra-pizarnik.jpg',
  './images/personalidades/amos-oz.jpg',
  './images/personalidades/arik-einstein.jpg',
  './images/personalidades/barbra-streisand.jpg',
  './images/personalidades/bob-dylan.jpg',
  './images/personalidades/cesar-milstein.jpg',
  './images/personalidades/chaim-weizmann.jpg',
  './images/personalidades/daniel-barenboim.jpg',
  './images/personalidades/daniel-kahneman.jpg',
  './images/personalidades/david-ben-gurion.jpg',
  './images/personalidades/franz-kafka.jpg',
  './images/personalidades/gal-gadot.jpg',
  './images/personalidades/golda-meir.jpg',
  './images/personalidades/groucho-marx.jpg',
  './images/personalidades/itzhak-perlman.jpg',
  './images/personalidades/j-robert-oppenheimer.jpg',
  './images/personalidades/jonas-salk.jpg',
  './images/personalidades/leonard-bernstein.jpg',
  './images/personalidades/leonard-cohen.jpg',
  './images/personalidades/lise-meitner.jpg',
  './images/personalidades/marc-chagall.jpg',
  './images/personalidades/menachem-begin.jpg',
  './images/personalidades/moshe-dayan.jpg',
  './images/personalidades/naomi-shemer.jpg',
  './images/personalidades/natalie-portman.jpg',
  './images/personalidades/ofra-haza.jpg',
  './images/personalidades/richard-feynman.jpg',
  './images/personalidades/rosalind-franklin.jpg',
  './images/personalidades/shimon-peres.jpg',
  './images/personalidades/sigmund-freud.jpg',
  './images/personalidades/steven-spielberg.jpg',
  './images/personalidades/theodor-herzl.jpg',
  './images/personalidades/yitzhak-rabin.jpg',
  './images/logo-bet-am.jpg',
  './images/logo-templo-tiferet.jpg',
  './index.html',
  './js/config.js',
  './js/juegos.js',
  './js/nucleo.js',
  './js/sonidos.js',
  './js/vendor/confetti.min.js',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      /* solo borra versiones viejas de ESTA edición: las otras ediciones de
         Mazeltoc comparten el mismo sitio y tienen sus propias cachés */
      Promise.all(keys.filter((k) => k.startsWith('mazeltoc-simjat-tora-') && k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

/* Primero intenta traer la versión nueva de internet (así los cambios en
   preguntas y juegos se ven enseguida) y, si no hay conexión, usa la copia
   guardada. Los audios e íconos, que no cambian, salen directo de la copia. */
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  const esFijo = /\/(audio|icons|images|fonts)\//.test(url.pathname);
  if (esFijo) {
    event.respondWith(caches.match(req).then((c) => c || fetch(req)));
    return;
  }

  event.respondWith(
    fetch(req)
      .then((resp) => {
        if (resp && resp.ok) {
          const copia = resp.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copia));
        }
        return resp;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }))
  );
});
