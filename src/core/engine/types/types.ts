/**
 * Engine types.
 * @module core/engine/types
 */

import type { Message } from '../../../types/messages/message.ts'
import type { ToolCall } from '../../../types/messages/tool-call.ts'
import type { ToolResult } from '../../../types/messages/tool-result.ts'

/**
 * Tool execution result.
 */
export interface ToolExecutionResult extends ToolResult {
  /** Tool call ID */
  toolCallId: string
}

/**
 * Query result.
 */
export interface QueryResult {
  /** Response messages */
  messages: Message[]
  /** Tool calls */
  toolCalls?: ToolCall[]
  /** Done */
  done: boolean
}