/**
 * Memory manager.
 * @module core/services/memory/manager
 */

import { readFile, writeFile, access } from 'fs/promises'
import { join } from 'path'
import { logger } from '../../logger/logger/logger.ts'

/**
 * Memory manager untuk load/save OMAKASE.md.
 */
export class MemoryManager {
  private memoryPath: string
  private cache: Record<string, string> | null = null
  private cacheTimestamp: number = 0
  private cacheTTL: number = 5000 // 5 seconds

  constructor(memoryPath?: string) {
    this.memoryPath = memoryPath || join(process.cwd(), 'OMAKASE.md')
  }

  /**
   * Add memory entry.
   *
   * @param key - Memory key
   * @param value - Memory value
   */
  async add(key: string, value: string): Promise<void> {
    const memories = await this.list()
    memories[key] = value
    await this.save(memories)
  }

  /**
   * Get memory by key.
   *
   * @param key - Memory key
   * @returns Memory value atau undefined
   */
  async get(key: string): Promise<string | undefined> {
    const memories = await this.list()
    return memories[key]
  }

  /**
   * List semua memories.
   *
   * @returns Object dengan semua memories
   */
  async list(): Promise<Record<string, string>> {
    const now = Date.now()
    if (this.cache && (now - this.cacheTimestamp) < this.cacheTTL) {
      return { ...this.cache }
    }

    try {
      await access(this.memoryPath)
    } catch {
      logger.debug('Memory file not found', { path: this.memoryPath })
      this.cache = {}
      this.cacheTimestamp = now
      return {}
    }

    try {
      const content = await readFile(this.memoryPath, 'utf-8')
      const lines = content.split('\n')
      const memories: Record<string, string> = {}

      let currentKey: string | null = null
      let currentValue: string[] = []

      for (const line of lines) {
        if (line.startsWith('### ')) {
          if (currentKey) {
            memories[currentKey] = currentValue.join('\n').trim()
          }
          currentKey = line.slice(4).trim()
          currentValue = []
        } else if (currentKey) {
          currentValue.push(line)
        }
      }

      if (currentKey) {
        memories[currentKey] = currentValue.join('\n').trim()
      }

      this.cache = memories
      this.cacheTimestamp = now
      return { ...memories }
    } catch (error) {
      logger.error('Failed to read memory file', error as Error, { path: this.memoryPath })
      throw new Error(`Failed to read memory: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Save memories ke file.
   *
   * @param memories - Memories untuk save
   */
  async save(memories: Record<string, string>): Promise<void> {
    const content = Object.entries(memories)
      .map(([key, value]) => `### ${key}\n\n${value}`)
      .join('\n\n')

    await writeFile(this.memoryPath, content, 'utf-8')
    this.cache = { ...memories }
    this.cacheTimestamp = Date.now()
    logger.debug('Memory saved', { path: this.memoryPath })
  }

  /**
   * Clear semua memories.
   */
  async clear(): Promise<void> {
    await writeFile(this.memoryPath, '', 'utf-8')
    this.cache = {}
    this.cacheTimestamp = Date.now()
  }

  /**
   * Invalidate cache.
   */
  invalidateCache(): void {
    this.cache = null
    this.cacheTimestamp = 0
  }
}