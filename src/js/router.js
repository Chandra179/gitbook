class Router {
    constructor(navigationData) {
        this.navigationData = navigationData;
        this.currentPage = 'README';
        this.currentCategory = null;
        this.breadcrumb = 'README';
        this.onRouteChange = null;
    }

    init() {
        window.addEventListener('hashchange', () => this.handleRoute());
        this.handleRoute();
    }

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
        const standaloneItem = this.navigationData.find(
            item => item.standalone && item.slug === hash
        );

        if (standaloneItem) {
            this.currentCategory = null;
            this.updateBreadcrumb(hash, null);
        } else {
            // Parse category and page from hash (format: category/page or just category)
            const parts = hash.split('/');
            this.currentCategory = parts[0];
            const page = parts[1] || null;
            this.updateBreadcrumb(this.currentCategory, page);
        }

        // Trigger route change callback
        if (this.onRouteChange) {
            this.onRouteChange(this.currentCategory || hash, anchor);
        }
    }

    navigate(path) {
        window.location.hash = path;
    }

    navigateToCategory(category) {
        window.location.hash = category;
    }

    navigateToPage(category, page) {
        window.location.hash = `${category}/${page}`;
    }

    updateBreadcrumb(category, page) {
        const standaloneItem = this.navigationData.find(
            item => item.standalone && item.slug === category
        );

        if (standaloneItem) {
            this.breadcrumb = standaloneItem.name;
            return;
        }

        const categoryData = this.navigationData.find(cat => cat.slug === category);

        if (!categoryData) {
            this.breadcrumb = 'Page Not Found';
            return;
        }

        if (!page) {
            this.breadcrumb = categoryData.name;
        } else {
            const pageData = categoryData.pages.find(p => p.slug === page);
            const pageName = pageData ? pageData.name : page;
            this.breadcrumb = `${categoryData.name} / ${pageName}`;
        }
    }

    isPageActive(category, page) {
        return this.currentPage === `${category}/${page}`;
    }

    isCategoryActive(category) {
        return this.currentCategory === category;
    }

    getCurrentPage() {
        return this.currentPage;
    }

    getCurrentCategory() {
        return this.currentCategory;
    }

    getBreadcrumb() {
        return this.breadcrumb;
    }
}