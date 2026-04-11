#!/usr/bin/env node
/**
 * Generates src/js/navigation-data.js by scanning content directories.
 *
 * Rules:
 *   - Root .md files (excluding README, SUMMARY, CLAUDE) become standalone pages.
 *   - Top-level directories with a README.md become categories.
 *   - Sub-directories inside a category become folder pages (isFolder: true).
 *   - .md files inside a category (or sub-folder) become regular pages.
 *   - README.md files inside directories are skipped as pages (they're loaded implicitly).
 *
 * Display names are derived from slugs:
 *   "api-design-guidelines" -> "Api Design Guidelines"
 * Override names in NAME_OVERRIDES below if needed.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT = path.join(ROOT, 'src/js/navigation-data.js');

// Slug -> display name overrides. Add entries here to customise a name
// without renaming the file/directory.
const NAME_OVERRIDES = {
    'README':                      'Introduction',
    'blog-architecture':           'Blog Architecture',
    'p2p-chat':                    'P2P Chat',
    'reactjs':                     'ReactJS',
    'cognitive-skills':            'Cognitive Skills',
    'books':                       'Books',
    'general':                     'General',
    'golang':                      'Golang',
    'math':                        'Math',
    'ml':                          'ML',
    'system-design':               'System Design',
    'web-scraper':                 'Web Scraper',
    'web-intelligence':            'Web Intelligence',
    'precalculus':                 'Precalculus',
    'cpu':                         'CPU',
    'api-design-guidelines':       'API Design Guidelines',
    'oauth2-and-oidc':             'OAuth2 and OIDC',
    'sequence-series-limit':       'Sequence, Series, Limit',
    'linear-algebra':              'Linear Algebra',
    'clock-skew-and-time-sync':    'Clock Skew and Time Sync',
    'consistent-hashing':          'Consistent Hashing',
    'id-generator':                'ID Generator',
    'rate-limit':                  'Rate Limit',
    'distributed-task-scheduler':  'Distributed Task Scheduler',
    'distributed-cache':           'Distributed Cache',
    'notification-system':         'Notification System',
    'chunking-and-embedding':      'Chunking and Embedding',
    'garbage-collector':           'Garbage Collector',
    'headless-browser':            'Headless Browser',
    'youtube-extraction':          'Youtube Extraction',
};

// Root .md files to expose as standalone pages, in order.
// Files not listed here but found on disk are appended alphabetically.
const ROOT_PAGE_ORDER = ['README', 'p2p-chat', 'reactjs', 'cognitive-skills', 'blog-architecture'];

// Top-level content directories, in order.
// Directories not listed here but found on disk are appended alphabetically.
const CATEGORY_ORDER = ['general', 'golang', 'math', 'ml', 'system-design'];

// Directories / files to never include.
const IGNORE = new Set([
    'node_modules', 'dist', 'src', 'scripts', '.git', '.gitbook',
    'CLAUDE.md', 'SUMMARY.md',
]);

function toName(slug) {
    if (NAME_OVERRIDES[slug]) return NAME_OVERRIDES[slug];
    return slug
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

function slugFromFile(filename) {
    return filename.replace(/\.md$/, '');
}

/** Scan a directory and return sorted page entries (files then sub-folders). */
function scanDir(dirPath, depth = 0) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    const pages = [];

    const files = entries
        .filter(e => e.isFile() && e.name.endsWith('.md') && e.name !== 'README.md')
        .map(e => slugFromFile(e.name))
        .sort();

    const dirs = entries
        .filter(e => e.isDirectory() && !IGNORE.has(e.name))
        .map(e => e.name)
        .sort();

    for (const slug of files) {
        pages.push({ name: toName(slug), slug });
    }

    for (const slug of dirs) {
        const subPath = path.join(dirPath, slug);
        const hasReadme = fs.existsSync(path.join(subPath, 'README.md'));
        if (!hasReadme) continue; // skip dirs without README

        if (depth === 0) {
            const subPages = scanDir(subPath, depth + 1);
            const entry = { name: toName(slug), slug, isFolder: true };
            if (subPages.length > 0) entry.pages = subPages;
            pages.push(entry);
        }
        // deeper nesting not needed for now
    }

    return pages;
}

function buildNav() {
    const nav = [];

    // --- Standalone root pages ---
    const rootMdFiles = fs.readdirSync(ROOT, { withFileTypes: true })
        .filter(e => e.isFile() && e.name.endsWith('.md') && !IGNORE.has(e.name))
        .map(e => slugFromFile(e.name));

    const orderedRootPages = [
        ...ROOT_PAGE_ORDER.filter(s => rootMdFiles.includes(s)),
        ...rootMdFiles.filter(s => !ROOT_PAGE_ORDER.includes(s)).sort(),
    ];

    for (const slug of orderedRootPages) {
        nav.push({ name: toName(slug), slug, standalone: true });
    }

    // --- Category directories ---
    const rootDirs = fs.readdirSync(ROOT, { withFileTypes: true })
        .filter(e => e.isDirectory() && !IGNORE.has(e.name) && !e.name.startsWith('.'))
        .map(e => e.name);

    const orderedCategories = [
        ...CATEGORY_ORDER.filter(s => rootDirs.includes(s)),
        ...rootDirs.filter(s => !CATEGORY_ORDER.includes(s)).sort(),
    ];

    for (const slug of orderedCategories) {
        const dirPath = path.join(ROOT, slug);
        const pages = scanDir(dirPath);
        const entry = { name: toName(slug), slug };
        if (pages.length > 0) entry.pages = pages;
        nav.push(entry);
    }

    return nav;
}

function serialize(nav) {
    const lines = [];
    lines.push('// AUTO-GENERATED by scripts/gen-nav.js — do not edit by hand.');
    lines.push('// Run `node scripts/gen-nav.js` (or `./build.sh`) to regenerate.');
    lines.push('const navigationData = [');

    for (const item of nav) {
        lines.push('    {');
        lines.push(`        name: ${JSON.stringify(item.name)},`);
        lines.push(`        slug: ${JSON.stringify(item.slug)},`);
        if (item.standalone) lines.push(`        standalone: true,`);
        if (item.isFolder)   lines.push(`        isFolder: true,`);
        if (item.pages) {
            lines.push(`        pages: [`);
            for (const page of item.pages) {
                serializePage(lines, page, 3);
            }
            lines.push(`        ],`);
        }
        lines.push('    },');
    }

    lines.push('];');
    lines.push('');
    return lines.join('\n');
}

function serializePage(lines, page, indent) {
    const pad = '    '.repeat(indent);
    if (page.pages) {
        lines.push(`${pad}{`);
        lines.push(`${pad}    name: ${JSON.stringify(page.name)},`);
        lines.push(`${pad}    slug: ${JSON.stringify(page.slug)},`);
        if (page.isFolder) lines.push(`${pad}    isFolder: true,`);
        lines.push(`${pad}    pages: [`);
        for (const sub of page.pages) {
            serializePage(lines, sub, indent + 2);
        }
        lines.push(`${pad}    ],`);
        lines.push(`${pad}},`);
    } else {
        const isFolder = page.isFolder ? `, isFolder: true` : '';
        lines.push(`${pad}{ name: ${JSON.stringify(page.name)}, slug: ${JSON.stringify(page.slug)}${isFolder} },`);
    }
}

const nav = buildNav();
const output = serialize(nav);
fs.writeFileSync(OUTPUT, output, 'utf8');
console.log(`navigation-data.js written (${nav.length} top-level entries)`);
