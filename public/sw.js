const CACHE_NAME = 'eventswap-v2';
const urlsToCache = [
  '/',
  '/login',
  '/register',
];

// ---------------------------------------------------------------------------
// Install - Cache core assets
// ---------------------------------------------------------------------------
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  // Activate immediately without waiting for existing clients to close
  self.skipWaiting();
});

// ---------------------------------------------------------------------------
// Activate - Clean up old caches
// ---------------------------------------------------------------------------
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  // Take control of all clients immediately
  self.clients.claim();
});

// ---------------------------------------------------------------------------
// Fetch - Cache-first strategy
// ---------------------------------------------------------------------------
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});

// ---------------------------------------------------------------------------
// Push Notifications
// ---------------------------------------------------------------------------
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};

  const options = {
    body: data.body || 'Nova notificacao',
    icon: '/icons/icon.svg',
    badge: '/icons/icon.svg',
    vibrate: [100, 50, 100],
    data: { url: data.action_url || '/' },
    actions: data.actions || [],
    tag: data.tag || 'default',
    renotify: true,
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'EventSwap', options)
  );
});

// ---------------------------------------------------------------------------
// Notification Click - Open the relevant page
// ---------------------------------------------------------------------------
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    // Try to focus an existing window, otherwise open a new one
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open with the target URL
        for (const client of clientList) {
          if (client.url.includes(url) && 'focus' in client) {
            return client.focus();
          }
        }
        // Check if there's any open window we can navigate
        for (const client of clientList) {
          if ('focus' in client && 'navigate' in client) {
            return client.focus().then(() => client.navigate(url));
          }
        }
        // Otherwise open a new window
        return self.clients.openWindow(url);
      })
  );
});
