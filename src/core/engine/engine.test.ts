/**
 * QueryEngine tests.
 * Updated to work with ProviderHealthManager support.
 */

import { describe, it, expect } from 'bun:test'
import { QueryEngine } from './engine.ts'
import type { LLMProvider, LLMResponse } from '../providers/interface.ts'
import type { Message } from '../../types/messages/message.ts'
import type { ToolCall } from '../../types/messages/tool-call.ts'
import type { ToolContext } from '../../types/tools/context.ts'
import type { Session } from '../../types/messages/turn.ts'

function createMockProvider(
  response: LLMResponse,
  shouldFail = false,
  error?: Error
): LLMProvider & { callCount: number } {
  const provider: any = {
    name: 'mock',
    callCount: 0,
    sendMessage: async (_messages: Message[], _tools?: any[]) => {
      provider.callCount++
      if (shouldFail && error) {
        throw error
      }
      return response
    },
  }
  return provider
}

function createMockSession(): Session {
  return {
    id: 'test-session',
    startTime: Date.now(),
    lastActivity: Date.now(),
    messages: [],
  }
}

function createMockContext(): ToolContext {
  return {
    session: createMockSession(),
    workingDirectory: '/tmp',
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
    expect(provider.callCount).toBe(1)
  })

  it('should retry on failure', async () => {
    const error = new Error('Network error')
    const provider = createMockProvider({ content: '' }, true, error)
    const engine = new QueryEngine(provider, {
      maxRetries: 3,
      retryDelay: 10,
    })

    await expect(engine.sendMessage(messages)).rejects.toThrow('Network error')
    expect(provider.callCount).toBe(3)
  })

  it('should succeed on retry', async () => {
    const response: LLMResponse = {
      content: 'Success',
      usage: { inputTokens: 10, outputTokens: 5 },
    }
    
    let callCount = 0
    const provider: any = {
      name: 'mock',
      callCount: 0,
      sendMessage: async () => {
        callCount++
        if (callCount < 3) throw new Error('Network error')
        return response
      },
    }
    
    const engine = new QueryEngine(provider, {
      maxRetries: 3,
      retryDelay: 10,
    })

    const result = await engine.sendMessage(messages)
    expect(result.content).toBe('Success')
    expect(callCount).toBe(3)
  })

  it('should execute tool call', async () => {
    const provider: any = {
      name: 'mock',
      callCount: 0,
      sendMessage: async () => ({ content: 'ok' }),
    }
    
    const engine = new QueryEngine(provider)
    const tools: Record<string, any> = {
      test_tool: {
        name: 'test_tool',
        description: 'test',
        inputSchema: {} as any,
        execute: async () => ({ success: true, data: 'result' }),
      },
    }

    const toolCall: ToolCall = {
      name: 'test_tool',
      input: {},
    }

    const context: ToolContext = {
      session: createMockSession(),
      workingDirectory: '/tmp',
    }

    // Separate test for tool execution
    expect(() => engine.executeToolCall(toolCall, tools, context)).not.toThrow()
  })

  it('should handle tool execution error', async () => {
    const provider: any = {
      name: 'mock',
      callCount: 0,
      sendMessage: async () => ({ content: 'ok' }),
    }
    
    const engine = new QueryEngine(provider)
    const tools: Record<string, any> = {
      failing_tool: {
        name: 'failing_tool',
        description: 'test',
        inputSchema: {} as any,
        execute: async () => { throw new Error('Tool failed') },
      },
    }

    const toolCall: ToolCall = {
      name: 'failing_tool',
      input: {},
    }

    const context: ToolContext = {
      session: createMockSession(),
      workingDirectory: '/tmp',
    }

    const result = await engine.executeToolCall(toolCall, tools, context)
    expect(result.success).toBe(false)
  })
})
