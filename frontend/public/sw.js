const CACHE_NAME = "mentor-v2";

const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.svg",
  "/offline.html",
  "/icons/android-chrome-192x192.png"
];

// INSTALL
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// ACTIVATE (delete only old caches)
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// FETCH
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // ❌ IMPORTANT: Skip non-GET (fix POST error)
  if (request.method !== "GET") return;

  // API calls → network first
  if (url.pathname.startsWith("/api")) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response("Offline", { status: 503 });
      })
    );
    return;
  }

  // Static → cache first
  event.respondWith(
    caches.match(request).then((cached) => {
      return (
        cached ||
        fetch(request)
          .then((res) => {
            const resClone = res.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, resClone);
            });
            return res;
          })
          .catch(() => caches.match("/offline.html"))
      );
    })
  );
});

// PUSH
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

// CLICK
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow("/"));
});