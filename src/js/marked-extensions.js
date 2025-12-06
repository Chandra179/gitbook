function initializeMarkedExtensions() {
    // Custom extension to protect LaTeX math from markdown parsing
    // This captures $$...$$ and $...$ and outputs them as raw text
    // so that KaTeX auto-render can pick them up later without mangling

    const mathExtension = {
        name: 'math',
        level: 'inline',
        start(src) {
            return src.match(/\$/)?.index;
        },
        tokenizer(src, tokens) {
            // Match $$...$$ (display/inline depending on config)
            const doubleDollar = /^\$\$([\s\S]+?)\$\$/;
            const doubleMatch = doubleDollar.exec(src);

            if (doubleMatch) {
                return {
                    type: 'math',
                    raw: doubleMatch[0],
                    text: doubleMatch[1],
                    display: true // We'll let renderMathInElement decide, but this marks it
                };
            }

            // Match $...$ (inline)
            // We need to be careful not to match normal text like "Costs $5 and $10"
            // So we usually require no spaces around the content or specific patterns
            // But for now, let's stick to $$ as that's what the user is using mostly
            // If they use $, we can add support.
            // The user's example used $$ for everything.

            return undefined;
        },
        renderer(token) {
            // Return the raw LaTeX wrapped in delimiters for KaTeX to find
            // We return it exactly as is: $$...$$
            return token.raw;
        }
    };

    marked.use({ extensions: [mathExtension] });
}
