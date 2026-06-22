/**
 * Anthropic provider tests.
 * @module core/providers/anthropic/client.test
 */

import { describe, it, expect, beforeEach, mock } from 'bun:test'
import type { Message } from '../../../types/messages/message.ts'

describe('AnthropicProvider', () => {
  beforeEach(() => {
    mock.restore()
  })

  it('should create provider with correct name', async () => {
    mock.module('@anthropic-ai/sdk', () => ({
      default: class MockAnthropic {
        messages = {
          create: async () => ({
            id: 'msg_test',
            content: [{ type: 'text', text: 'Hello' }],
            stop_reason: 'end_turn',
            usage: { input_tokens: 10, output_tokens: 5 },
          }),
        }
      },
    }))

    const { createAnthropicProvider } = await import('./client.ts')
    const provider = createAnthropicProvider('test-key')
    expect(provider.name).toBe('anthropic')
  })

  it('should send message and return content', async () => {
    mock.module('@anthropic-ai/sdk', () => ({
      default: class MockAnthropic {
        messages = {
          create: async () => ({
            id: 'msg_test',
            content: [{ type: 'text', text: 'Hello from Claude' }],
            stop_reason: 'end_turn',
            usage: { input_tokens: 10, output_tokens: 5 },
          }),
        }
      },
    }))

    const { createAnthropicProvider } = await import('./client.ts')
    const provider = createAnthropicProvider('test-key')
    const messages: Message[] = [{ role: 'user', content: 'Hi' }]

    const response = await provider.sendMessage(messages)
    expect(response.content).toBe('Hello from Claude')
    expect(response.usage?.inputTokens).toBe(10)
    expect(response.usage?.outputTokens).toBe(5)
  })

  it('should handle tool calls', async () => {
    mock.module('@anthropic-ai/sdk', () => ({
      default: class MockAnthropic {
        messages = {
          create: async () => ({
            id: 'msg_test',
            content: [
              { type: 'text', text: 'Let me help' },
              { type: 'tool_use', id: 'tool_1', name: 'Bash', input: { command: 'ls' } },
            ],
            stop_reason: 'tool_use',
            usage: { input_tokens: 10, output_tokens: 5 },
          }),
        }
      },
    }))

    const { createAnthropicProvider } = await import('./client.ts')
    const provider = createAnthropicProvider('test-key')
    const messages: Message[] = [{ role: 'user', content: 'List files' }]

    const response = await provider.sendMessage(messages)
    expect(response.content).toBe('Let me help')
    expect(response.toolCalls).toBeDefined()
    expect(response.toolCalls?.length).toBe(1)
    expect(response.toolCalls?.[0].name).toBe('Bash')
    expect(response.toolCalls?.[0].input).toEqual({ command: 'ls' })
  })

  it('should filter system messages', async () => {
    let capturedMessages: any[] = []

    mock.module('@anthropic-ai/sdk', () => ({
      default: class MockAnthropic {
        messages = {
          create: async (params: any) => {
            capturedMessages = params.messages
            return {
              id: 'msg_test',
              content: [{ type: 'text', text: 'OK' }],
              stop_reason: 'end_turn',
              usage: { input_tokens: 10, output_tokens: 5 },
            }
          },
        }
      },
    }))

    const { createAnthropicProvider } = await import('./client.ts')
    const provider = createAnthropicProvider('test-key')
    const messages: Message[] = [
      { role: 'system', content: 'You are helpful' },
      { role: 'user', content: 'Hi' },
    ]

    await provider.sendMessage(messages)
    expect(capturedMessages.length).toBe(1)
    expect(capturedMessages[0].role).toBe('user')
  })

  it('should handle API errors', async () => {
    mock.module('@anthropic-ai/sdk', () => ({
      default: class MockAnthropic {
        messages = {
          create: async () => {
            const error: any = new Error('Unauthorized')
            error.status = 401
            throw error
          },
        }
      },
    }))

    const { createAnthropicProvider } = await import('./client.ts')
    const provider = createAnthropicProvider('bad-key')
    const messages: Message[] = [{ role: 'user', content: 'Hi' }]

    await expect(provider.sendMessage(messages)).rejects.toThrow()
  })

  it('should handle empty content', async () => {
    mock.module('@anthropic-ai/sdk', () => ({
      default: class MockAnthropic {
        messages = {
          create: async () => ({
            id: 'msg_test',
            content: [],
            stop_reason: 'end_turn',
            usage: { input_tokens: 10, output_tokens: 0 },
          }),
        }
      },
    }))

    const { createAnthropicProvider } = await import('./client.ts')
    const provider = createAnthropicProvider('test-key')
    const messages: Message[] = [{ role: 'user', content: 'Hi' }]

    const response = await provider.sendMessage(messages)
    expect(response.content).toBe('')
  })
})
