function portfolioApp() {
    return {
        // UI state
        mobileMenuOpen: false,
        loading: true,
        isSearchOpen: false,
        expandedSections: {},

        // Module instances
        router: null,
        search: null,
        contentLoader: null,
        tocGenerator: null,
        renderer: null,

        // Data
        navigationData: navigationData,

        init() {
            // Initialize marked extensions
            if (typeof initializeMarkedExtensions === 'function') {
                initializeMarkedExtensions();
            }

            // Set up marked options
            marked.setOptions({
                breaks: true,
                gfm: true,
                headerIds: true,
            });

            // Initialize modules
            this.router = new Router(this.navigationData);
            this.search = new Search(this.navigationData);
            this.contentLoader = new ContentLoader(this.navigationData);
            this.tocGenerator = new TOCGenerator();
            this.renderer = new Renderer();

            // Set up router callback
            this.router.onRouteChange = (category, anchor) => {
                const page = this.router.getCurrentPage().includes('/') 
                    ? this.router.getCurrentPage().split('/')[1] 
                    : null;
                this.loadContent(category, page, anchor);
            };

            // Set up content loader callback
            this.contentLoader.onContentLoaded = (html, anchor) => {
                this.content = html;
                this.postRenderActions(anchor);
            };

            // Initialize expanded sections (expand first category by default)
            const firstCategory = this.navigationData.find(item => !item.standalone);
            if (firstCategory) {
                this.expandedSections[firstCategory.slug] = true;
            }

            // Start router
            this.router.init();

            // Initialize search index
            this.search.init();
        },

        async loadContent(category, page, anchor) {
            this.tocGenerator.clear();
            this.loading = true;
            await this.contentLoader.loadContent(category, page, anchor);
            this.loading = false;
        },

        postRenderActions(anchor) {
            // Wait for DOM update then apply all rendering
            setTimeout(() => {
                this.tocGenerator.addIdsToHeaders();
                this.tocGenerator.generate();
                this.renderer.renderAll();

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
        },

        // Navigation methods
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

        isPageActive(category, page) {
            return this.router.isPageActive(category, page);
        },

        isCategoryActive(category) {
            return this.router.isCategoryActive(category);
        },

        // Search methods
        performSearch() {
            return this.search.performSearch(this.searchQuery);
        },

        closeSearch() {
            this.isSearchOpen = false;
            this.search.clear();
            this.searchQuery = '';
        },

        navigateToSearchResult(link) {
            window.location.hash = link;
            this.closeSearch();
        },

        highlightText(text, query) {
            return this.search.highlightText(text, query);
        },

        // Section expansion
        toggleSection(slug) {
            this.expandedSections[slug] = !this.expandedSections[slug];
        },

        isSectionExpanded(slug) {
            return this.expandedSections[slug] || false;
        },

        // Getters for template binding
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
        }
    };
}