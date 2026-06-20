/**
 * Validation error type.
 * @module core/errors/types/validation
 */

import type { ErrorConstructor } from '../base/base.ts'
import { ValidationError } from '../../errors.ts'

/**
 * Validation error class.
 */
export class SchemaValidationError extends ValidationError {
  constructor(message: string) {
    super(message)
  }
}

/**
 * Validation error constructor.
 */
export const ValidationErrorClass: ErrorConstructor = SchemaValidationError