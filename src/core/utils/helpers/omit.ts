/**
 * Omit function.
 * @module core/utils/helpers/omit
 */

/**
 * Omit beberapa keys dari object.
 * 
 * @param obj - Object source
 * @param keys - Array keys yang akan di-omit
 * @returns Object tanpa keys yang di-omit
 */
export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj }
  for (const key of keys) {
    delete result[key]
  }
  return result as Omit<T, K>
}