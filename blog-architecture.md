# Blog Architecture

<figure><img src="/.gitbook/assets/blog-architecture.png" alt=""><figcaption></figcaption></figure>

## Goals

Build a lightweight, self-hosted documentation site that:
- Requires no backend or database
- Serves static markdown files directly (like GitBook)
- Provides a polished, modern UI with full-text search
- Loads instantly with minimal network overhead
- Deploys as a static site to edge hosting (Cloudflare Workers)

## Trade-offs

**Works well for:** Fixed content trees, read-only documentation, fast page loads on revisit
**Limitations:** Large sites (100+ pages) may have slower initial search index loads; no real-time content updates without a rebuild

## Routing

Hash-based routing via `router.js`. Every navigation event writes a path to the URL hash (`#category/page`) and fires an `onRouteChange` callback. The router validates paths to prevent directory traversal and maintains current category, page, and breadcrumb state. On back/forward, a `popstate` listener re-fires the route change so the app stays in sync with browser history.

## Content Loading

`content-loader.js` maps a route to a markdown file path (`/category/page.md` or `/category/page/README.md` for folders) and fetches it. Parsed HTML is cached in memory so revisiting a page costs zero network requests. After parsing, relative links and image paths are rewritten to root-relative URLs so they resolve correctly regardless of the current route. A `$$...$$` paragraph promotion step turns inline math blocks into display-level `<div class="katex-display">` wrappers.

## Search

Full-text search runs entirely in the browser against a pre-built index. At build time, `scripts/gen-search-index.js` walks every markdown file, splits content by headings into sections, strips markdown syntax, and writes `search-index.json`. At page load, `search.js` fetches this single JSON file — replacing the previous approach of fetching every markdown file individually on startup. Queries use substring matching with a 300ms debounce; results are capped at 10 and ranked by first match.

## Rendering Pipeline

After content loads, `renderer.js` runs three post-render passes:

1. **Timeline detection** — lists whose items contain year patterns get a `timeline-list` class for CSS grid styling.
2. **Math** — handled entirely at markdown parse time by the `gitbookMath` marked extension (`marked-extensions.js`). It intercepts `$...$` and `$$...$$` delimiters and calls `katex.renderToString()` inline, producing pre-rendered HTML spans. KaTeX auto-render is intentionally not used.
3. **Code highlighting** — Highlight.js syntax-highlights every `<pre><code>` block and wraps it in a toolbar with a language selector and copy button. All Highlight.js scripts are loaded with `defer` to avoid blocking HTML parsing.
