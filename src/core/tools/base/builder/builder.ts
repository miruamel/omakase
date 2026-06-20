/**
 * Tool builder utility.
 * @module core/tools/base/builder
 */

import type { ToolDefinition } from '../../../../types/tools/definition.ts'
import type { ToolContext } from '../../../../types/tools/context.ts'
import type { ToolResult } from '../../../../types/messages/tool-result.ts'
import type { PermissionResult } from '../types/permission.ts'

/**
 * Tool function type.
 */
export type ToolCallFn<T = any> = (args: T, context: ToolContext) => Promise<ToolResult>

/**
 * Permission check function type.
 */
export type PermissionCheckFn<T = any> = (args: T) => Promise<PermissionResult>

/**
 * Build tool dengan type safety.
 * 
 * @param definition - Tool definition dengan name, description, inputSchema
 * @param call - Function untuk execute tool
 * @param checkPermissions - Optional: function untuk check permissions
 * @returns ToolDefinition yang sudah typed
 */
export function buildTool<T = any>(options: {
  name: string
  description: string
  inputSchema: any
  call: ToolCallFn<T>
  checkPermissions?: PermissionCheckFn<T>
}): ToolDefinition {
  return {
    name: options.name,
    description: options.description,
    inputSchema: options.inputSchema,
    call: options.call as ToolCallFn,
    checkPermissions: options.checkPermissions as PermissionCheckFn,
  }
}