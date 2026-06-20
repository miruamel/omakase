/**
 * Config manager.
 * @module core/services/config/manager
 */

import { readFile, writeFile, access } from 'fs/promises'
import { join } from 'path'
import type { OmakaseConfig } from '../../../../types/config/omakase/config.ts'
import { OmakaseConfigSchema } from '../../../../types/config/omakase/config.ts'
import { logger } from '../../logger/logger/logger.ts'

/**
 * Config manager untuk load/save omakase.json.
 */
export class ConfigManager {
  private configPath: string

  constructor(configPath?: string) {
    this.configPath = configPath || join(process.cwd(), 'omakase.json')
  }

  /**
   * Load config dari file.
   * 
   * @returns Config object
   */
  async load(): Promise<OmakaseConfig> {
    try {
      await access(this.configPath)
      const content = await readFile(this.configPath, 'utf-8')
      const parsed = JSON.parse(content)
      const validated = OmakaseConfigSchema.parse(parsed)
      logger.debug('Config loaded', { path: this.configPath })
      return validated
    } catch (error) {
      logger.debug('Config not found, using defaults', { path: this.configPath })
      return OmakaseConfigSchema.parse({})
    }
  }

  /**
   * Save config ke file.
   * 
   * @param config - Config untuk save
   */
  async save(config: OmakaseConfig): Promise<void> {
    const content = JSON.stringify(config, null, 2)
    await writeFile(this.configPath, content, 'utf-8')
    logger.debug('Config saved', { path: this.configPath })
  }

  /**
   * Update config key.
   * 
   * @param key - Config key
   * @param value - New value
   */
  async update(key: string, value: any): Promise<void> {
    const config = await this.load()
    const validated = OmakaseConfigSchema.parse({ ...config, [key]: value })
    await this.save(validated)
  }

  /**
   * Reset config ke defaults.
   */
  async reset(): Promise<void> {
    const defaults = OmakaseConfigSchema.parse({})
    await this.save(defaults)
  }
}