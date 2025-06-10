const CACHE_NAME = 'perfume-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './scanner.js',
  './searchEngine.js',
  './perfumes.json',
  './libs/tesseract.min.js',
  './libs/quagga.min.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './images/perfume1.jpg',
  './images/perfume2.jpg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
