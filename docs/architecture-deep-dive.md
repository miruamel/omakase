# Architecture Deep Dive

Technical documentation for developers who want to understand Omakase internals.

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLI Layer                                │
│  (src/entrypoints/cli.tsx, src/App.tsx)                         │
│  - Commander.js argument parsing                                 │
│  - Ink/React terminal rendering                                  │
│  - REPL loop management                                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      QueryEngine                                 │
│  (src/core/engine/engine.ts)                                    │
│  - LLM request/response handling                                 │
│  - Tool call execution loop                                      │
│  - Retry logic with exponential backoff                          │
│  - Timeout management                                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   Provider Health Manager                        │
│  (src/core/resilience/provider-health.ts)                       │
│  - Circuit breaker per provider                                  │
│  - Health check polling (30s interval)                           │
│  - Automatic failover chain                                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     LLM Providers                                │
│  (src/core/providers/)                                          │
│  - AnthropicProvider (Claude models)                            │
│  - OpenAIProvider (GPT models)                                  │
│  - OllamaProvider (local models)                                │
│  - NvidiaProvider (NIM models)                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. QueryEngine

**Purpose**: Central orchestrator for LLM interactions

**Key Responsibilities**:
- Send messages to LLM provider
- Handle streaming responses
- Execute tool calls
- Manage retry logic
- Track token usage

**Code Location**: `src/core/engine/engine.ts`

```typescript
class QueryEngine {
  constructor(provider: LLMProvider | ProviderHealthManager, config)
  async sendMessage(messages: Message[], tools?: ToolDefinition[])
  async executeToolCall(toolCall: ToolCall, tools, context)
}
```

### 2. ProviderHealthManager

**Purpose**: Production-grade fault tolerance

**Key Patterns**:
- **Circuit Breaker**: Prevents cascading failures
  - CLOSED → Normal operation
  - OPEN → Blocking requests (5 failures)
  - HALF_OPEN → Testing recovery (30s timeout)
  
- **Health Check Polling**: Proactive failure detection
  - 30-second interval
  - 5-second timeout per provider
  
- **Automatic Failover**: Seamless provider switching
  - Priority: Anthropic → OpenAI → Ollama → Nvidia

**Code Location**: `src/core/resilience/provider-health.ts`

### 3. Agent System

**Architecture**:
```
AgentRegistry
    ↓
Agent (role: explorer|task|reviewer|oracle)
    ↓
Coordinator (sequential|parallel|adaptive)
    ↓
QueryEngine → Provider
```

**Agent Roles**:
| Role | Purpose | Tools |
|------|---------|-------|
| explorer | Codebase investigation | Read-only tools |
| task | Implementation | All tools |
| reviewer | Code review | Analysis tools |
| oracle | Architecture advice | All tools |

**Code Location**: `src/core/agents/`

### 4. Chronos Scheduler

**Task Types**:
- **Once**: Run at specific timestamp
- **Interval**: Run every N seconds
- **Delayed**: Run after N seconds
- **Cron**: Run on cron expression (5-field)

**Implementation**:
```typescript
interface ScheduledTask {
  id: string
  name: string
  type: TaskType
  command: string
  cron?: string      // For cron tasks
  interval?: number  // For interval tasks
  timeout?: number
  onError?: 'abort' | 'log' | 'notify'
}
```

**Code Location**: `src/core/chronos/`

### 5. Tool System

**Base Interface**:
```typescript
interface Tool {
  name: string
  description: string
  inputSchema: ZodSchema
  execute(params: unknown, context: ToolContext): Promise<ToolResult>
}
```

**Tool Categories**:
| Category | Tools |
|----------|-------|
| Filesystem | FileRead, FileWrite, Glob |
| Shell | Bash |
| Search | Grep |
| Productivity | TodoWrite, AskUser |
| Configuration | Config |
| Persistence | Memory |

**Code Location**: `src/core/tools/`

## Data Flow

### User Request Flow

```
User Input
    ↓
CLI Parser (Commander.js)
    ↓
App.tsx (handleInput)
    ↓
QueryEngine.sendMessage()
    ↓
ProviderHealthManager.getHealthyProvider()
    ↓
LLMProvider.sendMessage()
    ↓
Stream Response
    ↓
Tool Call Detection
    ↓
Tool Execution (if any)
    ↓
Response Aggregation
    ↓
Terminal UI (Ink)
```

### Failover Flow

```
Request to Primary Provider
    ↓
Circuit Breaker Check (CLOSED?)
    ↓
If OPEN → Try Next Provider
    ↓
If CLOSED → Execute Request
    ↓
Success → Record Success
    ↓
Failure → Record Failure
    ↓
If failures >= 5 → Trip Circuit
    ↓
Wait 30s → Try HALF_OPEN
    ↓
Success → Reset to CLOSED
    ↓
Failure → Stay OPEN
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

**Emitter Events**:
- `message:added`
- `session:started`
- `session:cleared`
- `settings:changed`
- `error:occurred`

**Code Location**: `src/core/state/AppStateStore.ts`

### RuntimeContext

Singleton context shared across agents:

```typescript
interface RuntimeContext {
  provider: LLMProvider
  tools: Record<string, Tool>
  state: AppState
}
```

**Code Location**: `src/core/runtime/runtime.ts`

## Error Handling

### Error Hierarchy

```
Error
  └── OmakaseError
        ├── ProviderError
        │     ├── CircuitBreakerError
        │     └── TimeoutError
        ├── ToolError
        │     ├── PermissionError
        │     └── ExecutionError
        └── ConfigError
              ├── ValidationError
              └── NotFoundError
```

**Code Location**: `src/core/errors/`

### Retry Strategy

Exponential backoff with jitter:

```typescript
async function retry<T>(
  operation: () => Promise<T>,
  maxRetries: number,
  baseDelay: number
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation()
    } catch (error) {
      const delay = baseDelay * Math.pow(2, i) + Math.random() * 1000
      await sleep(delay)
    }
  }
  throw new Error('Max retries exceeded')
}
```

## Performance Optimizations

### Lazy Loading

Heavy modules loaded on-demand:

```typescript
// Instead of:
import heavy from './heavy-module'

// Use:
const heavy = await import('./heavy-module')
```

### Memoization

React components use React.memo:

```typescript
const MessageList = React.memo(({ messages }) => {
  // Only re-render when messages change
})
```

### Batched Updates

State updates batched for performance:

```typescript
appState.batch(() => {
  appState.addMessage(msg1)
  appState.addMessage(msg2)
  // Single re-render
})
```

## Testing Strategy

### Test Pyramid

```
         /\
        /  \    E2E Tests (planned)
       /----\   
      /      \  Integration Tests
     /--------\
    /          \ Unit Tests (290+)
   /------------\
```

### Test Organization

| Type | Location | Count |
|------|----------|-------|
| Unit | `*.test.ts` | 290+ |
| Integration | `tests/integration/` | 0 (planned) |
| E2E | `tests/e2e/` | 0 (planned) |

### Mock Strategy

```typescript
class MockProvider implements LLMProvider {
  name = 'mock'
  async sendMessage() { return { content: 'mock response' } }
}
```

## Build System

### Bun Runtime

Omakase runs on Bun (not Node.js):
- Native TSX/JSX support
- Faster cold start
- Native test runner

### Build Pipeline

```bash
bun install        # Dependencies
bun run typecheck  # TypeScript validation
bun test           # Run tests
bun run build      # Bundle for production
```

### Output Structure

```
dist/
  cli.js          # Bundled executable
  cli.js.map      # Source maps
```

## Security Considerations

### Permission System

```json
{
  "permissionMode": "approve"  // Ask for each operation
  // or
  "permissionMode": "auto"     // Auto-approve safe ops
}
```

### Dangerous Command Detection

Blocked commands:
- `rm -rf /`
- `sudo`
- `dd if=/dev/zero`
- `mkfs`
- Writes to `/etc/`, `/proc/`, `/sys/`

### API Key Security

Best practices:
- Store in environment variables
- Never commit to git
- Rotate periodically
- Use minimal-scope keys

## Future Architecture Plans

### v0.3.0
- Plugin sandboxing (WebAssembly)
- Persistent task storage (SQLite)
- Team collaboration layer

### v0.4.0
- Multi-session support
- WebSocket real-time sync
- Web UI (React + Tailwind)

### v0.5.0
- GraphQL API
- Plugin marketplace
- Learning from corrections

---

**Last Updated:** June 25, 2026  
**Maintainer:** @miruamel
