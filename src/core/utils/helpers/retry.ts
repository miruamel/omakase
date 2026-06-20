/**
 * Retry function dengan exponential backoff.
 * @module core/utils/helpers/retry
 */

import { sleep } from './sleep.ts'

/**
 * Retry function dengan exponential backoff.
 * 
 * @param fn - Function yang akan di-retry
 * @param options - Retry options
 * @param options.maxRetries - Maximum retry attempts (default: 3)
 * @param options.delay - Delay awal dalam ms (default: 1000)
 * @param options.backoff - Multiplier untuk delay (default: 2)
 * @param options.onRetry - Callback setiap retry
 * @returns Promise yang resolve dengan hasil function
 */
export function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number
    delay?: number
    backoff?: number
    onRetry?: (error: Error, attempt: number) => void
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    delay = 1000,
    backoff = 2,
    onRetry,
  } = options

  return async function attempt(currentRetry = 0): Promise<T> {
    try {
      return await fn()
    } catch (error) {
      if (currentRetry >= maxRetries) {
        throw error
      }

      onRetry?.(error as Error, currentRetry + 1)
      await sleep(delay * Math.pow(backoff, currentRetry))
      return attempt(currentRetry + 1)
    }
  }()
}