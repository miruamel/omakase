/**
 * Agents command tests.
 * @module commands/builtin/agents.test
 */

import { describe, it, expect, beforeEach } from 'bun:test'
import { agentsCommand } from './agents.ts'
import { setRuntime } from '../../core/runtime/index.ts'
import { RuntimeContext } from '../../core/runtime/runtime.ts'
import type { LLMProvider } from '../../core/providers/interface.ts'

const mockProvider: LLMProvider = {
  name: 'mock',
  async sendMessage() {
    return { content: 'mock response' }
  },
}

describe('agentsCommand', () => {
  beforeEach(() => {
    setRuntime(new RuntimeContext(mockProvider, []))
  })

  it('should have correct name and description', () => {
    expect(agentsCommand.name).toBe('agents')
    expect(agentsCommand.description).toBeTruthy()
  })

  it('should show help by default', async () => {
    const result = await agentsCommand.execute([], {} as any)
    expect(result.type).toBe('text')
    expect(result.content).toContain('Multi-Agent Commands')
    expect(result.content).toContain('/agents list')
    expect(result.content).toContain('/agents register')
    expect(result.content).toContain('/agents run')
  })

  it('should list empty agents', async () => {
    const result = await agentsCommand.execute(['list'], {} as any)
    expect(result.type).toBe('text')
    expect(result.content).toContain('No agents registered')
  })

  it('should register an agent', async () => {
    const result = await agentsCommand.execute(['register', 'worker1', 'worker'], {} as any)
    expect(result.type).toBe('text')
    expect(result.content).toContain('Registered agent: worker1')
    expect(result.content).toContain('worker')
  })

  it('should reject invalid role', async () => {
    const result = await agentsCommand.execute(['register', 'agent1', 'invalid-role'], {} as any)
    expect(result.type).toBe('text')
    expect(result.content).toContain('Invalid role')
  })

  it('should reject missing args for register', async () => {
    const result = await agentsCommand.execute(['register'], {} as any)
    expect(result.type).toBe('text')
    expect(result.content).toContain('Usage')
  })

  it('should unregister an agent', async () => {
    await agentsCommand.execute(['register', 'temp', 'worker'], {} as any)
    const result = await agentsCommand.execute(['unregister', 'temp'], {} as any)
    expect(result.type).toBe('text')
    expect(result.content).toContain('Unregistered agent: temp')
  })

  it('should report when unregistering non-existent agent', async () => {
    const result = await agentsCommand.execute(['unregister', 'nonexistent'], {} as any)
    expect(result.type).toBe('text')
    expect(result.content).toContain('Agent not found')
  })

  it('should reject missing args for unregister', async () => {
    const result = await agentsCommand.execute(['unregister'], {} as any)
    expect(result.type).toBe('text')
    expect(result.content).toContain('Usage')
  })

  it('should reject missing task for run', async () => {
    const result = await agentsCommand.execute(['run'], {} as any)
    expect(result.type).toBe('text')
    expect(result.content).toContain('Usage')
  })

  it('should reject run with no agents', async () => {
    const result = await agentsCommand.execute(['run', 'do something'], {} as any)
    expect(result.type).toBe('text')
    expect(result.content).toContain('No agents registered')
  })

  it('should list registered agents', async () => {
    await agentsCommand.execute(['register', 'a1', 'worker'], {} as any)
    await agentsCommand.execute(['register', 'a2', 'reviewer'], {} as any)
    const result = await agentsCommand.execute(['list'], {} as any)
    expect(result.type).toBe('text')
    expect(result.content).toContain('Registered agents (2)')
    expect(result.content).toContain('a1')
    expect(result.content).toContain('a2')
  })
})
