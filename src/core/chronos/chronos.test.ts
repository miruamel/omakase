/**
 * Tests untuk Chronos scheduler.
 * @module core/chronos/chronos.test
 */

import { describe, it, expect, beforeEach, afterEach } from 'bun:test'
import { Chronos } from './chronos.ts'

describe('Chronos', () => {
  let chronos: Chronos

  beforeEach(() => {
    chronos = new Chronos()
  })

  afterEach(() => {
    chronos.shutdown()
  })

  it('should schedule a once task', () => {
    let executed = false
    const task = chronos.schedule({
      name: 'test-once',
      type: 'once',
      handler: () => {
        executed = true
      },
    })

    expect(task.id).toBeDefined()
    expect(task.name).toBe('test-once')
    expect(task.type).toBe('once')
    expect(task.status).toBe('pending')
    expect(executed).toBe(false)
  })

  it('should schedule a delayed task', () => {
    const task = chronos.schedule({
      name: 'test-delayed',
      type: 'delayed',
      delayMs: 100,
      handler: () => {},
    })

    expect(task.type).toBe('delayed')
    expect(task.nextExecutionAt).toBeGreaterThan(Date.now())
  })

  it('should schedule an interval task', () => {
    const task = chronos.schedule({
      name: 'test-interval',
      type: 'interval',
      intervalMs: 1000,
      handler: () => {},
    })

    expect(task.type).toBe('interval')
    expect(task.nextExecutionAt).toBeGreaterThan(Date.now())
  })

  it('should cancel a task', () => {
    const task = chronos.schedule({
      name: 'test-cancel',
      type: 'once',
      handler: () => {},
    })

    const cancelled = chronos.cancel(task.id)
    expect(cancelled).toBe(true)
    expect(chronos.get(task.id)?.status).toBe('cancelled')
  })

  it('should return false when cancelling non-existent task', () => {
    const cancelled = chronos.cancel('non-existent-id')
    expect(cancelled).toBe(false)
  })

  it('should list all tasks', () => {
    chronos.schedule({ name: 'task1', type: 'once', handler: () => {} })
    chronos.schedule({ name: 'task2', type: 'once', handler: () => {} })

    const tasks = chronos.getAll()
    expect(tasks.length).toBe(2)
  })

  it('should filter tasks by status', () => {
    const task1 = chronos.schedule({ name: 'task1', type: 'once', handler: () => {} })
    chronos.schedule({ name: 'task2', type: 'once', handler: () => {} })
    chronos.cancel(task1.id)

    const pending = chronos.getByStatus('pending')
    const cancelled = chronos.getByStatus('cancelled')
    expect(pending.length).toBe(1)
    expect(cancelled.length).toBe(1)
  })

  it('should shutdown all tasks', () => {
    chronos.schedule({ name: 'task1', type: 'interval', intervalMs: 1000, handler: () => {} })
    chronos.schedule({ name: 'task2', type: 'interval', intervalMs: 1000, handler: () => {} })

    chronos.shutdown()
    expect(chronos.getAll().length).toBe(2)
  })

  it('should execute delayed task after delay', async () => {
    let executed = false
    chronos.schedule({
      name: 'test-execute',
      type: 'delayed',
      delayMs: 50,
      handler: () => {
        executed = true
      },
    })

    await new Promise(resolve => setTimeout(resolve, 150))
    expect(executed).toBe(true)
  })

  it('should throw on missing name', () => {
    expect(() => chronos.schedule({
      name: '',
      type: 'once',
      handler: () => {},
    })).toThrow('name is required')
  })

  it('should throw on invalid type', () => {
    expect(() => chronos.schedule({
      name: 'test',
      type: 'invalid' as any,
      handler: () => {},
    })).toThrow('Invalid task type')
  })

  it('should throw on missing handler', () => {
    expect(() => chronos.schedule({
      name: 'test',
      type: 'once',
      handler: undefined as any,
    })).toThrow('handler is required')
  })

  it('should throw on interval without intervalMs', () => {
    expect(() => chronos.schedule({
      name: 'test',
      type: 'interval',
      handler: () => {},
    })).toThrow('intervalMs')
  })

  it('should throw on cron without cronExpression', () => {
    expect(() => chronos.schedule({
      name: 'test',
      type: 'cron',
      handler: () => {},
    })).toThrow('cronExpression')
  })

  it('should throw on negative maxExecutions', () => {
    expect(() => chronos.schedule({
      name: 'test',
      type: 'once',
      handler: () => {},
      maxExecutions: -1,
    })).toThrow('maxExecutions')
  })
})
