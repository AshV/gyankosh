/**
 * Gyankosh PWA Service Worker (v4)
 * Provides robust offline reading, partitioned caching, LRU eviction,
 * and zero-network overhead for immutable Vite assets.
 */

const VERSION = 'v4';
const CACHE_SHELL = `gyankosh-shell-${VERSION}`;
const CACHE_CONTENT = `gyankosh-content-${VERSION}`;
const CACHE_MEDIA = `gyankosh-media-${VERSION}`;

const CURRENT_CACHES = [CACHE_SHELL, CACHE_CONTENT, CACHE_MEDIA];
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

// Max items per dynamic cache (LRU/FIFO trim)
const MAX_CONTENT_PAGES = 40;
const MAX_MEDIA_ITEMS = 60;

/**
 * Trim cache to keep storage bounded on mobile devices
 */
async function trimCache(cacheName, maxItems) {
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    if (keys.length > maxItems) {
      const deleteCount = keys.length - maxItems;
      for (let i = 0; i < deleteCount; i++) {
        await cache.delete(keys[i]);
      }
    }
  } catch (err) {
    console.warn(`[Gyankosh SW] Cache trimming failed for ${cacheName}:`, err);
  }
}

// Install: Pre-cache core application shell
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_SHELL).then((cache) => {
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
          .filter((name) => name.startsWith('gyankosh-') && !CURRENT_CACHES.includes(name))
          .map((name) => {
            console.log(`[Gyankosh SW] Purging obsolete cache: ${name}`);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Strategy depending on request type
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle GET requests
  if (req.method !== 'GET') return;

  // 1. Immutable Content-Hashed Chunks (_astro/*) -> Pure Cache-First (NO background revalidation)
  if (url.pathname.includes('/_astro/')) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const resClone = networkRes.clone();
            caches.open(CACHE_SHELL).then((cache) => cache.put(req, resClone));
          }
          return networkRes;
        });
      })
    );
    return;
  }

  // 2. Search Catalog -> Stale-While-Revalidate with active background update
  if (url.pathname.endsWith('/search-catalog.json')) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const fetchPromise = fetch(req).then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const resClone = networkRes.clone();
            caches.open(CACHE_SHELL).then((cache) => cache.put(req, resClone));
          }
          return networkRes;
        }).catch(() => null);

        // Return cached version immediately if present, otherwise await network
        return cached || fetchPromise;
      })
    );
    return;
  }

  // 3. Book Covers & Media -> Cache-First with Background Revalidation & LRU Trimming
  if (url.pathname.includes('/covers/') || url.pathname.match(/\.(png|jpg|jpeg|webp|svg|ico)$/)) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const fetchPromise = fetch(req).then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const resClone = networkRes.clone();
            caches.open(CACHE_MEDIA).then((cache) => {
              cache.put(req, resClone);
              trimCache(CACHE_MEDIA, MAX_MEDIA_ITEMS);
            });
          }
          return networkRes;
        }).catch(() => null);

        return cached || fetchPromise;
      })
    );
    return;
  }

  // 4. Local Fonts & Shell Assets (CSS, JS, Fonts, Manifest) -> Stale-While-Revalidate
  if (
    url.pathname.match(/\.(css|js|woff2?|ttf|eot|webmanifest)$/) ||
    url.pathname.includes('/fonts/')
  ) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const fetchPromise = fetch(req).then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const resClone = networkRes.clone();
            caches.open(CACHE_SHELL).then((cache) => cache.put(req, resClone));
          }
          return networkRes;
        }).catch(() => null);

        return cached || fetchPromise;
      })
    );
    return;
  }

  // 5. HTML Navigation (Scriptures, categories, tags, home) -> Network-First with Offline Fallback
  if (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const resClone = networkRes.clone();
            caches.open(CACHE_CONTENT).then((cache) => {
              cache.put(req, resClone);
              trimCache(CACHE_CONTENT, MAX_CONTENT_PAGES);
            });
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
                  body { font-family: 'Rozha One', 'Martel', serif; background: #fcf8ee; color: #2c2523; text-align: center; padding: 3rem 1.5rem; }
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

  // 6. Default Fallback
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});
