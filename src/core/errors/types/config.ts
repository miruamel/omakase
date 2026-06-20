/**
 * Configuration errors.
 * @module core/errors/types/config
 */

import { OmakaseError } from './base.ts'

/**
 * ConfigError untuk error terkait konfigurasi.
 */
export class ConfigError extends OmakaseError {
  /**
   * Create ConfigError.
   * 
   * @param message - Error message
   * @param context - Additional context
   */
  constructor(message: string, context?: Record<string, unknown>) {
    super('CONFIG_ERROR', message, context)
    this.name = 'ConfigError'
  }
}