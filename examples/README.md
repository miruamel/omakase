# Omakase Examples

This directory contains example configurations, plugins, and usage patterns for Omakase.

## Getting Started

### 1. Basic Setup
```bash
# Install Omakase
curl -fsSL https://omakase.sh/install.sh | sh

# Initialize project
omakase init

# Configure providers
omakase config set provider anthropic
export ANTHROPIC_API_KEY=your_key_here
```

### 2. First Commands
```bash
# Start interactive session
omakase

# Try built-in commands
/help          # Show available commands
/agents        # List multi-agent roles
/chronos       # View scheduled tasks
/config        # View/edit configuration
```

### 3. Using Tools
```bash
# In session, try:
# Read a file
ReadFile path="./src/main.ts"

# Execute bash command
Bash command="ls -la"

# Write a file
FileWrite path="./test.txt" content="Hello Omakase!"
```

## Examples by Category

### Multi-Agent Orchestration
- [`multi-agent/sequential/`](multi-agent/sequential/) - Run agents in sequence
- [`multi-agent/parallel/`](multi-agent/parallel/) - Run agents in parallel
- [`multi-agent/adaptive/`](multi-agent/adaptive/) - Dynamic agent coordination

### Scheduled Tasks (Chronos)
- [`chronos/daily-backup.cron`](chronos/daily-backup.cron) - Daily backup example
- [`chronos/hourly-check.cron`](chronos/hourly-check.cron) - Hourly health check

### Plugins
- [`plugin-hello/`](plugin-hello/) - Minimal "Hello World" plugin
- [`plugin-custom-tool/`](plugin-custom-tool/) - Add custom tools

### Provider Configurations
- [`providers/multi-provider.json`](providers/multi-provider.json) - Setup multiple providers
- [`providers/local-ollama.json`](providers/local-ollama.json) - Local LLM with Ollama

## Best Practices

### 1. Provider Failover
Configure multiple providers for reliability:
```json
{
  "provider": "anthropic",
  "fallbackProviders": ["openai", "ollama"]
}
```

### 2. Permission Management
Use appropriate permission modes:
```json
{
  "permissionMode": "auto"     // Auto-approve safe operations
  // or
  "permissionMode": "approve"  // Ask for each operation
}
```

### 3. Memory Usage
Leverage persistent memory:
```bash
# In session
/memory save "Project context: Building React app with TypeScript"
/memory recall "What's the project about?"
```

### 4. Agent Roles
Choose the right agent for the task:
- `explorer` - Codebase investigation
- `task` - Multi-step implementation
- `reviewer` - Code review and analysis
- `oracle` - Architecture and debugging

## Troubleshooting

### Common Issues

**Provider Connection Failed**
```bash
# Verify API key
echo $ANTHROPIC_API_KEY

# Test connectivity
curl -I https://api.anthropic.com
```

**Health Check Warnings**
```json
// Increase health check interval
{
  "healthCheckInterval": 60000  // 60 seconds
}
```

**Tool Permission Denied**
- Press `y` when prompted
- Or set `permissionMode: "auto"` in config

## Contributing Examples

Want to share your example? [Submit a PR](../.github/pull_request_template.md)!

Guidelines:
1. Include README.md explaining the example
2. Add comments in configuration files
3. Test with latest Omakase version
4. Follow project code style

---

**More examples coming soon!** 🚀
