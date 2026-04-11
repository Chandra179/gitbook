// Search configuration constants
const SEARCH_CONFIG = {
    MAX_QUERY_LENGTH: 100,
    MAX_RESULTS: 10,
    SNIPPET_LENGTH: 100,
    SNIPPET_CONTEXT_BEFORE: 40,
    SNIPPET_CONTEXT_AFTER: 60,
    DEBOUNCE_MS: 300
};

class Search {
    constructor(navigationData) {
        this.navigationData = navigationData;
        this.searchIndex = [];
        this.searchQuery = '';
        this.searchResults = [];
    }

    async init() {
        const index = [];

        await Promise.all(this.navigationData.map(section => {
            if (section.standalone) {
                return fetch(`/${section.slug}.md`)
                    .then(r => r.ok ? r.text() : null)
                    .then(text => { if (text) this.indexContent(index, text, section.name, section.slug, section.name); })
                    .catch(e => console.warn('Failed to index', section.slug, e));
            } else if (section.pages) {
                return this.indexPages(index, section.pages, section.slug, section.name);
            }
        }));

        this.searchIndex = index;
    }

    // Recursive function to index pages including nested folders
    async indexPages(index, pages, categorySlug, categoryName, pathPrefix = '') {
        await Promise.all(pages.map(page => {
            if (page.isFolder && page.pages) {
                const folderPath = pathPrefix ? `${pathPrefix}/${page.slug}` : page.slug;
                return this.indexPages(index, page.pages, categorySlug, categoryName, folderPath);
            } else {
                const pagePath = pathPrefix ? `${pathPrefix}/${page.slug}` : page.slug;
                const filePath = `/${categorySlug}/${pagePath}.md`;
                return fetch(filePath)
                    .then(r => r.ok ? r.text() : null)
                    .then(text => {
                        if (text) this.indexContent(index, text, page.name, `${categorySlug}/${pagePath}`, categoryName);
                    })
                    .catch(e => console.warn('Failed to index', categorySlug, page.slug, e));
            }
        }));
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
                        link: `/${pageLink}${currentSection.anchor ? '#' + currentSection.anchor : ''}`,
                        plainText: this.stripMarkdown(currentSection.content)
                    });
                }

                // Start new section
                const title = headerMatch[2];
                const anchor = generateSlug(title);
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
                link: `/${pageLink}${currentSection.anchor ? '#' + currentSection.anchor : ''}`,
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

        if (this.searchQuery.length > SEARCH_CONFIG.MAX_QUERY_LENGTH) {
            this.searchResults = [];
            return [];
        }

        const lowerQuery = this.searchQuery.toLowerCase();
        const results = this.searchIndex.filter(item => {
            return item.title.toLowerCase().includes(lowerQuery) ||
                item.plainText.toLowerCase().includes(lowerQuery);
        });

        this.searchResults = results.map(item => {
            const snippet = this.getSnippet(item.plainText, lowerQuery);
            return { ...item, snippet };
        }).slice(0, SEARCH_CONFIG.MAX_RESULTS);

        return this.searchResults;
    }

    getSnippet(text, query) {
        const index = text.toLowerCase().indexOf(query);
        if (index === -1) return text.slice(0, SEARCH_CONFIG.SNIPPET_LENGTH) + '...';

        const start = Math.max(0, index - SEARCH_CONFIG.SNIPPET_CONTEXT_BEFORE);
        const end = Math.min(text.length, index + query.length + SEARCH_CONFIG.SNIPPET_CONTEXT_AFTER);

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