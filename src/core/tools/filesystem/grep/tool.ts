/**
 * Grep tool untuk cari konten di file.
 * @module core/tools/filesystem/grep
 */

import { z } from 'zod'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { glob as globFn } from 'glob'
import { buildTool } from '../../base/builder/builder.ts'
import type { ToolResult } from '../../../../types/messages/tool-result.ts'
import type { ToolContext } from '../../../../types/tools/context.ts'

const GrepInputSchema = z.object({
  pattern: z.string().describe('Regex pattern to search for'),
  path: z.string().optional().describe('File path to search in'),
  include: z.string().optional().describe('Glob pattern for files to include'),
})

/**
 * GrepTool untuk cari pattern di file.
 */
export const GrepTool = buildTool({
  name: 'Grep',
  description: 'Search for patterns in files using regex',
  inputSchema: GrepInputSchema,
  
  async call(args: any, context: ToolContext): Promise<ToolResult> {
    try {
      const { pattern, path, include } = args as { pattern: string; path?: string; include?: string }

      const cwd = context.workingDirectory
      const relativeFiles = path ? [path] : await globFn(include || '**/*', { cwd, nodir: true })
      const files = path ? [path] : relativeFiles.map(f => join(cwd, f))
      const results: Array<{ file: string; line: number; match: string }> = []
      const regex = new RegExp(pattern)

      for (const file of files) {
        try {
          const content = await readFile(file, 'utf-8')
          const lines = content.split('\n')

          for (let i = 0; i < lines.length; i++) {
            if (regex.test(lines[i])) {
              results.push({ file, line: i + 1, match: lines[i] })
            }
          }
        } catch (err) {
          // Skip files that can't be read
          continue
        }
      }

      return {
        toolCallId: crypto.randomUUID(),
        success: true,
        data: { results, count: results.length },
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