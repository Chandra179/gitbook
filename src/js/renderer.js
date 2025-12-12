class Renderer {
    constructor(contentElementId = 'content') {
        this.contentElementId = contentElementId;
    }

    renderMath() {
        if (typeof renderMathInElement === 'undefined') return;

        const content = document.getElementById(this.contentElementId);
        if (!content) return;

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
        const mathElements = content.querySelectorAll('.math');
        mathElements.forEach(el => {
            try {
                katex.render(el.textContent, el, {
                    throwOnError: false,
                    displayMode: false
                });
            } catch (e) {
                console.error('KaTeX rendering error for .math element:', e);
            }
        });
    }

    renderCodeBlocks() {
        if (typeof hljs !== 'undefined') {
            hljs.highlightAll();
        }
    }

    applyTimelineClass() {
        const content = document.getElementById(this.contentElementId);
        if (!content) return;

        const lists = content.querySelectorAll('ul');

        lists.forEach(list => {
            // Check if the previous element is a comment or contains 'timeline'
            const prevSibling = list.previousElementSibling;
            if (prevSibling && prevSibling.textContent.includes('timeline')) {
                list.classList.add('timeline-list');
                return;
            }

            // Auto-detect timelines by checking for year patterns
            const hasYears = Array.from(list.children).some(li =>
                /\b(19|20)\d{2}\b/.test(li.textContent)
            );

            if (hasYears && list.children.length >= 3) {
                list.classList.add('timeline-list');
            }
        });
    }

    renderAll() {
        this.applyTimelineClass();
        this.renderMath();
        this.renderCodeBlocks();
    }
}