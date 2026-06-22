/**
 * Ollama client implementation.
 * @module core/providers/ollama/client
 */

import type { LLMProvider, LLMResponse } from '../interface.ts'
import type { Message } from '../../../types/messages/message.ts'
import type { ToolDefinition } from '../../../types/tools/definition.ts'
import { httpRequest, mapMessages, mapTools, parseToolCalls } from '../http-client.ts'

/**
 * Create Ollama provider instance.
 *
 * @param endpoint - Ollama endpoint (default: http://localhost:11434)
 * @returns LLMProvider instance untuk Ollama
 */
export function createOllamaProvider(endpoint?: string): LLMProvider {
  const baseUrl = endpoint || 'http://localhost:11434'

  return {
    name: 'ollama',

    async sendMessage(messages: Message[], tools?: ToolDefinition[]): Promise<LLMResponse> {
      const { data } = await httpRequest<any>({
        url: `${baseUrl}/api/chat`,
        providerName: 'Ollama',
        body: {
          model: 'llama3',
          messages: mapMessages(messages),
          tools: mapTools(tools),
          stream: false,
        },
      })

      const content = data.message?.content || ''
      const toolCalls = parseToolCalls(data.message?.tool_calls)

      return {
        content,
        toolCalls,
        usage: {
          inputTokens: data.prompt_eval_count || 0,
          outputTokens: data.eval_count || 0,
        },
      }
    },
  }
}
