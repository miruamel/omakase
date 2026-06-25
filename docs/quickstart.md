<file path="docs/quickstart.md">
# Quick Start Guide

Get up and running with Omakase in 5 minutes.

## 1. Install

### Linux/macOS
```bash
curl -fsSL https://omakase.sh/install.sh | sh
```

### Windows (PowerShell)
```powershell
iwr -useb https://omakase.sh/install.ps1 | iex
```

### From Source
```bash
git clone https://github.com/miruamel/omakase.git
cd omakase
bun install
bun run build
```

## 2. Configure

### Set API Key
```bash
# Anthropic (recommended)
export ANTHROPIC_API_KEY=sk-ant-...

# Or OpenAI
export OPENAI_API_KEY=sk-...

# Or local Ollama (no API key needed)
# ollama pull llama2
# ollama serve
```

### Initialize Config
```bash
omakase config init
```

## 3. First Session

```bash
omakase
```

### Try Basic Commands

```
/help          # Show all commands
/version       # Check version
/agents        # List available agents
/config        # View configuration
```

### Ask Omakase to Do Something

```
Create a Python script that reads a CSV and prints the first 10 rows
```

Omakase will:
1. Understand your request
2. Create the file
3. Show you the result
4. Ask for permission before writing

## 4. Use Tools

### Read a File
```
ReadFile path="./src/main.py"
```

### Run a Command
```
Bash command="ls -la"
```

### Search Code
```
Grep pattern="function.*test" path="./src"
```

### Manage Tasks
```
TodoWrite todos=[{"content": "Fix bug", "status": "in_progress"}]
```

## 5. Multi-Agent Mode

For complex tasks, use multiple agents:

```bash
omakase /agents review ./src
```

Available roles:
- **explorer** - Investigate codebase
- **task** - Implement features
- **reviewer** - Code review
- **oracle** - Architecture advice

## 6. Schedule Tasks

### One-Time Task
```bash
omakase /chronos run --delay 60 --command "backup.sh"
```

### Recurring Task
```bash
omakase /chronos run --cron "0 2 * * *" --command "daily-backup.sh"
```

### View Scheduled Tasks
```bash
omakase /chronos list
```

## 7. Plugins

### Install a Plugin
```bash
omakase /plugin install npm:@scope/plugin-name
```

### Load a Plugin
```bash
omakase /plugin load ./my-plugin.js
```

### List Plugins
```bash
omakase /plugin list
```

## Common Workflows

### Code Review
```bash
# Start session
omakase

# Request review
/review ./src/components
```

### Refactor
```
Refactor the database layer to use connection pooling
```

### Debug
```
/debug Why is the test failing in auth.test.ts?
```

### Generate Code
```
Create a REST API endpoint for user registration with validation
```

## Tips for Best Results

1. **Be Specific**
   - ✅ "Create a React component with TypeScript props"
   - ❌ "Make a component"

2. **Provide Context**
   ```
   In the existing auth.py file, add a logout function that clears the session
   ```

3. **Review Before Approving**
   - Always check file changes before approving writes
   - Use `/config` to set `permissionMode: "approve"` for safety

4. **Use Agents Wisely**
   - **explorer**: "Find all uses of User model"
   - **task**: "Implement the login feature"
   - **reviewer**: "Review this PR for security issues"
   - **oracle**: "How should I structure this microservice?"

5. **Leverage Memory**
   ```
   /memory save "Project uses PostgreSQL and Redis"
   /memory recall "What database do we use?"
   ```

## Troubleshooting

### "Provider connection failed"
```bash
# Check API key
echo $ANTHROPIC_API_KEY

# Test connectivity
curl -I https://api.anthropic.com
```

### "Permission denied"
Press `y` when prompted, or set in config:
```json
{ "permissionMode": "auto" }
```

### Slow Performance
```json
{
  "provider": "ollama",
  "ollamaEndpoint": "http://localhost:11434"
}
```

## Next Steps

- 📚 [Full Documentation](index.md)
- 🛠️ [Configuration Guide](configuration.md)
- 🤖 [Multi-Agent Guide](multi-agent.md)
- ⏰ [Chronos Scheduler](chronos.md)
- 🔧 [API Reference](api-overview.md)

---

**Need Help?** Check [Support Guide](../.github/SUPPORT.md)
