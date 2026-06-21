/**
 * GrepTool tests.
 * @module core/tools/filesystem/grep/tool.test
 */

import { describe, it, expect, beforeEach, afterEach } from 'bun:test'
import { GrepTool } from './tool.ts'
import { writeFile, mkdir, rm } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import type { ToolContext } from '../../../../types/tools/context.ts'
import type { Session } from '../../../../types/messages/turn.ts'

function createMockContext(cwd: string): ToolContext {
  const session: Session = {
    id: 'test-session',
    startTime: Date.now(),
    lastActivity: Date.now(),
    messages: [],
  }
  return {
    session,
    workingDirectory: cwd,
  }
}

describe('GrepTool', () => {
  let tempDir: string

  beforeEach(async () => {
    tempDir = join(tmpdir(), `omakase-grep-${Date.now()}-${Math.random().toString(36).slice(2)}`)
    await mkdir(tempDir, { recursive: true })
    await writeFile(join(tempDir, 'file1.ts'), 'hello world\nfoo bar\nhello again')
    await writeFile(join(tempDir, 'file2.ts'), 'goodbye world\nhello there')
    await writeFile(join(tempDir, 'file3.js'), 'javascript content')
  })

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true })
  })

  it('should have correct name and description', () => {
    expect(GrepTool.name).toBe('Grep')
    expect(GrepTool.description).toBeTruthy()
  })

  it('should find pattern in single file', async () => {
    const context = createMockContext(tempDir)
    const result = await GrepTool.call({ pattern: 'hello', path: join(tempDir, 'file1.ts') }, context)
    expect(result.success).toBe(true)
    expect(result.data.count).toBe(2)
  })

  it('should find pattern across multiple files', async () => {
    const context = createMockContext(tempDir)
    const result = await GrepTool.call({ pattern: 'hello', include: '*.ts' }, context)
    expect(result.success).toBe(true)
    expect(result.data.count).toBe(3)
  })

  it('should return empty for no matches', async () => {
    const context = createMockContext(tempDir)
    const result = await GrepTool.call({ pattern: 'nonexistent', include: '*.ts' }, context)
    expect(result.success).toBe(true)
    expect(result.data.count).toBe(0)
  })

  it('should support regex patterns', async () => {
    const context = createMockContext(tempDir)
    const result = await GrepTool.call({ pattern: 'h[ae]llo', include: '*.ts' }, context)
    expect(result.success).toBe(true)
    expect(result.data.count).toBeGreaterThan(0)
  })

  it('should include line numbers', async () => {
    const context = createMockContext(tempDir)
    const result = await GrepTool.call({ pattern: 'foo', path: join(tempDir, 'file1.ts') }, context)
    expect(result.success).toBe(true)
    expect(result.data.results[0].line).toBe(2)
  })

  it('should grant permission', async () => {
    const permission = await GrepTool.checkPermissions!({ pattern: 'test' })
    expect(permission.granted).toBe(true)
  })
})
