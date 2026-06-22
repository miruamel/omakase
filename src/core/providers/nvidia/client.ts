/**
 * NVIDIA NIM client implementation.
 * @module core/providers/nvidia/client
 */

import type { LLMProvider, LLMResponse } from '../interface.ts'
import type { Message } from '../../../types/messages/message.ts'
import type { ToolDefinition } from '../../../types/tools/definition.ts'
import { httpRequest, mapMessages, mapTools, parseToolCalls } from '../http-client.ts'

/**
 * Create NVIDIA NIM provider instance.
 *
 * @param apiKey - NVIDIA API key
 * @param endpoint - NVIDIA NIM endpoint (default: https://integrate.api.nvidia.com/v1)
 * @returns LLMProvider instance untuk NVIDIA
 */
export function createNvidiaProvider(apiKey: string, endpoint?: string): LLMProvider {
  const baseUrl = endpoint || 'https://integrate.api.nvidia.com/v1'

  return {
    name: 'nvidia',

    async sendMessage(messages: Message[], tools?: ToolDefinition[]): Promise<LLMResponse> {
      const { data } = await httpRequest<any>({
        url: `${baseUrl}/chat/completions`,
        providerName: 'NVIDIA NIM',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        body: {
          model: 'nvidia/llama-3.1-nemotron-70b-instruct',
          messages: mapMessages(messages),
          tools: mapTools(tools),
          tool_choice: tools && tools.length > 0 ? 'auto' : undefined,
          max_tokens: 1024,
          temperature: 0.7,
        },
      })

      const content = data.choices[0]?.message?.content || ''
      const toolCalls = parseToolCalls(data.choices[0]?.message?.tool_calls)

      return {
        content,
        toolCalls,
        usage: {
          inputTokens: data.usage?.prompt_tokens || 0,
          outputTokens: data.usage?.completion_tokens || 0,
        },
      }
    },
  }
}
