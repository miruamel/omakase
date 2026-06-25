#!/usr/bin/env bash
# Code formatting script

set -e

echo "🎨 Formatting code..."

# Format TypeScript/JavaScript files
echo "  → Running Prettier..."
bunx prettier --write "src/**/*.{ts,tsx}" "examples/**/*.{ts,tsx,json}" 2>/dev/null || echo "  ⚠️  Prettier not installed, skipping..."

# Format Markdown
echo "  → Formatting Markdown..."
bunx prettier --write "**/*.md" 2>/dev/null || echo "  ⚠️  Skipping MD formatting..."

echo ""
echo "✅ Formatting complete!"
