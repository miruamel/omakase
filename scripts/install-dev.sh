#!/usr/bin/env bash
# Development installation script

set -e

echo "🔧 Installing Omakase for development..."

# Check Bun installed
if ! command -v bun &> /dev/null; then
    echo "❌ Bun not found. Install from https://bun.sh"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
bun install

# Type check
echo "🔍 Running type check..."
bun run typecheck

# Run tests
echo "🧪 Running tests..."
bun test

# Build
echo "🏗️  Building..."
bun run build

echo ""
echo "✅ Development installation complete!"
echo ""
echo "Quick start:"
echo "  bun run dev          # Start development mode"
echo "  bun test             # Run tests"
echo "  bun run typecheck    # Type check"
echo "  bun run build        # Build for production"
echo ""
echo "Happy coding! 🎉"
