/**
 * FileWriteTool tests.
 * @module core/tools/filesystem/write/tool.test
 */

import { describe, it, expect, beforeEach, afterEach } from 'bun:test'
import { FileWriteTool } from './tool.ts'
import { readFile, mkdir, rm } from 'fs/promises'
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

describe('FileWriteTool', () => {
  let tempDir: string
  let context: ToolContext

  beforeEach(async () => {
    tempDir = await (async () => {
      const dir = join(tmpdir(), `omakase-test-${Date.now()}-${Math.random().toString(36).slice(2)}`)
      await mkdir(dir, { recursive: true })
      return dir
    })()
    context = createMockContext()
  })

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true })
  })

  it('should have correct name and description', () => {
    expect(FileWriteTool.name).toBe('FileWrite')
    expect(FileWriteTool.description).toBeTruthy()
  })

  it('should write file contents', async () => {
    const filePath = join(tempDir, 'test.txt')
    const result = await FileWriteTool.call({ path: filePath, content: 'Hello, World!' }, context)
    expect(result.success).toBe(true)

    const content = await readFile(filePath, 'utf-8')
    expect(content).toBe('Hello, World!')
  })

  it('should create nested directories', async () => {
    const filePath = join(tempDir, 'nested', 'deep', 'test.txt')
    const result = await FileWriteTool.call({ path: filePath, content: 'nested content' }, context)
    expect(result.success).toBe(true)

    const content = await readFile(filePath, 'utf-8')
    expect(content).toBe('nested content')
  })

  it('should overwrite existing file', async () => {
    const filePath = join(tempDir, 'test.txt')
    await FileWriteTool.call({ path: filePath, content: 'first' }, context)
    await FileWriteTool.call({ path: filePath, content: 'second' }, context)

    const content = await readFile(filePath, 'utf-8')
    expect(content).toBe('second')
  })

  it('should reject write to /etc/', async () => {
    const permission = await FileWriteTool.checkPermissions!({ path: '/etc/passwd', content: 'test' })
    expect(permission.granted).toBe(false)
  })

  it('should reject write to /proc/', async () => {
    const permission = await FileWriteTool.checkPermissions!({ path: '/proc/sys/test', content: 'test' })
    expect(permission.granted).toBe(false)
  })

  it('should reject write to /sys/', async () => {
    const permission = await FileWriteTool.checkPermissions!({ path: '/sys/kernel/test', content: 'test' })
    expect(permission.granted).toBe(false)
  })

  it('should allow write to safe path', async () => {
    const permission = await FileWriteTool.checkPermissions!({ path: '/tmp/test.txt', content: 'test' })
    expect(permission.granted).toBe(true)
  })
})
