# Omakase

AI coding assistant CLI — terinspirasi dari arsitektur Claude Code, tapi dibangun dari nol sebagai sistem independen dengan multi-provider, multi-agent, dan scheduler.

## Nama

**Omakase** (お任せ) = "Saya serahkan ke Anda" — konsep Jepang dimana chef memilihkan menu terbaik untuk customer.

## Arsitektur

```
User Input → CLI Parser → QueryEngine → LLM Provider → Tool Loop → Terminal UI (Ink)
                                    ↓
                            Runtime Context
                                    ↓
                    ┌───────────────┼───────────────┐
                    ↓               ↓               ↓
              AgentRegistry    Chronos       Coordinator
                    ↓               ↓               ↓
                  Agents      Scheduled Tasks   Multi-Agent
                                                    Orchestration
```

### Komponen Utama

| Komponen | Lokasi | Deskripsi |
|----------|--------|-----------|
| CLI Entrypoint | `src/entrypoints/cli.tsx` | Commander.js parser + Ink renderer |
| QueryEngine | `src/core/engine/engine.ts` | Core engine: streaming, tool loops, retry |
| Tool System | `src/core/tools/` | 9 tools (Bash, FileRead, FileWrite, Glob, Grep, TodoWrite, AskUser, Config, Memory) |
| Command System | `src/commands/` | Slash commands (/help, /agents, /chronos, /config, /memory, /plugin) |
| State Management | `src/core/state/AppStateStore.ts` | EventEmitter-based global state |
| LLM Providers | `src/core/providers/` | 4 providers: Anthropic, OpenAI, Ollama, NVIDIA NIM |
| Config System | `src/core/services/config/` | omakase.json dengan Zod validation |
| Memory System | `src/core/services/memory/` | OMAKASE.md persistent memory |
| Plugin System | `src/core/services/plugins/` | Install/uninstall/load plugins |
| **Multi-Agent** | `src/core/agents/` | Agent, AgentRegistry, 4 roles |
| **Coordinator** | `src/core/coordinator/` | Multi-agent orchestration (sequential/parallel/adaptive) |
| **Chronos** | `src/core/chronos/` | Background task scheduler (once/interval/delayed/cron) |
| **Runtime** | `src/core/runtime/` | Shared singletons untuk agents/chronos/coordinator |

## Install

```bash
# Install dependencies
bun install

# Set API key (pilih salah satu)
export ANTHROPIC_API_KEY="sk-ant-..."
export OPENAI_API_KEY="sk-..."
export NVIDIA_API_KEY="nvapi-..."

# Run
bun run src/entrypoints/cli.tsx

# Dev mode (watch)
bun run dev

# Type check
bun run typecheck
```

## Providers

| Provider | API Key | Model Default | Endpoint |
|----------|---------|---------------|----------|
| anthropic | `ANTHROPIC_API_KEY` | claude-sonnet-4-20250514 | - |
| openai | `OPENAI_API_KEY` | gpt-4-turbo | - |
| ollama | - | llama3 | http://localhost:11434 |
| nvidia | `NVIDIA_API_KEY` | nvidia/llama-3.1-nemotron-70b-instruct | https://integrate.api.nvidia.com/v1 |

Usage:
```bash
omakase -p openai -m gpt-4
omakase -p ollama --endpoint http://localhost:11434
omakase -p nvidia -m nvidia/llama-3.1-nemotron-70b-instruct
```

## Tools

| Tool | Deskripsi |
|------|-----------|
| `Bash` | Execute shell commands |
| `FileRead` | Read file contents |
| `FileWrite` | Create/overwrite files |
| `Glob` | Find files by glob pattern |
| `Grep` | Search content with ripgrep |
| `TodoWrite` | Manage todo list |
| `AskUser` | Prompt user for input |
| `Config` | Read/modify configuration |
| `Memory` | Manage persistent memory |

## Commands

| Command | Deskripsi |
|---------|-----------|
| `/help` | Show available commands |
| `/exit` | Exit Omakase |
| `/clear` | Clear conversation history |
| `/config` | View/edit configuration |
| `/memory` | Manage memory |
| `/plugin` | Manage plugins |
| `/agents` | Manage multi-agent system |
| `/chronos` | Manage scheduled tasks |

### Multi-Agent Commands

```bash
/agents list                              # List registered agents
/agents register <name> <role>            # Register agent (roles: coordinator, worker, specialist, reviewer)
/agents unregister <name>                 # Remove agent
/agents run <task>                        # Run task via coordinator
```

### Chronos Commands

```bash
/chronos list                             # List scheduled tasks
/chronos schedule <name> <type> [ms]      # Schedule task (types: once, interval, delayed, cron)
/chronos cancel <task-id-or-name>         # Cancel task
```

## Multi-Agent System

Omakase mendukung multi-agent orchestration dengan 4 role:

- **coordinator**: Memecah task kompleks dan delegate ke specialist
- **worker**: Eksekusi task yang diberikan
- **specialist**: Domain expertise untuk masalah spesifik
- **reviewer**: Evaluasi kualitas output

Coordinator mendukung 3 strategi eksekusi:
- **sequential**: Step dijalankan satu per satu
- **parallel**: Semua step dijalankan bersamaan
- **adaptive**: Parallel dengan dependency resolution

## Chronos Scheduler

Background task scheduler dengan 4 tipe:
- **once**: Eksekusi satu kali setelah delay
- **interval**: Eksekusi berulang dengan interval
- **delayed**: Eksekusi setelah delay tertentu
- **cron**: Eksekusi berdasarkan cron expression (planned)

## Configuration

File: `omakase.json`

```json
{
  "provider": "anthropic",
  "model": "claude-sonnet-4-20250514",
  "maxTokens": 8192,
  "temperature": 0.7,
  "theme": "dark",
  "permissionMode": "default",
  "memory": {
    "enabled": true,
    "file": "OMAKASE.md"
  }
}
```

## Memory

Omakase menggunakan file `OMAKASE.md` untuk persistent memory:

```markdown
- [FACT] Project ini menggunakan Bun runtime
- [PREFERENCE] Selalu gunakan TypeScript strict mode
- [CONVENTION] File extension .ts untuk semua files
```

## Plugins

Plugin structure:

```
.omakase/plugins/my-plugin/
├── plugin.json
└── index.js
```

`plugin.json`:
```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "My custom plugin",
  "main": "index.js",
  "tools": ["MyCustomTool"],
  "commands": ["/mycmd"]
}
```

Install plugin:
```bash
/plugin install my-plugin npm:my-plugin-package
/plugin install my-plugin git:https://github.com/user/plugin.git
/plugin install my-plugin file:./local-plugin
```

## Perbedaan dengan Claude Code

| Aspek | Claude Code | Omakase |
|-------|-------------|---------|
| Runtime | Bun (internal) | Bun (public) |
| Size | ~100K lines | ~2K lines |
| Complexity | Production full-featured | Minimal viable |
| LLM | Anthropic only | Multi-provider (4) |
| UI | 140+ components | Single App component |
| Tools | ~40 tools | 9 tools |
| Commands | ~85 commands | 8 commands |
| Multi-Agent | Yes | Yes (Coordinator) |
| Scheduler | Yes | Yes (Chronos) |
| Feature Flags | Many (BRIDGE_MODE, dll) | None |
| Bridge/IDE | Yes | No (TODO) |
| MCP | Yes | No (TODO) |

## Roadmap

- [x] OpenAI provider
- [x] Ollama provider (local LLM)
- [x] NVIDIA NIM provider
- [x] Multi-agent system (Agent, Registry, Coordinator)
- [x] Chronos scheduler (once, interval, delayed)
- [x] Plugin manager (install/uninstall/load)
- [x] Cron expression parser untuk Chronos
- [ ] MCP client
- [ ] IDE bridge (VS Code extension)
- [ ] More tools (LSP, WebFetch, WebSearch)
- [ ] Plan mode
- [ ] Voice input
- [ ] Better UI components
- [ ] Cron expression parser untuk Chronos

## Contributing

Lihat [CONTRIBUTING.md](CONTRIBUTING.md) untuk development setup dan guidelines.

Untuk plugin development, lihat [examples/README.md](examples/README.md).

## License

Dual licensed under [Apache 2.0](LICENSE) or [MIT](LICENSE-MIT) — choose whichever fits your needs.
