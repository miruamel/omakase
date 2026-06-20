/**
 * Tool-related errors.
 * @module core/errors/types/tool
 */

import { OmakaseError } from './base.ts'

/**
 * ToolError untuk error saat eksekusi tool.
 */
export class ToolError extends OmakaseError {
  /**
   * Create ToolError.
   * 
   * @param toolName - Nama tool yang gagal
   * @param message - Error message
   * @param context - Additional context
   */
  constructor(toolName: string, message: string, context?: Record<string, unknown>) {
    super(`TOOL_${toolName.toUpperCase()}_ERROR`, message, { toolName, ...context })
    this.name = 'ToolError'
  }
}