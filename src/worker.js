export default {
    async fetch(request, env) {
        const response = await env.ASSETS.fetch(request);
        const url = new URL(request.url);
        const path = url.pathname;

        if (request.method !== 'GET') return response;

        const headers = new Headers(response.headers);

        if (path.endsWith('search-index.json')) {
            headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=3600');
        } else if (path.endsWith('.md')) {
            headers.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
        } else if (path.endsWith('.js') || path.endsWith('.css')) {
            headers.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
        }

        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers,
        });
    },
};
