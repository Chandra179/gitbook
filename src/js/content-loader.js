class ContentLoader {
    constructor(navigationData) {
        this.navigationData = navigationData;
        this.onContentLoaded = null;
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

            let markdown;

            if (standaloneItem) {
                // Load standalone page from root directory
                const response = await fetch(`../${category}.md`);
                if (!response.ok) {
                    markdown = `# Page Not Found\n\nThe file \`${category}.md\` could not be loaded.`;
                } else {
                    markdown = await response.text();
                }
            } else if (!page) {
                // Just category, load README.md for that category
                const response = await fetch(`../${category}/README.md`);
                if (!response.ok) {
                    const categoryData = this.navigationData.find(cat => cat.slug === category);
                    const categoryName = categoryData ? categoryData.name : category;
                    markdown = `# ${categoryName}\n\nREADME file not found for this category.`;
                } else {
                    markdown = await response.text();
                }
            } else {
                // Handle nested paths (e.g., "algebra/files")
                // Check if the page is a folder
                const isFolder = this.isPageFolder(category, page);
                const filePath = isFolder 
                    ? `../${category}/${page}/README.md`
                    : `../${category}/${page}.md`;
                
                const response = await fetch(filePath);

                if (!response.ok) {
                    markdown = `# Page Not Found\n\nThe file \`${filePath}\` could not be loaded.`;
                } else {
                    markdown = await response.text();
                }
            }

            const html = marked.parse(markdown);

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