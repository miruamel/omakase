#!/usr/bin/env bash
# Automated release script

set -e

echo "🚀 Omakase Release Script"
echo "========================"
echo ""

# Get current version
CURRENT_VERSION=$(grep '"version"' package.json | cut -d'"' -f4)
echo "Current version: $CURRENT_VERSION"

# Get new version
read -p "Enter new version (e.g., 0.2.0): " NEW_VERSION

if [[ ! $NEW_VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "❌ Invalid version format. Use semantic versioning (X.Y.Z)"
    exit 1
fi

# Update version in package.json
echo "📝 Updating package.json..."
sed -i "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" package.json

# Run tests
echo "🧪 Running tests..."
bun test

# Run type check
echo "🔍 Running type check..."
bun run typecheck

# Build
echo "🏗️  Building..."
bun run build

# Commit
echo "💾 Committing release..."
git add package.json
git commit -m "chore: Release v$NEW_VERSION"
git tag "v$NEW_VERSION"

# Push
echo "📤 Pushing to GitHub..."
git push origin main
git push origin "v$NEW_VERSION"

echo ""
echo "✅ Release v$NEW_VERSION complete!"
echo ""
echo "Next steps:"
echo "1. Create GitHub release: https://github.com/miruamel/omakase/releases/new"
echo "2. Use tag: v$NEW_VERSION"
echo "3. Copy release notes from .github/DRAFT_RELEASE_NOTES.md"
echo ""
echo "🎉 Congratulations!"
