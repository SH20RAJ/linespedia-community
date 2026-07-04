const CACHE_NAME = "linespedia-cache-v1";
const OFFLINE_URL = "/about";

self.addEventListener("install", (event) => {
  (event as any).waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        "/",
        "/explore",
        "/about",
        "/privacy",
        "/terms",
        "/contact",
      ]);
    })
  );
});

self.addEventListener("fetch", (event: any) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request).then((response) => {
          return response || caches.match(OFFLINE_URL);
        });
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});
