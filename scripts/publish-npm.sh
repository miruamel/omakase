#!/usr/bin/env bash
# Publish to npm registry

set -e

echo "📦 NPM Publishing Wizard"
echo "========================"
echo ""

# Check if logged in
if ! npm whoami &>/dev/null; then
    echo "❌ Not logged in to npm"
    echo "Run: npm login"
    exit 1
fi

# Get current version
VERSION=$(node -p "require('./package.json').version")
echo "Current version: $VERSION"

# Confirm publish
read -p "Publish version $VERSION to npm? (y/n): " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled"
    exit 0
fi

# Build
echo "🏗️  Building..."
bun run build

# Test
echo "🧪 Running tests..."
bun test

# Publish
echo "📤 Publishing to npm..."
npm publish --access public

echo ""
echo "✅ Published omakase@$VERSION to npm!"
echo ""
echo "Install with: npm install -g omakase"
