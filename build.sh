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

# Generate navigation data and search index from filesystem, then copy JS
echo "Generating navigation data..."
node scripts/gen-nav.js
echo "Generating search index..."
node scripts/gen-search-index.js
cp -r src/js dist/js
cp src/worker.js dist/worker.js
cp src/search-index.json dist/search-index.json

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

# Copy all root-level markdown files
for file in *.md; do
    [ -f "$file" ] && cp "$file" dist/
done

echo "Build complete! Content is in ./dist"