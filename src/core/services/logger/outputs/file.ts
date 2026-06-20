/**
 * File output.
 * @module core/services/logger/outputs/file
 */

import { writeFile, appendFile, access } from 'fs/promises'
import { dirname, join } from 'path'
import type { LogEntry } from '../types/entry.ts'

/**
 * File output untuk logger.
 */
export class FileOutput {
  private filePath: string
  private buffer: string[] = []

  constructor(filePath?: string) {
    this.filePath = filePath || join(process.cwd(), '.omakase', 'logs', 'omakase.log')
  }

  /**
   * Write log entry ke file.
   * 
   * @param entry - Log entry
   */
  async write(entry: LogEntry) {
    const line = this.formatEntry(entry)
    this.buffer.push(line)
    
    // Flush buffer setiap 10 entries
    if (this.buffer.length >= 10) {
      await this.flush()
    }
  }

  /**
   * Flush buffer ke file.
   */
  async flush() {
    if (this.buffer.length === 0) return

    try {
      await access(dirname(this.filePath))
    } catch {
      await writeFile(this.filePath, '', 'utf-8')
    }

    const content = this.buffer.join('\n') + '\n'
    await appendFile(this.filePath, content, 'utf-8')
    this.buffer = []
  }

  private formatEntry(entry: LogEntry): string {
    const timestamp = new Date(entry.timestamp).toISOString()
    const level = entry.level.toUpperCase().padEnd(5)
    const data = entry.data ? ` ${JSON.stringify(entry.data)}` : ''
    return `${timestamp} [${level}] ${entry.message}${data}`
  }
}