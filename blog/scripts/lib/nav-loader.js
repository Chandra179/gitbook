const path = require('path');
const fs = require('fs');
const { ROOT } = require('./paths');

const JSON_OUTPUT = path.join(ROOT, 'blog/src/js/navigation-data.json');
const JS_OUTPUT = path.join(ROOT, 'blog/src/js/navigation-data.js');

function loadNavData() {
    const src = fs.readFileSync(JSON_OUTPUT, 'utf8');
    return JSON.parse(src);
}

module.exports = { loadNavData, JSON_OUTPUT, JS_OUTPUT };
