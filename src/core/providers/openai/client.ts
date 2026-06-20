/**
 * OpenAI client implementation.
 * @module core/providers/openai/client
 */

import type { LLMProvider, LLMResponse } from '../interface.ts'
import type { Message } from '../../../types/messages/message.ts'
import type { ToolDefinition } from '../../../types/tools/definition.ts'
import { logger } from '../../services/logger/logger/logger.ts'
import { handleOpenAIError } from './errors/handler.ts'

/**
 * Create OpenAI provider instance.
 * 
 * @param apiKey - OpenAI API key (sk-...)
 * @returns LLMProvider instance untuk OpenAI
 */
export function createOpenAIProvider(apiKey: string): LLMProvider {
  return {
    name: 'openai',
    
    /**
     * Send messages ke OpenAI API.
     * 
     * @param messages - Array messages untuk send
     * @param tools - Optional: tools yang tersedia
     * @returns Response dengan content dan tool calls
     */
    async sendMessage(messages: Message[], tools?: ToolDefinition[]): Promise<LLMResponse> {
      logger.debug('Sending request to OpenAI API', {
        messageCount: messages.length,
        toolCount: tools?.length,
      })

      try {
        const { OpenAI } = await import('openai')
        const client = new OpenAI({ apiKey })

        const response = await client.chat.completions.create({
          model: 'gpt-4-turbo',
          messages: messages.map(m => ({
            role: m.role as 'user' | 'assistant' | 'system',
            content: m.content,
          })),
          tools: tools?.map(tool => ({
            type: 'function',
            function: {
              name: tool.name,
              description: tool.description,
              parameters: tool.inputSchema as any,
            },
          })),
          tool_choice: tools && tools.length > 0 ? 'auto' : undefined,
        })

        logger.debug('OpenAI API response received', {
          id: response.id,
          model: response.model,
          usage: response.usage,
        })

        const content = response.choices[0]?.message?.content || ''

        const toolCalls = response.choices[0]?.message?.tool_calls?.map(tc => ({
          id: tc.id,
          name: tc.function?.name || '',
          input: JSON.parse(tc.function?.arguments || '{}'),
        }))

        return {
          content,
          toolCalls: toolCalls && toolCalls.length > 0 ? toolCalls : undefined,
          usage: {
            inputTokens: response.usage?.prompt_tokens || 0,
            outputTokens: response.usage?.completion_tokens || 0,
          },
        }
      } catch (error) {
        logger.error('OpenAI API request failed', error as Error)
        throw handleOpenAIError(error)
      }
    },
  }
}