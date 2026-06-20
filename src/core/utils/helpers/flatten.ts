/**
 * Flatten function.
 * @module core/utils/helpers/flatten
 */

/**
 * Flatten nested array.
 * 
 * @param array - Nested array
 * @returns Flattened array
 */
export function flatten<T>(array: T[][]): T[] {
  return array.flat()
}