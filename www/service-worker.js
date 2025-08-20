const CACHE_NAME = 'maires-pwa-v1';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/@geoman-io/leaflet-geoman-free@2.13.1/dist/leaflet-geoman.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://unpkg.com/@geoman-io/leaflet-geoman-free@2.13.1/dist/leaflet-geoman.min.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (APP_SHELL.includes(url.href) || url.origin === location.origin) {
    event.respondWith(caches.match(event.request).then((resp) => resp || fetch(event.request)));
    return;
  }
  event.respondWith((async () => {
    try {
      const net = await fetch(event.request);
      const cache = await caches.open(CACHE_NAME);
      cache.put(event.request, net.clone());
      return net;
    } catch (e) {
      const cached = await caches.match(event.request);
      if (cached) return cached;
      return new Response('Hors-ligne et ressource non en cache.', { status: 503, statusText: 'Offline' });
    }
  })());
});
