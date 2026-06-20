/**
 * Tool definition type.
 * @module types/tools/definition
 */

import type { z } from 'zod'
import type { ToolContext } from './context.ts'
import type { ToolResult } from '../messages/tool-result.ts'
import type { PermissionResult } from './permission.ts'

/**
 * Tool definition interface.
 */
export interface ToolDefinition {
  /** Tool name (unique identifier) */
  name: string
  /** Tool description */
  description: string
  /** Zod schema untuk input validation */
  inputSchema: z.ZodType
  /** Function untuk execute tool */
  call: (args: any, context: ToolContext) => Promise<ToolResult>
  /** Optional: function untuk check permissions */
  checkPermissions?: (args: any) => Promise<PermissionResult>
}