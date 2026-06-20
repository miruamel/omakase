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
    try {
      await access(this.memoryPath)
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
      
      return memories
    } catch (error) {
      logger.debug('Memory file not found', { path: this.memoryPath })
      return {}
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
    logger.debug('Memory saved', { path: this.memoryPath })
  }

  /**
   * Clear semua memories.
   */
  async clear(): Promise<void> {
    await writeFile(this.memoryPath, '', 'utf-8')
  }
}