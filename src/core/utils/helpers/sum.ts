/**
 * Sum function.
 * @module core/utils/helpers/sum
 */

/**
 * Sum semua values dalam array.
 * 
 * @param array - Array numbers
 * @returns Sum dari semua values
 */
export function sum(array: number[]): number {
  return array.reduce((acc, val) => acc + val, 0)
}