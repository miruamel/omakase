/**
 * File error type.
 * @module core/errors/types/file
 */

import type { ErrorConstructor } from '../base/base.ts'
import { FileError } from '../../errors.ts'

/**
 * File error class.
 */
export class FileSystemError extends FileError {
  constructor(message: string) {
    super(message)
  }
}

/**
 * File error constructor.
 */
export const FileErrorClass: ErrorConstructor = FileSystemError