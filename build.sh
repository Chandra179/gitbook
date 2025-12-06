#!/bin/bash

# Clean dist directory
rm -rf dist
mkdir -p dist

# Build Tailwind CSS
npm run build:css

# Copy index.html
cp src/index.html dist/index.html


# Copy assets
cp -r src/css dist/css
cp -r src/js dist/js
# Copy .gitbook assets (images)
mkdir -p dist/.gitbook
cp -r .gitbook/assets dist/.gitbook/assets

# Copy content directories
# Check if directories exist before copying to avoid errors
for dir in general golang math rag system-design; do
    if [ -d "$dir" ]; then
        cp -r "$dir" "dist/$dir"
    fi
done

# Copy root markdown files
# Using find to copy only .md files from root, excluding node_modules, dist, etc.
# But simply listing known files is safer based on navigation-data.js
cp README.md dist/
cp p2p-chat.md dist/
cp reactjs.md dist/

echo "Build complete! Content is in ./dist"

# npx wrangler deploy
# semgrep scan