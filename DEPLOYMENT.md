# Deployment Guide

## 🚀 Cloudflare Pages Deployment

### Method 1: Git Integration (Recommended)

1. **Push your code to GitHub/GitLab**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Cloudflare Pages**
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Navigate to **Pages** → **Create a project**
   - Select **Connect to Git**
   - Choose your repository
   
3. **Configure Build Settings**
   - **Build command**: Leave empty (static site)
   - **Build output directory**: `src`
   - Click **Save and Deploy**

4. **Done!** Your site will be live at `https://your-project.pages.dev`

### Method 2: Direct Upload (Wrangler CLI)

1. **Install Wrangler**
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare**
   ```bash
   wrangler login
   ```

3. **Deploy**
   ```bash
   wrangler pages deploy src --project-name=my-gitbook
   ```

### Method 3: Drag & Drop

1. Go to [Cloudflare Pages](https://pages.cloudflare.com/)
2. Click **Create a project** → **Upload assets**
3. Drag and drop the `src` folder
4. Click **Deploy**

---

## 📁 Project Structure

```
gitbook/
├── src/                          # Your deployable static site
│   ├── index.html               # Production version (uses fetch)
│   ├── index-embedded.html      # Local testing version (file:// compatible)
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── app.js               # Production version (uses fetch)
│       ├── app-embedded.js      # Embedded version (no fetch)
│       ├── config.js
│       ├── navigation-data.js
│       └── markdown-content.js  # Auto-generated embedded content
├── general/                      # Markdown content directories
├── golang/
├── math/
├── rag/
├── system-design/
└── wrangler.toml                # Cloudflare Pages config
```

---

## 🧪 Local Testing

### Option 1: Using HTTP Server (Recommended for Production Testing)
```bash
# This mimics how it will work on Cloudflare Pages
npx http-server src -p 8000
# Visit: http://localhost:8000
```

### Option 2: Direct File Access (file:// protocol)
```bash
# Open the embedded version directly in browser
open src/index-embedded.html
# Or on Linux:
xdg-open src/index-embedded.html
```

**Important:** 
- `index.html` (production) requires HTTP server due to fetch() calls
- `index-embedded.html` works with file:// protocol for offline testing

---

## 🔄 Updating Content

### For Production Deployment:
1. Edit markdown files in `general/`, `golang/`, etc.
2. Commit and push changes
3. Cloudflare Pages auto-deploys (if using Git integration)

### For Local Embedded Version:
1. Edit markdown files
2. Regenerate embedded content:
   ```bash
   npm run generate-embedded
   ```
   Or manually:
   ```bash
   node -e "
   const fs = require('fs');
   const path = require('path');
   const categories = ['general', 'golang', 'math', 'rag', 'system-design'];
   const markdownData = {};
   categories.forEach(category => {
     markdownData[category] = {};
     const dir = path.join(process.cwd(), category);
     const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
     files.forEach(file => {
       const slug = file.replace('.md', '');
       const content = fs.readFileSync(path.join(dir, file), 'utf8');
       markdownData[category][slug] = content;
     });
   });
   fs.writeFileSync('src/js/markdown-content.js', 'const markdownContent = ' + JSON.stringify(markdownData, null, 2) + ';\\n');
   "
   ```

---

## ⚙️ Configuration Files

### `wrangler.toml`
- Cloudflare Pages configuration
- Sets security headers
- Configures caching rules

### `src/js/navigation-data.js`
- Defines sidebar navigation structure
- Update when adding new categories or pages

### `src/js/markdown-content.js` (Auto-generated)
- Contains all markdown content as JavaScript object
- Only needed for `index-embedded.html`
- Regenerate after content changes

---

## 🎯 Which Version to Use?

| Scenario | Use This | Why |
|----------|----------|-----|
| **Production deployment** | `index.html` | Smaller file size, loads markdown on-demand |
| **Local file:// testing** | `index-embedded.html` | Works without server, all content embedded |
| **Development** | `index.html` + http-server | Matches production behavior |

---

## 🔧 Troubleshooting

### "Failed to load content" error
- **Cause**: Using `index.html` with `file://` protocol
- **Solution**: Use `index-embedded.html` or run a local server

### Content not updating on Cloudflare Pages
- Check the build logs in Cloudflare dashboard
- Ensure `src` directory is set as build output
- Clear browser cache (Ctrl+Shift+R)

### Markdown not rendering
- Verify markdown files are in correct directories
- Check browser console for errors
- Ensure `marked.js` CDN is accessible

---

## 📊 Performance Tips

1. **Enable Cloudflare CDN** (automatic on Pages)
2. **Use custom domain** for better caching
3. **Optimize images** before adding to markdown
4. **Keep markdown files under 100KB** for fast loading

---

## 🔒 Security

The `wrangler.toml` includes security headers:
- `X-Frame-Options`: Prevents clickjacking
- `X-Content-Type-Options`: Prevents MIME sniffing
- `Referrer-Policy`: Controls referrer information
- `Permissions-Policy`: Restricts browser features

---

## 📝 License

This deployment configuration is provided as-is for your gitbook project.
