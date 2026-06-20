/**
 * Authentication error type.
 * @module core/errors/types/auth
 */

import type { ErrorConstructor } from '../base/base.ts'
import { AuthenticationError } from '../../errors.ts'

/**
 * Authentication error class.
 */
export class AuthError extends AuthenticationError {
  constructor(message: string) {
    super(message)
  }
}

/**
 * Authentication error constructor.
 */
export const AuthErrorClass: ErrorConstructor = AuthError