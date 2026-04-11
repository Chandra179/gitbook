class ContentLoader {
    constructor(navigationData) {
        this.navigationData = navigationData;
        this.onContentLoaded = null;
        this.cache = new Map();
    }

    isPageFolder(category, pagePath) {
        const categoryData = this.navigationData.find(cat => cat.slug === category);
        if (!categoryData || !categoryData.pages) return false;

        // Split the path to handle nested folders (e.g., "precalculus" or "algebra/files")
        const parts = pagePath.split('/');
        let currentPages = categoryData.pages;

        for (let i = 0; i < parts.length; i++) {
            const slug = parts[i];
            const page = currentPages.find(p => p.slug === slug);
            
            if (!page) return false;
            
            // If this is the last part, check if it's a folder
            if (i === parts.length - 1) {
                return page.isFolder === true;
            }
            
            // If not the last part, move to nested pages
            if (page.pages) {
                currentPages = page.pages;
            } else {
                return false;
            }
        }

        return false;
    }

    // Rewrite relative <a href> and <img src> values in rendered HTML to clean root-relative paths.
    // e.g. href="summary#algebra" on page /math/ becomes href="/math/summary#algebra"
    rewriteLinks(html, category, page) {
        const basePath = page ? `/${category}/${page}/` : `/${category}/`;
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        doc.querySelectorAll('a[href]').forEach(link => {
            const href = link.getAttribute('href');
            if (!href || href.startsWith('#') || /^https?:\/\//.test(href) || href.startsWith('mailto:')) return;
            // Resolve relative to the logical base path of this page
            const resolved = new URL(href, 'https://x' + basePath);
            link.setAttribute('href', resolved.pathname + resolved.hash);
        });
        doc.querySelectorAll('img[src]').forEach(img => {
            const src = img.getAttribute('src');
            if (!src || /^https?:\/\//.test(src) || src.startsWith('/') || src.startsWith('data:')) return;
            const resolved = new URL(src, 'https://x' + basePath);
            img.setAttribute('src', resolved.pathname);
        });
        return doc.body.innerHTML;
    }

    async loadContent(category, page, anchor) {
        try {
            const standaloneItem = this.navigationData.find(
                item => item.standalone && item.slug === category
            );

            let filePath;
            if (standaloneItem) {
                filePath = `/${category}.md`;
            } else if (!page) {
                filePath = `/${category}/README.md`;
            } else {
                const isFolder = this.isPageFolder(category, page);
                filePath = isFolder
                    ? `/${category}/${page}/README.md`
                    : `/${category}/${page}.md`;
            }

            let html;
            if (this.cache.has(filePath)) {
                html = this.cache.get(filePath);
            } else {
                const response = await fetch(filePath);
                let markdown;
                if (!response.ok) {
                    if (!page && !standaloneItem) {
                        const categoryData = this.navigationData.find(cat => cat.slug === category);
                        const categoryName = categoryData ? categoryData.name : category;
                        markdown = `# ${categoryName}\n\nREADME file not found for this category.`;
                    } else {
                        markdown = `# Page Not Found\n\nThe file \`${filePath}\` could not be loaded.`;
                    }
                } else {
                    markdown = await response.text();
                }
                html = this.rewriteLinks(marked.parse(markdown), category, page);
                // Convert standalone $$...$$ paragraphs to display math \[...\]
                // so KaTeX renders them as block-level with overflow-x:auto instead of
                // wide inline elements that cause horizontal page overflow.
                html = html.replace(/<p>\$\$([\s\S]+?)\$\$<\/p>/g, (_, formula) => `<p>\\[${formula}\\]</p>`);
                if (response.ok) this.cache.set(filePath, html);
            }

            if (this.onContentLoaded) {
                this.onContentLoaded(html, anchor);
            }

            return html;

        } catch (error) {
            console.error('Error loading content:', error);
            const errorHtml = marked.parse(`# Error\n\nFailed to load content: ${error.message}`);

            if (this.onContentLoaded) {
                this.onContentLoaded(errorHtml, anchor);
            }

            return errorHtml;
        }
    }
}