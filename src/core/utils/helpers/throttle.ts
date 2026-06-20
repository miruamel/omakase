/**
 * Throttle function.
 * @module core/utils/helpers/throttle
 */

/**
 * Throttle function untuk membatasi execution rate.
 * 
 * @param fn - Function yang akan di-throttle
 * @param limit - Minimum interval dalam ms
 * @returns Function yang di-throttle
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}