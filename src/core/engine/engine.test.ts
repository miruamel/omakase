/**
 * QueryEngine tests.
 * @module core/engine/engine.test
 */

import { describe, it, expect, mock } from 'bun:test'
import { QueryEngine } from './engine.ts'
import type { LLMProvider, LLMResponse } from '../providers/interface.ts'
import type { Message } from '../../types/messages/message.ts'
import type { ToolDefinition } from '../../types/tools/definition.ts'
import type { ToolCall } from '../../types/messages/tool-call.ts'
import type { ToolContext } from '../../types/tools/context.ts'

function createMockProvider(response: LLMResponse): LLMProvider {
  return {
    name: 'mock',
    sendMessage: mock(async (): Promise<LLMResponse> => response),
  }
}

function createFailingProvider(error: Error): LLMProvider {
  return {
    name: 'failing',
    sendMessage: mock(async (): Promise<LLMResponse> => {
      throw error
    }),
  }
}

describe('QueryEngine', () => {
  const messages: Message[] = [
    { role: 'user', content: 'Hello' },
  ]

  it('should send message successfully', async () => {
    const response: LLMResponse = {
      content: 'Hi there!',
      usage: { inputTokens: 10, outputTokens: 5 },
    }
    const provider = createMockProvider(response)
    const engine = new QueryEngine(provider)

    const result = await engine.sendMessage(messages)

    expect(result.content).toBe('Hi there!')
    expect(provider.sendMessage).toHaveBeenCalledTimes(1)
  })

  it('should retry on failure', async () => {
    const error = new Error('Network error')
    const provider = createFailingProvider(error)
    const engine = new QueryEngine(provider, {
      maxRetries: 3,
      retryDelay: 10,
    })

    await expect(engine.sendMessage(messages)).rejects.toThrow('Network error')
    expect(provider.sendMessage).toHaveBeenCalledTimes(3)
  })

  it('should succeed on retry', async () => {
    const response: LLMResponse = {
      content: 'Success',
      usage: { inputTokens: 10, outputTokens: 5 },
    }
    let attempts = 0
    const provider: LLMProvider = {
      name: 'flaky',
      sendMessage: mock(async (): Promise<LLMResponse> => {
        attempts++
        if (attempts < 2) {
          throw new Error('Transient error')
        }
        return response
      }),
    }
    const engine = new QueryEngine(provider, {
      maxRetries: 3,
      retryDelay: 10,
    })

    const result = await engine.sendMessage(messages)

    expect(result.content).toBe('Success')
    expect(provider.sendMessage).toHaveBeenCalledTimes(2)
  })

  it('should execute tool call', async () => {
    const provider = createMockProvider({ content: 'ok' })
    const engine = new QueryEngine(provider)

    const toolCall: ToolCall = {
      id: 'call_1',
      name: 'test_tool',
      input: { foo: 'bar' },
    }

    const tools: Record<string, ToolDefinition> = {
      test_tool: {
        name: 'test_tool',
        description: 'Test tool',
        inputSchema: { type: 'object', properties: {} },
        call: mock(async () => ({ success: true, output: 'tool result' })),
      },
    }

    const context: ToolContext = {
      sessionId: 'test',
      workingDirectory: '/tmp',
    }

    const result = await engine.executeToolCall(toolCall, tools, context)

    expect(result.success).toBe(true)
    expect(result.output).toBe('tool result')
  })

  it('should return error for unknown tool', async () => {
    const provider = createMockProvider({ content: 'ok' })
    const engine = new QueryEngine(provider)

    const toolCall: ToolCall = {
      id: 'call_1',
      name: 'unknown_tool',
      input: {},
    }

    const tools: Record<string, ToolDefinition> = {}
    const context: ToolContext = {
      sessionId: 'test',
      workingDirectory: '/tmp',
    }

    await expect(engine.executeToolCall(toolCall, tools, context)).rejects.toThrow('Tool not found')
  })

  it('should handle tool execution error', async () => {
    const provider = createMockProvider({ content: 'ok' })
    const engine = new QueryEngine(provider)

    const toolCall: ToolCall = {
      id: 'call_1',
      name: 'failing_tool',
      input: {},
    }

    const tools: Record<string, ToolDefinition> = {
      failing_tool: {
        name: 'failing_tool',
        description: 'Failing tool',
        inputSchema: { type: 'object', properties: {} },
        call: mock(async () => {
          throw new Error('Tool failed')
        }),
      },
    }

    const context: ToolContext = {
      sessionId: 'test',
      workingDirectory: '/tmp',
    }

    const result = await engine.executeToolCall(toolCall, tools, context)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Tool failed')
  })

  it('should respect permission check', async () => {
    const provider = createMockProvider({ content: 'ok' })
    const engine = new QueryEngine(provider)

    const toolCall: ToolCall = {
      id: 'call_1',
      name: 'restricted_tool',
      input: {},
    }

    const tools: Record<string, ToolDefinition> = {
      restricted_tool: {
        name: 'restricted_tool',
        description: 'Restricted tool',
        inputSchema: { type: 'object', properties: {} },
        checkPermissions: mock(async () => ({
          granted: false,
          prompt: 'Permission required',
        })),
        call: mock(async () => ({ success: true, output: 'should not run' })),
      },
    }

    const context: ToolContext = {
      sessionId: 'test',
      workingDirectory: '/tmp',
    }

    const result = await engine.executeToolCall(toolCall, tools, context)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Permission required')
  })
})
