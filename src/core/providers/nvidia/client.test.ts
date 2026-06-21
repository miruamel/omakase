/**
 * NVIDIA provider tests.
 * @module core/providers/nvidia/client.test
 */

import { describe, it, expect, mock, beforeEach, afterEach } from 'bun:test'
import { createNvidiaProvider } from './client.ts'
import type { Message } from '../../../types/messages/message.ts'
import type { ToolDefinition } from '../../../types/tools/definition.ts'
import { z } from 'zod'

describe('NvidiaProvider', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    globalThis.fetch = mock(async () => new Response()) as any
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('should have correct name', () => {
    const provider = createNvidiaProvider('test-key')
    expect(provider.name).toBe('nvidia')
  })

  it('should use default endpoint', () => {
    const provider = createNvidiaProvider('test-key')
    expect(provider.name).toBe('nvidia')
  })

  it('should use custom endpoint', () => {
    const provider = createNvidiaProvider('test-key', 'https://custom.endpoint/v1')
    expect(provider.name).toBe('nvidia')
  })

  it('should send message successfully', async () => {
    const mockResponse = {
      model: 'nvidia/llama-3.1-nemotron-70b-instruct',
      choices: [
        {
          message: { role: 'assistant', content: 'Hello from NVIDIA!' },
        },
      ],
      usage: { prompt_tokens: 15, completion_tokens: 8 },
    }

    globalThis.fetch = mock(async () =>
      new Response(JSON.stringify(mockResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    ) as any

    const provider = createNvidiaProvider('test-key')
    const messages: Message[] = [{ role: 'user', content: 'Hi' }]

    const result = await provider.sendMessage(messages)

    expect(result.content).toBe('Hello from NVIDIA!')
    expect(result.usage?.inputTokens).toBe(15)
    expect(result.usage?.outputTokens).toBe(8)
  })

  it('should handle tool calls with string arguments', async () => {
    const mockResponse = {
      model: 'nvidia/llama-3.1-nemotron-70b-instruct',
      choices: [
        {
          message: {
            role: 'assistant',
            content: '',
            tool_calls: [
              {
                id: 'call_1',
                function: {
                  name: 'test_tool',
                  arguments: '{"foo":"bar"}',
                },
              },
            ],
          },
        },
      ],
    }

    globalThis.fetch = mock(async () =>
      new Response(JSON.stringify(mockResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    ) as any

    const provider = createNvidiaProvider('test-key')
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
    expect(result.toolCalls?.[0].input).toEqual({ foo: 'bar' })
  })

  it('should handle tool calls with object arguments', async () => {
    const mockResponse = {
      model: 'nvidia/llama-3.1-nemotron-70b-instruct',
      choices: [
        {
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
        },
      ],
    }

    globalThis.fetch = mock(async () =>
      new Response(JSON.stringify(mockResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    ) as any

    const provider = createNvidiaProvider('test-key')
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

    expect(result.toolCalls?.[0].input).toEqual({ foo: 'bar' })
  })

  it('should handle API error', async () => {
    globalThis.fetch = mock(async () =>
      new Response('Unauthorized', { status: 401 })
    ) as any

    const provider = createNvidiaProvider('test-key')
    const messages: Message[] = [{ role: 'user', content: 'Hi' }]

    await expect(provider.sendMessage(messages)).rejects.toThrow('NVIDIA API error')
  })

  it('should handle network error', async () => {
    globalThis.fetch = mock(async () => {
      throw new Error('Connection refused')
    }) as any

    const provider = createNvidiaProvider('test-key')
    const messages: Message[] = [{ role: 'user', content: 'Hi' }]

    await expect(provider.sendMessage(messages)).rejects.toThrow('Connection refused')
  })

  it('should send Authorization header', async () => {
    let capturedHeaders: Record<string, string> = {}

    globalThis.fetch = mock(async (url: any, options: any) => {
      capturedHeaders = options.headers
      return new Response(JSON.stringify({
        choices: [{ message: { content: 'ok' } }],
      }), { status: 200 })
    }) as any

    const provider = createNvidiaProvider('my-secret-key')
    await provider.sendMessage([{ role: 'user', content: 'Hi' }])

    expect(capturedHeaders['Authorization']).toBe('Bearer my-secret-key')
  })
})
