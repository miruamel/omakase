/**
 * FileRead tool untuk baca file.
 * @module core/tools/filesystem/read
 */

import { z } from 'zod'
import { readFile } from 'fs/promises'
import { buildTool } from '../../base/builder/builder.ts'
import type { ToolResult } from '../../../../types/messages/tool-result.ts'
import type { ToolContext } from '../../../../types/tools/context.ts'

/**
 * FileReadTool input schema.
 */
const FileReadInputSchema = z.object({
  path: z.string().describe('Path to the file to read'),
  limit: z.number().optional().describe('Maximum lines to read'),
  offset: z.number().optional().describe('Line offset to start from'),
})

/**
 * FileReadTool untuk baca isi file.
 */
export const FileReadTool = buildTool({
  name: 'FileRead',
  description: 'Read contents of a file',
  inputSchema: FileReadInputSchema,
  
  async call(args: any, context: ToolContext): Promise<ToolResult> {
    try {
      const path = args.path as string
      const content = await readFile(path, 'utf-8')
      const lines = content.split('\n')
      
      const offset = (args.offset as number) || 0
      const limit = (args.limit as number) || lines.length
      const sliced = lines.slice(offset, offset + limit)
      
      return {
        toolCallId: crypto.randomUUID(),
        success: true,
        data: {
          content: sliced.join('\n'),
          totalLines: lines.length,
          returnedLines: sliced.length,
        },
      }
    } catch (error) {
      return {
        toolCallId: crypto.randomUUID(),
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }
    }
  },
  
  async checkPermissions(args: any) {
    return { granted: true }
  },
})