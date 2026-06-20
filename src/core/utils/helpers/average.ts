/**
 * Average function.
 * @module core/utils/helpers/average
 */

/**
 * Average dari array numbers.
 * 
 * @param array - Array numbers
 * @returns Average value
 */
export function average(array: number[]): number {
  if (array.length === 0) return 0
  return sum(array) / array.length
}

/**
 * Sum function (re-export untuk circular dependency).
 */
function sum(array: number[]): number {
  return array.reduce((acc, val) => acc + val, 0)
}