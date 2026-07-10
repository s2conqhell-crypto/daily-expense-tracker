const CACHE_NAME = 'expenseflow-v2';
const ASSET_CACHE = 'expenseflow-assets-v2';
const STATIC_CACHE_URLS = ['/manifest.json'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_CACHE_URLS).catch(() => {});
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('expenseflow-') && name !== CACHE_NAME && name !== ASSET_CACHE)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

function isAuthOrApiRequest(url) {
  if (url.includes('/__/auth/')) return true;
  if (url.includes('googleapis.com/identitytoolkit')) return true;
  if (url.includes('securetoken.googleapis.com')) return true;
  if (url.includes('firestore.googleapis.com')) return true;
  if (url.includes('firebaseio.com')) return true;
  return false;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;

  if (isAuthOrApiRequest(url.href)) {
    event.respondWith(fetch(request).catch(() => new Response(null, { status: 503 })));
    return;
  }

  if (url.origin !== self.location.origin) return;

  if (request.destination === 'document') {
    event.respondWith(
      fetch(request).then((response) => {
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      }).catch(() => {
        return caches.match(request).then((cached) => {
          return cached || new Response(null, { status: 503 });
        });
      })
    );
    return;
  }

  if (request.destination === 'style' || request.destination === 'script' || request.destination === 'font' || request.destination === 'image') {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request).then((response) => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(ASSET_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        });
        return cached || fetchPromise;
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
