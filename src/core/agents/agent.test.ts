/**
 * Tests untuk Agent.
 * @module core/agents/agent.test
 */

import { describe, it, expect } from 'bun:test'
import { Agent } from './agent.ts'
import type { LLMProvider, LLMResponse } from '../providers/interface.ts'
import type { ToolDefinition } from '../../types/tools/definition.ts'

/**
 * Mock LLM provider untuk testing.
 */
function createMockProvider(response: string): LLMProvider {
  return {
    name: 'mock',
    async sendMessage(): Promise<LLMResponse> {
      return { content: response }
    },
  }
}

/**
 * Mock tool untuk testing.
 */
const mockTool: ToolDefinition = {
  name: 'mock-tool',
  description: 'A mock tool',
  inputSchema: {} as any,
  async call() {
    return { toolCallId: 'mock', success: true, data: 'mock-result' }
  },
}

describe('Agent', () => {
  it('should create agent with default system prompt', () => {
    const provider = createMockProvider('response')
    const tools = new Map<string, ToolDefinition>()
    const agent = new Agent(
      { name: 'test-agent', role: 'worker' },
      provider,
      tools
    )

    expect(agent.name).toBe('test-agent')
    expect(agent.role).toBe('worker')
    expect(agent.systemPrompt).toContain('worker agent')
  })

  it('should use custom system prompt when provided', () => {
    const provider = createMockProvider('response')
    const tools = new Map<string, ToolDefinition>()
    const agent = new Agent(
      { name: 'test-agent', role: 'worker', systemPrompt: 'Custom prompt' },
      provider,
      tools
    )

    expect(agent.systemPrompt).toBe('Custom prompt')
  })

  it('should start with idle status', () => {
    const provider = createMockProvider('response')
    const tools = new Map<string, ToolDefinition>()
    const agent = new Agent(
      { name: 'test-agent', role: 'worker' },
      provider,
      tools
    )

    expect(agent.getStatus()).toBe('idle')
  })

  it('should execute task and return result', async () => {
    const provider = createMockProvider('task result')
    const tools = new Map<string, ToolDefinition>()
    const agent = new Agent(
      { name: 'test-agent', role: 'worker' },
      provider,
      tools
    )

    const task = {
      id: 'task-1',
      description: 'test task',
      input: 'do something',
      status: 'idle' as const,
      createdAt: Date.now(),
    }

    const result = await agent.execute(task)
    expect(result.status).toBe('completed')
    expect(result.result).toBe('task result')
    expect(result.assignedTo).toBe('test-agent')
    expect(result.completedAt).toBeDefined()
  })

  it('should handle task failure', async () => {
    const provider: LLMProvider = {
      name: 'mock-fail',
      async sendMessage() {
        throw new Error('LLM error')
      },
    }
    const tools = new Map<string, ToolDefinition>()
    const agent = new Agent(
      { name: 'test-agent', role: 'worker' },
      provider,
      tools
    )

    const task = {
      id: 'task-1',
      description: 'test task',
      input: 'do something',
      status: 'idle' as const,
      createdAt: Date.now(),
    }

    const result = await agent.execute(task)
    expect(result.status).toBe('failed')
    expect(result.error).toBe('LLM error')
  })

  it('should reset to idle status', () => {
    const provider = createMockProvider('response')
    const tools = new Map<string, ToolDefinition>()
    const agent = new Agent(
      { name: 'test-agent', role: 'worker' },
      provider,
      tools
    )

    agent.reset()
    expect(agent.getStatus()).toBe('idle')
  })

  it('should have correct default system prompts for each role', () => {
    const provider = createMockProvider('response')
    const tools = new Map<string, ToolDefinition>()

    const roles = ['coordinator', 'worker', 'specialist', 'reviewer'] as const
    for (const role of roles) {
      const agent = new Agent(
        { name: `${role}-agent`, role },
        provider,
        tools
      )
      expect(agent.systemPrompt).toContain(role)
    }
  })
})
