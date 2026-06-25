#!/usr/bin/env bash
# Display project statistics

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║           Omakase Project Statistics                      ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

echo "📊 Code Metrics"
echo "────────────────────────────────────────────────────────"
printf "  %-35s %s\n" "Source files (TS/TSX):" "$(find src -type f \( -name '*.ts' -o -name '*.tsx' \) | wc -l | tr -d ' ')"
printf "  %-35s %s\n" "Test files:" "$(find src -type f -name '*.test.ts' | wc -l | tr -d ' ')"
printf "  %-35s %s\n" "Documentation files:" "$(find docs -type f -name '*.md' | wc -l | tr -d ' ')"
printf "  %-35s %s\n" "Total lines of code:" "$(find src -type f \( -name '*.ts' -o -name '*.tsx' \) -exec wc -l {} + | tail -1 | awk '{print $1}')"
echo ""

echo "🧪 Test Coverage"
echo "────────────────────────────────────────────────────────"
TEST_RESULT=$(bun test 2>&1 | tail -5)
TEST_PASS=$(echo "$TEST_RESULT" | grep -oP '\d+(?= pass)')
TEST_FAIL=$(echo "$TEST_RESULT" | grep -oP '\d+(?= fail)')
printf "  %-35s %s\n" "Passing tests:" "${TEST_PASS:-0} ✅"
printf "  %-35s %s\n" "Failing tests:" "${TEST_FAIL:-0} ${TEST_FAIL:-0 == 0 && '✅' || '❌'}"
echo ""

echo "🔧 Features"
echo "────────────────────────────────────────────────────────"
echo "  ✓ Multi-provider LLM support (4 providers)"
echo "  ✓ Circuit breaker pattern"
echo "  ✓ Automatic failover"
echo "  ✓ Health check polling"
echo "  ✓ Multi-agent orchestration"
echo "  ✓ Chronos scheduler"
echo "  ✓ Plugin system"
echo "  ✓ Memory management"
echo ""

echo "📦 Dependencies"
echo "────────────────────────────────────────────────────────"
printf "  %-35s %s\n" "Total dependencies:" "$(cat package.json | grep -A 100 '"dependencies"' | grep -c '"@')"
printf "  %-35s %s\n" "Dev dependencies:" "$(cat package.json | grep -A 100 '"devDependencies"' | grep -c '"@')"
echo ""

echo "🚀 Git Activity"
echo "────────────────────────────────────────────────────────"
printf "  %-35s %s\n" "Total commits:" "$(git rev-list --count HEAD)"
printf "  %-35s %s\n" "Commits this week:" "$(git rev-list --count HEAD --since='1 week ago')"
printf "  %-35s %s\n" "Last commit:" "$(git log -1 --pretty=format:'%cr')"
echo ""

echo "📄 License"
echo "────────────────────────────────────────────────────────"
echo "  Apache 2.0 OR MIT (dual licensed)"
echo ""

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║        Built with ❤️  using Bun + TypeScript              ║"
echo "╚═══════════════════════════════════════════════════════════╝"
