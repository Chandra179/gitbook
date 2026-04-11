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

    async loadContent(category, page, anchor) {
        try {
            const standaloneItem = this.navigationData.find(
                item => item.standalone && item.slug === category
            );

            let filePath;
            if (standaloneItem) {
                filePath = `../${category}.md`;
            } else if (!page) {
                filePath = `../${category}/README.md`;
            } else {
                const isFolder = this.isPageFolder(category, page);
                filePath = isFolder
                    ? `../${category}/${page}/README.md`
                    : `../${category}/${page}.md`;
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
                html = marked.parse(markdown);
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