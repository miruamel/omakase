# API Reference Overview

Complete API documentation for Omakase core modules.

## Core Modules

| Module | Location | Description |
|--------|----------|-------------|
| **QueryEngine** | `src/core/engine/engine.ts` | Core LLM query processing with retry logic |
| **ProviderHealthManager** | `src/core/resilience/provider-health.ts` | Circuit breaker and automatic failover |
| **Agent** | `src/core/agents/agent.ts` | Single agent execution with timeout |
| **AgentRegistry** | `src/core/agents/registry.ts` | Agent registration and discovery |
| **Coordinator** | `src/core/coordinator/coordinator.ts` | Multi-agent orchestration |
| **Chronos** | `src/core/chronos/chronos.ts` | Background task scheduler |
| **RuntimeContext** | `src/core/runtime/runtime.ts` | Shared context for agents/tools |

## Provider API

### LLMProvider Interface

```typescript
interface LLMProvider {
  name: string
  sendMessage(
    messages: Message[],
    tools?: ToolDefinition[]
  ): Promise<LLMResponse>
}
```

### Available Providers

- **AnthropicProvider** - Claude models (claude-3-opus, claude-3-sonnet)
- **OpenAIProvider** - GPT models (gpt-4-turbo, gpt-3.5-turbo)
- **OllamaProvider** - Local models (llama2, mistral, etc.)
- **NvidiaProvider** - Nvidia NIM models (nemotron-70b)

## Tool System

### Base Tool Interface

```typescript
interface Tool {
  name: string
  description: string
  inputSchema: ZodSchema
  execute(params: unknown, context: ToolContext): Promise<ToolResult>
}
```

### Built-in Tools

1. **Bash** - Execute shell commands
2. **FileRead** - Read file contents
3. **FileWrite** - Write/create files
4. **Glob** - Pattern-based file search
5. **Grep** - Text search in files
6. **TodoWrite** - Task list management
7. **AskUser** - Interactive user prompts
8. **Config** - Configuration management
9. **Memory** - Persistent memory storage

## Resilience API

### Circuit Breaker

```typescript
class CircuitBreaker {
  constructor(config?: CircuitBreakerConfig)
  call<T>(operation: () => Promise<T>): Promise<T>
  recordSuccess(): void
  recordFailure(): void
  getState(): CircuitState  // CLOSED | OPEN | HALF_OPEN
  getFailureCount(): number
}
```

### Provider Health Manager

```typescript
class ProviderHealthManager {
  registerProvider(provider: LLMProvider): void
  getHealthyProvider(preferred?: string): Promise<LLMProvider | null>
  executeWithFailover<T>(
    operation: (provider: LLMProvider) => Promise<T>
  ): Promise<T>
  getProviderStatuses(): ProviderHealthStatus[]
  startHealthChecks(): void
  stopHealthChecks(): void
}
```

## Agent API

### Agent Roles

```typescript
enum AgentRole {
  EXPLORER = 'explorer',      // Codebase investigation
  TASK = 'task',              // Multi-step implementation
  REVIEWER = 'reviewer',      // Code review and analysis
  ORACLE = 'oracle'           // Architecture and debugging
}
```

### Agent Execution

```typescript
class Agent {
  constructor(config: AgentConfig)
  execute(prompt: string): Promise<AgentResult>
  setTimeout(timeout: number): void
  setTools(tools: Tool[]): void
}
```

## Scheduler API (Chronos)

### Task Types

```typescript
enum TaskType {
  ONCE = 'once',      // Run once at specified time
  INTERVAL = 'interval', // Run every N seconds
  DELAYED = 'delayed',   // Run after N seconds
  CRON = 'cron'       // Run on cron schedule
}
```

### Scheduled Task

```typescript
interface ScheduledTask {
  id: string
  name: string
  type: TaskType
  command: string
  cron?: string
  interval?: number
  timeout?: number
  onError?: 'abort' | 'log' | 'notify'
}
```

## State Management

### AppState

```typescript
interface AppState {
  session: Session | null
  messages: Message[]
  settings: Settings
  isLoading: boolean
  error: string | null
}
```

### Events

```typescript
appState.on('message:added', (msg: Message) => {...})
appState.on('session:started', (session: Session) => {...})
appState.on('settings:changed', (settings: Settings) => {...})
```

## Error Handling

### Error Types

```typescript
class OmakaseError extends Error { }
class ProviderError extends OmakaseError { }
class TimeoutError extends OmakaseError { }
class CircuitBreakerError extends OmakaseError { }
class PermissionError extends OmakaseError { }
```

### Error Recovery

```typescript
try {
  const response = await queryEngine.sendMessage(messages)
} catch (error) {
  if (error instanceof CircuitBreakerError) {
    // Provider unavailable, waiting for failover
  } else if (error instanceof TimeoutError) {
    // Operation timed out, retry with longer timeout
  } else if (error instanceof PermissionError) {
    // Request user permission
  }
}
```

## Related

- [Tools Reference](tools.md) - Detailed tool documentation
- [Resilience Guide](resilience.md) - Fault tolerance patterns
- [Multi-Agent](multi-agent.md) - Agent orchestration
