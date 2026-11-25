const scope = self.registration.scope;
const cachePrefix = `identidade-estudantil-offline:${scope}:`;
const cacheName = cachePrefix + offline.version;
const shell = new URL('index.html', scope).href;
const assets = new Set(offline.assets.map(asset => new URL(asset, scope).href));

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(cacheName);
    await cache.addAll([...assets].map(url => new Request(url, { cache: 'reload' })));
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const versions = await caches.keys();
    await Promise.all(versions
      .filter(name => name.startsWith(cachePrefix) && name !== cacheName)
      .map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const path = url.origin + url.pathname;
  const isAppNavigation = request.mode === 'navigate' && (path === scope || path === shell);
  if (!isAppNavigation && !assets.has(request.url)) return;

  event.respondWith((async () => {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(isAppNavigation ? shell : request);
    return cached ?? fetch(request);
  })());
});
