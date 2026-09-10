/**
 * Gyankosh PWA Service Worker
 * Provides offline reading capabilities and fast cached assets.
 */

const CACHE_NAME = 'gyankosh-v2';
const BASE = '/gyankosh';

// Core assets to pre-cache on install
const PRECACHE_ASSETS = [
  `${BASE}/`,
  `${BASE}/search-catalog.json`,
  `${BASE}/manifest.webmanifest`,
  `${BASE}/favicon.svg`,
  `${BASE}/favicon.ico`,
  `${BASE}/logo.png`,
  `${BASE}/apple-touch-icon.png`,
  `${BASE}/pwa-192x192.png`,
  `${BASE}/pwa-512x512.png`,
  `${BASE}/pwa-maskable-512x512.png`
];

// Install: Cache core application shell
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Use catch on each asset to avoid failing entire install if an optional asset is missing
      return Promise.allSettled(
        PRECACHE_ASSETS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn(`[Gyankosh SW] Failed to pre-cache ${url}:`, err);
          })
        )
      );
    })
  );
});

// Activate: Clean up previous cache versions and claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('gyankosh-') && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Strategy depending on request type
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle same-origin or fonts.googleapis / fonts.gstatic requests
  if (req.method !== 'GET') return;

  // Static assets (CSS, JS, Fonts, Images, Icons) -> Cache-First with Network Revalidation
  if (
    url.pathname.match(/\.(css|js|woff2?|ttf|eot|png|jpg|jpeg|svg|webp|ico|webmanifest)$/) ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.hostname.includes('fonts.googleapis.com')
  ) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) {
          // Revalidate in background
          fetch(req).then((networkRes) => {
            if (networkRes && networkRes.status === 200) {
              const resClone = networkRes.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
            }
          }).catch(() => {});
          return cached;
        }
        return fetch(req).then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const resClone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          }
          return networkRes;
        });
      })
    );
    return;
  }

  // HTML Navigation (Scriptures, categories, tags, home) -> Network-First with Cache Fallback
  if (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const resClone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          }
          return networkRes;
        })
        .catch(async () => {
          // Offline fallback: try cache for this exact page
          const cached = await caches.match(req);
          if (cached) return cached;

          // Try without trailing slash / with trailing slash
          const altUrl = url.pathname.endsWith('/')
            ? url.pathname.slice(0, -1)
            : url.pathname + '/';
          const altCached = await caches.match(altUrl);
          if (altCached) return altCached;

          // Fallback to home page if available in cache
          const homeCached = await caches.match(`${BASE}/`);
          if (homeCached) return homeCached;

          // Custom offline message in sacred Indic styling
          return new Response(
            `<!doctype html>
            <html lang="hi">
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <title>ऑफलाइन — ज्ञानकोश</title>
                <style>
                  body { font-family: 'Rozha One', 'Yatra One', serif; background: #fcf8ee; color: #2c2523; text-align: center; padding: 3rem 1.5rem; }
                  .card { max-width: 500px; margin: 0 auto; background: #fffdfa; border: 2px solid #8e1b14; border-radius: 12px; padding: 2rem; box-shadow: 0 4px 15px rgba(0,0,0,0.08); }
                  h1 { color: #8e1b14; font-size: 1.8rem; margin-bottom: 1rem; }
                  p { font-size: 1.1rem; line-height: 1.6; margin-bottom: 1.5rem; }
                  a { display: inline-block; background: #8e1b14; color: #fff; padding: 0.6rem 1.4rem; border-radius: 6px; text-decoration: none; font-weight: bold; }
                </style>
              </head>
              <body>
                <div class="card">
                  <div style="font-size: 3rem; margin-bottom: 1rem;">🕉️</div>
                  <h1>आप वर्तमान में ऑफलाइन हैं</h1>
                  <p>यह पृष्ठ अभी कैशे में उपलब्ध नहीं है। कृपया इंटरनेट कनेक्शन पुनः स्थापित होने पर पुनः प्रयास करें, या पहले से पढ़े गए ग्रंथों को पढ़ें।</p>
                  <a href="${BASE}/">ज्ञानकोश मुख्य पृष्ठ</a>
                </div>
              </body>
            </html>`,
            {
              headers: { 'Content-Type': 'text/html; charset=utf-8' }
            }
          );
        })
    );
    return;
  }

  // Default fetch
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});
