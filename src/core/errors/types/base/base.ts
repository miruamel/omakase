/**
 * Base error type.
 * @module core/errors/types/base
 */

import { OmakaseError } from '../../errors.ts'

/**
 * Error constructor type.
 */
export type ErrorConstructor = new (message: string) => OmakaseError

export { OmakaseError }

export class TransientError extends OmakaseError {
  constructor(message: string) {
    super(message)
  }
}

export class PermanentError extends OmakaseError {
  constructor(message: string) {
    super(message)
  }
}