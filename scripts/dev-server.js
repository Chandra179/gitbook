#!/usr/bin/env node
// Dev server: serves src/ for assets, repo root for markdown content, SPA fallback to index.html

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.md':   'text/plain; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.xml':  'application/xml',
  '.txt':  'text/plain',
  '.json': 'application/json',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function serveFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME[ext] || 'application/octet-stream';
  const data = fs.readFileSync(filePath);
  res.writeHead(200, { 'Content-Type': contentType });
  res.end(data);
}

function serveIndex(res) {
  serveFile(res, path.join(SRC, 'index.html'));
}

const server = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];

  // Strip trailing slash (except root)
  if (urlPath !== '/' && urlPath.endsWith('/')) {
    urlPath = urlPath.slice(0, -1);
  }

  // 1. Root → index.html
  if (urlPath === '/' || urlPath === '') {
    return serveIndex(res);
  }

  // 2. Try src/ first (CSS, JS, images, robots, sitemap)
  const srcPath = path.join(SRC, urlPath);
  if (fs.existsSync(srcPath) && fs.statSync(srcPath).isFile()) {
    return serveFile(res, srcPath);
  }

  // 3. Try repo root (markdown content: /math/trig.md, /.gitbook/assets/img.png, etc.)
  const rootPath = path.join(ROOT, urlPath);
  if (fs.existsSync(rootPath) && fs.statSync(rootPath).isFile()) {
    return serveFile(res, rootPath);
  }

  // 4. SPA fallback — unknown paths are client-side routes
  serveIndex(res);
});

server.listen(PORT, () => {
  console.log(`Dev server running at http://localhost:${PORT}`);
  console.log(`Serving assets from: ${SRC}`);
  console.log(`Serving content from: ${ROOT}`);
});
