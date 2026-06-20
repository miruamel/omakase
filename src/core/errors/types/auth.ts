/**
 * Authentication errors.
 * @module core/errors/types/auth
 */

import { OmakaseError } from './base.ts'

/**
 * AuthenticationError untuk error saat authentication gagal.
 */
export class AuthenticationError extends OmakaseError {
  /**
   * Create AuthenticationError.
   * 
   * @param message - Error message
   */
  constructor(message: string = 'Authentication failed') {
    super('AUTH_ERROR', message)
    this.name = 'AuthenticationError'
  }
}