/**
 * Validation utilities.
 * @module core/utils/validation
 */

import { truncate as truncateHelper } from './helpers/truncate.ts'

/**
 * Memvalidasi apakah string merupakan URL yang valid.
 *
 * @param url - String yang akan divalidasi
 * @returns true jika valid URL, false jika tidak
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Memvalidasi apakah string merupakan email yang valid.
 *
 * @param email - String yang akan divalidasi
 * @returns true jika valid email, false jika tidak
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Membersihkan user input dari karakter berbahaya.
 *
 * @param input - String yang akan dibersihkan
 * @returns String yang sudah dibersihkan
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

/**
 * Memotong string ke panjang tertentu.
 *
 * @param str - String yang akan dipotong
 * @param maxLen - Panjang maximum
 * @returns String yang sudah dipotong
 */
export function truncate(str: string, maxLen: number): string {
  return truncateHelper(str, maxLen)
}
