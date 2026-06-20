/**
 * Escape regex function.
 * @module core/utils/helpers/escape-regex
 */

/**
 * Escape special regex characters dalam string.
 * 
 * @param str - String yang akan di-escape
 * @returns Escaped string yang safe untuk regex
 */
export function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}