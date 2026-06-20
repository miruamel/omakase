/**
 * Base error class untuk Omakase.
 * @module core/errors/types/base
 */

/**
 * OmakaseError adalah base class untuk semua error di Omakase.
 * Gunakan error class ini untuk error yang tidak spesifik.
 * 
 * @example
 * ```typescript
 * throw new OmakaseError('INVALID_INPUT', 'Input tidak valid', { field: 'name' })
 * ```
 */
export class OmakaseError extends Error {
  /** Error code untuk programmatic handling */
  public readonly code: string
  /** Context tambahan untuk debugging */
  public readonly context?: Record<string, unknown>

  /**
   * Create OmakaseError.
   * 
   * @param code - Error code (e.g., 'INVALID_INPUT', 'NETWORK_ERROR')
   * @param message - Human-readable error message
   * @param context - Additional context untuk debugging
   */
  constructor(code: string, message: string, context?: Record<string, unknown>) {
    super(message)
    this.name = 'OmakaseError'
    this.code = code
    this.context = context
  }
}