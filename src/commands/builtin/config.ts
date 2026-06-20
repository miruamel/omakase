/**
 * /config command.
 * @module commands/builtin/config
 */

import type { CommandDefinition } from '../../types/commands/definition.ts'
import { ConfigManager } from '../../core/services/config/manager/manager.ts'

/**
 * Config command untuk manage configuration.
 */
export const configCommand: CommandDefinition = {
  name: 'config',
  description: 'Manage configuration',
  async execute(args) {
    const manager = new ConfigManager()
    const [action, key, ...valueParts] = args
    const value = valueParts.join(' ')

    if (!action) {
      return {
        type: 'text',
        content: 'Usage: /config <get|set|reset> [key] [value]',
      }
    }

    if (action === 'get') {
      const config = await manager.load()
      if (key) {
        return {
          type: 'text',
          content: `${key}: ${config[key as keyof typeof config]}`,
        }
      }
      return {
        type: 'text',
        content: JSON.stringify(config, null, 2),
      }
    }

    if (action === 'set' && key && value) {
      await manager.update(key, value)
      return {
        type: 'text',
        content: `Set ${key} = ${value}`,
      }
    }

    if (action === 'reset') {
      await manager.reset()
      return {
        type: 'text',
        content: 'Configuration reset to defaults',
      }
    }

    return {
      type: 'text',
      content: 'Usage: /config <get|set|reset> [key] [value]',
    }
  },
}