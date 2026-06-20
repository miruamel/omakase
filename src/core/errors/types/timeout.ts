/**
 * Timeout errors.
 * @module core/errors/types/timeout
 */

import { OmakaseError } from './base.ts'

/**
 * TimeoutError untuk error saat operation timeout.
 */
export class TimeoutError extends OmakaseError {
  /**
   * Create TimeoutError.
   * 
   * @param operation - Nama operation yang timeout
   * @param timeout - Timeout dalam ms
   */
  constructor(operation: string, timeout: number) {
    super('TIMEOUT', `${operation} timed out after ${timeout}ms`, { operation, timeout })
    this.name = 'TimeoutError'
  }
}