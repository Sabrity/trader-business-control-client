const CACHE = 'tbc-client-shell-v8';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icons/icon-48.png', './icons/icon-72.png', './icons/icon-96.png', './icons/icon-128.png', './icons/icon-144.png', './icons/icon-152.png', './icons/icon-180.png', './icons/icon-192.png', './icons/icon-256.png', './icons/icon-384.png', './icons/icon-512.png', './favicon.ico', './favicon-16.png', './favicon-32.png', './favicon-48.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Keep Supabase/API requests online; never serve business data from the shell cache.
  if (url.pathname.includes('/rest/v1/')) return;
  event.respondWith(fetch(req).then(res => {
    if (res.ok && url.origin === location.origin) {
      const copy = res.clone();
      caches.open(CACHE).then(cache => cache.put(req, copy));
    }
    return res;
  }).catch(() => caches.match(req).then(cached => cached || caches.match('./index.html'))));
});
