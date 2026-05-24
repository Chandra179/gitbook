# AGENTS.md

## Commands

```bash
make dev         # build CSS + start dev server (http://localhost:3000)
npm run dev      # dev server only (no CSS build)
npm run build:css        # Tailwind: input.css → output.css
npm run build:css:watch  # Tailwind watch mode
./build.sh       # full production build → dist/
npx wrangler deploy      # deploy dist/ to Cloudflare Workers
```

No tests, no linting, no CI.

## Architecture

Client-side SPA for browsing markdown docs, deployed as static assets on Cloudflare Workers. No JS bundler — scripts loaded via `<script>` tags in `src/index.html` in dependency order.

**Routing**: History API path-based (`window.location.pathname` + `pushState`). Root `/` is the landing page. The `wrangler.jsonc` SPA fallback handles 404s. Worker name is `blog`.

## Script load order (must be preserved in `src/index.html`)

1. `utils.js` (depended upon by others)
2. `router.js`, `search.js`, `content-loader.js`, `toc-generator.js`, `renderer.js` (class definitions)
3. `marked-extensions.js`, `navigation-data.js` (config)
4. `app.js` (instantiates everything, must be last)

## Content structure

Content directories at repo root:
- `fundamental/` — (NOT `general/` as CLAUDE.md states)
- `golang/`, `math/`, `system-design/` — categories with sub-pages
- `math/precalculus/` — nested folder (depth 1 only)
- Root `*.md` files become standalone pages (e.g., `ml.md`, `syncthing.md`, `README.md`)

Markdown URL resolution:
- Standalone: `/{slug}.md` (e.g., `/ml.md`)
- Category root: `/{category}/README.md`
- Regular page: `/{category}/{page}.md`
- Folder root: `/{category}/{folder}/README.md`

## Adding/removing content

**Do NOT edit `src/js/navigation-data.js` by hand** — it is auto-generated. To add content:

1. Add/remove `.md` files in content directories or repo root
2. Update `NAME_OVERRIDES`, `ROOT_PAGE_ORDER`, `CATEGORY_ORDER`, or `IGNORE` in `scripts/gen-nav.js` if needed
3. Run `./build.sh` (or `node scripts/gen-nav.js` + `node scripts/gen-search-index.js` + `node scripts/gen-landing-index.js` in that order)

## Build: generators mutate `src/` before copy

`build.sh` runs three generators that write back into `src/` before copying to `dist/`:
1. `gen-nav.js` → writes `src/js/navigation-data.js`
2. `gen-search-index.js` → reads nav data, writes `src/search-index.json`
3. `gen-landing-index.js` → reads nav data, writes `src/landing-index.json`

Order matters: step 2 and 3 depend on the output of step 1.

## Dev server behavior

`scripts/dev-server.js` resolves requests in order:
1. `src/` (for CSS/JS/images/robots/sitemap)
2. Repo root (for .md content files)
3. Falls back to `src/index.html` (SPA fallback)

During development you must run `npm run build:css` at least once (or use `make dev` which does it for you). The dev server serves the raw source tree — generators only run during `./build.sh`.

## Math rendering

Uses a custom marked.js extension (`gitbookMath` in `marked-extensions.js`) that renders KaTeX inline during markdown parsing. NOT the standard `marked-katex-extension` npm package (despite being in `package.json`). After parsing, `content-loader.js` post-processes double-dollar spans inside sole `<p>` tags into `<div class="katex-display">` for block-level display.

## npm dependencies

Despite `package.json` listing `marked`, `katex`, `highlight.js`, `alpinejs`, and `marked-katex-extension` as dependencies, only Tailwind CSS (`tailwindcss`, `postcss`, `autoprefixer`) is actually used from npm at build time. All runtime libraries are loaded from CDN in `src/index.html`. `marked-katex-extension` is not used at all.
