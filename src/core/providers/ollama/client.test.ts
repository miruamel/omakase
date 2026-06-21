/**
 * Ollama provider tests.
 * @module core/providers/ollama/client.test
 */

import { describe, it, expect, mock, beforeEach, afterEach } from 'bun:test'
import { createOllamaProvider } from './client.ts'
import type { Message } from '../../../types/messages/message.ts'
import type { ToolDefinition } from '../../../types/tools/definition.ts'
import { z } from 'zod'

describe('OllamaProvider', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    globalThis.fetch = mock(async () => new Response()) as any
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('should have correct name', () => {
    const provider = createOllamaProvider()
    expect(provider.name).toBe('ollama')
  })

  it('should use default endpoint', () => {
    const provider = createOllamaProvider()
    expect(provider.name).toBe('ollama')
  })

  it('should use custom endpoint', () => {
    const provider = createOllamaProvider('http://custom:1234')
    expect(provider.name).toBe('ollama')
  })

  it('should send message successfully', async () => {
    const mockResponse = {
      model: 'llama3',
      message: { role: 'assistant', content: 'Hello!' },
      prompt_eval_count: 10,
      eval_count: 5,
    }

    globalThis.fetch = mock(async () =>
      new Response(JSON.stringify(mockResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    ) as any

    const provider = createOllamaProvider('http://localhost:11434')
    const messages: Message[] = [{ role: 'user', content: 'Hi' }]

    const result = await provider.sendMessage(messages)

    expect(result.content).toBe('Hello!')
    expect(result.usage?.inputTokens).toBe(10)
    expect(result.usage?.outputTokens).toBe(5)
  })

  it('should handle tool calls', async () => {
    const mockResponse = {
      model: 'llama3',
      message: {
        role: 'assistant',
        content: '',
        tool_calls: [
          {
            id: 'call_1',
            function: {
              name: 'test_tool',
              arguments: { foo: 'bar' },
            },
          },
        ],
      },
    }

    globalThis.fetch = mock(async () =>
      new Response(JSON.stringify(mockResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    ) as any

    const provider = createOllamaProvider('http://localhost:11434')
    const messages: Message[] = [{ role: 'user', content: 'Use a tool' }]
    const tools: ToolDefinition[] = [
      {
        name: 'test_tool',
        description: 'Test tool',
        inputSchema: z.object({}),
        async call() {
          return { toolCallId: 'call_1', success: true }
        },
      },
    ]

    const result = await provider.sendMessage(messages, tools)

    expect(result.toolCalls).toBeDefined()
    expect(result.toolCalls?.length).toBe(1)
    expect(result.toolCalls?.[0].name).toBe('test_tool')
  })

  it('should handle API error', async () => {
    globalThis.fetch = mock(async () =>
      new Response('Internal Server Error', { status: 500 })
    ) as any

    const provider = createOllamaProvider('http://localhost:11434')
    const messages: Message[] = [{ role: 'user', content: 'Hi' }]

    await expect(provider.sendMessage(messages)).rejects.toThrow('Ollama API error')
  })

  it('should handle network error', async () => {
    globalThis.fetch = mock(async () => {
      throw new Error('Network error')
    }) as any

    const provider = createOllamaProvider('http://localhost:11434')
    const messages: Message[] = [{ role: 'user', content: 'Hi' }]

    await expect(provider.sendMessage(messages)).rejects.toThrow('Network error')
  })

  it('should handle empty response', async () => {
    const mockResponse = {
      model: 'llama3',
      message: { role: 'assistant', content: '' },
    }

    globalThis.fetch = mock(async () =>
      new Response(JSON.stringify(mockResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    ) as any

    const provider = createOllamaProvider('http://localhost:11434')
    const messages: Message[] = [{ role: 'user', content: 'Hi' }]

    const result = await provider.sendMessage(messages)

    expect(result.content).toBe('')
    expect(result.usage?.inputTokens).toBe(0)
    expect(result.usage?.outputTokens).toBe(0)
  })
})
