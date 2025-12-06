# Portfolio Documentation - Refactored Structure

This is a refactored version of the portfolio documentation site with improved maintainability.

## 📁 Project Structure

```
src/
├── index.html              # Main HTML file
├── css/
│   └── styles.css         # Custom CSS styles
├── js/
│   ├── config.js          # Tailwind configuration
│   ├── demo-content.js    # Demo content for pages
│   └── app.js             # Main application logic
└── content/               # (Optional) Place your .md files here
```

## 🚀 Getting Started

1. **Serve the application**: Use any static file server to serve the `src` directory
   ```bash
   # Using Python
   cd src
   python -m http.server 8000
   
   # Using Node.js (http-server)
   npx http-server src -p 8000
   
   # Using PHP
   cd src
   php -S localhost:8000
   ```

2. **Open in browser**: Navigate to `http://localhost:8000`

## 📝 File Descriptions

### `index.html`
The main HTML structure containing:
- Responsive layout with mobile menu
- Left sidebar navigation
- Main content area
- Right sidebar table of contents (TOC)

### `css/styles.css`
Custom CSS including:
- Timeline/roadmap styling
- Code block styling
- TOC active link styles
- Loading animation
- Navigation active states

### `js/config.js`
Tailwind CSS configuration for:
- Custom fonts (Inter, JetBrains Mono)
- Typography plugin settings
- Color customization

### `js/demo-content.js`
Demo markdown content for all pages:
- About Me
- Experience
- Skills
- Project Alpha
- Project Beta
- Contact

### `js/app.js`
Main application logic including:
- Route handling
- Content loading
- Markdown parsing
- TOC generation
- Timeline detection

## 🎨 Customization

### Adding New Pages

1. Add navigation link in `index.html`:
```html
<a href="#new-page" @click="navigate('new-page')"
    class="nav-link block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 mb-1"
    :class="currentPage === 'new-page' ? 'active' : ''">
    New Page
</a>
```

2. Add breadcrumb in `js/app.js`:
```javascript
updateBreadcrumb(page) {
    const breadcrumbs = {
        // ... existing breadcrumbs
        'new-page': 'New Page Title'
    };
    // ...
}
```

3. Add content in `js/demo-content.js`:
```javascript
const demoContent = {
    // ... existing content
    'new-page': `# New Page\n\nYour content here...`
};
```

### Using Real Markdown Files

Place your `.md` files in the `general/` directory (relative to `index.html`):
- `general/about.md`
- `general/experience.md`
- etc.

The app will automatically fetch these files instead of using demo content.

## 🔧 Technologies Used

- **Tailwind CSS**: Utility-first CSS framework
- **Alpine.js**: Lightweight JavaScript framework
- **Marked.js**: Markdown parser
- **Google Fonts**: Inter & JetBrains Mono

## 📱 Features

- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Dynamic content loading
- ✅ Automatic table of contents generation
- ✅ Timeline visualization for experience
- ✅ Smooth scrolling and transitions
- ✅ Active link highlighting
- ✅ Markdown support with syntax highlighting

## 🛠️ Maintenance Benefits

The refactored structure provides:

1. **Separation of Concerns**: HTML, CSS, and JavaScript are in separate files
2. **Easy Content Updates**: Modify demo content without touching application logic
3. **Reusable Styles**: CSS can be easily extended or modified
4. **Modular JavaScript**: Each JS file has a specific purpose
5. **Better Version Control**: Smaller files make git diffs more readable
6. **Easier Debugging**: Issues can be isolated to specific files

## 📄 License

This is a portfolio template. Feel free to customize and use it for your own projects!
