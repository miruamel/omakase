/**
 * Is empty function.
 * @module core/utils/helpers/is-empty
 */

/**
 * Check apakah object kosong.
 * 
 * @param obj - Object untuk check
 * @returns True jika object kosong
 */
export function isEmpty(obj: object): boolean {
  return Object.keys(obj).length === 0
}