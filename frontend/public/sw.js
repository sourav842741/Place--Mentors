const CACHE_VERSION = "mentor-v4"; // 🔥 version update
const CACHE_NAME = `${CACHE_VERSION}-static`;
const API_CACHE_NAME = `${CACHE_VERSION}-api`;

// STATIC FILES
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.svg",
  "/offline.html",
  "/icons/android-chrome-192x192.png",
  "/icons/android-chrome-512x512.png",
];

// 🔹 INSTALL
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

// 🔹 ACTIVATE
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== API_CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// 🔹 FETCH
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // ❌ Only GET
  if (request.method !== "GET") return;

  // ✅ NAVIGATION (SPA fallback)
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => res)
        .catch(() => caches.match("/index.html"))
    );
    return;
  }

  // ❌ skip external requests
  if (url.origin !== self.location.origin) return;

  // 🔥 API → NETWORK FIRST
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (!res || !res.ok) return res;

          const clone = res.clone(); // ✅ clone BEFORE use

          caches.open(API_CACHE_NAME).then((cache) => {
            cache.put(request, clone).catch(() => {});
          });

          return res;
        })
        .catch(() =>
          caches.match(request).then((cached) => {
            return cached || caches.match("/offline.html");
          })
        )
    );
    return;
  }

  // 🔥 STATIC → CACHE FIRST
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        // 🔄 background update (safe clone handling)
        fetch(request)
          .then((res) => {
            if (!res || !res.ok) return;

            const clone = res.clone(); // ✅ FIXED

            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clone).catch(() => {});
            });
          })
          .catch(() => {});

        return cached;
      }

      // 🌐 network fetch
      return fetch(request)
        .then((res) => {
          if (!res || !res.ok) return res;

          const clone = res.clone(); // ✅ FIXED

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clone).catch(() => {});
          });

          return res;
        })
        .catch(() => caches.match("/offline.html"));
    })
  );
});

// 🔔 PUSH
self.addEventListener("push", (event) => {
  const data = event.data?.json() || {
    title: "Place Mentor 🚀",
    body: "New update available!",
  };

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/android-chrome-192x192.png",
    })
  );
});

// 👆 CLICK
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow("/"));
});