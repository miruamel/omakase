/**
 * Tool builder options.
 * @module types/tools/builders/options
 */

import type { z } from 'zod'
import type { ToolResult } from '../../messages/tool-result.ts'
import type { ToolContext } from '../context/context.ts'
import type { PermissionResult } from '../permissions/result.ts'

/**
 * Options untuk membuat tool via builder.
 */
export interface ToolBuilderOptions {
  /** Nama tool */
  name: string
  /** Deskripsi tool */
  description: string
  /** Zod schema untuk input validation */
  inputSchema: z.ZodObject<any>
  /** Fungsi eksekusi tool */
  call: (args: Record<string, unknown>, context: ToolContext) => Promise<ToolResult>
  /** Optional permission check */
  checkPermissions?: (input: Record<string, unknown>, context: ToolContext) => Promise<PermissionResult>
}
