// Timeline configuration
const TIMELINE_CONFIG = {
    MIN_ITEMS_FOR_GRID: 3
};

class Renderer {
    constructor(contentElementId = 'content') {
        this.contentElementId = contentElementId;
    }

    renderMath() {
        if (typeof renderMathInElement === 'undefined') {
            console.warn('KaTeX auto-render not loaded - math rendering disabled');
            return;
        }

        const content = document.getElementById(this.contentElementId);
        if (!content) return;

        try {
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
                    if (typeof katex !== 'undefined') {
                        katex.render(el.textContent, el, {
                            throwOnError: false,
                            displayMode: false
                        });
                    }
                } catch (e) {
                    console.error('KaTeX rendering error for .math element:', e);
                }
            });
        } catch (error) {
            console.error('Error rendering math:', error);
        }
    }

    renderCodeBlocks() {
        if (typeof hljs === 'undefined') {
            console.warn('Highlight.js not loaded - syntax highlighting disabled');
            return;
        }

        const content = document.getElementById(this.contentElementId);
        if (!content) return;

        try {
            content.querySelectorAll('pre code').forEach(block => {
                hljs.highlightElement(block);
            });
        } catch (error) {
            console.error('Error highlighting code:', error);
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

            if (hasYears && list.children.length >= TIMELINE_CONFIG.MIN_ITEMS_FOR_GRID) {
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