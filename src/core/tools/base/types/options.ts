/**
 * Tool build options type.
 * @module core/tools/base/types/options
 */

import type { ToolDefinitionBase } from './definition.ts'

/**
 * Build tool options.
 */
export interface BuildToolOptions<T = any> {
  /** Tool name (unique identifier) */
  name: string
  /** Tool description */
  description: string
  /** Zod schema untuk input validation */
  inputSchema: any
  /** Function untuk execute tool */
  call: (args: T, context: any) => Promise<any>
  /** Optional: function untuk check permissions */
  checkPermissions?: (args: T) => Promise<any>
}