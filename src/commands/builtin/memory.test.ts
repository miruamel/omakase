/**
 * Memory command tests.
 * @module commands/builtin/memory.test
 */

import { describe, it, expect, beforeEach, afterEach } from 'bun:test'
import { mkdtempSync, rmSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { memoryCommand } from './memory.ts'

let tempDir: string
let originalCwd: string

describe('memoryCommand', () => {
  beforeEach(() => {
    originalCwd = process.cwd()
    tempDir = mkdtempSync(join(tmpdir(), 'omakase-memory-test-'))
    process.chdir(tempDir)
  })

  afterEach(() => {
    process.chdir(originalCwd)
    rmSync(tempDir, { recursive: true, force: true })
  })

  it('should have correct name and description', () => {
    expect(memoryCommand.name).toBe('memory')
    expect(memoryCommand.description).toBeTruthy()
  })

  it('should show usage when no action provided', async () => {
    const result = await memoryCommand.execute([], {} as any)
    expect(result.type).toBe('text')
    expect(result.content).toContain('Usage')
  })

  it('should add a memory', async () => {
    const result = await memoryCommand.execute(['add', 'project', 'omakase'], {} as any)
    expect(result.type).toBe('text')
    expect(result.content).toContain('Added memory: project')
  })

  it('should get a memory', async () => {
    await memoryCommand.execute(['add', 'lang', 'typescript'], {} as any)
    const result = await memoryCommand.execute(['get', 'lang'], {} as any)
    expect(result.type).toBe('text')
    expect(result.content).toContain('typescript')
  })

  it('should report when memory not found', async () => {
    const result = await memoryCommand.execute(['get', 'nonexistent'], {} as any)
    expect(result.type).toBe('text')
    expect(result.content).toContain('Memory not found')
  })

  it('should list empty memories', async () => {
    const result = await memoryCommand.execute(['list'], {} as any)
    expect(result.type).toBe('text')
    expect(result.content).toContain('No memories')
  })

  it('should list memories', async () => {
    await memoryCommand.execute(['add', 'k1', 'value1'], {} as any)
    await memoryCommand.execute(['add', 'k2', 'value2'], {} as any)
    const result = await memoryCommand.execute(['list'], {} as any)
    expect(result.type).toBe('text')
    expect(result.content).toContain('Memories')
    expect(result.content).toContain('k1')
    expect(result.content).toContain('k2')
  })

  it('should clear memories', async () => {
    await memoryCommand.execute(['add', 'temp', 'value'], {} as any)
    const result = await memoryCommand.execute(['clear'], {} as any)
    expect(result.type).toBe('text')
    expect(result.content).toContain('Memory cleared')
  })

  it('should reject add without key', async () => {
    const result = await memoryCommand.execute(['add'], {} as any)
    expect(result.type).toBe('text')
    expect(result.content).toContain('Usage')
  })

  it('should reject add without value', async () => {
    const result = await memoryCommand.execute(['add', 'key'], {} as any)
    expect(result.type).toBe('text')
    expect(result.content).toContain('Usage')
  })

  it('should reject get without key', async () => {
    const result = await memoryCommand.execute(['get'], {} as any)
    expect(result.type).toBe('text')
    expect(result.content).toContain('Usage')
  })

  it('should reject unknown action', async () => {
    const result = await memoryCommand.execute(['unknown'], {} as any)
    expect(result.type).toBe('text')
    expect(result.content).toContain('Usage')
  })
})
