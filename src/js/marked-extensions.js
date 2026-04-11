function initializeMarkedExtensions() {
    // Block-level extension: catches $$...$$ that forms an entire paragraph (display math)
    // This prevents wide formulas from rendering as inline elements and overflowing the page.
    const blockMathExtension = {
        name: 'blockMath',
        level: 'block',
        start(src) {
            return src.match(/^\$\$/)?.index;
        },
        tokenizer(src, tokens) {
            const match = /^\$\$([\s\S]+?)\$\$[ \t]*(?:\n|$)/.exec(src);
            if (match) {
                return {
                    type: 'blockMath',
                    raw: match[0],
                    text: match[1].trim()
                };
            }
            return undefined;
        },
        renderer(token) {
            // Render as \[...\] so KaTeX auto-render picks it up as display math
            return `<p>\\[${token.text}\\]</p>\n`;
        }
    };

    // Inline extension: catches $$...$$ within text (e.g. inside list items or mid-paragraph)
    const inlineMathExtension = {
        name: 'math',
        level: 'inline',
        start(src) {
            return src.match(/\$/)?.index;
        },
        tokenizer(src, tokens) {
            const match = /^\$\$([\s\S]+?)\$\$/.exec(src);
            if (match) {
                return {
                    type: 'math',
                    raw: match[0],
                    text: match[1],
                    display: false
                };
            }
            return undefined;
        },
        renderer(token) {
            // Return raw $$...$$ for KaTeX auto-render (inline mode)
            return token.raw;
        }
    };

    marked.use({ extensions: [blockMathExtension, inlineMathExtension] });
}
