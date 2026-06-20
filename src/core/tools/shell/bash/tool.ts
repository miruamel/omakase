/**
 * Bash tool untuk execute shell commands.
 * @module core/tools/shell/bash
 */

import { z } from 'zod'
import { exec } from 'child_process'
import { buildTool } from '../../base/builder/builder.ts'
import type { ToolResult } from '../../../../types/messages/tool-result.ts'
import type { PermissionResult } from '../../base/types/permission.ts'
import type { ToolContext } from '../../../../types/tools/context.ts'

const BashInputSchema = z.object({
  command: z.string().describe('The bash command to execute'),
  workingDirectory: z.string().optional().describe('Working directory for the command'),
})

const DANGEROUS_COMMANDS = [
  'rm -rf',
  'sudo',
  'dd',
  'mkfs',
  '> /dev/',
  '| tee /',
]

/**
 * BashTool untuk execute shell commands.
 */
export const BashTool = buildTool({
  name: 'Bash',
  description: 'Execute bash commands in the shell',
  inputSchema: BashInputSchema,
  
  async call(args: any, context: ToolContext): Promise<ToolResult> {
    const { command, workingDirectory = context.workingDirectory } = args as {
      command: string
      workingDirectory?: string
    }

    return new Promise((resolve) => {
      exec(command, { cwd: workingDirectory, encoding: 'utf8' }, (error, stdout, stderr) => {
        if (error) {
          resolve({
            toolCallId: crypto.randomUUID(),
            success: false,
            error: stderr || error.message,
          })
        } else {
          resolve({
            toolCallId: crypto.randomUUID(),
            success: true,
            data: { stdout, stderr },
          })
        }
      })
    })
  },
  
  async checkPermissions(input: any): Promise<PermissionResult> {
    const command = input.command as string
    
    for (const dangerous of DANGEROUS_COMMANDS) {
      if (command.includes(dangerous)) {
        return {
          granted: false,
          prompt: `Command "${command}" may be dangerous. Continue?`,
        }
      }
    }
    
    return { granted: true }
  },
})