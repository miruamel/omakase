/**
 * FileReadTool tests.
 * @module core/tools/filesystem/read/tool.test
 */

import { describe, it, expect, beforeEach, afterEach } from 'bun:test'
import { FileReadTool } from './tool.ts'
import { writeFile, mkdir, rm } from 'fs/promises'
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

describe('FileReadTool', () => {
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
    expect(FileReadTool.name).toBe('FileRead')
    expect(FileReadTool.description).toBeTruthy()
  })

  it('should read file contents', async () => {
    const filePath = join(tempDir, 'test.txt')
    await writeFile(filePath, 'Hello, World!', 'utf-8')

    const result = await FileReadTool.call({ path: filePath }, context)
    expect(result.success).toBe(true)
    expect(result.data.content).toBe('Hello, World!')
  })

  it('should read file with limit', async () => {
    const filePath = join(tempDir, 'test.txt')
    await writeFile(filePath, 'line1\nline2\nline3\nline4\nline5', 'utf-8')

    const result = await FileReadTool.call({ path: filePath, limit: 2 }, context)
    expect(result.success).toBe(true)
    expect(result.data.content).toBe('line1\nline2')
    expect(result.data.returnedLines).toBe(2)
  })

  it('should read file with offset', async () => {
    const filePath = join(tempDir, 'test.txt')
    await writeFile(filePath, 'line1\nline2\nline3\nline4\nline5', 'utf-8')

    const result = await FileReadTool.call({ path: filePath, offset: 2 }, context)
    expect(result.success).toBe(true)
    expect(result.data.content).toBe('line3\nline4\nline5')
  })

  it('should handle non-existent file', async () => {
    const result = await FileReadTool.call({ path: '/nonexistent/file.txt' }, context)
    expect(result.success).toBe(false)
    expect(result.error).toBeTruthy()
  })

  it('should grant permission for any path', async () => {
    const permission = await FileReadTool.checkPermissions!({ path: '/etc/passwd' })
    expect(permission.granted).toBe(true)
  })
})
