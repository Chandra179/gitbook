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

cp -r src/css dist/css
cp -r src/js dist/js

# Copy .gitbook assets (images)
mkdir -p dist/.gitbook
# Only copy if assets exist to prevent error
if [ -d ".gitbook/assets" ]; then
    cp -r .gitbook/assets dist/.gitbook/assets
fi

# Copy content directories
# Check if directories exist before copying to avoid errors
for dir in general golang math rag system-design neural-network precalculus; do
    if [ -d "$dir" ]; then
        cp -r "$dir" "dist/$dir"
    fi
done

# Copy root markdown files
# Added check to prevent errors if specific files are missing
files=(
    "README.md"
    "p2p-chat.md"
    "reactjs.md"
    "deep-research.md"
    "knowledge-graph.md"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        cp "$file" dist/
    else
        echo "Warning: $file not found, skipping."
    fi
done

echo "Build complete! Content is in ./dist"

# npx wrangler deploy
# semgrep scan