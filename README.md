# GitBook Documentation Site

A client-side documentation/portfolio site built with vanilla JavaScript, Alpine.js, and Markdown.

## Features

- **Markdown-based content** - Write content in standard Markdown files
- **Client-side search** - Full-text search across all content
- **Table of contents** - Auto-generated TOC from page headers
- **Math rendering** - KaTeX support for mathematical expressions
- **Syntax highlighting** - Code blocks with Highlight.js
- **Responsive design** - Works on desktop and mobile

## Architecture

### Tech Stack

- **Vanilla JavaScript** - No build step required
- **Alpine.js** - Lightweight reactivity framework
- **Marked.js** - Markdown parsing
- **KaTeX** - Math rendering
- **Highlight.js** - Syntax highlighting
- **Tailwind CSS** - Utility-first styling

### File Structure

```
src/
├── index.html          # Main entry point
├── css/
│   ├── base.css       # Base styles and components
│   ├── styles.css     # Custom styles
│   ├── input.css      # Tailwind input
│   ├── output.css     # Compiled Tailwind output
│   ├── prose.css      # Typography styles
│   ├── math.css       # Math rendering styles
│   └── timeline.css   # Timeline component styles
└── js/
    ├── app.js         # Alpine.js app initialization
    ├── config.js      # Tailwind configuration
    ├── utils.js       # Shared utility functions
    ├── router.js      # Hash-based routing
    ├── content-loader.js  # Markdown file loading
    ├── renderer.js    # Post-render processing
    ├── search.js      # Search indexing and querying
    ├── toc-generator.js   # Table of contents generation
    ├── marked-extensions.js  # Custom marked extensions
    └── navigation-data.js    # Site navigation structure
```

### Core Components

#### Router (`js/router.js`)
Handles hash-based navigation. Maps URL hashes to content files.

#### ContentLoader (`js/content-loader.js`)
Fetches markdown files from the server and converts them to HTML.

#### Search (`js/search.js`)
Indexes all content pages and provides full-text search functionality.

#### TOCGenerator (`js/toc-generator.js`)
Generates table of contents from page headers with smooth scrolling.

## Usage

### Adding New Pages

1. Create a new `.md` file in your content directory
2. Add the page to `navigation-data.js`:

```javascript
const navigationData = {
    categories: [
        {
            title: 'Your Category',
            items: [
                { title: 'Your Page', path: 'your-page' }
            ]
        }
    ]
};
```

3. Navigate to `#your-page` to view it

### Content Format

Pages support standard Markdown plus:

- **Math expressions**: `$inline$` or `$$block$$`
- **Code blocks**: triple backticks with language
- **Tables**: standard Markdown tables
- **Callouts**: use blockquotes with emoji

## Development

### Prerequisites

- Any static file server (Python, Node.js, or simply open index.html)

### Running Locally

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve src/

# Then open http://localhost:8000
```

### Tailwind CSS

The project uses Tailwind CSS. To rebuild styles after changes:

```bash
npx tailwindcss -i src/css/input.css -o src/css/output.css --watch
```

## Browser Support

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+

## License

[Your License Here]
