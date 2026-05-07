const CACHE_NAME = 'game-hub-20260507011644';
const ASSETS = ['./', './index.html', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  const isStatic = /\.(png|svg|ico|woff2?|jpg|jpeg|webp)$/i.test(url.pathname);
  if (isStatic) {
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
        if (res && res.status === 200 && res.type !== 'opaque')
          caches.open(CACHE_NAME).then(c => c.put(e.request, res.clone()));
        return res;
      }))
    );
    return;
  }
  e.respondWith(
    fetch(e.request).then(res => {
      if (res && res.status === 200 && res.type !== 'opaque')
        caches.open(CACHE_NAME).then(c => c.put(e.request, res.clone()));
      return res;
    }).catch(() => caches.match(e.request))
  );
});
