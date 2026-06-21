/**
 * Tests untuk MemoryManager.
 * @module core/services/memory/manager/manager.test
 */

import { describe, it, expect, beforeEach, afterEach } from 'bun:test'
import { MemoryManager } from './manager.ts'
import { mkdtemp, rm, writeFile } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'

describe('MemoryManager', () => {
  let tempDir: string
  let memoryPath: string
  let manager: MemoryManager

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'omakase-memory-'))
    memoryPath = join(tempDir, 'OMAKASE.md')
    manager = new MemoryManager(memoryPath)
  })

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true })
  })

  it('should return empty when memory file does not exist', async () => {
    const memories = await manager.list()
    expect(memories).toEqual({})
  })

  it('should add and get memory', async () => {
    await manager.add('project', 'Omakase CLI')
    const value = await manager.get('project')
    expect(value).toBe('Omakase CLI')
  })

  it('should list all memories', async () => {
    await manager.add('key1', 'value1')
    await manager.add('key2', 'value2')
    const memories = await manager.list()
    expect(Object.keys(memories).length).toBe(2)
    expect(memories.key1).toBe('value1')
    expect(memories.key2).toBe('value2')
  })

  it('should return undefined for non-existent key', async () => {
    const value = await manager.get('non-existent')
    expect(value).toBeUndefined()
  })

  it('should clear all memories', async () => {
    await manager.add('key1', 'value1')
    await manager.clear()
    const memories = await manager.list()
    expect(memories).toEqual({})
  })

  it('should parse existing memory file', async () => {
    await writeFile(
      memoryPath,
      '### key1\n\nvalue1\n\n### key2\n\nvalue2',
      'utf-8'
    )
    const memories = await manager.list()
    expect(memories.key1).toBe('value1')
    expect(memories.key2).toBe('value2')
  })

  it('should handle missing file gracefully', async () => {
    const memories = await manager.list()
    expect(memories).toEqual({})
  })
})
