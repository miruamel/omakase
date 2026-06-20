/**
 * Sleep function untuk delay.
 * @module core/utils/helpers/sleep
 */

/**
 * Sleep/tidur selama beberapa milidetik.
 * 
 * @param ms - Durasi dalam milidetik
 * @returns Promise yang resolve setelah timeout
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}