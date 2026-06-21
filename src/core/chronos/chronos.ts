/**
 * Chronos - background task scheduler.
 * @module core/chronos
 */

import type { ChronosTask, ChronosTaskConfig, ChronosTaskStatus } from '../../types/chronos/index.ts'
import { logger } from '../services/logger/logger/logger.ts'
import { getNextCronTime } from './cron-parser.ts'

/**
 * Scheduler untuk background tasks dengan dukungan once, interval, delayed, dan cron.
 */
export class Chronos {
  /** Map ID task ke instance */
  private tasks: Map<string, ChronosTask> = new Map()
  /** Map ID task ke timer handle */
  private timers: Map<string, NodeJS.Timeout> = new Map()
  /** Map ID task ke konfigurasi */
  private configs: Map<string, ChronosTaskConfig> = new Map()

  /**
   * Jadwalkan task baru.
   * 
   * @param config - Konfigurasi task
   * @returns Instance task yang dijadwalkan
   */
  schedule(config: ChronosTaskConfig): ChronosTask {
    const id = config.id || crypto.randomUUID()
    const task: ChronosTask = {
      id,
      name: config.name,
      type: config.type,
      status: 'pending',
      executionCount: 0,
      nextExecutionAt: this.calculateNextExecution(config),
    }

    this.tasks.set(id, task)
    this.configs.set(id, config)

    logger.info('Task scheduled', {
      id,
      name: config.name,
      type: config.type,
    })

    this.startTask(id, config)
    return task
  }

  /**
   * Hitung waktu eksekusi berikutnya berdasarkan tipe task.
   * 
   * @param config - Konfigurasi task
   * @returns Timestamp eksekusi berikutnya
   */
  private calculateNextExecution(config: ChronosTaskConfig): number {
    const now = Date.now()
    switch (config.type) {
      case 'once':
        return now + (config.delayMs || 0)
      case 'delayed':
        return now + (config.delayMs || 0)
      case 'interval':
        return now + (config.intervalMs || 1000)
      case 'cron':
        if (!config.cronExpression) {
          throw new Error('Cron expression is required for cron tasks')
        }
        return getNextCronTime(config.cronExpression, now)
      default:
        return now
    }
  }

  /**
   * Mulai eksekusi task.
   * 
   * @param id - ID task
   * @param config - Konfigurasi task
   */
  private startTask(id: string, config: ChronosTaskConfig): void {
    const task = this.tasks.get(id)
    if (!task) return

    const delay = Math.max(0, (task.nextExecutionAt || Date.now()) - Date.now())

    const timer = setTimeout(async () => {
      await this.executeTask(id, config)
    }, delay)

    this.timers.set(id, timer)
  }

  /**
   * Eksekusi task.
   * 
   * @param id - ID task
   * @param config - Konfigurasi task
   */
  private async executeTask(id: string, config: ChronosTaskConfig): Promise<void> {
    const task = this.tasks.get(id)
    if (!task) return

    task.status = 'running'
    logger.debug('Executing task', { id, name: config.name })

    try {
      await config.handler()
      task.executionCount++
      task.lastExecutedAt = Date.now()
      task.status = 'completed'

      if (config.type === 'interval' &&
          (config.maxExecutions === undefined || task.executionCount < config.maxExecutions)) {
        task.status = 'pending'
        task.nextExecutionAt = Date.now() + (config.intervalMs || 1000)
        this.startTask(id, config)
      } else if (config.type === 'cron' &&
                 (config.maxExecutions === undefined || task.executionCount < config.maxExecutions)) {
        task.status = 'pending'
        task.nextExecutionAt = getNextCronTime(config.cronExpression!, Date.now())
        this.startTask(id, config)
      } else if (config.type === 'once' || config.type === 'delayed') {
        this.timers.delete(id)
      }
    } catch (error) {
      task.status = 'failed'
      task.error = error instanceof Error ? error.message : String(error)
      logger.error('Task execution failed', error as Error, { id, name: config.name })
    }
  }

  /**
   * Batalkan task.
   * 
   * @param id - ID task
   * @returns True jika berhasil dibatalkan
   */
  cancel(id: string): boolean {
    const timer = this.timers.get(id)
    if (timer) {
      clearTimeout(timer)
      this.timers.delete(id)
    }
    const task = this.tasks.get(id)
    if (task) {
      task.status = 'cancelled'
      return true
    }
    return false
  }

  /**
   * Dapatkan task berdasarkan ID.
   * 
   * @param id - ID task
   * @returns Instance task atau undefined
   */
  get(id: string): ChronosTask | undefined {
    return this.tasks.get(id)
  }

  /**
   * Dapatkan semua task.
   * 
   * @returns Array semua task
   */
  getAll(): ChronosTask[] {
    return Array.from(this.tasks.values())
  }

  /**
   * Dapatkan task berdasarkan status.
   * 
   * @param status - Status yang dicari
   * @returns Array task dengan status tersebut
   */
  getByStatus(status: ChronosTaskStatus): ChronosTask[] {
    return this.getAll().filter(t => t.status === status)
  }

  /**
   * Hentikan semua task.
   */
  shutdown(): void {
    for (const timer of this.timers.values()) {
      clearTimeout(timer)
    }
    this.timers.clear()
    logger.info('Chronos shutdown complete')
  }
}