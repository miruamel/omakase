/**
 * Tool definition types.
 * @module types/tools/definitions/definition
 */

import type { z } from 'zod'
import type { ToolResult } from '../../messages/tool-result.ts'
import type { ToolContext } from '../context/context.ts'
import type { PermissionResult } from '../permissions/result.ts'

/**
 * Definisi tool yang dapat dipanggil oleh agent.
 */
export interface ToolDefinition {
  /** Nama tool (unique identifier) */
  name: string
  /** Deskripsi tool untuk LLM */
  description: string
  /** Zod schema untuk validasi input */
  inputSchema: z.ZodObject<any>
  /** Fungsi untuk eksekusi tool */
  call: (args: Record<string, unknown>, context: ToolContext) => Promise<ToolResult>
  /** Optional permission check sebelum eksekusi */
  checkPermissions?: (input: Record<string, unknown>, context: ToolContext) => Promise<PermissionResult>
}
