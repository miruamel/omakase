/**
 * Console output.
 * @module core/services/logger/outputs/console
 */

import type { LogEntry } from '../types/entry.ts'
import chalk from 'chalk'

/**
 * Console output untuk logger.
 */
export class ConsoleOutput {
  /**
   * Write log entry ke console.
   * 
   * @param entry - Log entry
   */
  write(entry: LogEntry) {
    const timestamp = new Date(entry.timestamp).toISOString()
    const level = entry.level.toUpperCase().padEnd(5)
    
    const colors: Record<string, any> = {
      debug: chalk.gray,
      info: chalk.blue,
      warn: chalk.yellow,
      error: chalk.red,
    }

    const color = colors[entry.level] || chalk.white
    console.log(color(`${timestamp} [${level}] ${entry.message}`))
    
    if (entry.data) {
      console.log(color(JSON.stringify(entry.data, null, 2)))
    }
  }
}