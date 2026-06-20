/**
 * Group by function.
 * @module core/utils/helpers/group-by
 */

/**
 * Group array by key function.
 * 
 * @param array - Array untuk group
 * @param keyFn - Function untuk extract key
 * @returns Map dari key ke array items
 */
export function groupBy<T, K extends string | number | symbol>(
  array: T[],
  keyFn: (item: T) => K
): Map<K, T[]> {
  const map = new Map<K, T[]>()
  
  for (const item of array) {
    const key = keyFn(item)
    const group = map.get(key) || []
    group.push(item)
    map.set(key, group)
  }
  
  return map
}