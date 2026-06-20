/**
 * Chronos types - background task scheduler.
 * @module types/chronos
 */

/**
 * Tipe scheduled task dalam sistem Chronos.
 */
export type ChronosTaskType = 'once' | 'interval' | 'cron' | 'delayed'

/**
 * Status eksekusi scheduled task.
 */
export type ChronosTaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'

/**
 * Konfigurasi untuk scheduled task.
 */
export interface ChronosTaskConfig {
  /** ID unik task */
  id?: string
  /** Nama task */
  name: string
  /** Tipe scheduling */
  type: ChronosTaskType
  /** Interval dalam milliseconds (untuk type 'interval') */
  intervalMs?: number
  /** Delay dalam milliseconds (untuk type 'delayed') */
  delayMs?: number
  /** Cron expression (untuk type 'cron') */
  cronExpression?: string
  /** Fungsi yang akan dijalankan */
  handler: () => Promise<void> | void
  /** Maksimal jumlah eksekusi (0 = unlimited) */
  maxExecutions?: number
}

/**
 * Instance scheduled task yang sedang berjalan.
 */
export interface ChronosTask {
  /** ID unik task */
  id: string
  /** Nama task */
  name: string
  /** Tipe scheduling */
  type: ChronosTaskType
  /** Status task */
  status: ChronosTaskStatus
  /** Jumlah eksekusi yang sudah dilakukan */
  executionCount: number
  /** Timestamp eksekusi terakhir */
  lastExecutedAt?: number
  /** Timestamp eksekusi berikutnya */
  nextExecutionAt?: number
  /** Error message jika gagal */
  error?: string
}