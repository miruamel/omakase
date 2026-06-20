/**
 * TodoWrite tool untuk manage todo list.
 * @module core/tools/utility/todo
 */

import { z } from 'zod'
import { buildTool } from '../../base/builder/builder.ts'
import type { ToolResult } from '../../../../types/messages/tool-result.ts'
import type { ToolContext } from '../../../../types/tools/context.ts'

const TodoWriteInputSchema = z.object({
  todos: z.array(z.object({
    content: z.string(),
    status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']),
    priority: z.enum(['high', 'medium', 'low']).optional(),
  })),
})

/**
 * TodoWriteTool untuk create dan manage todo list.
 */
export const TodoWriteTool = buildTool({
  name: 'TodoWrite',
  description: 'Create and manage a todo list for tracking tasks',
  inputSchema: TodoWriteInputSchema,
  
  async call(args: any, context: ToolContext): Promise<ToolResult> {
    const todos = args.todos as Array<{
      content: string
      status: string
      priority?: string
    }>

    const output = todos
      .map((t, i) => {
        const icon = {
          pending: '○',
          in_progress: '●',
          completed: '✓',
          cancelled: '✗',
        }[t.status] || '○'
        return `${i + 1}. [${icon}] ${t.content}${t.priority ? ` (${t.priority})` : ''}`
      })
      .join('\n')

    return {
      toolCallId: crypto.randomUUID(),
      success: true,
      data: { todos, rendered: output },
    }
  },
  
  async checkPermissions() {
    return { granted: true }
  },
})