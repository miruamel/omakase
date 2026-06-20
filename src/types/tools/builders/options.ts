/** Tool builder options */
import type { z } from 'zod'
import type { ToolResult } from '../../messages/tool-result.ts'
import type { ToolContext } from '../context/context.ts'
import type { PermissionResult } from '../permissions/result.ts'

export interface ToolBuilderOptions {
  name: string
  description: string
  inputSchema: z.ZodObject<any>
  call: (args: Record<string, unknown>, context: ToolContext) => Promise<ToolResult>
  checkPermissions?: (input: Record<string, unknown>, context: ToolContext) => Promise<PermissionResult>
}