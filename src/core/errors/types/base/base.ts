/**
 * Base error type.
 * @module core/errors/types/base
 */

import type { OmakaseError } from '../../errors.ts'

/**
 * Error constructor type.
 */
export type ErrorConstructor = new (message: string) => OmakaseError

export { OmakaseError }