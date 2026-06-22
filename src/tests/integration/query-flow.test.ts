/**
 * Integration tests untuk full query flow.
 * @module tests/integration/query-flow
 */

import { describe, it, expect, beforeEach, mock } from 'bun:test'
import { QueryEngine } from '../../core/engine/engine.ts'
import { RuntimeContext } from '../../core/runtime/runtime.ts'
import { setRuntime } from '../../core/runtime/index.ts'
import { listTools } from '../../core/tools/index.ts'
import type { LLMProvider } from '../../core/providers/interface.ts'
import type { Message } from '../../types/messages/message.ts'

describe('Integration: Query Flow', () => {
  beforeEach(() => {
    mock.restore()
  })

  it('should complete full query with tool execution', async () => {
    const mockProvider: LLMProvider = {
      name: 'mock',
      async sendMessage(messages: Message[]) {
        const lastMsg = messages[messages.length - 1]
        if (lastMsg.role === 'tool') {
          return {
            content: 'Tool executed successfully',
            usage: { inputTokens: 20, outputTokens: 10 },
          }
        }
        return {
          content: '',
          toolCalls: [{
            id: 'call_1',
            name: 'Glob',
            input: { pattern: '*.ts' },
          }],
          usage: { inputTokens: 10, outputTokens: 5 },
        }
      },
    }

    const tools = listTools()
    const runtime = new RuntimeContext(mockProvider, tools)
    setRuntime(runtime)

    const engine = new QueryEngine(mockProvider)
    const messages: Message[] = [{ role: 'user', content: 'Find TypeScript files' }]

    const response = await engine.sendMessage(messages, tools)
    expect(response.toolCalls).toBeDefined()
    expect(response.toolCalls?.[0].name).toBe('Glob')

    if (response.toolCalls) {
      const toolsMap = tools.reduce((acc, t) => {
        acc[t.name] = t
        return acc
      }, {} as Record<string, any>)

      const result = await engine.executeToolCall(response.toolCalls[0], toolsMap, {
        session: { id: 'test', messages: [], createdAt: Date.now() } as any,
        workingDirectory: '/root/omakase/src',
      })

      expect(result.success).toBe(true)
    }
  })

  it('should handle provider errors with retry', async () => {
    let attempts = 0
    const mockProvider: LLMProvider = {
      name: 'mock',
      async sendMessage() {
        attempts++
        if (attempts < 3) {
          throw new Error('Transient error')
        }
        return {
          content: 'Success after retry',
          usage: { inputTokens: 10, outputTokens: 5 },
        }
      },
    }

    const engine = new QueryEngine(mockProvider, {
      maxRetries: 3,
      retryDelay: 10,
    })

    const response = await engine.sendMessage([{ role: 'user', content: 'Hi' }])
    expect(response.content).toBe('Success after retry')
    expect(attempts).toBe(3)
  })

  it('should handle tool execution errors gracefully', async () => {
    const mockProvider: LLMProvider = {
      name: 'mock',
      async sendMessage() {
        return {
          content: '',
          toolCalls: [{
            id: 'call_1',
            name: 'NonExistentTool',
            input: {},
          }],
        }
      },
    }

    const engine = new QueryEngine(mockProvider)
    const tools = listTools().reduce((acc, t) => {
      acc[t.name] = t
      return acc
    }, {} as Record<string, any>)

    await expect(
      engine.executeToolCall(
        { id: 'call_1', name: 'NonExistentTool', input: {} },
        tools,
        {
          session: { id: 'test', messages: [], createdAt: Date.now() } as any,
          workingDirectory: '/tmp',
        }
      )
    ).rejects.toThrow('Tool not found')
  })

  it('should handle permission denial', async () => {
    const mockProvider: LLMProvider = {
      name: 'mock',
      async sendMessage() {
        return {
          content: '',
          toolCalls: [{
            id: 'call_1',
            name: 'Bash',
            input: { command: 'rm -rf /' },
          }],
        }
      },
    }

    const engine = new QueryEngine(mockProvider)
    const tools = listTools().reduce((acc, t) => {
      acc[t.name] = t
      return acc
    }, {} as Record<string, any>)

    const result = await engine.executeToolCall(
      { id: 'call_1', name: 'Bash', input: { command: 'rm -rf /' } },
      tools,
      {
        session: { id: 'test', messages: [], createdAt: Date.now() } as any,
        workingDirectory: '/tmp',
      }
    )

    expect(result.success).toBe(false)
    expect(result.error).toContain('dangerous')
  })

  it('should handle permission approval via promptUser', async () => {
    const mockProvider: LLMProvider = {
      name: 'mock',
      async sendMessage() {
        return {
          content: '',
          toolCalls: [{
            id: 'call_1',
            name: 'Bash',
            input: { command: 'rm -rf /tmp/test' },
          }],
        }
      },
    }

    const engine = new QueryEngine(mockProvider)
    const tools = listTools().reduce((acc, t) => {
      acc[t.name] = t
      return acc
    }, {} as Record<string, any>)

    let promptCalled = false
    const promptUser = async (msg: string): Promise<boolean> => {
      promptCalled = true
      expect(msg).toContain('dangerous')
      return true
    }

    const result = await engine.executeToolCall(
      { id: 'call_1', name: 'Bash', input: { command: 'rm -rf /tmp/test' } },
      tools,
      {
        session: { id: 'test', messages: [], createdAt: Date.now() } as any,
        workingDirectory: '/tmp',
        promptUser,
      }
    )

    expect(promptCalled).toBe(true)
    expect(result.success).toBe(true)
  })

  it('should handle permission denial via promptUser', async () => {
    const mockProvider: LLMProvider = {
      name: 'mock',
      async sendMessage() {
        return {
          content: '',
          toolCalls: [{
            id: 'call_1',
            name: 'Bash',
            input: { command: 'rm -rf /tmp/test' },
          }],
        }
      },
    }

    const engine = new QueryEngine(mockProvider)
    const tools = listTools().reduce((acc, t) => {
      acc[t.name] = t
      return acc
    }, {} as Record<string, any>)

    const promptUser = async (): Promise<boolean> => false

    const result = await engine.executeToolCall(
      { id: 'call_1', name: 'Bash', input: { command: 'rm -rf /tmp/test' } },
      tools,
      {
        session: { id: 'test', messages: [], createdAt: Date.now() } as any,
        workingDirectory: '/tmp',
        promptUser,
      }
    )

    expect(result.success).toBe(false)
    expect(result.error).toContain('denied')
  })
})
