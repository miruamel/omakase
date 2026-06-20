/**
 * /plugin command.
 * @module commands/builtin/plugin
 */

import type { CommandDefinition } from '../../types/commands/definition.ts'
import { PluginManager } from '../../core/services/plugins/manager/manager.ts'
import { logger } from '../../core/services/logger/logger/logger.ts'

/**
 * Plugin command untuk manage plugins.
 */
export const pluginCommand: CommandDefinition = {
  name: 'plugin',
  description: 'Manage plugins',
  async execute(args) {
    const [action, name, ...sourceParts] = args
    const source = sourceParts.join(' ') || undefined

    try {
      const manager = new PluginManager()

      if (!action) {
        return {
          type: 'text',
          content: 'Usage: /plugin <install|uninstall|list> [name] [source]',
        }
      }

      if (action === 'list') {
        const plugins = await manager.list()
        if (plugins.length === 0) {
          return { type: 'text', content: 'No plugins installed' }
        }
        const list = plugins
          .map(p => `  - ${p.name} v${p.version}: ${p.description}`)
          .join('\n')
        return { type: 'text', content: `Installed plugins (${plugins.length}):\n${list}` }
      }

      if (action === 'install' && name) {
        const manifest = await manager.install(name, source)
        return {
          type: 'text',
          content: `Installed plugin: ${manifest.name} v${manifest.version}`,
        }
      }

      if (action === 'uninstall' && name) {
        const ok = await manager.uninstall(name)
        return {
          type: 'text',
          content: ok ? `Uninstalled plugin: ${name}` : `Plugin not found: ${name}`,
        }
      }

      return {
        type: 'text',
        content: 'Usage: /plugin <install|uninstall|list> [name] [source]',
      }
    } catch (error) {
      logger.error('Plugin command failed', error as Error)
      return {
        type: 'text',
        content: `Error: ${error instanceof Error ? error.message : String(error)}`,
      }
    }
  },
}
