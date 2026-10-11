/* ====================================================================
   LOG CALENDAR - PWA Service Worker (v4.0.0)
   Offline Support & Network-First Cache Strategy
   Zero interference with File System Access API or IndexedDB
   ==================================================================== */

const CACHE_NAME = "log-calendar-pwa-v4.0.0";

const PRECACHE_ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./assets/manifest.webmanifest",
  "./assets/version.json",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./js/core/constants.js",
  "./js/core/utils.js",
  "./js/core/i18n.js",
  "./js/core/sound.js",
  "./js/core/state.js",
  "./js/features/tasks.js",
  "./js/infrastructure/storage.js",
  "./js/features/calendar.js",
  "./js/features/tracker.js",
  "./js/features/stats.js",
  "./js/features/insights.js",
  "./js/features/periods.js",
  "./js/features/settings.js",
  "./js/features/tutorial.js",
  "./js/features/updater.js",
  "./js/ui/theme.js",
  "./js/ui/dock.js",
  "./js/ui/day-panel.js",
  "./js/main.js"
];

// Install: Pre-cache core shell
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn("[SW] Partial precache failure:", err);
      });
    })
  );
});

// Activate: Clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Network First with Cache Fallback for same-origin assets
self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Never intercept external requests (e.g. GitHub raw version checks)
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === "basic") {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          if (event.request.headers.get("accept")?.includes("text/html")) {
            return caches.match("./index.html");
          }
        });
      })
  );
});
