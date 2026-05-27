#!/bin/bash

# Ensure script stops on first error
set -e

# Install dependencies if node_modules is missing
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

rm -rf dist
mkdir -p dist

echo "Building CSS..."
npm run build:css

cp src/index.html dist/index.html
cp src/sitemap.xml dist/sitemap.xml
cp src/robots.txt dist/robots.txt

cp -r src/css dist/css

# Concatenate modular CSS into single file to eliminate @import waterfall (7 serial requests → 1)
cat src/css/base.css src/css/prose.css src/css/timeline.css src/css/math.css src/css/landing.css src/css/dark.css > dist/css/styles.css

# Generate navigation data and search index from filesystem, then copy JS
echo "Generating navigation data..."
node scripts/gen-nav.js
echo "Generating search index..."
node scripts/gen-search-index.js
echo "Generating landing index..."
node scripts/gen-landing-index.js
cp -r src/js dist/js
cp src/worker.js dist/worker.js
cp src/search-index.json dist/search-index.json
cp src/landing-index.json dist/landing-index.json

# Copy .gitbook assets (images)
mkdir -p dist/.gitbook
# Only copy if assets exist to prevent error
if [ -d ".gitbook/assets" ]; then
    cp -r .gitbook/assets dist/.gitbook/assets
fi

# Copy all content directories (any top-level dir that isn't infrastructure)
SKIP_DIRS="node_modules dist src scripts .git .gitbook .claude .wrangler"
for dir in */; do
    dir="${dir%/}"
    if [[ ! " $SKIP_DIRS " =~ " $dir " ]]; then
        cp -r "$dir" "dist/$dir"
    fi
done

# Copy all root-level markdown files (excluding ROADMAP.md)
for file in *.md; do
    [ -f "$file" ] && [ "$file" != "ROADMAP.md" ] && cp "$file" dist/
done

echo "Build complete! Content is in ./dist"