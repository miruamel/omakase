/**
 * Ollama client implementation.
 * @module core/providers/ollama/client
 */

import type { LLMProvider, LLMResponse } from '../interface.ts'
import type { Message } from '../../../types/messages/message.ts'
import type { ToolDefinition } from '../../../types/tools/definition.ts'
import { logger } from '../../services/logger/logger/logger.ts'

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
      logger.debug('Sending request to Ollama API', {
        messageCount: messages.length,
        toolCount: tools?.length,
        endpoint: baseUrl,
      })

      try {
        const response = await fetch(`${baseUrl}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'llama3',
            messages: messages.map(m => ({
              role: m.role,
              content: m.content,
            })),
            tools: tools?.map(tool => ({
              type: 'function',
              function: {
                name: tool.name,
                description: tool.description,
                parameters: tool.inputSchema,
              },
            })),
            stream: false,
          }),
        })

        if (!response.ok) {
          throw new Error(`Ollama API error: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        
        logger.debug('Ollama API response received', {
          model: data.model,
        })

        const content = data.message?.content || ''
        
        const toolCalls = data.message?.tool_calls?.map((tc: any) => ({
          id: tc.id || crypto.randomUUID(),
          name: tc.function?.name || '',
          input: tc.function?.arguments || {},
        }))

        return {
          content,
          toolCalls: toolCalls && toolCalls.length > 0 ? toolCalls : undefined,
          usage: {
            inputTokens: data.eval_count || 0,
            outputTokens: data.eval_count || 0,
          },
        }
      } catch (error) {
        logger.error('Ollama API request failed', error as Error)
        throw error
      }
    },
  }
}