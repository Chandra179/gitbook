class Router {
    constructor(navigationData) {
        this.navigationData = navigationData;
        this.currentPage = 'README';
        this.currentCategory = null;
        this.breadcrumb = 'README';
        this.onRouteChange = null;
    }

    init() {
        window.addEventListener('popstate', () => this.handleRoute());
        this.handleRoute();
    }

    handleRoute() {
        try {
            // Use pathname for History API routing; strip leading slash
            let path = window.location.pathname.replace(/^\//, '') || 'README';

            // Also support an in-page anchor via the URL hash (e.g. /math/algebra#section)
            let anchor = window.location.hash.replace(/^#/, '');

            // Validate path — only allow alphanumeric, hyphens, underscores, and slashes
            if (!/^[a-zA-Z0-9-_/]*$/.test(path)) {
                console.warn('Invalid path format:', path);
                path = 'README';
            }

            // Sanitize to prevent directory traversal
            path = path.replace(/\.\./g, '');

            this.currentPage = path;

            const standaloneItem = this.navigationData.find(
                item => item.standalone && item.slug === path
            );

            if (standaloneItem) {
                this.currentCategory = null;
                this.updateBreadcrumb(path, null);
            } else {
                const parts = path.split('/');
                this.currentCategory = parts[0];
                const page = parts.slice(1).join('/') || null;
                this.updateBreadcrumb(this.currentCategory, page);
            }

            if (this.onRouteChange) {
                this.onRouteChange(this.currentCategory || path, anchor);
            }
        } catch (error) {
            console.error('Router error:', error);
            this.currentPage = 'README';
            this.currentCategory = null;
            this.breadcrumb = 'README';
            if (this.onRouteChange) {
                this.onRouteChange('README', '');
            }
        }
    }

    navigate(path) {
        history.pushState(null, '', '/' + path);
        this.handleRoute();
    }

    navigateToCategory(category) {
        this.navigate(category);
    }

    navigateToPage(category, page) {
        this.navigate(`${category}/${page}`);
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
