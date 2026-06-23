/**
 * Log entry type.
 * @module core/services/logger/types
 */

/**
 * Log level.
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

/**
 * Log entry interface.
 */
export interface LogEntry {
  /** Timestamp */
  timestamp: number
  /** Log level */
  level: LogLevel
  /** Log message */
  message: string
  /** Optional data */
  data?: unknown
}