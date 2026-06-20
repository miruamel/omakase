/**
 * Glob tool untuk cari file.
 * @module core/tools/filesystem/glob
 */

import { z } from 'zod'
import { glob as globFn } from 'glob'
import { buildTool } from '../../base/builder/builder.ts'
import type { ToolResult } from '../../../../types/messages/tool-result.ts'
import type { ToolContext } from '../../../../types/tools/context.ts'

const GlobInputSchema = z.object({
  pattern: z.string().describe('Glob pattern (e.g., **/*.ts)'),
  cwd: z.string().optional().describe('Working directory'),
})

/**
 * GlobTool untuk cari files matching pattern.
 */
export const GlobTool = buildTool({
  name: 'Glob',
  description: 'Find files matching a glob pattern',
  inputSchema: GlobInputSchema,
  
  async call(args: any, context: ToolContext): Promise<ToolResult> {
    try {
      const { pattern, cwd = context.workingDirectory } = args as { pattern: string; cwd?: string }
      const files = await globFn(pattern, { cwd, nodir: true })
      
      return {
        toolCallId: crypto.randomUUID(),
        success: true,
        data: { files, count: files.length },
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