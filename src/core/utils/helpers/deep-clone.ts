/**
 * Deep clone function.
 * @module core/utils/helpers/deep-clone
 */

/**
 * Deep clone object.
 * Note: Tidak support function, Date, Map, Set, dll.
 * 
 * @param obj - Object untuk clone
 * @returns Cloned object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}