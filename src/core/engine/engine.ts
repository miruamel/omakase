/**
 * QueryEngine - Core engine untuk handle LLM queries.
 * @module core/engine
 */

import type { LLMProvider } from '../providers/interface.ts'
import type { Message } from '../../types/messages/message.ts'
import type { ToolDefinition } from '../../types/tools/definition.ts'
import type { ToolCall } from '../../types/messages/tool-call.ts'
import type { ToolContext } from '../../types/tools/context.ts'
import type { ToolResult } from '../../types/messages/tool-result.ts'
import type { LLMResponse } from '../providers/interface.ts'
import { logger } from '../services/logger/logger/logger.ts'

/**
 * QueryEngine configuration.
 */
export interface QueryEngineConfig {
  /** Max retry attempts */
  maxRetries: number
  /** Retry delay in ms */
  retryDelay: number
  /** Timeout in ms */
  timeout: number
}

/**
 * QueryEngine untuk handle LLM queries dengan retry logic.
 */
export class QueryEngine {
  private provider: LLMProvider
  private config: QueryEngineConfig

  /**
   * Create QueryEngine.
   * 
   * @param provider - LLM provider
   * @param config - Engine configuration
   */
  constructor(provider: LLMProvider, config?: Partial<QueryEngineConfig>) {
    this.provider = provider
    this.config = {
      maxRetries: 3,
      retryDelay: 1000,
      timeout: 30000,
      ...config,
    }
  }

  /**
   * Send message ke LLM dengan retry logic.
   * 
   * @param messages - Messages untuk send
   * @param tools - Available tools
   * @returns LLM response
   */
  async sendMessage(messages: Message[], tools?: ToolDefinition[]): Promise<LLMResponse> {
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        logger.debug('Sending message', { attempt, messageCount: messages.length })
        
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

        const response = await this.provider.sendMessage(messages, tools)
        
        clearTimeout(timeoutId)
        logger.debug('Message sent successfully', { 
          hasContent: !!response.content,
          hasToolCalls: !!response.toolCalls,
        })

        return response
      } catch (error) {
        lastError = error as Error
        logger.error('Send message failed', error as Error, { attempt })

        if (attempt < this.config.maxRetries) {
          await this.sleep(this.config.retryDelay * attempt)
        }
      }
    }

    throw lastError || new Error('Failed to send message')
  }

  /**
   * Execute tool call.
   * 
   * @param toolCall - Tool call untuk execute
   * @param tools - Available tools
   * @param context - Tool context
   * @returns Tool result
   */
  async executeToolCall(
    toolCall: ToolCall,
    tools: Record<string, ToolDefinition>,
    context: ToolContext
  ): Promise<ToolResult> {
    const tool = tools[toolCall.name]
    
    if (!tool) {
      throw new Error(`Tool not found: ${toolCall.name}`)
    }

    try {
      // Check permissions
      if (tool.checkPermissions) {
        const permission = await tool.checkPermissions(toolCall.input)
        
        if (!permission.granted) {
          // If promptUser callback is available, ask user for confirmation
          if (context.promptUser && permission.prompt) {
            const userApproved = await context.promptUser(permission.prompt)
            
            if (!userApproved) {
              return {
                toolCallId: toolCall.id,
                success: false,
                error: 'Permission denied by user',
              }
            }
          } else {
            return {
              toolCallId: toolCall.id,
              success: false,
              error: permission.prompt || 'Permission denied',
            }
          }
        }
      }

      // Execute tool
      const result = await tool.call(toolCall.input, context)
      
      logger.debug('Tool executed', {
        tool: toolCall.name,
        success: result.success,
      })

      return result
    } catch (error) {
      logger.error('Tool execution failed', error as Error, {
        tool: toolCall.name,
      })

      return {
        toolCallId: toolCall.id,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}