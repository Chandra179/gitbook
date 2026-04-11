function initializeMarkedExtensions() {
    // Inline extension: protects $$...$$ from markdown mangling so KaTeX can render it.
    // Standalone $$...$$ paragraphs are converted to display math \[...\] by
    // content-loader.js after marked.parse(), so this extension only needs to handle
    // inline usage (e.g. within list items or mid-paragraph text).
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
            return token.raw;
        }
    };

    marked.use({ extensions: [inlineMathExtension] });
}
