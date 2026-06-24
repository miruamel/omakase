/**
 * LRU Cache implementation dengan TTL support.
 * @module core/utils/cache
 */

/**
 * Entry dalam cache dengan value dan expiry timestamp.
 */
export interface CacheEntry<T> {
  value: T
  expiry: number
}

/**
 * LRU Cache dengan dukungan max size dan TTL (time-to-live).
 *
 * @template T - Tipe value yang disimpan dalam cache
 */
export class LRUCache<T> {
  private cache: Map<string, CacheEntry<T>>
  private maxSize: number
  private ttl: number

  /**
   * Membuat instance LRUCache.
   *
   * @param maxSize - Ukuran maximum cache (default: 100)
   * @param ttl - Time-to-live dalam milidetik (default: 60000)
   */
  constructor(maxSize: number = 100, ttl: number = 60000) {
    this.cache = new Map()
    this.maxSize = maxSize
    this.ttl = ttl
  }

  /**
   * Mengambil value dari cache.
   *
   * @param key - Key untuk lookup
   * @returns Value jika ada dan belum expired, undefined jika tidak
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key)
    if (!entry) {
      return undefined
    }

    if (Date.now() > entry.expiry) {
      this.cache.delete(key)
      return undefined
    }

    // Update access order (LRU)
    this.cache.delete(key)
    this.cache.set(key, entry)

    return entry.value
  }

  /**
   * Menyimpan value ke cache.
   *
   * @param key - Key untuk disimpan
   * @param value - Value yang akan di-cache
   */
  set(key: string, value: T): void {
    // Remove existing entry to update order
    if (this.cache.has(key)) {
      this.cache.delete(key)
    }

    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey !== undefined) {
        this.cache.delete(firstKey)
      }
    }

    this.cache.set(key, {
      value,
      expiry: Date.now() + this.ttl,
    })
  }

  /**
   * Mengecek apakah key ada dalam cache dan belum expired.
   *
   * @param key - Key untuk dicek
   * @returns true jika ada dan valid, false jika tidak
   */
  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) {
      return false
    }

    if (Date.now() > entry.expiry) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  /**
   * Menghapus entry dari cache.
   *
   * @/key - Key yang akan dihapus
   * @returns true jika berhasil dihapus, false jika tidak ada
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * Menghapus semua entry dalam cache.
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Mengembalikan jumlah entry dalam cache.
   */
  get size(): number {
    return this.cache.size
  }
}
