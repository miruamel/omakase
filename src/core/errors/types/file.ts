/**
 * File-related errors.
 * @module core/errors/types/file
 */

import { OmakaseError } from './base.ts'

/**
 * FileNotFoundError untuk error saat file tidak ditemukan.
 */
export class FileNotFoundError extends OmakaseError {
  /**
   * Create FileNotFoundError.
   * 
   * @param path - Path file yang tidak ditemukan
   */
  constructor(path: string) {
    super('FILE_NOT_FOUND', `File not found: ${path}`, { path })
    this.name = 'FileNotFoundError'
  }
}