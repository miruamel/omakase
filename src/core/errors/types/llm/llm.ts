/**
 * LLM error type.
 * @module core/errors/types/llm
 */

import type { ErrorConstructor } from '../base/base.ts'
import { LLMError } from '../../errors.ts'

/**
 * LLM error class.
 */
export class ProviderError extends LLMError {
  constructor(message: string) {
    super(message)
  }
}

/**
 * LLM error constructor.
 */
export const LLMErrorClass: ErrorConstructor = ProviderError