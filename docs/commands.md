# Commands

Omakase menyediakan 8 slash commands.

## /help

Show help text.

```bash
omakase /help
```

## /agents

Manage agents.

```bash
# List semua agents
omakase /agents list

# Register agent
omakase /agents register <name> --role <role> --description <desc>

# Unregister agent
omakase /agents unregister <name>

# Run agent
omakase /agents run <name> <task>
```

## /chronos

Manage scheduled tasks.

```bash
# List semua tasks
omakase /chronos list

# Schedule task
omakase /chronos schedule --name <name> --type <type> [options]

# Cancel task
omakase /chronos cancel <id>
```

Task types: `once`, `interval`, `delayed`, `cron`

## /clear

Clear screen.

```bash
omakase /clear
```

## /config

Manage configuration.

```bash
# Show config
omakase /config show

# Set value
omakase /config set <key> <value>

# Reset to default
omakase /config reset
```

## /exit

Exit Omakase.

```bash
omakase /exit
```

## /memory

Manage persistent memory.

```bash
# Read memory
omakase /memory read

# Write memory
omakase /memory write <content>

# Append memory
omakase /memory append <content>
```

## /plugin

Manage plugins.

```bash
# List plugins
omakase /plugin list

# Install plugin
omakase /plugin install <name> <source>

# Uninstall plugin
omakase /plugin uninstall <name>
```

## /tools

List available tools.

```bash
omakase /tools
```

## Next Steps

- [API Reference](api/core.md)
