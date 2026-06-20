# Omakase

AI coding assistant CLI — terinspirasi dari arsitektur Claude Code, tapi dibangun dari nol sebagai sistem independen.

## Nama

**Omakase** (お任せ) = "Saya serahkan ke Anda" — konsep Jepang dimana chef memilihkan menu terbaik untuk customer.

## Arsitektur

```
User Input → CLI Parser → QueryEngine → LLM Provider → Tool Loop → Terminal UI (Ink)
```

### Komponen Utama

| Komponen | Lokasi | Deskripsi |
|----------|--------|-----------|
| CLI Entrypoint | `src/entrypoints/cli.tsx` | Commander.js parser + Ink renderer |
| QueryEngine | `src/QueryEngine.ts` | Core engine: streaming, tool loops, retry |
| Tool System | `src/tools/` | ~10 tools (Bash, FileRead, FileWrite, Glob, Grep, dll) |
| Command System | `src/commands/` | Slash commands (/help, /config, /memory, /plugin) |
| State Management | `src/state/AppStateStore.ts` | EventEmitter-based global state |
| LLM Providers | `src/services/llm/providers.ts` | Abstract interface (Anthropic, OpenAI, Ollama, NVIDIA) |
| Config System | `src/services/config/` | omakase.json dengan Zod validation |
| Memory System | `src/services/memory/` | OMAKASE.md persistent memory |
| Plugin System | `src/services/plugins/` | Extensibility via plugins |

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

# Global install (setelah build)
bun build src/entrypoints/cli.tsx --outdir ./dist
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
| `/tools` | List available tools |
| `/status` | Show session status |
| `/config` | View/edit configuration |
| `/memory` | Manage memory |
| `/plugin` | Manage plugins |

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

## Perbedaan dengan Claude Code

| Aspek | Claude Code | Omakase |
|-------|-------------|---------|
| Runtime | Bun (internal) | Bun (public) |
| Size | ~100K lines | ~2K lines |
| Complexity | Production full-featured | Minimal viable |
| LLM | Anthropic only | Multi-provider (abstract) |
| UI | 140+ components | Single App component |
| Tools | ~40 tools | ~10 tools |
| Commands | ~85 commands | ~8 commands |
| Feature Flags | Many (BRIDGE_MODE, dll) | None |
| Bridge/IDE | Yes | No (TODO) |
| MCP | Yes | No (TODO) |

## Roadmap

- [x] OpenAI provider
- [x] Ollama provider (local LLM)
- [x] NVIDIA NIM provider
- [ ] MCP client
- [ ] IDE bridge (VS Code extension)
- [ ] More tools (LSP, WebFetch, WebSearch)
- [ ] Plan mode
- [ ] Multi-agent (Coordinator)
- [ ] Voice input
- [ ] Better UI components

## License

MIT