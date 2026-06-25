#!/usr/bin/env bash
# Automated fixes for common issues

set -e

echo "🔧 Omakase Common Issues Fixer"
echo "=============================="
echo ""

FIXED=0
SKIPPED=0

# Fix 1: Reset corrupted config
if [ -f ~/.omakase/omakase.json ]; then
    echo "Checking configuration..."
    if ! bun -e "JSON.parse(require('fs').readFileSync('$HOME/.omakase/omakase.json', 'utf-8'))" 2>/dev/null; then
        echo "⚠️  Config file corrupted, backing up..."
        cp ~/.omakase/omakase.json ~/.omakase/omakase.json.corrupted
        cat > ~/.omakase/omakase.json << 'CONFIG'
{
  "provider": "anthropic",
  "healthCheck": { "enabled": true, "interval": 30000 },
  "permissionMode": "approve"
}
CONFIG
        echo "   ✓ Config reset to defaults"
        ((FIXED++))
    else
        echo "   ✓ Config OK"
        ((SKIPPED++))
    fi
fi

# Fix 2: Clear stale lock files
echo ""
echo "Checking for stale lock files..."
if [ -f /tmp/omakase.lock ]; then
    LOCK_AGE=$(( ($(date +%s) - $(stat -f %m /tmp/omakase.lock 2>/dev/null || stat -c %Y /tmp/omakase.lock 2>/dev/null || echo 0)) / 60 ))
    if [ $LOCK_AGE -gt 60 ]; then
        echo "⚠️  Stale lock file found (${LOCK_AGE} minutes old), removing..."
        rm -f /tmp/omakase.lock
        echo "   ✓ Lock file removed"
        ((FIXED++))
    else
        echo "   ✓ Lock file OK (active session)"
        ((SKIPPED++))
    fi
else
    echo "   ℹ️  No lock files"
    ((SKIPPED++))
fi

# Fix 3: Rebuild if dist missing
echo ""
echo "Checking build artifacts..."
if [ ! -d dist ] || [ ! -f dist/cli.js ]; then
    echo "⚠️  Build artifacts missing, rebuilding..."
    bun run build
    echo "   ✓ Build complete"
    ((FIXED++))
else
    echo "   ✓ Build OK"
    ((SKIPPED++))
fi

# Fix 4: Clean node_modules if corrupted
echo ""
echo "Checking dependencies..."
if [ -d node_modules ] && [ ! -f node_modules/.bun ]; then
    echo "⚠️  Dependencies may be corrupted, reinstalling..."
    rm -rf node_modules
    bun install
    echo "   ✓ Dependencies reinstalled"
    ((FIXED++))
else
    echo "   ✓ Dependencies OK"
    ((SKIPPED++))
fi

# Fix 5: Update stale type definitions
echo ""
echo "Checking type definitions..."
if bun run typecheck 2>&1 | grep -q "Cannot find module"; then
    echo "⚠️  Type definitions outdated, updating..."
    bun install --frozen-lockfile=false
    echo "   ✓ Types updated"
    ((FIXED++))
else
    echo "   ✓ Types OK"
    ((SKIPPED++))
fi

# Summary
echo ""
echo "=============================="
echo "📊 Fix Summary"
echo "=============================="
echo "   Fixed: $FIXED"
echo "   Skipped: $SKIPPED"
echo ""

if [ $FIXED -gt 0 ]; then
    echo "✅ Common issues fixed!"
    echo ""
    echo "Try running omakase again:"
    echo "   omakase --help"
else
    echo "ℹ️  No issues found, system healthy"
fi

exit 0
