/**
 * Timeout error type.
 * @module core/errors/types/timeout
 */

import type { ErrorConstructor } from '../base/base.ts'
import { TimeoutError } from '../../errors.ts'

/**
 * Timeout error class.
 */
export class RequestTimeoutError extends TimeoutError {
  constructor(message: string) {
    super(message)
  }
}

/**
 * Timeout error constructor.
 */
export const TimeoutErrorClass: ErrorConstructor = RequestTimeoutError