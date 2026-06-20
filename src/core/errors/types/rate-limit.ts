/**
 * Rate limit errors.
 * @module core/errors/types/rate-limit
 */

import { LLMError } from './llm.ts'

/**
 * RateLimitError untuk error saat rate limit exceeded.
 */
export class RateLimitError extends LLMError {
  /** Seconds untuk wait sebelum retry */
  public readonly retryAfter?: number

  /**
   * Create RateLimitError.
   * 
   * @param message - Error message
   * @param retryAfter - Seconds untuk retry (jika ada)
   */
  constructor(message: string, retryAfter?: number) {
    super(message, 429, { retryAfter })
    this.name = 'RateLimitError'
    this.retryAfter = retryAfter
  }
}