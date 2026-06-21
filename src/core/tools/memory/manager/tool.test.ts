/**
 * MemoryTool tests.
 * @module core/tools/memory/manager/tool.test
 */

import { describe, it, expect, beforeEach, afterEach } from 'bun:test'
import { MemoryTool } from './tool.ts'
import { mkdtemp, rm } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import type { ToolContext } from '../../../../types/tools/context.ts'
import type { Session } from '../../../../types/messages/turn.ts'

function createMockContext(): ToolContext {
  const session: Session = {
    id: 'test-session',
    startTime: Date.now(),
    lastActivity: Date.now(),
    messages: [],
  }
  return {
    session,
    workingDirectory: '/tmp',
  }
}

describe('MemoryTool', () => {
  let tempDir: string
  let context: ToolContext

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'omakase-memory-'))
    context = createMockContext()
  })

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true })
  })

  it('should have correct name and description', () => {
    expect(MemoryTool.name).toBe('Memory')
    expect(MemoryTool.description).toBeTruthy()
  })

  it('should add memory', async () => {
    const result = await MemoryTool.call({
      action: 'add',
      key: 'user-pref',
      value: 'dark mode',
    }, context)
    expect(result.success).toBe(true)
    expect(result.data.added).toBe('user-pref')
  })

  it('should get memory', async () => {
    await MemoryTool.call({
      action: 'add',
      key: 'user-pref',
      value: 'dark mode',
    }, context)

    const result = await MemoryTool.call({
      action: 'get',
      key: 'user-pref',
    }, context)
    expect(result.success).toBe(true)
    expect(result.data['user-pref']).toBe('dark mode')
  })

  it('should list memories', async () => {
    await MemoryTool.call({
      action: 'add',
      key: 'key1',
      value: 'value1',
    }, context)
    await MemoryTool.call({
      action: 'add',
      key: 'key2',
      value: 'value2',
    }, context)

    const result = await MemoryTool.call({ action: 'list' }, context)
    expect(result.success).toBe(true)
    expect(result.data.key1).toBe('value1')
    expect(result.data.key2).toBe('value2')
  })

  it('should clear memories', async () => {
    await MemoryTool.call({
      action: 'add',
      key: 'key1',
      value: 'value1',
    }, context)

    const result = await MemoryTool.call({ action: 'clear' }, context)
    expect(result.success).toBe(true)
    expect(result.data.cleared).toBe(true)
  })

  it('should fail on add without key', async () => {
    const result = await MemoryTool.call({
      action: 'add',
      value: 'value',
    }, context)
    expect(result.success).toBe(false)
  })

  it('should fail on add without value', async () => {
    const result = await MemoryTool.call({
      action: 'add',
      key: 'key',
    }, context)
    expect(result.success).toBe(false)
  })

  it('should fail on get without key', async () => {
    const result = await MemoryTool.call({ action: 'get' }, context)
    expect(result.success).toBe(false)
  })

  it('should grant permission', async () => {
    const permission = await MemoryTool.checkPermissions!({ action: 'list' })
    expect(permission.granted).toBe(true)
  })
})
