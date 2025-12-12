class Search {
    constructor(navigationData) {
        this.navigationData = navigationData;
        this.searchIndex = [];
        this.searchQuery = '';
        this.searchResults = [];
    }

    async init() {
        const index = [];

        for (const section of this.navigationData) {
            if (section.standalone) {
                try {
                    const response = await fetch(`../${section.slug}.md`);
                    if (response.ok) {
                        const text = await response.text();
                        this.indexContent(index, text, section.name, section.slug, section.name);
                    }
                } catch (e) {
                    console.warn('Failed to index', section.slug, e);
                }
            } else if (section.pages) {
                for (const page of section.pages) {
                    try {
                        const response = await fetch(`../${section.slug}/${page.slug}.md`);
                        if (response.ok) {
                            const text = await response.text();
                            this.indexContent(
                                index,
                                text,
                                page.name,
                                `${section.slug}/${page.slug}`,
                                section.name
                            );
                        }
                    } catch (e) {
                        console.warn('Failed to index', section.slug, page.slug, e);
                    }
                }
            }
        }
        this.searchIndex = index;
    }

    indexContent(index, text, pageName, pageLink, categoryName) {
        const lines = text.split('\n');
        let currentSection = {
            title: pageName,
            content: '',
            anchor: ''
        };

        lines.forEach(line => {
            const headerMatch = line.match(/^(#{1,3})\s+(.+)$/);
            if (headerMatch) {
                // Push previous section
                if (currentSection.content.trim()) {
                    index.push({
                        title: currentSection.title,
                        category: categoryName,
                        page: pageName,
                        link: `#${pageLink}${currentSection.anchor ? '#' + currentSection.anchor : ''}`,
                        plainText: this.stripMarkdown(currentSection.content)
                    });
                }

                // Start new section
                const title = headerMatch[2];
                const anchor = title.toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '');
                currentSection = {
                    title: title,
                    content: '',
                    anchor: anchor
                };
            } else {
                currentSection.content += line + '\n';
            }
        });

        // Push last section
        if (currentSection.content.trim()) {
            index.push({
                title: currentSection.title,
                category: categoryName,
                page: pageName,
                link: `#${pageLink}${currentSection.anchor ? '#' + currentSection.anchor : ''}`,
                plainText: this.stripMarkdown(currentSection.content)
            });
        }
    }

    stripMarkdown(markdown) {
        return markdown
            .replace(/^#+\s+/gm, '') // Headers
            .replace(/(\*\*|__)(.*?)\1/g, '$2') // Bold
            .replace(/(\*|_)(.*?)\1/g, '$2') // Italic
            .replace(/`([^`]+)`/g, '$1') // Inline code
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
            .replace(/!\[([^\]]*)\]\([^)]+\)/g, '') // Images
            .replace(/>\s+/gm, '') // Blockquotes
            .replace(/```[\s\S]*?```/g, '') // Code blocks
            .replace(/\n/g, ' '); // Newlines
    }

    performSearch(query) {
        this.searchQuery = query;

        if (this.searchQuery.length < 2) {
            this.searchResults = [];
            return [];
        }

        // Limit query length to prevent ReDoS
        if (this.searchQuery.length > 100) {
            this.searchResults = [];
            return [];
        }

        const lowerQuery = this.searchQuery.toLowerCase();
        const results = this.searchIndex.filter(item => {
            return item.title.toLowerCase().includes(lowerQuery) ||
                item.plainText.toLowerCase().includes(lowerQuery);
        });

        // Map results to include snippets
        this.searchResults = results.map(item => {
            const snippet = this.getSnippet(item.plainText, lowerQuery);
            return { ...item, snippet };
        }).slice(0, 10); // Limit to 10 results

        return this.searchResults;
    }

    getSnippet(text, query) {
        const index = text.toLowerCase().indexOf(query);
        if (index === -1) return text.slice(0, 100) + '...';

        const start = Math.max(0, index - 40);
        const end = Math.min(text.length, index + query.length + 60);

        return (start > 0 ? '...' : '') +
            text.slice(start, end) +
            (end < text.length ? '...' : '');
    }

    highlightText(text, query) {
        if (!query) return text;
        const regex = new RegExp(
            `(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
            'gi'
        );
        return text.replace(regex, '<span class="search-highlight">$1</span>');
    }

    clear() {
        this.searchQuery = '';
        this.searchResults = [];
    }

    getResults() {
        return this.searchResults;
    }

    getQuery() {
        return this.searchQuery;
    }
}