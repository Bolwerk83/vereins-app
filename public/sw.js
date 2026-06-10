// Vereins-App Service Worker — auto-updating + Web-Push.
// Diese Datei (public/sw.js) wird in den Build kopiert und unter /sw.js
// ausgeliefert. Cache-Name bei groesseren Aenderungen hochzaehlen.
const CACHE = 'vereins-v5';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // HTML/Navigation: IMMER network-first, damit ein neuer Build sofort
  // geladen wird (verweist auf die neuen, gehashten JS-Dateien).
  if (req.mode === 'navigate' || req.destination === 'document') {
    e.respondWith(
      fetch(req).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(req, clone));
        return res;
      }).catch(() => caches.match(req).then(r => r || caches.match('/')))
    );
    return;
  }

  // Gehashte Assets sind unveraenderlich: aus Cache bedienen, im Hintergrund auffrischen.
  e.respondWith(
    caches.match(req).then(cached => {
      const networkFetch = fetch(req).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(req, clone));
        }
        return res;
      }).catch(() => cached);
      return cached || networkFetch;
    })
  );
});

self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});

// ── Web Push ──────────────────────────────────────────────
self.addEventListener('push', e => {
  let data = {};
  try { data = e.data ? e.data.json() : {}; } catch { data = { title: 'Vereins-App', body: e.data && e.data.text() }; }
  const title = data.title || 'Vereins-App';
  const opts = {
    body: data.body || '',
    tag: data.tag || 'vereins',
    icon: data.icon || '/icon-192.png',
    badge: data.badge || '/icon-192.png',
    data: { url: data.url || '/' },
    renotify: !!data.renotify,
    requireInteraction: !!data.requireInteraction,
    actions: data.actions || [],
  };
  e.waitUntil(self.registration.showNotification(title, opts));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const target = (e.notification.data && e.notification.data.url) || '/';
  e.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const sameOrigin = all.filter(c => new URL(c.url).origin === self.location.origin);
    if (sameOrigin.length) {
      const client = sameOrigin[0];
      try { await client.focus(); client.navigate(target).catch(()=>{}); } catch {}
      return;
    }
    await self.clients.openWindow(target);
  })());
});
