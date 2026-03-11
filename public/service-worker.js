const CACHE_NAME = "agrivus-2026-03-11";
const urlsToCache = ["/manifest.json"];

// Install event - cache essential files
self.addEventListener("install", (event) => {
  console.log("Service Worker installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache");
      return cache.addAll(urlsToCache).catch((err) => {
        console.log("Cache addAll error:", err);
        // Don't fail install if some files can't be cached
        return Promise.resolve();
      });
    }),
  );
  // Force new service worker to activate immediately
  self.skipWaiting();
});

// Fetch event - network first for HTML and JS, cache first for others
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Never intercept unsupported schemes, API calls, or cross-origin requests.
  // This avoids cache errors from extension requests and keeps payment/API flows network-driven.
  if (
    request.method !== "GET" ||
    (url.protocol !== "http:" && url.protocol !== "https:") ||
    url.origin !== self.location.origin ||
    url.pathname.startsWith("/api/")
  ) {
    return;
  }

  // Network-only strategy for HTML/JS/assets to avoid stale index+asset mismatch
  if (
    url.pathname === "/" ||
    url.pathname.endsWith(".html") ||
    url.pathname.endsWith(".js") ||
    url.pathname.includes("/assets/")
  ) {
    event.respondWith(
      fetch(request)
        .then((response) => response)
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(request).then((response) => {
            return (
              response ||
              new Response("Offline - please check your connection", {
                status: 503,
                statusText: "Service Unavailable",
                headers: new Headers({
                  "Content-Type": "text/plain",
                }),
              })
            );
          });
        }),
    );
    return;
  }

  // Cache first strategy for other assets
  event.respondWith(
    caches.match(request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache).catch((err) => {
            console.log("Cache put skipped:", err);
          });
        });

        return response;
      });
    }),
  );
});

// Activate event - claim all clients and clean up
self.addEventListener("activate", (event) => {
  console.log("Service Worker activating...");
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );

  // Claim all clients to ensure new service worker is used immediately
  return self.clients.claim();
});

// Message event - handle update requests from client
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    console.log("Service Worker: SKIP_WAITING requested");
    self.skipWaiting();
  }
});
