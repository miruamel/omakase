/**
 * NVIDIA NIM client implementation.
 * @module core/providers/nvidia/client
 */

import type { LLMProvider, LLMResponse } from '../interface.ts'
import type { Message } from '../../../types/messages/message.ts'
import type { ToolDefinition } from '../../../types/tools/definition.ts'
import { logger } from '../../services/logger/logger/logger.ts'

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
      logger.debug('Sending request to NVIDIA NIM API', {
        messageCount: messages.length,
        toolCount: tools?.length,
        endpoint: baseUrl,
      })

      try {
        const response = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'nvidia/llama-3.1-nemotron-70b-instruct',
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
            tool_choice: tools && tools.length > 0 ? 'auto' : undefined,
            max_tokens: 1024,
            temperature: 0.7,
          }),
        })

        if (!response.ok) {
          throw new Error(`NVIDIA API error: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        
        logger.debug('NVIDIA NIM API response received', {
          model: data.model,
        })

        const content = data.choices[0]?.message?.content || ''
        
        const toolCalls = data.choices[0]?.message?.tool_calls?.map((tc: any) => ({
          id: tc.id || crypto.randomUUID(),
          name: tc.function?.name || '',
          input: typeof tc.function?.arguments === 'string' 
            ? JSON.parse(tc.function.arguments) 
            : tc.function?.arguments || {},
        }))

        return {
          content,
          toolCalls: toolCalls && toolCalls.length > 0 ? toolCalls : undefined,
          usage: {
            inputTokens: data.usage?.prompt_tokens || 0,
            outputTokens: data.usage?.completion_tokens || 0,
          },
        }
      } catch (error) {
        logger.error('NVIDIA NIM API request failed', error as Error)
        throw error
      }
    },
  }
}