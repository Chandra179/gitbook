// App configuration
const APP_CONFIG = {
    INITIALIZATION_DELAY_MS: 100
};

function portfolioApp() {
    return {
        mobileMenuOpen: false,
        loading: true,
        isSearchOpen: false,
        searchQuery: '',
        expandedSections: {},
        expandedFolders: {},
        content: '',

        router: null,
        search: null,
        contentLoader: null,
        tocGenerator: null,
        renderer: null,

        navigationData: navigationData,

        init() {
            if (typeof initializeMarkedExtensions === 'function') {
                initializeMarkedExtensions();
            }

            marked.setOptions({
                breaks: true,
                gfm: true,
                headerIds: true,
            });

            this.router = new Router(this.navigationData);
            this.search = new Search(this.navigationData);
            this.contentLoader = new ContentLoader(this.navigationData);
            this.tocGenerator = new TOCGenerator();
            this.renderer = new Renderer();

            this.router.onRouteChange = (category, anchor) => {
                const page = this.router.getCurrentPage().includes('/')
                    ? this.router.getCurrentPage().split('/').slice(1).join('/')
                    : null;
                this.loadContent(category, page, anchor);
                this.updateSEOMeta();
            };

            this.contentLoader.onContentLoaded = (html, anchor) => {
                this.content = html;
                this.postRenderActions(anchor);
            };

            const firstCategory = this.navigationData.find(item => !item.standalone);
            if (firstCategory) {
                this.expandedSections[firstCategory.slug] = true;
            }

            this.router.init();
            this.search.init();
        },

        async loadContent(category, page, anchor) {
            this.tocGenerator.clear();
            this.loading = true;
            await this.contentLoader.loadContent(category, page, anchor);
            this.loading = false;
        },

        postRenderActions(anchor) {
            const contentEl = document.getElementById('content');
            const observer = new MutationObserver(() => {
                observer.disconnect();
                this.tocGenerator.addIdsToHeaders();
                this.tocGenerator.generate();
                this.renderer.renderAll();

                this.interceptContentLinks(contentEl);

                if (anchor) {
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            const element = document.getElementById(anchor);
                            if (element) {
                                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                        });
                    });
                } else {
                    window.scrollTo(0, 0);
                }
            });
            observer.observe(contentEl, { childList: true, subtree: true });
        },

        interceptContentLinks(contentEl) {
            contentEl.querySelectorAll('a[href]').forEach(link => {
                const href = link.getAttribute('href');
                if (!href) return;

                // Skip pure in-page anchors (#section) and external links
                if (href.startsWith('#') || /^https?:\/\//.test(href) || href.startsWith('mailto:')) return;

                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    // Resolve the href relative to the current page path
                    const base = window.location.origin + window.location.pathname;
                    const resolved = new URL(href, base);
                    const path = resolved.pathname.replace(/^\//, '');
                    const anchor = resolved.hash.replace(/^#/, '');
                    history.pushState(null, '', resolved.pathname + resolved.hash);
                    this.router.currentPage = path;
                    const parts = path.split('/');
                    this.router.currentCategory = parts[0];
                    this.router.updateBreadcrumb(parts[0], parts.slice(1).join('/') || null);
                    if (this.router.onRouteChange) {
                        this.router.onRouteChange(this.router.currentCategory || path, anchor);
                    }
                });
            });
        },

        navigate(path) {
            this.router.navigate(path);
        },

        navigateToCategory(category) {
            this.router.navigateToCategory(category);
            this.expandedSections[category] = true;
        },

        navigateToPage(category, page) {
            this.router.navigateToPage(category, page);
        },

        // Navigate to folder (loads folder's README.md)
        navigateToFolder(category, folder) {
            this.router.navigate(`${category}/${folder}`);
            this.expandedFolders[`${category}/${folder}`] = true;
        },

        // Navigate to nested page
        navigateToNestedPage(category, folder, page) {
            this.router.navigate(`${category}/${folder}/${page}`);
        },

        isPageActive(category, page) {
            return this.router.isPageActive(category, page);
        },

        // Check if folder itself is active (showing its README)
        isFolderActive(category, folder) {
            return this.currentPage === `${category}/${folder}`;
        },

        // Check if nested page is active
        isNestedPageActive(category, folder, page) {
            return this.currentPage === `${category}/${folder}/${page}`;
        },

        isCategoryActive(category) {
            return this.router.isCategoryActive(category);
        },

        performSearch() {
            return this.search.performSearch(this.searchQuery);
        },

        closeSearch() {
            this.isSearchOpen = false;
            this.search.clear();
            this.searchQuery = '';
        },

        navigateToSearchResult(link) {
            // link is "/category/page#anchor" — extract path and anchor
            const url = new URL(link, window.location.origin);
            const path = url.pathname.replace(/^\//, '');
            const anchor = url.hash.replace(/^#/, '');
            const isSamePage = this.router.getCurrentPage() === path;

            history.pushState(null, '', url.pathname + url.hash);
            this.closeSearch();

            if (isSamePage) {
                // Already on this page — just scroll to the anchor
                if (anchor) {
                    const element = document.getElementById(anchor);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                } else {
                    window.scrollTo(0, 0);
                }
                return;
            }

            this.router.currentPage = path;
            const parts = path.split('/');
            this.router.currentCategory = parts[0];
            this.router.updateBreadcrumb(parts[0], parts.slice(1).join('/') || null);
            if (this.router.onRouteChange) {
                this.router.onRouteChange(this.router.currentCategory || path, anchor);
            }
        },

        highlightText(text, query) {
            return this.search.highlightText(text, query);
        },

        toggleSection(slug) {
            this.expandedSections[slug] = !this.expandedSections[slug];
        },

        isSectionExpanded(slug) {
            return this.expandedSections[slug] || false;
        },

        // Toggle nested folders
        toggleFolder(category, folder) {
            const key = `${category}/${folder}`;
            this.expandedFolders[key] = !this.expandedFolders[key];
        },

        isFolderExpanded(category, folder) {
            const key = `${category}/${folder}`;
            return this.expandedFolders[key] || false;
        },

        get currentPage() {
            return this.router ? this.router.getCurrentPage() : 'README';
        },

        get currentCategory() {
            return this.router ? this.router.getCurrentCategory() : null;
        },

        get breadcrumb() {
            return this.router ? this.router.getBreadcrumb() : 'README';
        },

        get searchResults() {
            return this.search ? this.search.getResults() : [];
        },

        updateSEOMeta() {
            const breadcrumb = this.router.getBreadcrumb();
            const siteName = 'Chan179';
            const baseDescription = 'Technical notes and learning resources on Math, Golang, System Design, ML, and more.';

            const isHome = !this.router.getCurrentPage() || this.router.getCurrentPage() === 'README';
            const title = isHome ? `${siteName} — Technical Notes` : `${breadcrumb} — ${siteName}`;
            const description = isHome ? baseDescription : `Notes on ${breadcrumb}. ${baseDescription}`;

            document.title = title;
            this._setMeta('name', 'description', description);
            this._setMeta('property', 'og:title', title);
            this._setMeta('property', 'og:description', description);
            this._setMeta('name', 'twitter:title', title);
            this._setMeta('name', 'twitter:description', description);
        },

        _setMeta(attr, key, value) {
            let el = document.querySelector(`meta[${attr}="${key}"]`);
            if (!el) {
                el = document.createElement('meta');
                el.setAttribute(attr, key);
                document.head.appendChild(el);
            }
            el.setAttribute('content', value);
        },
    };
}