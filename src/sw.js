const CACHE = 'gitbook-v1';

// Cache-first: serve from SW cache instantly, revalidate in background
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    const path = url.pathname;

    if (!['GET', 'HEAD'].includes(event.request.method)) return;
    if (!path.match(/\.(md|json|js|css)$/)) return;

    event.respondWith(
        caches.open(CACHE).then(async (cache) => {
            const cached = await cache.match(event.request);
            const fetchPromise = fetch(event.request).then((response) => {
                if (response.ok) cache.put(event.request, response.clone());
                return response;
            });
            return cached ?? fetchPromise;
        })
    );
});

// Clean up old caches on activation
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
        )
    );
});
