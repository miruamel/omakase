/**
 * Unique function.
 * @module core/utils/helpers/unique
 */

/**
 * Get unique values dari array.
 * 
 * @param array - Array untuk unique
 * @returns Array dengan unique values
 */
export function unique<T>(array: T[]): T[] {
  return [...new Set(array)]
}