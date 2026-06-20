/**
 * Tool result type.
 * @module types/messages/tool-result
 */

/**
 * Tool execution result.
 */
export interface ToolResult {
  /** Unique tool call ID */
  toolCallId: string
  /** Apakah execution success */
  success: boolean
  /** Result data (jika success) */
  data?: any
  /** Error message (jika failed) */
  error?: string
}