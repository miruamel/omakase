/**
 * Built-in commands.
 * @module commands/builtin
 */

import { helpCommand } from './help.ts'
import { exitCommand } from './exit.ts'
import { clearCommand } from './clear.ts'
import { toolsCommand } from './tools.ts'
import { statusCommand } from './status.ts'
import { configCommand } from './config.ts'
import { memoryCommand } from './memory.ts'
import { pluginCommand } from './plugin.ts'
import { agentsCommand } from './agents.ts'
import { chronosCommand } from './chronos.ts'

/**
 * Registered builtin commands.
 */
export const commands: Record<string, any> = {
  help: helpCommand,
  exit: exitCommand,
  clear: clearCommand,
  tools: toolsCommand,
  status: statusCommand,
  config: configCommand,
  memory: memoryCommand,
  plugin: pluginCommand,
  agents: agentsCommand,
  chronos: chronosCommand,
}