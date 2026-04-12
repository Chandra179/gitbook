#!/usr/bin/env node
/**
 * Pre-builds the full-text search index at build time.
 *
 * Walks the same content tree as gen-nav.js, reads every markdown file,
 * splits it by headings into sections, strips markdown syntax, and writes
 * src/search-index.json.
 *
 * At runtime, search.js fetches this single JSON file instead of fetching
 * every markdown file individually — N requests → 1 request.
 */

const fs   = require('fs');
const path = require('path');

const ROOT   = path.resolve(__dirname, '..');
const OUTPUT = path.join(ROOT, 'src', 'search-index.json');

const IGNORE = new Set([
    'node_modules', 'dist', 'src', 'scripts', '.git', '.gitbook',
    'CLAUDE.md', 'SUMMARY.md', 'diagrams', 'books.md',
]);

// Must match utils.js generateSlug exactly so anchor links resolve correctly.
function generateSlug(text) {
    if (!text || typeof text !== 'string') return '';
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function stripMarkdown(markdown) {
    return markdown
        .replace(/^#+\s+/gm, '')
        .replace(/(\*\*|__)(.*?)\1/g, '$2')
        .replace(/(\*|_)(.*?)\1/g, '$2')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
        .replace(/>\s+/gm, '')
        .replace(/```[\s\S]*?```/g, '')
        .replace(/\n/g, ' ');
}

function indexFile(index, filePath, pageName, pageLink, categoryName) {
    let text;
    try {
        text = fs.readFileSync(filePath, 'utf8');
    } catch {
        return; // file doesn't exist or unreadable — skip
    }

    const lines = text.split('\n');
    let current = { title: pageName, content: '', anchor: '' };

    for (const line of lines) {
        const m = line.match(/^(#{1,3})\s+(.+)$/);
        if (m) {
            if (current.content.trim()) {
                index.push({
                    title:    current.title,
                    category: categoryName,
                    page:     pageName,
                    link:     `/${pageLink}${current.anchor ? '#' + current.anchor : ''}`,
                    plainText: stripMarkdown(current.content),
                });
            }
            current = { title: m[2], content: '', anchor: generateSlug(m[2]) };
        } else {
            current.content += line + '\n';
        }
    }

    if (current.content.trim()) {
        index.push({
            title:    current.title,
            category: categoryName,
            page:     pageName,
            link:     `/${pageLink}${current.anchor ? '#' + current.anchor : ''}`,
            plainText: stripMarkdown(current.content),
        });
    }
}

function indexPages(index, pages, categorySlug, categoryName, pathPrefix = '') {
    for (const page of pages) {
        if (page.isFolder && page.pages) {
            const folderPath = pathPrefix ? `${pathPrefix}/${page.slug}` : page.slug;
            indexPages(index, page.pages, categorySlug, categoryName, folderPath);
        } else {
            const pagePath = pathPrefix ? `${pathPrefix}/${page.slug}` : page.slug;
            indexFile(
                index,
                path.join(ROOT, categorySlug, pagePath + '.md'),
                page.name,
                `${categorySlug}/${pagePath}`,
                categoryName,
            );
        }
    }
}

// Load the already-generated navigation data to reuse its structure.
// Avoids duplicating the filesystem-walking logic.
function loadNavData() {
    const navFile = path.join(ROOT, 'src', 'js', 'navigation-data.js');
    const src = fs.readFileSync(navFile, 'utf8');
    // Strip the const assignment so we can eval just the array literal
    const json = src
        .replace(/^\/\/.*$/gm, '')           // remove comments
        .replace(/const navigationData\s*=/, '')
        .replace(/;?\s*$/, '');
    // eslint-disable-next-line no-eval
    return eval(`(${json.trim()})`);
}

function build() {
    const nav   = loadNavData();
    const index = [];

    for (const section of nav) {
        if (section.standalone) {
            indexFile(
                index,
                path.join(ROOT, section.slug + '.md'),
                section.name,
                section.slug,
                section.name,
            );
        } else if (section.pages) {
            indexPages(index, section.pages, section.slug, section.name);
        }
    }

    fs.writeFileSync(OUTPUT, JSON.stringify(index), 'utf8');
    console.log(`search-index.json written (${index.length} sections)`);
}

build();
