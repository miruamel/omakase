# Core API

## QueryEngine

Core engine untuk handle LLM queries.

```typescript
import { QueryEngine } from 'omakase/core/engine'

const engine = new QueryEngine(provider, {
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 30000,
})

const response = await engine.sendMessage(messages, tools)
```

### Methods

#### `sendMessage(messages, tools?)`

Send messages ke LLM dengan retry logic.

**Parameters:**
- `messages: Message[]` — Array of messages
- `tools?: ToolDefinition[]` — Optional tools

**Returns:** `Promise<LLMResponse>`

#### `executeToolCall(toolCall, tools, context)`

Execute a tool call.

**Parameters:**
- `toolCall: ToolCall` — Tool call to execute
- `tools: Record<string, ToolDefinition>` — Available tools
- `context: ToolContext` — Execution context

**Returns:** `Promise<ToolResult>`

## RuntimeContext

Shared singletons untuk agents, chronos, dan coordinator.

```typescript
import { RuntimeContext, setRuntime, getRuntime, requireRuntime } from 'omakase/core/runtime'

const runtime = new RuntimeContext(provider, tools)
setRuntime(runtime)

// Later, anywhere in the app
const runtime = requireRuntime() // throws if not set
```

### Methods

#### `getAgentRegistry()`

Get the agent registry.

**Returns:** `AgentRegistry`

#### `getChronos()`

Get the Chronos scheduler.

**Returns:** `Chronos`

#### `getCoordinator()`

Get the coordinator.

**Returns:** `Coordinator`

## AppStateStore

Global application state.

```typescript
import { appState } from 'omakase/core/state'

const settings = appState.getSettings()
const session = appState.getSession()

appState.updateSettings({ provider: 'openai' })
appState.createSession()
appState.addMessage(session, { role: 'user', content: 'Hello' })
```

### Events

```typescript
appState.on('change', (state) => {
  console.log('State changed:', state)
})
```

## Logger

Structured logging.

```typescript
import { logger } from 'omakase/core/services/logger'

logger.debug('Debug message', { key: 'value' })
logger.info('Info message')
logger.warn('Warning message')
logger.error('Error message', error)
```
