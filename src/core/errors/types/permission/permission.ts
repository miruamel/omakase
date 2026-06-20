/**
 * Permission error type.
 * @module core/errors/types/permission
 */

import type { ErrorConstructor } from '../base/base.ts'
import { PermissionError } from '../../errors.ts'

/**
 * Permission error class.
 */
export class AccessDeniedError extends PermissionError {
  constructor(message: string) {
    super(message)
  }
}

/**
 * Permission error constructor.
 */
export const PermissionErrorClass: ErrorConstructor = AccessDeniedError