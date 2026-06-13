#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { ROOT, SRC } = require('./lib/paths');
const { loadNavData } = require('./lib/nav-loader');
const { generateSlug, stripMarkdown, stripFrontmatter } = require('./lib/markdown');

const OUTPUT = path.join(SRC, 'search-index.json');

function indexFile(index, filePath, pageName, pageLink, categoryName) {
    let text;
    try {
        text = stripFrontmatter(fs.readFileSync(filePath, 'utf8'));
    } catch {
        return;
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
