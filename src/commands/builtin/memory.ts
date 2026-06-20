/**
 * /memory command.
 * @module commands/builtin/memory
 */

import type { CommandDefinition } from '../../types/commands/definition.ts'
import { MemoryManager } from '../../core/services/memory/manager/manager.ts'

/**
 * Memory command untuk manage memory.
 */
export const memoryCommand: CommandDefinition = {
  name: 'memory',
  description: 'Manage memory',
  async execute(args) {
    const manager = new MemoryManager()
    const [action, key, ...valueParts] = args
    const value = valueParts.join(' ')

    if (!action) {
      return {
        type: 'text',
        content: 'Usage: /memory <add|get|list|clear> [key] [value]',
      }
    }

    if (action === 'add' && key && value) {
      await manager.add(key, value)
      return {
        type: 'text',
        content: `Added memory: ${key}`,
      }
    }

    if (action === 'get' && key) {
      const data = await manager.get(key)
      return {
        type: 'text',
        content: data || `Memory not found: ${key}`,
      }
    }

    if (action === 'list') {
      const memories = await manager.list()
      const entries = Object.entries(memories)
      
      if (entries.length === 0) {
        return {
          type: 'text',
          content: 'No memories',
        }
      }

      const list = entries
        .map(([k, v]) => `  ${k}: ${v.slice(0, 50)}...`)
        .join('\n')

      return {
        type: 'text',
        content: `Memories:\n\n${list}`,
      }
    }

    if (action === 'clear') {
      await manager.clear()
      return {
        type: 'text',
        content: 'Memory cleared',
      }
    }

    return {
      type: 'text',
      content: 'Usage: /memory <add|get|list|clear> [key] [value]',
    }
  },
}