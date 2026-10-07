const CACHE_NAME = "portfolio-eyd-v8";

const LOCAL_FILES = [
  "./",
  "./index.html",
  "./style.css?v=18",
  "./script.js?v=3",
  "./manifest.webmanifest",
  "./photo-profil.jpeg",
  "./CV_FINAL_DROITE_ENTIEREMENT_VISIBLE.pdf",
  "./Convention%20stage%20-%20DRAME.pdf",
  "./Capture%20d%E2%80%99%C3%A9cran%20(543).png",
  "./Capture%20d%E2%80%99%C3%A9cran%20(549).png",
  "./Capture%20d%E2%80%99%C3%A9cran%20(552).png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(LOCAL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const requestUrl = new URL(event.request.url);

  // Les services externes (GitHub, LinkedIn, WhatsApp, FormSubmit, MDS Avis)
  // restent dépendants d'une connexion Internet.
  if (requestUrl.origin !== self.location.origin) return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put("./index.html", copy));
          return response;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        if (response && response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        }
        return response;
      });
    })
  );
});
