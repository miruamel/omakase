/**
 * Config error type.
 * @module core/errors/types/config
 */

import type { ErrorConstructor } from '../base/base.ts'
import { ConfigError } from '../../errors.ts'

/**
 * Config error class.
 */
export class ConfigurationError extends ConfigError {
  constructor(message: string) {
    super(message)
  }
}

/**
 * Config error constructor.
 */
export const ConfigErrorClass: ErrorConstructor = ConfigurationError