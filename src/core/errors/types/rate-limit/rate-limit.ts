/**
 * Rate limit error type.
 * @module core/errors/types/rate-limit
 */

import type { ErrorConstructor } from '../base/base.ts'
import { RateLimitError } from '../../errors.ts'

/**
 * Rate limit error class.
 */
export class QuotaExceededError extends RateLimitError {
  constructor(message: string) {
    super(message)
  }
}

/**
 * Rate limit error constructor.
 */
export const RateLimitErrorClass: ErrorConstructor = QuotaExceededError