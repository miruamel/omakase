/**
 * Memory tool untuk manage memory.
 * @module core/tools/memory/manager
 */

import { z } from 'zod'
import { buildTool } from '../../base/builder/builder.ts'
import type { ToolResult } from '../../../../types/messages/tool-result.ts'
import type { ToolContext } from '../../../../types/tools/context.ts'
import { MemoryManager } from '../../../services/memory/manager/manager.ts'

const MemoryInputSchema = z.object({
  action: z.enum(['add', 'get', 'list', 'clear']).describe('Memory action'),
  key: z.string().optional().describe('Memory key'),
  value: z.string().optional().describe('Memory value'),
})

/**
 * MemoryTool untuk manage OMAKASE.md memory.
 */
export const MemoryTool = buildTool({
  name: 'Memory',
  description: 'Manage Omakase memory (OMAKASE.md)',
  inputSchema: MemoryInputSchema,
  
  async call(args: any, context: ToolContext): Promise<ToolResult> {
    try {
      const { action, key, value } = args as { action: 'add' | 'get' | 'list' | 'clear'; key?: string; value?: string }
      const manager = new MemoryManager()
      
      if (action === 'add' && key && value) {
        await manager.add(key, value)
        return {
          toolCallId: crypto.randomUUID(),
          success: true,
          data: { added: key },
        }
      }
      
      if (action === 'get' && key) {
        const data = await manager.get(key)
        return {
          toolCallId: crypto.randomUUID(),
          success: true,
          data: { [key]: data },
        }
      }
      
      if (action === 'list') {
        const memories = await manager.list()
        return {
          toolCallId: crypto.randomUUID(),
          success: true,
          data: memories,
        }
      }
      
      if (action === 'clear') {
        await manager.clear()
        return {
          toolCallId: crypto.randomUUID(),
          success: true,
          data: { cleared: true },
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