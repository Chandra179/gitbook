class TOCGenerator {
    constructor(contentElementId = 'content', tocElementId = 'toc') {
        this.contentElementId = contentElementId;
        this.tocElementId = tocElementId;
        this.observer = null;
    }

    addIdsToHeaders() {
        const content = document.getElementById(this.contentElementId);
        if (!content) return;

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
    }

    generate() {
        const content = document.getElementById(this.contentElementId);
        const toc = document.getElementById(this.tocElementId);

        if (!content || !toc) return;

        const headers = content.querySelectorAll('h2, h3');

        // Reset: Clear content and hide by default
        toc.innerHTML = '';
        toc.style.display = 'none';

        // If no headers, TOC remains hidden
        if (headers.length === 0) {
            return;
        }

        // Make TOC visible if we have headers
        toc.style.display = 'block';

        headers.forEach(header => {
            const level = header.tagName === 'H2' ? 'ml-0' : 'ml-4';
            const text = header.textContent;
            const id = header.id;

            if (!id) return;

            const link = document.createElement('a');
            link.href = `#${id}`;
            link.className = `toc-link block py-1 text-sm text-gray-600 hover:text-gray-900 border-l-2 border-transparent hover:border-gray-300 pl-3 ${level}`;
            link.textContent = text;

            link.onclick = (e) => {
                e.preventDefault();
                document.getElementById(id).scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            };
            toc.appendChild(link);
        });

        this.setupHighlight();
    }

    setupHighlight() {
        // Clean up previous observer
        if (this.observer) {
            this.observer.disconnect();
        }

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    document.querySelectorAll('.toc-link').forEach(link => {
                        link.classList.remove('active');
                    });
                    const activeLink = document.querySelector(
                        `.toc-link[href="#${entry.target.id}"]`
                    );
                    if (activeLink) activeLink.classList.add('active');
                }
            });
        }, { rootMargin: '-100px 0px -66%' });

        const content = document.getElementById(this.contentElementId);
        if (!content) return;

        content.querySelectorAll('h2, h3').forEach(header => {
            this.observer.observe(header);
        });
    }

    clear() {
        const toc = document.getElementById(this.tocElementId);
        if (toc) {
            toc.innerHTML = '';
            toc.style.display = 'none';
        }

        if (this.observer) {
            this.observer.disconnect();
        }
    }
}