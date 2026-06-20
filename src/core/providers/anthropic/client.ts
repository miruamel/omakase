/**
 * Anthropic client implementation.
 * @module core/providers/anthropic/client
 */

import type { LLMProvider, LLMResponse } from '../interface.ts'
import type { Message } from '../../../types/messages/message.ts'
import type { ToolDefinition } from '../../../types/tools/definition.ts'
import { logger } from '../../services/logger/logger/logger.ts'
import { handleAnthropicError } from './errors/handler.ts'

/**
 * Create Anthropic provider instance.
 * 
 * @param apiKey - Anthropic API key (sk-ant-...)
 * @returns LLMProvider instance untuk Anthropic
 */
export function createAnthropicProvider(apiKey: string): LLMProvider {
  return {
    name: 'anthropic',
    
    /**
     * Send messages ke Anthropic API.
     * 
     * @param messages - Array messages untuk send
     * @param tools - Optional: tools yang tersedia
     * @returns Response dengan content dan tool calls
     */
    async sendMessage(messages: Message[], tools?: ToolDefinition[]): Promise<LLMResponse> {
      logger.debug('Sending request to Anthropic API', {
        messageCount: messages.length,
        toolCount: tools?.length,
      })

      try {
        const Anthropic = (await import('@anthropic-ai/sdk')).default
        const client = new Anthropic({ apiKey })

        // Filter system messages (Anthropic doesn't accept them in messages array)
        const userMessages = messages.filter(m => m.role !== 'system')

        const response = await client.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 8192,
          messages: userMessages.map(m => ({ 
            role: m.role as 'user' | 'assistant', 
            content: m.content 
          })),
          tools: tools?.map(tool => ({
            name: tool.name,
            description: tool.description,
            input_schema: tool.inputSchema as any,
          })),
        })

        logger.debug('Anthropic API response received', {
          id: response.id,
          stopReason: response.stop_reason,
          usage: response.usage,
        })

        const content = response.content
          .filter(block => block.type === 'text')
          .map(block => (block as any).text)
          .join('')

        const toolCalls = response.content
          .filter(block => block.type === 'tool_use')
          .map(block => {
            const toolBlock = block as any
            return {
              id: toolBlock.id,
              name: toolBlock.name,
              input: toolBlock.input,
            }
          })

        return {
          content,
          toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
          usage: {
            inputTokens: response.usage.input_tokens,
            outputTokens: response.usage.output_tokens,
          },
        }
      } catch (error) {
        logger.error('Anthropic API request failed', error as Error)
        throw handleAnthropicError(error)
      }
    },
  }
}