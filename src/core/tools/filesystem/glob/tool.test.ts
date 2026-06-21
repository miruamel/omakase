/**
 * GlobTool tests.
 * @module core/tools/filesystem/glob/tool.test
 */

import { describe, it, expect, beforeEach, afterEach } from 'bun:test'
import { GlobTool } from './tool.ts'
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

describe('GlobTool', () => {
  let tempDir: string

  beforeEach(async () => {
    tempDir = join(tmpdir(), `omakase-glob-${Date.now()}-${Math.random().toString(36).slice(2)}`)
    await mkdir(tempDir, { recursive: true })
    await writeFile(join(tempDir, 'file1.ts'), 'content1')
    await writeFile(join(tempDir, 'file2.ts'), 'content2')
    await writeFile(join(tempDir, 'file3.js'), 'content3')
    await mkdir(join(tempDir, 'subdir'), { recursive: true })
    await writeFile(join(tempDir, 'subdir', 'file4.ts'), 'content4')
  })

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true })
  })

  it('should have correct name and description', () => {
    expect(GlobTool.name).toBe('Glob')
    expect(GlobTool.description).toBeTruthy()
  })

  it('should find files matching pattern', async () => {
    const context = createMockContext(tempDir)
    const result = await GlobTool.call({ pattern: '*.ts' }, context)
    expect(result.success).toBe(true)
    expect(result.data.count).toBe(2)
  })

  it('should find files recursively', async () => {
    const context = createMockContext(tempDir)
    const result = await GlobTool.call({ pattern: '**/*.ts' }, context)
    expect(result.success).toBe(true)
    expect(result.data.count).toBe(3)
  })

  it('should return empty array for no matches', async () => {
    const context = createMockContext(tempDir)
    const result = await GlobTool.call({ pattern: '*.py' }, context)
    expect(result.success).toBe(true)
    expect(result.data.count).toBe(0)
  })

  it('should use custom cwd', async () => {
    const context = createMockContext('/tmp')
    const result = await GlobTool.call({ pattern: '*.ts', cwd: tempDir }, context)
    expect(result.success).toBe(true)
    expect(result.data.count).toBe(2)
  })

  it('should grant permission', async () => {
    const permission = await GlobTool.checkPermissions!({ pattern: '*.ts' })
    expect(permission.granted).toBe(true)
  })
})
