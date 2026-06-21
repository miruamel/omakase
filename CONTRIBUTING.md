# Contributing to Omakase

Terima kasih sudah tertarik untuk contribute ke Omakase! 🎉

## Development Setup

### Prerequisites

- [Bun](https://bun.sh) >= 1.3.0
- Git

### Setup

```bash
# Clone repository
git clone https://github.com/miruamel/omakase.git
cd omakase

# Install dependencies
bun install

# Run tests
bun test

# Run typecheck
bun run typecheck

# Run CLI in dev mode
bun run dev
```

## Project Structure

```
src/
├── entrypoints/        # CLI entry points
├── commands/           # Slash commands (/help, /agents, etc.)
├── core/
│   ├── agents/         # Multi-agent system
│   ├── chronos/        # Task scheduler
│   ├── coordinator/    # Multi-agent orchestration
│   ├── engine/         # QueryEngine (LLM queries)
│   ├── providers/      # LLM providers (Anthropic, OpenAI, Ollama, NVIDIA)
│   ├── runtime/        # Runtime context (singletons)
│   ├── services/       # Config, memory, plugins, logger
│   ├── state/          # AppStateStore
│   ├── tools/          # Built-in tools
│   └── ui/             # Ink UI components
└── types/              # TypeScript type definitions
```

## Coding Standards

### TypeScript

- Strict mode enabled
- All files harus punya JSDoc dengan `@module` tag
- Prefer `type` over `interface` untuk type aliases
- Use `import type` untuk type-only imports

### Testing

- All new features harus ada tests
- Test files: `*.test.ts` di sebelah source file
- Run tests: `bun test`
- Coverage target: 80%+ untuk core modules

### Commits

- Conventional commits format
- Examples:
  - `feat: add new tool`
  - `fix: handle null in config`
  - `docs: update README`
  - `test: add tests for coordinator`
  - `refactor: simplify error handling`

### Pull Requests

1. Fork repository
2. Create feature branch (`git checkout -b feat/my-feature`)
3. Make changes + add tests
4. Run `bun run typecheck` dan `bun test`
5. Commit dengan conventional format
6. Push ke fork
7. Open PR ke `main`

## Plugin Development

Lihat [examples/README.md](examples/README.md) untuk plugin development guide.

## Release Process

1. Update version di `package.json` (semantic versioning)
2. Update `CHANGELOG.md` dengan release notes
3. Commit: `Release X.Y.Z: <description>`
4. Tag: `git tag vX.Y.Z`
5. Push: `git push origin main --tags`

## Questions?

Open an issue di [GitHub](https://github.com/miruamel/omakase/issues).
