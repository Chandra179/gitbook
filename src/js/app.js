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
        },

        toggleSection(slug) {
            this.expandedSections[slug] = !this.expandedSections[slug];
        },

        isSectionExpanded(slug) {
            return this.expandedSections[slug] || false;
        },

        handleRoute() {
            const hash = window.location.hash.slice(1) || 'README';
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

        async loadContent(category, page) {
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

            if (headers.length === 0) {
                toc.innerHTML = '<p class="text-gray-400 text-xs">No headings found</p>';
                return;
            }

            let tocHTML = '';
            headers.forEach(header => {
                const level = header.tagName === 'H2' ? 'ml-0' : 'ml-4';
                const text = header.textContent;
                const id = header.id;

                tocHTML += `
                    <a href="#${id}" 
                       class="toc-link block py-1 text-gray-600 hover:text-gray-900 border-l-2 border-transparent hover:border-gray-300 pl-3 ${level}"
                       onclick="document.getElementById('${id}').scrollIntoView({behavior: 'smooth', block: 'start'}); return false;">
                        ${text}
                    </a>
                `;
            });

            toc.innerHTML = tocHTML;

            // Highlight active TOC link on scroll
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
