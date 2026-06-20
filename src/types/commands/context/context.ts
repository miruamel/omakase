/**
 * Command context untuk execution.
 * @module commands/context
 */

import type { UserSettings } from '../../config/settings.js'

/**
 * CommandContext diberikan ke setiap command saat eksekusi.
 * Berisi informasi tentang session, settings, dan environment.
 */
export interface CommandContext {
  /** Session ID saat ini untuk tracking conversation */
  session: string
  
  /** User settings saat ini (model, provider, dll) */
  settings: UserSettings
  
  /** Working directory untuk operasi file/shell */
  workingDirectory: string
}