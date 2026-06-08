// App configuration
const APP_CONFIG = {
    INITIALIZATION_DELAY_MS: 100
};

// Landing page card grid configuration
const LANDING_CONFIG = {
    GRID_COLUMNS: 2,  // Number of columns on tablet/desktop (1-4). Mobile always 1 column.
};

// Category -> badge CSS class mapping
const CATEGORY_BADGES = {
    'fundamental':    'badge-fundamental',
    'system-design':  'badge-system-design',
    'golang':         'badge-golang',
    'math':           'badge-math',
    'ml':             'badge-ml',
    'quant':          'badge-quant',
};

function portfolioApp() {
    return {
        mobileMenuOpen: false,
        isDark: document.documentElement.classList.contains('dark'),
        loading: true,
        isSearchOpen: false,
        searchQuery: '',
        expandedSections: {},
        expandedFolders: {},
        content: '',
        _initialPageViewDone: false,

        landingCards: [],
        landingColumns: LANDING_CONFIG.GRID_COLUMNS,
        landingFilter: 'all',

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
            this.search = new Search();
            this.contentLoader = new ContentLoader(this.navigationData);
            this.tocGenerator = new TOCGenerator();
            this.renderer = new Renderer();

            this.router.onRouteChange = (category, anchor) => {
                if (category === '__home__') {
                    this.tocGenerator.clear();
                    this.updateSEOMeta();
                    return;
                }
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
            this.initLanding();
        },

        async initLanding() {
            try {
                const res = await fetch('/landing-index.json');
                if (res.ok) {
                    this.landingCards = await res.json();
                }
            } catch (e) {
                console.warn('Failed to load landing index', e);
            }
            if (this.isLanding) {
                this.loading = false;
            }
        },

        get landingGridStyle() {
            return `--landing-cols: ${this.landingColumns};`;
        },

        get isLanding() {
            return this.router ? this.router.isHome : false;
        },

        getCategoryBadgeClass(categorySlug) {
            return CATEGORY_BADGES[categorySlug] || 'badge-default';
        },

        get filteredCards() {
            if (this.landingFilter === 'all') return this.landingCards;
            return this.landingCards.filter(c => c.categorySlug === this.landingFilter);
        },

        get landingCategories() {
            const seen = new Set();
            const cats = [];
            for (const card of this.landingCards) {
                const key = card.categorySlug;
                if (!key || seen.has(key)) continue;
                seen.add(key);
                cats.push({ slug: key, label: card.category || key });
            }
            return cats;
        },

        setLandingFilter(slug) {
            this.landingFilter = slug;
        },

        async loadContent(category, page, anchor) {
            if (this.isLanding) return;
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
                    requestAnimationFrame(() => window.scrollTo(0, 0));
                }
            });
            observer.observe(contentEl, { childList: true, subtree: true });
        },

        interceptContentLinks(contentEl) {
            contentEl.addEventListener('click', (e) => {
                const link = e.target.closest('a[href]');
                if (!link) return;

                const href = link.getAttribute('href');
                if (!href || href.startsWith('#') || /^https?:\/\//.test(href) || href.startsWith('mailto:')) return;

                e.preventDefault();
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

            const isHome = this.router.isHome;
            const title = isHome ? `${siteName} — Technical Notes` : `${breadcrumb} — ${siteName}`;
            const description = isHome ? baseDescription : `Notes on ${breadcrumb}. ${baseDescription}`;

            document.title = title;
            this._setMeta('name', 'description', description);
            this._setMeta('property', 'og:title', title);
            this._setMeta('property', 'og:description', description);
            this._setMeta('name', 'twitter:title', title);
            this._setMeta('name', 'twitter:description', description);

            // Notify Cloudflare Web Analytics of SPA page view (skip first load — beacon fires automatically)
            if (this._initialPageViewDone && window.cfBeacon && typeof window.cfBeacon.send === 'function') {
                window.cfBeacon.send({ type: 'spa' });
            }
            this._initialPageViewDone = true;
        },

        toggleDarkMode() {
            this.isDark = !this.isDark;
            document.documentElement.classList.toggle('dark', this.isDark);
            localStorage.setItem('darkMode', this.isDark);
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