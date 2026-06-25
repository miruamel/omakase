#!/usr/bin/env bash
# Linting script

set -e

echo "🔍 Linting code..."

# TypeScript type check
echo "  → Type checking..."
bun run typecheck

# Check for common issues
echo "  → Checking imports..."
grep -r "from '\.\./\.\./" src --include="*.ts" | head -5 || echo "  ✓ No deep relative imports"

echo "  → Checking for console.log..."
grep -r "console\.log" src --include="*.ts" | grep -v "logger" | head -5 || echo "  ✓ No stray console.log"

echo ""
echo "✅ Linting complete!"
