#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { ROOT, SRC } = require('./lib/paths');
const { loadNavData } = require('./lib/nav-loader');
const { extractDescription, readMarkdown } = require('./lib/markdown');

const OUTPUT = path.join(SRC, 'landing-index.json');

function build() {
    const nav   = loadNavData();
    const cards = [];

    for (const section of nav) {
        if (section.standalone) {
            const filePath = path.join(ROOT, section.slug + '.md');
            const desc = extractDescription(readMarkdown(filePath, fs));
            cards.push({
                title:       section.name,
                path:        section.slug,
                standalone:  true,
                category:    null,
                categorySlug: null,
                description: desc,
            });
        } else {
            const catFile = path.join(ROOT, section.slug, 'README.md');
            cards.push({
                title:       section.name,
                path:        section.slug,
                standalone:  false,
                category:    section.name,
                categorySlug: section.slug,
                description: extractDescription(readMarkdown(catFile, fs)),
            });

            if (!section.pages) continue;

            for (const page of section.pages) {
                if (page.isFolder && page.pages) {
                    const folderFile = path.join(ROOT, section.slug, page.slug, 'README.md');
                    const hasReadme = fs.existsSync(folderFile);
                    if (hasReadme) {
                        cards.push({
                            title:        page.name,
                            path:         `${section.slug}/${page.slug}`,
                            standalone:   false,
                            category:     section.name,
                            categorySlug: section.slug,
                            description:  extractDescription(readMarkdown(folderFile, fs)),
                        });
                    }

                    for (const subpage of page.pages) {
                        const subFile = path.join(ROOT, section.slug, page.slug, subpage.slug + '.md');
                        cards.push({
                            title:        subpage.name,
                            path:         `${section.slug}/${page.slug}/${subpage.slug}`,
                            standalone:   false,
                            category:     section.name,
                            categorySlug: section.slug,
                            description:  extractDescription(readMarkdown(subFile, fs)),
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
                        description:  extractDescription(readMarkdown(pageFile, fs)),
                    });
                }
            }
        }
    }

    fs.writeFileSync(OUTPUT, JSON.stringify(cards), 'utf8');
    console.log(`landing-index.json written (${cards.length} cards)`);
}

build();
