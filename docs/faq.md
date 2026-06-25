# Frequently Asked Questions

Common questions about Omakase.

## General

### What is Omakase?
Omakase is an AI coding assistant CLI inspired by Claude Code's architecture, but built from scratch as an independent system with multi-provider support, multi-agent orchestration, and background task scheduling.

### How is it different from Claude Code?
- **Multi-provider**: Supports Anthropic, OpenAI, Ollama, and Nvidia (not just Anthropic)
- **Open source**: Fully open development, community-driven
- **Local-first**: Can run entirely locally with Ollama
- **Scheduler**: Built-in cron-like task scheduler (Chronos)
- **Multi-agent**: Coordinate multiple AI agents with different roles

### Is it free?
Yes! Omakase is dual-licensed under Apache 2.0 or MIT. You only pay for LLM API usage (or nothing if using local models).

## Installation

### Do I need Bun?
Yes, Omakase runs on Bun for performance. Install from https://bun.sh

```bash
curl -fsSL https://bun.sh/install | bash
```

### Can I use it with Node.js?
Currently no. Bun provides 2-3x performance improvement and is required.

### How do I uninstall?
```bash
# Remove binary
rm ~/.local/bin/omakase

# Remove config
rm -rf ~/.config/omakase

# Remove from PATH (edit ~/.bashrc or ~/.zshrc)
```

## Configuration

### How do I switch providers?
```bash
omakase config set provider openai
export OPENAI_API_KEY=sk-...
```

Or edit `~/.omakase/omakase.json`:
```json
{
  "provider": "openai"
}
```

### Can I use multiple providers?
Yes! Configure fallback:
```json
{
  "provider": "anthropic",
  "fallbackProviders": ["openai", "ollama"]
}
```

Omakase will automatically failover if the primary provider fails.

### How do I disable health checks?
```json
{
  "healthCheck": {
    "enabled": false
  }
}
```

Not recommended for production use.

## Usage

### How do I stop a running task?
Press `Ctrl+C` to interrupt the current operation.

### Can Omakase delete files?
Yes, but it will ask for permission first. You can block destructive operations in config:
```json
{
  "dangerousCommands": "block"
}
```

### Does it work offline?
Yes, with Ollama:
```json
{
  "provider": "ollama",
  "ollamaEndpoint": "http://localhost:11434"
}
```

Install Ollama: https://ollama.ai

### How do I see what Omakase is doing?
Check the logs:
```bash
tail -f ~/.omakase/omakase.log
```

Or run with verbose mode:
```bash
omakase --verbose
```

## Multi-Agent

### What are agent roles?
- **explorer**: Investigates codebase, answers questions
- **task**: Implements features, fixes bugs
- **reviewer**: Reviews code for quality and security
- **oracle**: Provides architecture advice

### How do I use multiple agents?
```bash
omakase /agents parallel "Review the auth module"
```

Or in a session:
```
/use-agent reviewer
Review this code for security vulnerabilities
```

### Can agents work together?
Yes! The Coordinator can run agents in:
- **Sequential**: One after another
- **Parallel**: All at once
- **Adaptive**: Dynamic based on task

## Chronos (Scheduler)

### How do I schedule a task?
```bash
omakase /chronos run --cron "0 2 * * *" --command "backup.sh"
```

### Where are tasks stored?
In `~/.omakase/chronos.json`

### Do tasks survive restarts?
Currently no. Tasks are in-memory only. Persistence is planned for v0.3.0.

### Can I edit scheduled tasks?
```bash
# View
omakase /chronos list

# Cancel
omakase /chronos cancel <task-id>

# Edit config file directly
```

## Plugins

### How do I create a plugin?
See [Plugin Development Guide](plugins.md)

Minimal example:
```javascript
export default {
  name: "hello",
  commands: {
    hello: () => console.log("Hello from plugin!")
  }
}
```

### Are plugins safe?
Plugins run with the same permissions as Omakase. Only install from trusted sources.

### Where can I find plugins?
- npm (search `omakase-plugin`)
- GitHub (topic `omakase-plugin`)
- [examples/plugin-hello](../examples/plugin-hello/)

## Troubleshooting

### "Module not found"
```bash
bun install
```

### "Permission denied"
```bash
chmod +x ~/.local/bin/omakase
```

### "API key invalid"
Check your key:
```bash
echo $ANTHROPIC_API_KEY
```

Regenerate if needed from provider dashboard.

### Slow response times
- Use a closer region endpoint
- Switch to a faster model (e.g., `claude-3-haiku`)
- Use local Ollama for development

### High memory usage
- Reduce `maxConcurrent` agents
- Increase health check interval
- Restart if running for extended periods

## Development

### How do I contribute?
See [CONTRIBUTING.md](../CONTRIBUTING.md)

### How do I run tests?
```bash
bun test
```

### How do I build?
```bash
bun install
bun run build
```

### Where's the source code?
https://github.com/miruamel/omakase

## Security

### Is my code sent to LLM providers?
Yes, when using cloud providers (Anthropic, OpenAI, Nvidia). For local processing, use Ollama.

### Are API keys stored securely?
Keys are stored in environment variables or config file (`~/.omakase/omakase.json`). Use environment variables for better security.

### Can Omakase execute arbitrary code?
Yes, via the Bash tool. Always review proposed commands before approving.

## Billing

### How much does it cost to run?
Depends on usage:
- **Anthropic**: ~$0.01-0.10 per typical session
- **OpenAI**: ~$0.01-0.10 per typical session
- **Ollama**: Free (local)

Check your provider dashboard for exact costs.

### How do I track costs?
```bash
omakase /cost
```

Shows token usage and estimated cost for current session.

## Still Have Questions?

- 📚 Browse [Documentation](index.md)
- 💬 Ask in [Discussions](https://github.com/miruamel/omakase/discussions)
- 🐛 Report issues [GitHub Issues](https://github.com/miruamel/omakase/issues)
- 📧 Contact: [your-email@example.com](mailto:your-email@example.com)
