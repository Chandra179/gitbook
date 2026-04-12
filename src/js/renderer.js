// Timeline configuration
const TIMELINE_CONFIG = {
    MIN_ITEMS_FOR_GRID: 3
};

// Math rendering note:
// Math is handled entirely at markdown parse time by the `gitbookMath` marked extension
// (see marked-extensions.js). It matches GitBook-style $...$ and $$...$$ delimiters and
// calls katex.renderToString() inline, producing <span class="math-single|math-double"> HTML.
// KaTeX auto-render (renderMathInElement) is intentionally NOT used — it would conflict with
// the pre-rendered spans and require a separate auto-render script bundle.

class Renderer {
    constructor(contentElementId = 'content') {
        this.contentElementId = contentElementId;
    }

    renderCodeBlocks() {
        if (typeof hljs === 'undefined') {
            console.warn('Highlight.js not loaded - syntax highlighting disabled');
            return;
        }

        const content = document.getElementById(this.contentElementId);
        if (!content) return;

        const SUPPORTED_LANGUAGES = [
            { value: 'plaintext', label: 'Plain Text' },
            { value: 'bash',       label: 'Bash' },
            { value: 'cpp',        label: 'C++' },
            { value: 'go',         label: 'Go' },
            { value: 'java',       label: 'Java' },
            { value: 'javascript', label: 'JavaScript' },
            { value: 'json',       label: 'JSON' },
            { value: 'python',     label: 'Python' },
            { value: 'rust',       label: 'Rust' },
            { value: 'sql',        label: 'SQL' },
            { value: 'typescript', label: 'TypeScript' },
            { value: 'yaml',       label: 'YAML' },
        ];

        try {
            content.querySelectorAll('pre code').forEach(block => {
                hljs.highlightElement(block);

                const pre = block.parentElement;
                if (!pre || pre.dataset.codeWrapped) return;
                pre.dataset.codeWrapped = '1';

                // Detect language: hljs adds a `language-X` class after highlighting
                const classLang = Array.from(block.classList)
                    .find(c => c.startsWith('language-'))
                    ?.replace('language-', '') || 'plaintext';
                const detectedLang = classLang;

                // Build wrapper
                const wrapper = document.createElement('div');
                wrapper.className = 'code-block-wrapper';

                // Toolbar
                const toolbar = document.createElement('div');
                toolbar.className = 'code-block-toolbar';

                // Language dropdown
                const select = document.createElement('select');
                select.className = 'code-lang-select';
                SUPPORTED_LANGUAGES.forEach(({ value, label }) => {
                    const opt = document.createElement('option');
                    opt.value = value;
                    opt.textContent = label;
                    if (value === detectedLang) {
                        opt.selected = true;
                    }
                    select.appendChild(opt);
                });

                select.addEventListener('change', () => {
                    const lang = select.value;
                    // Strip old hljs classes
                    block.className = Array.from(block.classList)
                        .filter(c => !c.startsWith('language-') && !c.startsWith('hljs'))
                        .join(' ');
                    block.classList.add(`language-${lang}`);
                    block.removeAttribute('data-highlighted');
                    if (lang === 'plaintext') {
                        block.innerHTML = block.textContent
                            .replace(/&/g, '&amp;')
                            .replace(/</g, '&lt;')
                            .replace(/>/g, '&gt;');
                    } else {
                        hljs.highlightElement(block);
                    }
                });

                // Copy button
                const copyBtn = document.createElement('button');
                copyBtn.className = 'code-copy-btn';
                copyBtn.textContent = 'Copy';
                copyBtn.addEventListener('click', () => {
                    navigator.clipboard.writeText(block.textContent).then(() => {
                        copyBtn.textContent = 'Copied!';
                        copyBtn.classList.add('copied');
                        setTimeout(() => {
                            copyBtn.textContent = 'Copy';
                            copyBtn.classList.remove('copied');
                        }, 2000);
                    });
                });

                toolbar.appendChild(select);
                toolbar.appendChild(copyBtn);

                pre.parentNode.insertBefore(wrapper, pre);
                wrapper.appendChild(toolbar);
                wrapper.appendChild(pre);
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
        this.renderCodeBlocks();
    }
}