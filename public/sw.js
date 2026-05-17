// Service Worker — NalaKoe PWA
// Cache strategy:
//   - Static assets (JS, CSS, fonts): CacheFirst, 30 days
//   - Pages (HTML): NetworkFirst, 7 days
//   - API routes: NetworkOnly (always fresh)
//   - Images: StaleWhileRevalidate, 7 days
//   - Offline fallback: /offline

const CACHE_VERSION = 'v1';
const CACHE_STATIC = `nk-static-${CACHE_VERSION}`;
const CACHE_PAGES = `nk-pages-${CACHE_VERSION}`;
const CACHE_IMAGES = `nk-images-${CACHE_VERSION}`;

const OFFLINE_URL = '/offline';

const STATIC_ASSETS = [
  '/',
  OFFLINE_URL,
  '/manifest.json',
];

// ─── Install ──────────────────────────────────────────────────────────────────

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// ─── Activate ─────────────────────────────────────────────────────────────────

self.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_STATIC, CACHE_PAGES, CACHE_IMAGES];
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => !currentCaches.includes(name))
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// ─── Fetch ────────────────────────────────────────────────────────────────────

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // Skip API routes — always network
  if (url.pathname.startsWith('/api/')) return;

  // Images: StaleWhileRevalidate
  if (request.destination === 'image') {
    event.respondWith(staleWhileRevalidate(CACHE_IMAGES, request));
    return;
  }

  // Static assets (JS/CSS/fonts): CacheFirst
  if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font'
  ) {
    event.respondWith(cacheFirst(CACHE_STATIC, request));
    return;
  }

  // HTML pages: NetworkFirst with offline fallback
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirstWithOfflineFallback(request));
    return;
  }
});

// ─── Strategies ───────────────────────────────────────────────────────────────

async function cacheFirst(cacheName, request) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

async function staleWhileRevalidate(cacheName, request) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  });
  return cached ?? fetchPromise;
}

async function networkFirstWithOfflineFallback(request) {
  const cache = await caches.open(CACHE_PAGES);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    const offlinePage = await caches.match(OFFLINE_URL);
    return offlinePage ?? new Response('Offline', { status: 503 });
  }
}
