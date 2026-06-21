# Changelog

All notable changes to Omakase will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Multi-agent system: Agent, AgentRegistry, Coordinator (sequential/parallel/adaptive)
- Chronos scheduler: once, interval, delayed, cron tasks
- Runtime context: shared singletons for agents/chronos/coordinator
- 4 LLM providers: Anthropic, OpenAI, Ollama, NVIDIA NIM
- 9 tools: Bash, FileRead, FileWrite, Glob, Grep, TodoWrite, AskUser, Config, Memory
- 8 commands: /help, /agents, /chronos, /clear, /config, /exit, /memory, /plugin
- Plugin manager: install/uninstall/load from npm/git/local
- 41 tests for Chronos, Agent, AgentRegistry, Runtime, PluginManager, ConfigManager
- GitHub Actions CI workflow (typecheck, test, build)
- JSDoc on all source files with @module tags

### Changed
- Refactored type structure: removed duplicate types, consolidated to single source of truth
- Updated README with multi-agent + chronos architecture diagram

### Fixed
- Ollama token usage: inputTokens now uses prompt_eval_count (was eval_count)
- ConfigManager.load: now throws on invalid JSON (was silently returning defaults)
- Removed empty internal/ directories (60+ dirs)
- Removed broken {manager}, {bash} directories with literal braces
- Fixed broken .js imports in core/utils/index.ts
- Added @types/bun for Bun.spawn type support
- Removed misleading anthropic/interface.ts (was throwing 'Not implemented')
- Removed unused useEffect import in App.tsx

### Security
- Plugin manager validates source format before execution
- Bash tool has dangerous command detection (rm -rf, sudo, dd, mkfs, etc.)
- FileWrite tool blocks writes to /etc/, /proc/, /sys/

## [0.0.1] - 2026-06-20

### Added
- Initial release
- Basic CLI with Commander.js
- Ink-based terminal UI
- Anthropic provider
- Basic tool system
- Memory system (OMAKASE.md)
- Plugin system skeleton
