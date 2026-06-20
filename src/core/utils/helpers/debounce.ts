/**
 * Debounce function.
 * @module core/utils/helpers/debounce
 */

/**
 * Debounce function untuk membatasi frequency call.
 * 
 * @param fn - Function yang akan di-debounce
 * @param delay - Delay dalam ms
 * @returns Function yang di-debounce
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}