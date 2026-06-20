/**
 * Tool context type.
 * @module types/tools/context
 */

import type { Session } from '../messages/turn.ts'
import type { UserSettings } from '../config/settings.ts'

/**
 * Tool execution context.
 */
export interface ToolContext {
  /** Current session */
  session: Session
  /** User settings */
  settings?: UserSettings
  /** Working directory */
  workingDirectory: string
  /** Permission mode */
  permissionMode?: 'auto' | 'confirm' | 'readonly'
}