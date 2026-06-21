/**
 * Chronos command tests.
 * @module commands/builtin/chronos.test
 */

import { describe, it, expect, beforeEach } from 'bun:test'
import { chronosCommand } from './chronos.ts'
import { setRuntime } from '../../core/runtime/index.ts'
import { RuntimeContext } from '../../core/runtime/runtime.ts'
import type { LLMProvider } from '../../core/providers/interface.ts'

const mockProvider: LLMProvider = {
  name: 'mock',
  async sendMessage() {
    return { content: 'mock response' }
  },
}

describe('chronosCommand', () => {
  beforeEach(() => {
    setRuntime(new RuntimeContext(mockProvider, []))
  })

  it('should have correct name and description', () => {
    expect(chronosCommand.name).toBe('chronos')
    expect(chronosCommand.description).toBeTruthy()
  })

  it('should show help by default', async () => {
    const result = await chronosCommand.execute([], {} as any)
    expect(result.type).toBe('text')
    expect(result.content).toContain('Chronos Commands')
    expect(result.content).toContain('/chronos list')
    expect(result.content).toContain('/chronos schedule')
    expect(result.content).toContain('/chronos cancel')
  })

  it('should list empty tasks', async () => {
    const result = await chronosCommand.execute(['list'], {} as any)
    expect(result.type).toBe('text')
    expect(result.content).toContain('No scheduled tasks')
  })

  it('should schedule a once task', async () => {
    const result = await chronosCommand.execute(['schedule', 'task1', 'once', '1000'], {} as any)
    expect(result.type).toBe('text')
    expect(result.content).toContain('Scheduled task: task1')
    expect(result.content).toContain('once')
  })

  it('should schedule an interval task', async () => {
    const result = await chronosCommand.execute(['schedule', 'task2', 'interval', '5000'], {} as any)
    expect(result.type).toBe('text')
    expect(result.content).toContain('Scheduled task: task2')
    expect(result.content).toContain('interval')
  })

  it('should reject invalid type', async () => {
    const result = await chronosCommand.execute(['schedule', 'task3', 'invalid-type'], {} as any)
    expect(result.type).toBe('text')
    expect(result.content).toContain('Invalid type')
  })

  it('should reject missing args for schedule', async () => {
    const result = await chronosCommand.execute(['schedule'], {} as any)
    expect(result.type).toBe('text')
    expect(result.content).toContain('Usage')
  })

  it('should reject missing args for cancel', async () => {
    const result = await chronosCommand.execute(['cancel'], {} as any)
    expect(result.type).toBe('text')
    expect(result.content).toContain('Usage')
  })

  it('should report when cancelling non-existent task', async () => {
    const result = await chronosCommand.execute(['cancel', 'nonexistent'], {} as any)
    expect(result.type).toBe('text')
    expect(result.content).toContain('Task not found')
  })

  it('should list scheduled tasks', async () => {
    await chronosCommand.execute(['schedule', 'a', 'once', '1000'], {} as any)
    await chronosCommand.execute(['schedule', 'b', 'interval', '5000'], {} as any)
    const result = await chronosCommand.execute(['list'], {} as any)
    expect(result.type).toBe('text')
    expect(result.content).toContain('Scheduled tasks (2)')
    expect(result.content).toContain('a')
    expect(result.content).toContain('b')
  })

  it('should cancel a task by name', async () => {
    await chronosCommand.execute(['schedule', 'cancelme', 'once', '1000'], {} as any)
    const result = await chronosCommand.execute(['cancel', 'cancelme'], {} as any)
    expect(result.type).toBe('text')
    expect(result.content).toContain('Cancelled task: cancelme')
  })
})
