const CACHE_VERSION = 'mentor-v2'; 
const CACHE_NAME = CACHE_VERSION + '-static-v1';
const API_CACHE_NAME = CACHE_VERSION + '-api-v1';




const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.svg",
  "/offline.html",
  "/icons/android-chrome-192x192.png",
  "/icons/android-chrome-512x512.png"
];

//  INSTALL - Cache static assets
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
     
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

//  ACTIVATE - Delete ALL old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== API_CACHE_NAME) {
           
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 🌐 FETCH - Smart Strategies
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

// Skip non-GET
  if (request.method !== "GET") return;

  // Handle navigation requests first
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Only same-origin requests after navigation
  if (url.origin !== self.location.origin) return;


  //  API Calls: Network-first → Cache fallback (24h)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((netRes) => {
          // Cache successful API responses (24h max-age)
          if (netRes.ok) {
            const resClone = netRes.clone();
            caches.open(API_CACHE_NAME).then((cache) => {
              cache.put(request, resClone);
            });
          }
          return netRes;
        })
        .catch(() => {
          // Fallback to cache
          return caches.match(request).then((cached) => {
            if (cached) {
              console.log(' API cache hit:', url.pathname);
              return cached;
            }
            return caches.match('/offline.html');
          });
        })
    );
    return;
  }

  // Static Assets: Cache-first (stale-while-revalidate)
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        // Update cache in background
        fetch(request).then((netRes) => {
          const resClone = netRes.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, resClone);
          });
        }).catch(() => {}); 
        return cached;
      }

      // Cache miss → network
      return fetch(request)
        .then((netRes) => {
          const resClone = netRes.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, resClone);
          });
          return netRes;
        })
        .catch(() => caches.match('/offline.html'));
    })
  );
});

// 🔔 PUSH Notifications (unchanged)
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

// 👆 Notification Click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow("/"));
});

