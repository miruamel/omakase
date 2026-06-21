# Multi-Agent System

Omakase mendukung multi-agent orchestration untuk task kompleks.

## Konsep

- **Agent** — Single AI agent dengan role spesifik
- **AgentRegistry** — Central registry untuk manage agents
- **Coordinator** — Orchestrator yang menjalankan multiple agents

## Agent Roles

| Role | Description |
|------|-------------|
| `coordinator` | Orchestrate other agents |
| `worker` | Execute tasks |
| `specialist` | Domain-specific expertise |
| `reviewer` | Review dan validate output |

## Built-in Agents

Omakase menyediakan 4 built-in agents:

- **Planner** — Break down complex tasks
- **Coder** — Write code
- **Reviewer** — Review code quality
- **Researcher** — Research dan gather information

## Commands

```bash
# List semua agents
omakase /agents list

# Register custom agent
omakase /agents register my-agent --role worker --description "My custom agent"

# Unregister agent
omakase /agents unregister my-agent

# Run agent
omakase /agents run coder "Write a hello world function"
```

## Execution Strategies

Coordinator mendukung 3 strategies:

### Sequential

Jalankan agents satu per satu.

```typescript
const coordinator = new Coordinator({
  name: 'my-coordinator',
  strategy: 'sequential',
  agents: [planner, coder, reviewer],
}, registry, provider)
```

### Parallel

Jalankan agents secara parallel.

```typescript
const coordinator = new Coordinator({
  name: 'my-coordinator',
  strategy: 'parallel',
  agents: [researcher1, researcher2, researcher3],
}, registry, provider)
```

### Adaptive

Jalankan agents dengan dependency graph.

```typescript
const coordinator = new Coordinator({
  name: 'my-coordinator',
  strategy: 'adaptive',
  agents: [planner, coder, reviewer],
}, registry, provider)
```

## Next Steps

- [Chronos Scheduler](chronos.md) — Schedule background tasks
