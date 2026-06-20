/**
 * Type guard untuk check defined.
 * @module core/utils/helpers/is-defined
 */

/**
 * Type guard untuk check apakah value defined.
 * 
 * @param value - Value untuk check
 * @returns True jika value defined
 */
export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null
}