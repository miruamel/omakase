/**
 * Memory configuration types.
 * @module config/memory
 */

/**
 * MemoryConfig untuk persistent memory system.
 * Memory disimpan di file `OMAKASE.md` untuk project-wide knowledge.
 */
export interface MemoryConfig {
  /**
   * Apakah memory system enabled.
   * Default: true
   */
  enabled: boolean
  
  /**
   * Nama file memory.
   * Default: `OMAKASE.md`
   */
  file: string
}