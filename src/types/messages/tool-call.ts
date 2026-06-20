/**
 * Tool call type.
 * @module types/messages/tool-call
 */

/**
 * Tool call untuk invoke tools.
 */
export interface ToolCall {
  /** Unique tool call ID */
  id: string
  /** Tool name */
  name: string
  /** Tool input arguments */
  input: Record<string, any>
}