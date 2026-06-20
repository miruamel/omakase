/**
 * Tool base definition type.
 * @module core/tools/base/types/definition
 */

import type { z } from 'zod'
import type { ToolContext } from '../../../../types/tools/context.ts'
import type { ToolResult } from '../../../../types/messages/tool-result.ts'
import type { PermissionResult } from './permission.ts'

/**
 * Tool function type.
 */
export type ToolCallFn<T = any> = (args: T, context: ToolContext) => Promise<ToolResult>

/**
 * Permission check function type.
 */
export type PermissionCheckFn<T = any> = (args: T) => Promise<PermissionResult>

/**
 * Tool definition interface.
 */
export interface ToolDefinitionBase<T = any> {
  /** Tool name (unique identifier) */
  name: string
  /** Tool description */
  description: string
  /** Zod schema untuk input validation */
  inputSchema: z.ZodType
  /** Function untuk execute tool */
  call: ToolCallFn<T>
  /** Optional: function untuk check permissions */
  checkPermissions?: PermissionCheckFn<T>
}