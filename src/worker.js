const CACHE = {
    DAY: 'public, max-age=86400, stale-while-revalidate=604800',
    HOUR: 'public, max-age=3600, stale-while-revalidate=86400',
};

export default {
    async fetch(request, env) {
        const response = await env.ASSETS.fetch(request);

        if (request.method !== 'GET') return response;

        const path = new URL(request.url).pathname;
        let ttl = null;

        if (path === '/search-index.json' || path === '/landing-index.json') {
            ttl = CACHE.DAY;
        } else if (path.endsWith('.js') || path.endsWith('.css')) {
            ttl = CACHE.DAY;
        } else if (path.endsWith('.md') || path.endsWith('.json')) {
            ttl = CACHE.DAY;
        } else if (path.endsWith('.html')) {
            ttl = CACHE.HOUR;
        } else if (path.endsWith('.png') || path.endsWith('.svg') || path.endsWith('.jpg') || path.endsWith('.ico') || path.endsWith('.woff2')) {
            ttl = CACHE.DAY;
        }

        if (!ttl) return response;

        const headers = new Headers(response.headers);
        headers.set('Cache-Control', ttl);

        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers,
        });
    },
};
