/**
 * LLM Provider interface.
 * @module core/providers/interface
 */

import type { Message } from '../../types/messages/message.ts'
import type { ToolDefinition } from '../../types/tools/definition.ts'
import type { ToolCall } from '../../types/messages/tool-call.ts'

/**
 * Token usage.
 */
export interface TokenUsage {
  /** Input tokens */
  inputTokens: number
  /** Output tokens */
  outputTokens: number
}

/**
 * LLM response.
 */
export interface LLMResponse {
  /** Response content */
  content?: string
  /** Tool calls */
  toolCalls?: ToolCall[]
  /** Token usage */
  usage?: TokenUsage
}

/**
 * LLM Provider interface.
 */
export interface LLMProvider {
  /** Provider name */
  name: string
  /** Send message ke LLM */
  sendMessage(messages: Message[], tools?: ToolDefinition[]): Promise<LLMResponse>
}