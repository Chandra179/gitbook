function initializeMarkedExtensions() {
    const gitbookMath = {
        name: 'gitbookMath',
        level: 'inline', // CRITICAL: Parsing as inline protects your <ul> lists
        start(src) { return src.indexOf('$'); },
        tokenizer(src) {
            // Matches both $$...$$ and $...$
            const match = /^(?:\$\$([\s\S]+?)\$\$|\$([\s\S]+?)\$)/.exec(src);
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

    marked.use({ extensions: [gitbookMath] });
}