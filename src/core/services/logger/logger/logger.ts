/**
 * Logger service.
 * @module core/services/logger
 */

import { ConsoleOutput } from '../outputs/console.ts'
import { FileOutput } from '../outputs/file.ts'
import type { LogEntry, LogLevel } from '../types/entry.ts'

/**
 * Logger service.
 */
export class Logger {
  private outputs: Array<{ output: any; level: LogLevel }> = []
  private buffer: LogEntry[] = []

  constructor() {
    this.addOutput(new ConsoleOutput(), 'info')
  }

  /**
   * Add output destination.
   * 
   * @param output - Output instance
   * @param level - Minimum log level
   */
  addOutput(output: any, level: LogLevel) {
    this.outputs.push({ output, level })
  }

  /**
   * Log entry.
   * 
   * @param level - Log level
   * @param message - Log message
   * @param data - Optional data
   */
  log(level: LogLevel, message: string, data?: any) {
    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      message,
      data,
    }

    this.buffer.push(entry)

    for (const { output, level: minLevel } of this.outputs) {
      if (this.shouldLog(level, minLevel)) {
        output.write(entry)
      }
    }
  }

  /**
   * Debug log.
   */
  debug(message: string, data?: any) {
    this.log('debug', message, data)
  }

  /**
   * Info log.
   */
  info(message: string, data?: any) {
    this.log('info', message, data)
  }

  /**
   * Warning log.
   */
  warn(message: string, data?: any) {
    this.log('warn', message, data)
  }

  /**
   * Error log.
   */
  error(message: string, error?: Error, data?: any) {
    this.log('error', message, { error: error?.message, stack: error?.stack, ...data })
  }

  private shouldLog(level: LogLevel, minLevel: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error']
    return levels.indexOf(level) >= levels.indexOf(minLevel)
  }
}

/**
 * Global logger instance.
 */
export const logger = new Logger()