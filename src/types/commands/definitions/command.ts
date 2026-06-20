/**
 * Definisi sebuah slash command.
 * @module commands/definitions/command
 */

import type { CommandType } from './type.ts'
import type { CommandContext } from '../context/context.ts'
import type { CommandResult } from '../result/result.ts'

/**
 * CommandDefinition adalah interface untuk slash commands.
 * Setiap command harus implement interface ini.
 * 
 * @example
 * ```typescript
 * const helpCommand: CommandDefinition = {
 *   name: 'help',
 *   description: 'Show available commands',
 *   type: 'local',
 *   execute: async (args, context) => {
 *     return { type: 'text', content: 'Available commands: ...' }
 *   }
 * }
 * ```
 */
export interface CommandDefinition {
  /** Nama command (tanpa slash prefix) */
  name: string
  
  /** Deskripsi command untuk help text */
  description: string
  
  /** Tipe command menentukan execution mode */
  type: CommandType
  
  /**
   * Function untuk execute command.
   * @param args - Array arguments dari command input
   * @param context - Command context dengan session, settings, workingDirectory
   * @returns Promise CommandResult
   */
  execute: (args: string[], context: CommandContext) => Promise<CommandResult>
}