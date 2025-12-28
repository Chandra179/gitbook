function portfolioApp() {
    return {
        mobileMenuOpen: false,
        loading: true,
        isSearchOpen: false,
        expandedSections: {},
        expandedFolders: {}, // NEW: Track expanded nested folders

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
            setTimeout(() => {
                this.tocGenerator.addIdsToHeaders();
                this.tocGenerator.generate();
                this.renderer.renderAll();

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

        // NEW: Navigate to nested page
        navigateToNestedPage(category, folder, page) {
            window.location.hash = `${category}/${folder}/${page}`;
        },

        isPageActive(category, page) {
            return this.router.isPageActive(category, page);
        },

        // NEW: Check if nested page is active
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
            window.location.hash = link;
            this.closeSearch();
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

        // NEW: Toggle nested folders
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
        }
    };
}