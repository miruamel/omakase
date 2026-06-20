/**
 * FileWrite tool untuk tulis file.
 * @module core/tools/filesystem/write
 */

import { z } from 'zod'
import { writeFile, mkdir } from 'fs/promises'
import { buildTool } from '../../base/builder/builder.ts'
import type { ToolResult } from '../../../../types/messages/tool-result.ts'
import type { PermissionResult } from '../../base/types/permission.ts'
import type { ToolContext } from '../../../../types/tools/context.ts'

const FileWriteInputSchema = z.object({
  path: z.string().describe('Path to the file'),
  content: z.string().describe('Content to write'),
})

function getDirname(path: string): string {
  const parts = path.split('/')
  return parts.slice(0, -1).join('/') || '.'
}

/**
 * FileWriteTool untuk create atau overwrite file.
 */
export const FileWriteTool = buildTool({
  name: 'FileWrite',
  description: 'Create or overwrite a file',
  inputSchema: FileWriteInputSchema,
  
  async call(args: any, context: ToolContext): Promise<ToolResult> {
    try {
      const { path, content } = args as { path: string; content: string }
      await mkdir(getDirname(path), { recursive: true })
      await writeFile(path, content, 'utf-8')
      
      return {
        toolCallId: crypto.randomUUID(),
        success: true,
        data: { path, bytesWritten: content.length },
      }
    } catch (error) {
      return {
        toolCallId: crypto.randomUUID(),
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }
    }
  },
  
  async checkPermissions(input: any): Promise<PermissionResult> {
    const path = input.path as string
    if (path.includes('/etc/') || path.includes('/proc/') || path.includes('/sys/')) {
      return {
        granted: false,
        prompt: `Writing to "${path}" may be dangerous. Continue?`,
      }
    }
    return { granted: true }
  },
})