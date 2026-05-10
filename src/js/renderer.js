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
            const prevSibling = list.previousElementSibling;
            if (prevSibling && prevSibling.textContent.includes('timeline')) {
                list.classList.add('timeline-list');
            }
        });
    }

    renderMathSpans() {
        if (typeof katex === 'undefined') return;

        const content = document.getElementById(this.contentElementId);
        if (!content) return;

        content.querySelectorAll('span.math').forEach(span => {
            if (span.dataset.mathRendered) return;
            span.dataset.mathRendered = '1';
            try {
                const html = katex.renderToString(span.textContent, {
                    displayMode: false,
                    throwOnError: false
                });
                span.innerHTML = html;
            } catch (e) {
                console.warn('KaTeX render failed for math span:', span.textContent, e);
            }
        });
    }

    async renderMermaid() {
        if (typeof mermaid === 'undefined') return;

        const content = document.getElementById(this.contentElementId);
        if (!content) return;

        const mermaidBlocks = content.querySelectorAll('pre code.language-mermaid');
        if (mermaidBlocks.length === 0) return;

        mermaid.initialize({ startOnLoad: false, theme: 'default' });

        for (const block of mermaidBlocks) {
            const pre = block.parentElement;
            if (!pre || pre.dataset.mermaidRendered) continue;
            pre.dataset.mermaidRendered = '1';

            try {
                const id = 'mermaid-' + Math.random().toString(36).substr(2, 9);
                const { svg } = await mermaid.render(id, block.textContent);
                const wrapper = document.createElement('div');
                wrapper.className = 'mermaid-diagram';

                const svgContainer = document.createElement('div');
                svgContainer.className = 'mermaid-svg-container';
                svgContainer.innerHTML = svg;

                let scale = 1;
                let tx = 0, ty = 0;
                let dragging = false;
                let dragStartX, dragStartY, dragStartTX, dragStartTY;

                function applyTransform() {
                    svgContainer.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
                }

                svgContainer.style.transformOrigin = '0 0';
                svgContainer.style.cursor = 'grab';
                applyTransform();

                // Wheel / pinch → zoom (only on ctrlKey or two-finger pinch)
                // Normal scroll → let container scroll naturally
                wrapper.addEventListener('wheel', (e) => {
                    if (!e.ctrlKey && !e.metaKey) return;
                    e.preventDefault();
                    const rect = svgContainer.getBoundingClientRect();
                    const mx = e.clientX - rect.left;
                    const my = e.clientY - rect.top;

                    const factor = e.deltaY < 0 ? 1.1 : 0.9;
                    const newScale = Math.min(Math.max(scale * factor, 0.25), 5);

                    tx = mx - (mx - tx) * (newScale / scale);
                    ty = my - (my - ty) * (newScale / scale);
                    scale = newScale;
                    applyTransform();
                }, { passive: false });

                // Pan via drag
                svgContainer.addEventListener('pointerdown', (e) => {
                    dragging = true;
                    svgContainer.style.cursor = 'grabbing';
                    svgContainer.setPointerCapture(e.pointerId);
                    dragStartX = e.clientX;
                    dragStartY = e.clientY;
                    dragStartTX = tx;
                    dragStartTY = ty;
                });

                svgContainer.addEventListener('pointermove', (e) => {
                    if (!dragging) return;
                    tx = dragStartTX + (e.clientX - dragStartX);
                    ty = dragStartTY + (e.clientY - dragStartY);
                    applyTransform();
                });

                const stopDrag = () => {
                    dragging = false;
                    svgContainer.style.cursor = 'grab';
                };
                svgContainer.addEventListener('pointerup', stopDrag);
                svgContainer.addEventListener('pointerleave', stopDrag);

                // Zoom buttons
                const controls = document.createElement('div');
                controls.className = 'mermaid-controls';
                controls.innerHTML = `
                    <button class="mermaid-zoom-btn" data-action="in" title="Zoom in">+</button>
                    <button class="mermaid-zoom-btn" data-action="out" title="Zoom out">−</button>
                    <button class="mermaid-zoom-btn" data-action="reset" title="Reset">↺</button>
                `;

                controls.querySelectorAll('button').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const action = btn.dataset.action;
                        if (action === 'in') scale = Math.min(scale * 1.25, 5);
                        else if (action === 'out') scale = Math.max(scale / 1.25, 0.25);
                        else { scale = 1; tx = 0; ty = 0; }
                        applyTransform();
                    });
                });

                wrapper.appendChild(svgContainer);
                wrapper.appendChild(controls);
                pre.replaceWith(wrapper);
            } catch (e) {
                console.warn('Mermaid render failed:', e);
            }
        }
    }

    async renderAll() {
        this.applyTimelineClass();
        await this.renderMermaid();
        this.renderCodeBlocks();
        this.renderMathSpans();
    }
}