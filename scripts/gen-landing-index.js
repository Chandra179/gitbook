#!/usr/bin/env node
/**
 * Pre-builds the landing page card index at build time.
 *
 * Walks the same content tree as gen-nav.js, reads every markdown file,
 * extracts the title and first meaningful paragraph as a description,
 * and writes src/landing-index.json.
 *
 * At runtime, app.js fetches this single JSON file to render the card grid.
 */

const fs   = require('fs');
const path = require('path');

const ROOT   = path.resolve(__dirname, '..');
const OUTPUT = path.join(ROOT, 'src', 'landing-index.json');

const DESCRIPTION_MAX_LENGTH = 200;

function loadNavData() {
    const navFile = path.join(ROOT, 'src', 'js', 'navigation-data.js');
    const src = fs.readFileSync(navFile, 'utf8');
    const json = src
        .replace(/^\/\/.*$/gm, '')
        .replace(/const navigationData\s*=/, '')
        .replace(/;?\s*$/, '');
    // eslint-disable-next-line no-eval
    return eval(`(${json.trim()})`);
}

function extractDescription(markdown) {
    if (!markdown) return '';

    const lines = markdown.split('\n');
    let inCodeBlock = false;
    let paragraph = '';

    for (const line of lines) {
        const trimmed = line.trim();

        if (trimmed.startsWith('```')) {
            inCodeBlock = !inCodeBlock;
            continue;
        }
        if (inCodeBlock) continue;

        if (/^#{1,6}\s/.test(trimmed)) continue;
        if (!trimmed || /^[-*_]{3,}$/.test(trimmed)) continue;

        paragraph += (paragraph ? ' ' : '') + trimmed;

        if (paragraph.length >= DESCRIPTION_MAX_LENGTH) break;
    }

    // Strip markdown formatting
    paragraph = paragraph
        .replace(/(\*\*|__)(.*?)\1/g, '$2')
        .replace(/(\*|_)(.*?)\1/g, '$2')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
        .replace(/>\s+/gm, '');

    if (paragraph.length > DESCRIPTION_MAX_LENGTH) {
        paragraph = paragraph.slice(0, DESCRIPTION_MAX_LENGTH).trimEnd() + '...';
    }

    return paragraph;
}

function readMarkdown(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch {
        return '';
    }
}

function build() {
    const nav   = loadNavData();
    const cards = [];

    for (const section of nav) {
        if (section.standalone) {
            const filePath = path.join(ROOT, section.slug + '.md');
            const desc = extractDescription(readMarkdown(filePath));
            cards.push({
                title:       section.name,
                path:        section.slug,
                standalone:  true,
                category:    null,
                categorySlug: null,
                description: desc,
            });
        } else {
            // Category card (from README.md)
            const catFile = path.join(ROOT, section.slug, 'README.md');
            cards.push({
                title:       section.name,
                path:        section.slug,
                standalone:  false,
                category:    section.name,
                categorySlug: section.slug,
                description: extractDescription(readMarkdown(catFile)),
            });

            if (!section.pages) continue;

            for (const page of section.pages) {
                if (page.isFolder && page.pages) {
                    // Nested folder card (from folder's README.md)
                    const folderFile = path.join(ROOT, section.slug, page.slug, 'README.md');
                    cards.push({
                        title:        page.name,
                        path:         `${section.slug}/${page.slug}`,
                        standalone:   false,
                        category:     section.name,
                        categorySlug: section.slug,
                        description:  extractDescription(readMarkdown(folderFile)),
                    });

                    for (const subpage of page.pages) {
                        const subFile = path.join(ROOT, section.slug, page.slug, subpage.slug + '.md');
                        cards.push({
                            title:        subpage.name,
                            path:         `${section.slug}/${page.slug}/${subpage.slug}`,
                            standalone:   false,
                            category:     section.name,
                            categorySlug: section.slug,
                            description:  extractDescription(readMarkdown(subFile)),
                        });
                    }
                } else {
                    const pageFile = path.join(ROOT, section.slug, page.slug + '.md');
                    cards.push({
                        title:        page.name,
                        path:         `${section.slug}/${page.slug}`,
                        standalone:   false,
                        category:     section.name,
                        categorySlug: section.slug,
                        description:  extractDescription(readMarkdown(pageFile)),
                    });
                }
            }
        }
    }

    fs.writeFileSync(OUTPUT, JSON.stringify(cards), 'utf8');
    console.log(`landing-index.json written (${cards.length} cards)`);
}

build();
