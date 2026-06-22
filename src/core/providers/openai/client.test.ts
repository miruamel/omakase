/**
 * OpenAI provider tests.
 * @module core/providers/openai/client.test
 */

import { describe, it, expect, beforeEach, mock } from 'bun:test'
import type { Message } from '../../../types/messages/message.ts'

describe('OpenAIProvider', () => {
  beforeEach(() => {
    mock.restore()
  })

  it('should create provider with correct name', async () => {
    mock.module('openai', () => ({
      OpenAI: class MockOpenAI {
        chat = {
          completions: {
            create: async () => ({
              id: 'chatcmpl-test',
              model: 'gpt-4-turbo',
              choices: [{
                message: { role: 'assistant', content: 'Hello' },
                finish_reason: 'stop',
              }],
              usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
            }),
          },
        }
      },
    }))

    const { createOpenAIProvider } = await import('./client.ts')
    const provider = createOpenAIProvider('test-key')
    expect(provider.name).toBe('openai')
  })

  it('should send message and return content', async () => {
    mock.module('openai', () => ({
      OpenAI: class MockOpenAI {
        chat = {
          completions: {
            create: async () => ({
              id: 'chatcmpl-test',
              model: 'gpt-4-turbo',
              choices: [{
                message: { role: 'assistant', content: 'Hello from GPT' },
                finish_reason: 'stop',
              }],
              usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
            }),
          },
        }
      },
    }))

    const { createOpenAIProvider } = await import('./client.ts')
    const provider = createOpenAIProvider('test-key')
    const messages: Message[] = [{ role: 'user', content: 'Hi' }]

    const response = await provider.sendMessage(messages)
    expect(response.content).toBe('Hello from GPT')
    expect(response.usage?.inputTokens).toBe(10)
    expect(response.usage?.outputTokens).toBe(5)
  })

  it('should handle tool calls', async () => {
    mock.module('openai', () => ({
      OpenAI: class MockOpenAI {
        chat = {
          completions: {
            create: async () => ({
              id: 'chatcmpl-test',
              model: 'gpt-4-turbo',
              choices: [{
                message: {
                  role: 'assistant',
                  content: null,
                  tool_calls: [{
                    id: 'call_1',
                    type: 'function',
                    function: {
                      name: 'Bash',
                      arguments: '{"command":"ls"}',
                    },
                  }],
                },
                finish_reason: 'tool_calls',
              }],
              usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
            }),
          },
        }
      },
    }))

    const { createOpenAIProvider } = await import('./client.ts')
    const provider = createOpenAIProvider('test-key')
    const messages: Message[] = [{ role: 'user', content: 'List files' }]

    const response = await provider.sendMessage(messages)
    expect(response.toolCalls).toBeDefined()
    expect(response.toolCalls?.length).toBe(1)
    expect(response.toolCalls?.[0].name).toBe('Bash')
    expect(response.toolCalls?.[0].input).toEqual({ command: 'ls' })
  })

  it('should handle system messages', async () => {
    let capturedMessages: any[] = []

    mock.module('openai', () => ({
      OpenAI: class MockOpenAI {
        chat = {
          completions: {
            create: async (params: any) => {
              capturedMessages = params.messages
              return {
                id: 'chatcmpl-test',
                model: 'gpt-4-turbo',
                choices: [{
                  message: { role: 'assistant', content: 'OK' },
                  finish_reason: 'stop',
                }],
                usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
              }
            },
          },
        }
      },
    }))

    const { createOpenAIProvider } = await import('./client.ts')
    const provider = createOpenAIProvider('test-key')
    const messages: Message[] = [
      { role: 'system', content: 'You are helpful' },
      { role: 'user', content: 'Hi' },
    ]

    await provider.sendMessage(messages)
    expect(capturedMessages.length).toBe(2)
    expect(capturedMessages[0].role).toBe('system')
    expect(capturedMessages[1].role).toBe('user')
  })

  it('should handle API errors', async () => {
    mock.module('openai', () => ({
      OpenAI: class MockOpenAI {
        chat = {
          completions: {
            create: async () => {
              const error: any = new Error('Rate limit exceeded')
              error.status = 429
              throw error
            },
          },
        }
      },
    }))

    const { createOpenAIProvider } = await import('./client.ts')
    const provider = createOpenAIProvider('test-key')
    const messages: Message[] = [{ role: 'user', content: 'Hi' }]

    await expect(provider.sendMessage(messages)).rejects.toThrow()
  })

  it('should handle empty content', async () => {
    mock.module('openai', () => ({
      OpenAI: class MockOpenAI {
        chat = {
          completions: {
            create: async () => ({
              id: 'chatcmpl-test',
              model: 'gpt-4-turbo',
              choices: [{
                message: { role: 'assistant', content: null },
                finish_reason: 'stop',
              }],
              usage: { prompt_tokens: 10, completion_tokens: 0, total_tokens: 10 },
            }),
          },
        }
      },
    }))

    const { createOpenAIProvider } = await import('./client.ts')
    const provider = createOpenAIProvider('test-key')
    const messages: Message[] = [{ role: 'user', content: 'Hi' }]

    const response = await provider.sendMessage(messages)
    expect(response.content).toBe('')
  })
})
