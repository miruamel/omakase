/**
 * Pick function.
 * @module core/utils/helpers/pick
 */

/**
 * Pick beberapa keys dari object.
 * 
 * @param obj - Object source
 * @param keys - Array keys yang akan di-pick
 * @returns Object dengan keys yang di-pick
 */
export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key]
    }
  }
  return result
}