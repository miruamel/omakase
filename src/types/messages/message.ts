/**
 * Message types.
 * @module types/messages/message
 */

import type { ToolCall } from './tool-call.ts'

/**
 * Message role.
 */
export type MessageRole = 'user' | 'assistant' | 'system' | 'tool'

/**
 * Message interface.
 */
export interface Message {
  /** Message role */
  role: MessageRole
  /** Message content */
  content: string
  /** Optional tool calls (untuk assistant messages) */
  toolCalls?: ToolCall[]
}