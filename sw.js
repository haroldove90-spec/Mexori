// A basic service worker to make the app installable.
self.addEventListener('install', (event) => {
  console.log('Service worker installing...');
  // You can add pre-caching logic here if needed.
});

self.addEventListener('fetch', (event) => {
  // This simple fetch handler is enough to make the app installable.
  // For a true offline experience, you would implement a cache-first strategy here.
  event.respondWith(fetch(event.request));
});
