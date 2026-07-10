const CACHE_NAME = 'expenseflow-v1';
const STATIC_CACHE_URLS = ['/', '/dashboard', '/manifest.json'];
const API_CACHE_NAME = 'expenseflow-api-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_CACHE_URLS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('expenseflow-') && name !== CACHE_NAME && name !== API_CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});

function isCacheable(request) {
  if (request.method !== 'GET') return false;
  if (request.url.includes('/__/auth/')) return false;
  if (request.url.includes('googleapis.com/identitytoolkit')) return false;
  if (request.url.includes('securetoken.googleapis.com')) return false;
  if (request.url.includes('firestore.googleapis.com/google.firestore')) return false;
  return true;
}

function cacheResponse(request, response, cacheName) {
  if (!isCacheable(request)) return;
  if (!response || response.status !== 200) return;
  if (response.type === 'opaqueredirect' || response.type === 'error') return;
  const clone = response.clone();
  caches.open(cacheName).then((cache) => cache.put(request, clone));
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.origin === self.location.origin) {
    if (request.destination === 'document') {
      event.respondWith(
        caches.match(request).then((cached) => {
          const fetchPromise = fetch(request).then((response) => {
            cacheResponse(request, response, CACHE_NAME);
            return response;
          }).catch(() => cached);
          return cached || fetchPromise;
        })
      );
      return;
    }

    if (request.destination === 'style' || request.destination === 'script' || request.destination === 'font' || request.destination === 'image') {
      event.respondWith(
        caches.match(request).then((cached) => {
          const fetchPromise = fetch(request).then((response) => {
            cacheResponse(request, response, CACHE_NAME);
            return response;
          });
          return cached || fetchPromise;
        })
      );
      return;
    }
  }

  if (url.pathname.includes('/api/firebase/') || url.pathname.includes('firestore')) {
    event.respondWith(
      caches.open(API_CACHE_NAME).then((cache) => {
        return fetch(request).then((response) => {
          cacheResponse(request, response, API_CACHE_NAME);
          return response;
        }).catch(() => cache.match(request));
      })
    );
    return;
  }
});

self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
