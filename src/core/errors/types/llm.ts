/**
 * LLM-related errors.
 * @module core/errors/types/llm
 */

import { OmakaseError } from './base.ts'

/**
 * LLMError untuk error dari LLM provider.
 */
export class LLMError extends OmakaseError {
  /** HTTP status code dari response */
  public readonly statusCode?: number

  /**
   * Create LLMError.
   * 
   * @param message - Error message
   * @param statusCode - HTTP status code (jika ada)
   * @param context - Additional context
   */
  constructor(message: string, statusCode?: number, context?: Record<string, unknown>) {
    super('LLM_ERROR', message, { statusCode, ...context })
    this.name = 'LLMError'
    this.statusCode = statusCode
  }
}