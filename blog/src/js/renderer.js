// Math is rendered at markdown parse time by the `gitbookMath` marked extension
// (see marked-extensions.js). KaTeX auto-render is intentionally NOT used.

class Renderer {
    static SUPPORTED_LANGUAGES = [
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

        try {
            content.querySelectorAll('pre code:not(.language-mermaid)').forEach(block => {
                hljs.highlightElement(block);

                const pre = block.parentElement;
                if (!pre || pre.dataset.codeWrapped) return;
                pre.dataset.codeWrapped = '1';

                const classLang = Array.from(block.classList)
                    .find(c => c.startsWith('language-'))
                    ?.replace('language-', '') || 'plaintext';
                const detectedLang = classLang;

                const wrapper = document.createElement('div');
                wrapper.className = 'code-block-wrapper';

                const toolbar = document.createElement('div');
                toolbar.className = 'code-block-toolbar';

                const select = document.createElement('select');
                select.className = 'code-lang-select';
                Renderer.SUPPORTED_LANGUAGES.forEach(({ value, label }) => {
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
                const id = 'mermaid-' + Math.random().toString(36).substring(2, 11);
                const { svg } = await mermaid.render(id, block.textContent);
                const wrapper = document.createElement('div');
                wrapper.className = 'mermaid-diagram';

                const svgContainer = document.createElement('div');
                svgContainer.className = 'mermaid-svg-container';
                svgContainer.innerHTML = svg;

                const svgEl = svgContainer.querySelector('svg');
                // viewBox is the canonical source for natural size; fall back to width/height attributes
                const naturalWidth = svgEl.viewBox.baseVal.width
                    || parseFloat(svgEl.getAttribute('width'))
                    || svgEl.clientWidth;
                const naturalHeight = svgEl.viewBox.baseVal.height
                    || parseFloat(svgEl.getAttribute('height'))
                    || svgEl.clientHeight;

                // Mermaid ships SVG with `max-width:100%` inline which would clamp our zoom
                svgEl.removeAttribute('width');
                svgEl.removeAttribute('height');
                svgEl.style.maxWidth = 'none';
                svgEl.style.display = 'block';

                let scale = 1;

                function applyZoom() {
                    svgEl.style.width = (naturalWidth * scale) + 'px';
                    svgEl.style.height = (naturalHeight * scale) + 'px';
                }

                applyZoom();

                // Wheel / pinch → zoom (only on ctrlKey or two-finger pinch)
                // Normal scroll → let container scroll naturally
                wrapper.addEventListener('wheel', (e) => {
                    if (!e.ctrlKey && !e.metaKey) return;
                    e.preventDefault();
                    const factor = e.deltaY < 0 ? 1.1 : 0.9;
                    scale = Math.min(Math.max(scale * factor, 0.25), 5);
                    applyZoom();
                }, { passive: false });

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
                        else { scale = 1; }
                        applyZoom();
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
    }
}