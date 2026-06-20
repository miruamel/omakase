/**
 * Command definition type.
 * @module types/commands/definition
 */

import type { Message } from '../messages/message.ts'
import type { Session } from '../messages/turn.ts'
import type { UserSettings } from '../config/settings.ts'

/**
 * Command context.
 */
export interface CommandContext {
  /** Current session */
  session: Session
  /** User settings */
  settings: UserSettings
  /** Working directory */
  workingDirectory: string
}

/**
 * Command result.
 */
export interface CommandResult {
  /** Result type */
  type: 'text' | 'prompt'
  /** Result content */
  content: string | Message[]
}

/**
 * Command definition interface.
 */
export interface CommandDefinition {
  /** Command name (without /) */
  name: string
  /** Command description */
  description: string
  /** Execute function */
  execute: (args: string[], context: CommandContext) => Promise<CommandResult>
}