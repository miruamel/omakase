/**
 * Validation errors.
 * @module core/errors/types/validation
 */

import { OmakaseError } from './base.ts'

/**
 * ValidationError untuk error saat validasi input gagal.
 */
export class ValidationError extends OmakaseError {
  /**
   * Create ValidationError.
   * 
   * @param field - Field yang invalid
   * @param message - Error message
   */
  constructor(field: string, message: string) {
    super('VALIDATION_ERROR', `Invalid ${field}: ${message}`, { field })
    this.name = 'ValidationError'
  }
}