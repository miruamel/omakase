/**
 * Tests untuk AgentRegistry.
 * @module core/agents/registry.test
 */

import { describe, it, expect } from 'bun:test'
import { AgentRegistry } from './registry.ts'
import type { LLMProvider, LLMResponse } from '../providers/interface.ts'
import type { ToolDefinition } from '../../types/tools/definition.ts'

function createMockProvider(): LLMProvider {
  return {
    name: 'mock',
    async sendMessage(): Promise<LLMResponse> {
      return { content: 'response' }
    },
  }
}

describe('AgentRegistry', () => {
  it('should register and retrieve agent', () => {
    const provider = createMockProvider()
    const tools = new Map<string, ToolDefinition>()
    const registry = new AgentRegistry(provider, tools)

    const agent = registry.register({ name: 'agent-1', role: 'worker' })
    expect(agent.name).toBe('agent-1')

    const retrieved = registry.get('agent-1')
    expect(retrieved).toBe(agent)
  })

  it('should return undefined for non-existent agent', () => {
    const provider = createMockProvider()
    const tools = new Map<string, ToolDefinition>()
    const registry = new AgentRegistry(provider, tools)

    expect(registry.get('non-existent')).toBeUndefined()
  })

  it('should list all agents', () => {
    const provider = createMockProvider()
    const tools = new Map<string, ToolDefinition>()
    const registry = new AgentRegistry(provider, tools)

    registry.register({ name: 'agent-1', role: 'worker' })
    registry.register({ name: 'agent-2', role: 'specialist' })

    const agents = registry.getAll()
    expect(agents.length).toBe(2)
  })

  it('should unregister agent', () => {
    const provider = createMockProvider()
    const tools = new Map<string, ToolDefinition>()
    const registry = new AgentRegistry(provider, tools)

    registry.register({ name: 'agent-1', role: 'worker' })
    expect(registry.size()).toBe(1)

    const removed = registry.unregister('agent-1')
    expect(removed).toBe(true)
    expect(registry.size()).toBe(0)
  })

  it('should return false when unregistering non-existent agent', () => {
    const provider = createMockProvider()
    const tools = new Map<string, ToolDefinition>()
    const registry = new AgentRegistry(provider, tools)

    const removed = registry.unregister('non-existent')
    expect(removed).toBe(false)
  })

  it('should track size correctly', () => {
    const provider = createMockProvider()
    const tools = new Map<string, ToolDefinition>()
    const registry = new AgentRegistry(provider, tools)

    expect(registry.size()).toBe(0)
    registry.register({ name: 'agent-1', role: 'worker' })
    expect(registry.size()).toBe(1)
    registry.register({ name: 'agent-2', role: 'specialist' })
    expect(registry.size()).toBe(2)
  })
})
