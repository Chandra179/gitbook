# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Local development server
npm run dev

# Build CSS (one-time)
npm run build:css

# Watch CSS for changes
npm run build:css:watch

# Full production build (CSS + copies all assets to dist/)
./build.sh

# Deploy to Cloudflare Workers (manual)
npx wrangler deploy
```

There are no tests or linting configured.

## Architecture

This is a client-side SPA for browsing hierarchical markdown documentation, deployed as a static site on Cloudflare Workers. No JS bundler — JavaScript modules are loaded in order via `<script>` tags in `src/index.html`.

**Core modules in `src/js/`:**

- `navigation-data.js` — Static definition of all pages, sections, and nested folders. **Edit this to add/remove content from the navigation tree.**
- `app.js` — Alpine.js app state and initialization; orchestrates all modules
- `router.js` — Hash-based routing (`#path/to/page`); validates paths to prevent directory traversal
- `content-loader.js` — Fetches and parses markdown files dynamically; supports nested folder paths
- `search.js` — Full-text search across all markdown content (indexed on page load, max 10 results)
- `toc-generator.js` — Extracts h2/h3 headings from rendered content; uses IntersectionObserver for active section tracking
- `renderer.js` — Post-render processing: KaTeX for math (`$...$` and `$$...$$`), Highlight.js for code blocks, custom timeline styling
- `marked-extensions.js` — Custom marked.js extension that protects LaTeX delimiters from markdown parsing
- `utils.js` — Slug generation used for heading IDs and routing

**Content structure:**

Markdown content lives in topic directories at the repo root (`general/`, `golang/`, `math/`, `system-design/`, `ml/`) and is served directly. Nested folders (e.g., `math/precalculus/`) are supported by both the content loader and the navigation data.

**CSS:**

Tailwind CSS is compiled from `src/css/input.css` to `src/css/output.css`. Custom CSS modules in `src/css/` handle prose styling, math rendering, timeline components, and base layout. The `build:css` step must be run after any changes to Tailwind classes.

**Build output:**

`build.sh` copies `src/` HTML/CSS/JS and all content directories into `dist/` for Cloudflare Workers deployment. The `wrangler.jsonc` config points to `dist/` as the Workers assets directory.
