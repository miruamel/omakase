/**
 * Config tool untuk manage configuration.
 * @module core/tools/configuration/config
 */

import { z } from 'zod'
import { buildTool } from '../../base/builder/builder.ts'
import type { ToolResult } from '../../../../types/messages/tool-result.ts'
import type { ToolContext } from '../../../../types/tools/context.ts'
import { ConfigManager } from '../../../services/config/manager/manager.ts'

const ConfigInputSchema = z.object({
  action: z.enum(['get', 'set', 'reset']).describe('Action to perform'),
  key: z.string().optional().describe('Configuration key'),
  value: z.any().optional().describe('Configuration value'),
})

/**
 * ConfigTool untuk manage omakase.json configuration.
 */
export const ConfigTool = buildTool({
  name: 'Config',
  description: 'Manage Omakase configuration (omakase.json)',
  inputSchema: ConfigInputSchema,
  
  async call(args: any, context: ToolContext): Promise<ToolResult> {
    try {
      const { action, key, value } = args as { action: 'get' | 'set' | 'reset'; key?: string; value?: any }
      const manager = new ConfigManager()
      
      if (action === 'get') {
        const config = await manager.load()
        if (key) {
          return {
            toolCallId: crypto.randomUUID(),
            success: true,
            data: { [key]: config[key as keyof typeof config] },
          }
        }
        return {
          toolCallId: crypto.randomUUID(),
          success: true,
          data: config,
        }
      }
      
      if (action === 'set' && key && value !== undefined) {
        await manager.update(key, value)
        return {
          toolCallId: crypto.randomUUID(),
          success: true,
          data: { updated: key, value },
        }
      }
      
      if (action === 'reset') {
        await manager.reset()
        return {
          toolCallId: crypto.randomUUID(),
          success: true,
          data: { reset: true },
        }
      }
      
      return {
        toolCallId: crypto.randomUUID(),
        success: false,
        error: 'Invalid action or missing parameters',
      }
    } catch (error) {
      return {
        toolCallId: crypto.randomUUID(),
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }
    }
  },
  
  async checkPermissions() {
    return { granted: true }
  },
})