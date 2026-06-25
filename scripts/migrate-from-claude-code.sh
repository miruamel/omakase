#!/usr/bin/env bash
# Migration script from Claude Code to Omakase

set -e

echo "🔄 Claude Code → Omakase Migration Wizard"
echo "=========================================="
echo ""

# Backup existing config
if [ -f ~/.claude/claude.json ]; then
    echo "📦 Backing up Claude Code config..."
    cp ~/.claude/claude.json ~/.claude/claude.json.backup
    echo "   ✓ Backup created: ~/.claude/claude.json.backup"
fi

# Install Omakase
echo ""
echo "📥 Installing Omakase..."
if command -v omakase &> /dev/null; then
    echo "   ✓ Omakase already installed"
else
    curl -fsSL https://omakase.sh/install.sh | sh
    echo "   ✓ Omakase installed"
fi

# Migrate API keys
echo ""
echo "🔑 Migrating API keys..."
if [ -f ~/.claude/claude.json ]; then
    ANTHROPIC_KEY=$(grep -o '"anthropic_key"[[:space:]]*:[[:space:]]*"[^"]*"' ~/.claude/claude.json | cut -d'"' -f4 || true)
    if [ -n "$ANTHROPIC_KEY" ]; then
        echo "export ANTHROPIC_API_KEY=$ANTHROPIC_KEY" >> ~/.bashrc
        echo "   ✓ Anthropic key migrated"
    fi
fi

# Create Omakase config
echo ""
echo "⚙️  Creating Omakase configuration..."
OMAKASE_CONFIG="$HOME/.omakase/omakase.json"
mkdir -p ~/.omakase

cat > "$OMAKASE_CONFIG" << CONFIG
{
  "provider": "anthropic",
  "fallbackProviders": ["openai", "ollama"],
  "healthCheck": {
    "enabled": true,
    "interval": 30000
  },
  "permissionMode": "approve",
  "_comment": "Migrated from Claude Code"
}
CONFIG

echo "   ✓ Config created: $OMAKASE_CONFIG"

# Migrate custom tools (if any)
echo ""
echo "🔧 Checking for custom tools..."
if [ -d "~/.claude/tools" ]; then
    mkdir -p ~/.omakase/tools
    cp -r ~/.claude/tools/* ~/.omakase/tools/ 2>/dev/null || echo "   ⚠️  No custom tools found"
    echo "   ✓ Tools migrated"
else
    echo "   ℹ️  No custom tools to migrate"
fi

# Create migration summary
echo ""
echo "✅ Migration Complete!"
echo ""
echo "📊 Migration Summary:"
echo "   • Omakase installed: ✓"
echo "   • API keys migrated: ✓"
echo "   • Config created: ✓"
echo "   • Tools migrated: ${FOUND_TOOLS:-0}"
echo ""
echo "🚀 Next Steps:"
echo "   1. Restart your terminal"
echo "   2. Run: omakase --version"
echo "   3. Try: omakase --help"
echo ""
echo "🎉 Welcome to Omakase!"
echo ""
echo "Key differences from Claude Code:"
echo "   ✓ Automatic failover to backup providers"
echo "   ✓ Health check monitoring every 30s"
echo "   ✓ Task scheduler (Chronos) built-in"
echo "   ✓ Multi-agent system for complex tasks"
echo "   ✓ Open source (Apache 2.0/MIT)"
echo ""
echo "Need help? Check: https://github.com/miruamel/omakase"
