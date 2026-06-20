/**
 * /clear command.
 * @module commands/builtin/clear
 */

import type { CommandDefinition } from '../../types/commands/definition.ts'

/**
 * Clear command untuk clear screen.
 */
export const clearCommand: CommandDefinition = {
  name: 'clear',
  description: 'Clear screen',
  async execute() {
    console.clear()
    return {
      type: 'text',
      content: 'Screen cleared',
    }
  },
}