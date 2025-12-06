// Main application logic
function portfolioApp() {
    return {
        mobileMenuOpen: false,
        currentPage: 'README',
        currentCategory: null,
        breadcrumb: 'README',
        content: '',
        loading: true,
        navigationData: navigationData,
        searchQuery: '',
        searchIndex: [],
        searchResults: [],
        isSearchOpen: false,
        expandedSections: {},

        init() {
            // Initialize marked extensions (tabs, KaTeX)
            if (typeof initializeMarkedExtensions === 'function') {
                initializeMarkedExtensions();
            }

            // Set up marked options
            marked.setOptions({
                breaks: true,
                gfm: true,
                headerIds: true,
            });

            // Initialize expanded sections (expand first category by default)
            const firstCategory = this.navigationData.find(item => !item.standalone);
            if (firstCategory) {
                this.expandedSections[firstCategory.slug] = true;
            }

            // Handle initial load and hash changes
            window.addEventListener('hashchange', () => this.handleRoute());
            this.handleRoute();

            // Initialize search index
            this.initSearch();
        },

        async initSearch() {
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
                                this.indexContent(index, text, page.name, `${section.slug}/${page.slug}`, section.name);
                            }
                        } catch (e) {
                            console.warn('Failed to index', section.slug, page.slug, e);
                        }
                    }
                }
            }
            this.searchIndex = index;
        },

        indexContent(index, text, pageName, pageLink, categoryName) {
            // Split by headers (h1, h2, h3)
            // We'll use a regex to find headers and their content
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
                    const anchor = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
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
        },

        stripMarkdown(markdown) {
            // Simple markdown stripper
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
        },

        performSearch() {
            if (this.searchQuery.length < 2) {
                this.searchResults = [];
                return;
            }

            // Limit query length to prevent ReDoS
            if (this.searchQuery.length > 100) {
                this.searchResults = [];
                return;
            }

            const query = this.searchQuery.toLowerCase();
            const results = this.searchIndex.filter(item => {
                return item.title.toLowerCase().includes(query) ||
                    item.plainText.toLowerCase().includes(query);
            });

            // Map results to include snippets
            this.searchResults = results.map(item => {
                const snippet = this.getSnippet(item.plainText, query);
                return {
                    ...item,
                    snippet
                };
            }).slice(0, 10); // Limit to 10 results
        },

        getSnippet(text, query) {
            const index = text.toLowerCase().indexOf(query);
            if (index === -1) return text.slice(0, 100) + '...';

            const start = Math.max(0, index - 40);
            const end = Math.min(text.length, index + query.length + 60);

            return (start > 0 ? '...' : '') +
                text.slice(start, end) +
                (end < text.length ? '...' : '');
        },

        highlightText(text, query) {
            if (!query) return text;
            const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
            return text.replace(regex, '<span class="search-highlight">$1</span>');
        },

        closeSearch() {
            this.isSearchOpen = false;
            this.searchQuery = '';
            this.searchResults = [];
        },

        navigateToSearchResult(link) {
            window.location.hash = link;
            this.closeSearch();
        },

        toggleSection(slug) {
            this.expandedSections[slug] = !this.expandedSections[slug];
        },

        isSectionExpanded(slug) {
            return this.expandedSections[slug] || false;
        },

        handleRoute() {
            let hash = window.location.hash.slice(1) || 'README';

            // Handle anchors in hash (e.g. category/page#header)
            let anchor = '';
            if (hash.includes('#')) {
                const parts = hash.split('#');
                hash = parts[0];
                anchor = parts[1];
            }

            this.currentPage = hash;

            // Check if this is a standalone page
            const standaloneItem = this.navigationData.find(item => item.standalone && item.slug === hash);

            if (standaloneItem) {
                // Standalone page
                this.currentCategory = null;
                this.updateBreadcrumb(hash, null);
                this.loadContent(hash, null);
            } else {
                // Parse category and page from hash (format: category/page or just category)
                const parts = hash.split('/');
                this.currentCategory = parts[0];
                const page = parts[1] || null;

                this.updateBreadcrumb(this.currentCategory, page);
                this.loadContent(this.currentCategory, page);
            }

            this.mobileMenuOpen = false;
        },

        navigate(path) {
            window.location.hash = path;
        },

        navigateToCategory(category) {
            window.location.hash = category;
            this.expandedSections[category] = true; // Expand the section
        },

        navigateToPage(category, page) {
            window.location.hash = `${category}/${page}`;
        },

        updateBreadcrumb(category, page) {
            // Check if this is a standalone page
            const standaloneItem = this.navigationData.find(item => item.standalone && item.slug === category);

            if (standaloneItem) {
                this.breadcrumb = standaloneItem.name;
                return;
            }

            // Find the category in navigation data
            const categoryData = this.navigationData.find(cat => cat.slug === category);

            if (!categoryData) {
                this.breadcrumb = 'Page Not Found';
                return;
            }

            if (!page) {
                // Just category, no page
                this.breadcrumb = categoryData.name;
            } else {
                // Category and page
                const pageData = categoryData.pages.find(p => p.slug === page);
                const pageName = pageData ? pageData.name : page;
                this.breadcrumb = `${categoryData.name} / ${pageName}`;
            }
        },

        async loadContent(category, page, anchor) {
            const toc = document.getElementById('toc');
            if (toc) {
                toc.innerHTML = ''; 
                toc.style.display = 'none'; // Hide it visually
            }

            this.loading = true;

            try {
                // Check if this is a standalone page
                const standaloneItem = this.navigationData.find(item => item.standalone && item.slug === category);

                if (standaloneItem) {
                    // Load standalone page from root directory
                    const response = await fetch(`../${category}.md`);

                    if (!response.ok) {
                        this.content = marked.parse(`# Page Not Found\n\nThe file \`${category}.md\` could not be loaded.`);
                    } else {
                        const markdown = await response.text();
                        this.content = marked.parse(markdown);
                    }
                } else if (!page) {
                    // Just category, load README.md for that category
                    const response = await fetch(`../${category}/README.md`);

                    if (!response.ok) {
                        const categoryData = this.navigationData.find(cat => cat.slug === category);
                        const categoryName = categoryData ? categoryData.name : category;
                        this.content = marked.parse(`# ${categoryName}\n\nREADME file not found for this category.`);
                    } else {
                        const markdown = await response.text();
                        this.content = marked.parse(markdown);
                    }
                } else {
                    // Fetch markdown file from category subdirectory
                    const filePath = `../${category}/${page}.md`;
                    const response = await fetch(filePath);

                    if (!response.ok) {
                        this.content = marked.parse(`# Page Not Found\n\nThe file \`${filePath}\` could not be loaded.`);
                    } else {
                        const markdown = await response.text();
                        this.content = marked.parse(markdown);
                    }
                }

                // Wait for DOM update then generate TOC
                setTimeout(() => {
                    this.addIdsToHeaders();
                    this.generateTOC();
                    this.applyTimelineClass();
                    this.renderMath();
                    this.renderCodeBlocks();

                    // Scroll to anchor if present
                    if (anchor) {
                        const element = document.getElementById(anchor);
                        if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    } else {
                        window.scrollTo(0, 0);
                    }
                }, 100);

            } catch (error) {
                console.error('Error loading content:', error);
                this.content = marked.parse(`# Error\n\nFailed to load content: ${error.message}`);
                setTimeout(() => {
                    this.addIdsToHeaders();
                    this.generateTOC();
                    this.applyTimelineClass();
                    this.renderMath();
                    this.renderCodeBlocks();
                }, 100);
            }

            this.loading = false;
        },

        addIdsToHeaders() {
            const content = document.getElementById('content');
            const headers = content.querySelectorAll('h2, h3');

            headers.forEach(header => {
                if (!header.id) {
                    const id = header.textContent
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/(^-|-$)/g, '');
                    header.id = id;
                }
            });
        },

        generateTOC() {
            const content = document.getElementById('content');
            const headers = content.querySelectorAll('h2, h3');
            const toc = document.getElementById('toc');

            // Safety check
            if (!toc) return;

            // Reset: Clear content and hide by default
            toc.innerHTML = '';
            toc.style.display = 'none';

            // If no headers, we stop here. The TOC remains hidden (style.display = 'none')
            if (headers.length === 0) {
                return;
            }

            // If we have headers, make the container visible again
            toc.style.display = 'block';

            headers.forEach(header => {
                const level = header.tagName === 'H2' ? 'ml-0' : 'ml-4';
                const text = header.textContent;
                const id = header.id;

                if (!id) return;

                const link = document.createElement('a');
                link.href = `#${id}`;
                // Styling matches GitBook sidebar items
                link.className = `toc-link block py-1 text-sm text-gray-600 hover:text-gray-900 border-l-2 border-transparent hover:border-gray-300 pl-3 ${level}`;
                link.textContent = text;
                
                link.onclick = (e) => {
                    e.preventDefault();
                    document.getElementById(id).scrollIntoView({ behavior: 'smooth', block: 'start' });
                };
                toc.appendChild(link);
            });

            this.setupTOCHighlight();
        },

        setupTOCHighlight() {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        document.querySelectorAll('.toc-link').forEach(link => {
                            link.classList.remove('active');
                        });
                        const activeLink = document.querySelector(`.toc-link[href="#${entry.target.id}"]`);
                        if (activeLink) activeLink.classList.add('active');
                    }
                });
            }, { rootMargin: '-100px 0px -66%' });

            document.querySelectorAll('#content h2, #content h3').forEach(header => {
                observer.observe(header);
            });
        },

        applyTimelineClass() {
            // Look for lists that should be timelines (you can mark them in markdown with a special comment)
            const content = document.getElementById('content');
            const lists = content.querySelectorAll('ul');

            lists.forEach(list => {
                // Check if the previous element is a comment or if the list has specific markers
                const prevSibling = list.previousElementSibling;
                if (prevSibling && prevSibling.textContent.includes('timeline')) {
                    list.classList.add('timeline-list');
                }
                // Also check if any list item contains year patterns (optional auto-detection)
                const hasYears = Array.from(list.children).some(li =>
                    /\b(19|20)\d{2}\b/.test(li.textContent)
                );
                if (hasYears && list.children.length >= 3) {
                    list.classList.add('timeline-list');
                }
            });
        },

        isPageActive(category, page) {
            return this.currentPage === `${category}/${page}`;
        },

        isCategoryActive(category) {
            return this.currentCategory === category;
        },

        renderMath() {
            // Render KaTeX math formulas if available
            if (typeof renderMathInElement !== 'undefined') {
                const content = document.getElementById('content');

                // 1. Auto-render delimiters ($$ and $)
                renderMathInElement(content, {
                    delimiters: [
                        { left: '$$', right: '$$', display: false },
                        { left: '$', right: '$', display: false },
                        { left: '\\[', right: '\\]', display: true },
                        { left: '\\(', right: '\\)', display: false }
                    ],
                    throwOnError: false
                });

                // 2. Explicitly render elements with class="math"
                // These are often used in tables or specific HTML structures
                const mathElements = content.querySelectorAll('.math');
                mathElements.forEach(el => {
                    try {
                        katex.render(el.textContent, el, {
                            throwOnError: false,
                            displayMode: false // Treat as inline by default
                        });
                    } catch (e) {
                        console.error('KaTeX rendering error for .math element:', e);
                    }
                });
            }
        },

        renderCodeBlocks() {
            if (typeof hljs !== 'undefined') {
                hljs.highlightAll();
            }
        }
    };
}
