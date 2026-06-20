/**
 * Format duration function.
 * @module core/utils/helpers/format-duration
 */

/**
 * Format duration dalam ms ke human-readable string.
 * 
 * @param ms - Duration dalam milidetik
 * @returns Formatted string (e.g., "1m 30s")
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  
  const seconds = Math.floor(ms / 1000)
  if (seconds < 60) return `${seconds}s`
  
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}m ${remainingSeconds}s`
}