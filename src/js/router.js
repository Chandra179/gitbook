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

        let anchor = '';
        if (hash.includes('#')) {
            const parts = hash.split('#');
            hash = parts[0];
            anchor = parts[1];
        }

        this.currentPage = hash;

        const standaloneItem = this.navigationData.find(
            item => item.standalone && item.slug === hash
        );

        if (standaloneItem) {
            this.currentCategory = null;
            this.updateBreadcrumb(hash, null);
        } else {
            // Parse category and page from hash (format: category/subfolder/page)
            const parts = hash.split('/');
            this.currentCategory = parts[0];
            const page = parts.slice(1).join('/') || null; // Join remaining parts
            this.updateBreadcrumb(this.currentCategory, page);
        }

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
            // Handle nested paths (e.g., "algebra/files")
            const parts = page.split('/');
            const breadcrumbParts = [categoryData.name];
            
            let currentLevel = categoryData.pages;
            for (let i = 0; i < parts.length; i++) {
                const slug = parts[i];
                const item = currentLevel?.find(p => p.slug === slug);
                
                if (item) {
                    breadcrumbParts.push(item.name);
                    if (item.isFolder && item.pages) {
                        currentLevel = item.pages;
                    }
                } else {
                    breadcrumbParts.push(slug);
                }
            }
            
            this.breadcrumb = breadcrumbParts.join(' / ');
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