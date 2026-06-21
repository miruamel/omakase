/**
 * /exit command.
 * @module commands/builtin/exit
 */

import type { CommandDefinition } from '../../types/commands/definition.ts'
import { logger } from '../../core/services/logger/logger/logger.ts'

/**
 * Exit command untuk exit Omakase.
 */
export const exitCommand: CommandDefinition = {
  name: 'exit',
  description: 'Exit Omakase',
  async execute() {
    logger.info('Exiting Omakase')
    process.exit(0)
  },
}