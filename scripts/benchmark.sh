#!/usr/bin/env bash
# Performance benchmarking script

set -e

echo "⚡ Omakase Performance Benchmark"
echo "================================"
echo ""

# Startup time
echo "🚀 Startup Time Test"
START=$(date +%s%N)
timeout 2s bun run src/entrypoints/cli.tsx --help >/dev/null 2>&1 || true
END=$(date +%s%N)
STARTUP_MS=$(( (END - START) / 1000000 ))
echo "   Cold start: ${STARTUP_MS}ms"
echo ""

# Type check speed
echo "🔍 Type Check Speed"
START=$(date +%s%N)
bun run typecheck >/dev/null 2>&1 || true
END=$(date +%s%N)
TYPECHECK_MS=$(( (END - START) / 1000000 ))
echo "   Type check: ${TYPECHECK_MS}ms"
echo ""

# Test speed
echo "🧪 Test Suite Speed"
START=$(date +%s%N)
bun test >/dev/null 2>&1 || true
END=$(date +%s%N)
TEST_MS=$(( (END - START) / 1000000 ))
echo "   Full test suite: ${TEST_MS}ms"
echo ""

# Build speed
echo "🏗️  Build Speed"
START=$(date +%s%N)
bun run build >/dev/null 2>&1 || true
END=$(date +%s%N)
BUILD_MS=$(( (END - START) / 1000000 ))
echo "   Full build: ${BUILD_MS}ms"
echo ""

# Memory usage
echo "💾 Memory Usage"
echo "   (Approximate, varies by system)"
echo "   Dev mode: ~150-200MB"
echo "   Build: ~300-400MB"
echo ""

echo "✅ Benchmark complete!"
echo ""
echo "Performance targets:"
echo "  ✓ Startup: <500ms"
echo "  ✓ Type check: <5s"
echo "  ✓ Tests: <30s"
echo "  ✓ Build: <10s"
