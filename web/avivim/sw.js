const CACHE = "mazal-avivim-7beb4368dde9";
const ROOT = new URL("./", self.location.href).href;
const bundledAssets = ["assets/index-DL1lzjP1.js","assets/index-DtY80Pft.css","audio/CREDITS.txt","audio/buzzer.mp3","audio/crowd-boo-big.mp3","audio/crowd-cheer-big.mp3","audio/festejo-1.mp3","audio/festejo-2.mp3","audio/festejo-3.mp3","audio/festejo-ganador.mp3","fonts/LICENSE-atkinsonhyperlegible.txt","fonts/LICENSE-baloo2.txt","fonts/atkinson-hyperlegible-400.woff2","fonts/atkinson-hyperlegible-700.woff2","fonts/baloo-2-800.woff2","icon-192.png","icon-512.png","icon.svg","images/CREDITS.json","images/afilador.webp","images/bandoneon.webp","images/camara.webp","images/carbonico.webp","images/casete.webp","images/fichas.webp","images/kipa.webp","images/logo-bet-am.jpg","images/maquina.webp","images/proyector.webp","images/shofar.webp","images/sifon.webp","images/telefono.webp","images/televisor.webp","images/walkman.webp","index.html","manifest.webmanifest"];
self.addEventListener("install", (e) =>
  e.waitUntil(
    (async () => {
      const c = await caches.open(CACHE);
      const html = await fetch(ROOT);
      if (!html.ok) throw new Error("No se pudo descargar el juego");
      await c.put(ROOT, html);
      await c.addAll(bundledAssets.map((path) => new URL(path, ROOT).href));
    })(),
  ),
);
self.addEventListener("activate", (e) =>
  e.waitUntil(
    (async () => {
      for (const key of await caches.keys())
        if (key.startsWith("mazal-avivim-") && key !== CACHE)
          await caches.delete(key);
      await self.clients.claim();
    })(),
  ),
);
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || !e.request.url.startsWith(ROOT)) return;
  e.respondWith(
    (async () => {
      const cached = await caches.match(e.request, { ignoreVary: true });
      if (cached) return cached;
      try {
        return await fetch(e.request);
      } catch {
        if (e.request.mode === "navigate") return await caches.match(ROOT);
        return Response.error();
      }
    })(),
  );
});
