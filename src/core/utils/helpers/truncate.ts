/**
 * Truncate function.
 * @module core/utils/helpers/truncate
 */

/**
 * Truncate string ke maximum length dengan suffix.
 * 
 * @param str - String yang akan di-truncate
 * @param length - Maximum length
 * @param suffix - Suffix untuk string yang di-truncate (default: "...")
 * @returns Truncated string
 */
export function truncate(str: string, length: number, suffix: string = '...'): string {
  if (str.length <= length) return str
  return str.slice(0, length - suffix.length) + suffix
}