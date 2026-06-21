# Provider API

## LLMProvider Interface

```typescript
interface LLMProvider {
  name: string
  sendMessage(messages: Message[], tools?: ToolDefinition[]): Promise<LLMResponse>
}
```

## Anthropic

```typescript
import { createAnthropicProvider } from 'omakase/core/providers/anthropic'

const provider = createAnthropicProvider(apiKey)
```

## OpenAI

```typescript
import { createOpenAIProvider } from 'omakase/core/providers/openai'

const provider = createOpenAIProvider(apiKey)
```

## Ollama

```typescript
import { createOllamaProvider } from 'omakase/core/providers/ollama'

const provider = createOllamaProvider(endpoint) // default: http://localhost:11434
```

## NVIDIA NIM

```typescript
import { createNvidiaProvider } from 'omakase/core/providers/nvidia'

const provider = createNvidiaProvider(apiKey, endpoint)
```

## LLMResponse

```typescript
interface LLMResponse {
  content?: string
  toolCalls?: ToolCall[]
  usage?: {
    inputTokens: number
    outputTokens: number
  }
}
```

## Message

```typescript
interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}
```

## ToolCall

```typescript
interface ToolCall {
  id: string
  name: string
  input: Record<string, unknown>
}
```
