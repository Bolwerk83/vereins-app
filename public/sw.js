const CACHE = 'vereins-v1';
const ASSETS = ['./', './index.html'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

// Push notifications
self.addEventListener('push', e => {
  const data = e.data?.json() || {};
  e.waitUntil(
    self.registration.showNotification(data.title || 'Vereins-App', {
      body: data.body || 'Neue Benachrichtigung',
      icon: './icon-192.png',
      badge: './icon-192.png',
      tag: data.tag || 'vereins',
      data: { url: data.url || './' },
      actions: data.actions || []
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data?.url || './'));
});

// Background sync for offline saves
self.addEventListener('sync', e => {
  if (e.tag === 'sync-data') {
    e.waitUntil(syncPendingData());
  }
});

async function syncPendingData() {
  const cache = await caches.open(CACHE);
  // Sync any pending offline changes when back online
}
