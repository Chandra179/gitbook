const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const CONTENT_ROOT = ROOT;
const BLOG_ROOT = path.resolve(__dirname, '..', '..');
const SRC = path.join(BLOG_ROOT, 'src');

module.exports = { ROOT, CONTENT_ROOT, BLOG_ROOT, SRC, path };
