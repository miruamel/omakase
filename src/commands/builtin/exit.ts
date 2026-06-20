/**
 * /exit command.
 * @module commands/builtin/exit
 */

import type { CommandDefinition } from '../../types/commands/definition.ts'

/**
 * Exit command untuk exit Omakase.
 */
export const exitCommand: CommandDefinition = {
  name: 'exit',
  description: 'Exit Omakase',
  async execute() {
    console.log('Goodbye!')
    process.exit(0)
  },
}