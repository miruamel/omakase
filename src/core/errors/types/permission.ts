/**
 * Permission-related errors.
 * @module core/errors/types/permission
 */

import { OmakaseError } from './base.ts'

/**
 * PermissionError untuk error saat permission check gagal.
 */
export class PermissionError extends OmakaseError {
  /**
   * Create PermissionError.
   * 
   * @param toolName - Nama tool yang ditolak
   * @param reason - Alasan penolakan
   */
  constructor(toolName: string, reason: string) {
    super('PERMISSION_DENIED', `Permission denied for ${toolName}: ${reason}`, { toolName })
    this.name = 'PermissionError'
  }
}