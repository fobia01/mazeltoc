const CACHE = "mazal-v1";
const ROOT = new URL("./", self.location.href).href;
const bundledAssets = /* BUILD_ASSETS */ [];
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
