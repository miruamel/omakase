/**
 * /chronos command - manage scheduled tasks.
 * @module commands/builtin/chronos
 */

import type { CommandDefinition } from '../../types/commands/definition.ts'
import { requireRuntime } from '../../core/runtime/index.ts'
import type { ChronosTaskType } from '../../types/chronos/index.ts'
import { logger } from '../../core/services/logger/logger/logger.ts'

/**
 * Chronos command untuk manage scheduled tasks.
 */
export const chronosCommand: CommandDefinition = {
  name: 'chronos',
  description: 'Manage scheduled background tasks',
  async execute(args, context) {
    const subcommand = args[0] || 'help'

    try {
      const runtime = requireRuntime()
      const chronos = runtime.chronos

      switch (subcommand) {
        case 'list': {
          const tasks = chronos.getAll()
          if (tasks.length === 0) {
            return { type: 'text', content: 'No scheduled tasks.' }
          }
          const lines = tasks.map(t => {
            const next = t.nextExecutionAt ? new Date(t.nextExecutionAt).toISOString() : '-'
            return `  - ${t.id.slice(0, 8)} ${t.name} [${t.type}] ${t.status} (exec:${t.executionCount}, next:${next})`
          })
          return {
            type: 'text',
            content: `Scheduled tasks (${tasks.length}):\n${lines.join('\n')}`,
          }
        }

        case 'schedule': {
          const name = args[1]
          const type = args[2] as ChronosTaskType
          const intervalArg = args[3]
          if (!name || !type) {
            return {
              type: 'text',
              content: 'Usage: /chronos schedule <name> <type> [intervalMs]\nTypes: once, interval, delayed, cron',
            }
          }
          if (!['once', 'interval', 'delayed', 'cron'].includes(type)) {
            return {
              type: 'text',
              content: `Invalid type: ${type}. Valid types: once, interval, delayed, cron`,
            }
          }
          const intervalMs = intervalArg ? parseInt(intervalArg, 10) : undefined
          const task = chronos.schedule({
            name,
            type,
            intervalMs,
            delayMs: type === 'delayed' || type === 'once' ? intervalMs : undefined,
            handler: async () => {
              logger.info('Chronos task fired', { name })
            },
          })
          return {
            type: 'text',
            content: `Scheduled task: ${task.name} (${task.type}) id=${task.id}`,
          }
        }

        case 'cancel': {
          const id = args[1]
          if (!id) {
            return { type: 'text', content: 'Usage: /chronos cancel <task-id>' }
          }
          const tasks = chronos.getAll()
          const match = tasks.find(t => t.id.startsWith(id) || t.name === id)
          if (!match) {
            return { type: 'text', content: `Task not found: ${id}` }
          }
          const ok = chronos.cancel(match.id)
          return {
            type: 'text',
            content: ok ? `Cancelled task: ${match.name}` : `Failed to cancel: ${match.name}`,
          }
        }

        case 'help':
        default:
          return {
            type: 'text',
            content: `
Chronos Commands:
  /chronos list - List scheduled tasks
  /chronos schedule <name> <type> [intervalMs] - Schedule new task
  /chronos cancel <task-id-or-name> - Cancel scheduled task
  /chronos help - Show this help

Types: once, interval, delayed, cron
`.trim(),
          }
      }
    } catch (error) {
      logger.error('Chronos command failed', error as Error)
      return {
        type: 'text',
        content: `Error: ${error instanceof Error ? error.message : String(error)}`,
      }
    }
  },
}
