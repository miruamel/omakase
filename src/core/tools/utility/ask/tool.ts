/**
 * AskUser tool untuk prompt user.
 * @module core/tools/utility/ask
 */

import { z } from 'zod'
import { buildTool } from '../../base/builder/builder.ts'
import type { ToolResult } from '../../../../types/messages/tool-result.ts'
import type { ToolContext } from '../../../../types/tools/context.ts'

const AskUserInputSchema = z.object({
  question: z.string().describe('The question to ask'),
  options: z.array(z.string()).optional().describe('Multiple choice options'),
})

/**
 * AskUserTool untuk prompt user selama execution.
 */
export const AskUserTool = buildTool({
  name: 'AskUser',
  description: 'Ask the user a question during execution',
  inputSchema: AskUserInputSchema,
  
  async call(args: any, context: ToolContext): Promise<ToolResult> {
    const { question, options } = args as { question: string; options?: string[] }

    return new Promise(async (resolve) => {
      const readline = await import('readline')
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      })

      console.log(`\n${question}`)
      
      if (options && options.length > 0) {
        options.forEach((opt, i) => {
          console.log(`  ${i + 1}. ${opt}`)
        })
      }

      rl.question('> ', (answer) => {
        rl.close()
        resolve({
          toolCallId: crypto.randomUUID(),
          success: true,
          data: { answer },
        })
      })
    })
  },
  
  async checkPermissions() {
    return { granted: true }
  },
})