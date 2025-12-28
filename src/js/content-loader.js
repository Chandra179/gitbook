class ContentLoader {
    constructor(navigationData) {
        this.navigationData = navigationData;
        this.onContentLoaded = null;
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
                const filePath = `../${category}/${page}.md`;
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