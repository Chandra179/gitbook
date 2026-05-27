function renderEmbedCard(url) {
    let icon = '<svg class="embed-card-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';
    let label = url;
    let sublabel = '';
    let favicon = '';

    const ghMatch = url.match(/^https?:\/\/github\.com\/([^/]+)\/([^/\s#?]+)/);
    if (ghMatch) {
        const owner = ghMatch[1];
        const repo = ghMatch[2].replace(/\.git$/, '');
        icon = '<svg class="embed-card-icon-svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>';
        label = owner + '/' + repo;
        sublabel = 'github.com/' + owner + '/' + repo;
        favicon = 'https://github.com/favicon.ico';
    } else {
        try {
            const u = new URL(url);
            favicon = u.origin + '/favicon.ico';
            sublabel = u.hostname;
        } catch (_) {}
    }

    return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="embed-card">`
        + `<span class="embed-card-icon">${icon}</span>`
        + `<span class="embed-card-body">`
        + `<span class="embed-card-label">${escapeHtml(label)}</span>`
        + (sublabel ? `<span class="embed-card-sublabel">${escapeHtml(sublabel)}</span>` : '')
        + `</span>`
        + `<svg class="embed-card-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`
        + `</a>`;
}

const ESCAPE_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
function escapeHtml(str) {
    return str.replace(/[&<>"']/g, m => ESCAPE_MAP[m]);
}

function initializeMarkedExtensions() {
    const gitbookMath = {
        name: 'gitbookMath',
        level: 'inline', // CRITICAL: Parsing as inline protects your <ul> lists
        start(src) { return src.indexOf('$'); },
        tokenizer(src) {
            // Matches both $$...$$ and $...$
            const match = /^(?:\$\$([\s\S]+?)\$\$|\$(?!\d)([\s\S]+?)\$)/.exec(src);
            if (match) {
                return {
                    type: 'gitbookMath',
                    raw: match[0],
                    text: match[1] || match[2],
                    isDouble: !!match[1] // Tracks if it used $$
                };
            }
        },
        renderer(token) {
            try {
                // GitBook uses \displaystyle to keep inline math large and legible.
                const text = token.isDouble ? `\\displaystyle {${token.text}}` : token.text;
                
                const html = katex.renderToString(text, {
                    displayMode: false, // Keeps equations like $$a$$ = $$b$$ on one line
                    throwOnError: false
                });

                // Tag it so we can style block math later
                return `<span class="math-${token.isDouble ? 'double' : 'single'}">${html}</span>`;
            } catch (e) {
                return token.raw;
            }
        }
    };

    const gitbookEmbed = {
        name: 'gitbookEmbed',
        level: 'block',
        tokenizer(src) {
            const match = /^\s*\{%\s*embed\s+url="([^"]+)"\s*%\}/.exec(src);
            if (match) {
                return {
                    type: 'gitbookEmbed',
                    raw: match[0],
                    url: match[1]
                };
            }
        },
        renderer(token) {
            return renderEmbedCard(token.url);
        }
    };

    marked.use({ extensions: [gitbookMath, gitbookEmbed] });
}