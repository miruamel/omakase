/**
 * Shared HTTP client utilities untuk LLM providers.
 * @module core/providers/http-client
 */

import type { Message } from '../../types/messages/message.ts'
import type { ToolDefinition } from '../../types/tools/definition.ts'
import type { ToolCall } from '../../types/messages/tool-call.ts'

/**
 * HTTP request options.
 */
export interface HttpRequestOptions {
  /** HTTP method */
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  /** Request URL */
  url: string
  /** Request headers */
  headers?: Record<string, string>
  /** Request body */
  body?: unknown
  /** Request timeout in ms */
  timeout?: number
  /** Provider name for logging */
  providerName: string
}

/**
 * HTTP response.
 */
export interface HttpResponse<T = unknown> {
  /** Response status */
  status: number
  /** Response status text */
  statusText: string
  /** Parsed JSON body */
  data: T
}

/**
 * Make HTTP request dengan timeout dan error handling.
 *
 * @param options - Request options
 * @returns HTTP response
 * @throws Error jika request gagal atau timeout
 */
export async function httpRequest<T = unknown>(
  options: HttpRequestOptions
): Promise<HttpResponse<T>> {
  const { method = 'POST', url, headers = {}, body, timeout = 30000, providerName } = options

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`${providerName} API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json() as T

    return {
      status: response.status,
      statusText: response.statusText,
      data,
    }
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

/**
 * Map messages ke format OpenAI-compatible (role + content).
 *
 * @param messages - Messages untuk map
 * @returns Mapped messages
 */
export function mapMessages(messages: Message[]): Array<{ role: string; content: string }> {
  return messages.map(m => ({
    role: m.role,
    content: m.content,
  }))
}

/**
 * Map tools ke format OpenAI-compatible (function calling).
 *
 * @param tools - Tools untuk map
 * @returns Mapped tools
 */
export function mapTools(tools?: ToolDefinition[]): Array<{
  type: 'function'
  function: { name: string; description: string; parameters: unknown }
}> | undefined {
  if (!tools || tools.length === 0) return undefined

  return tools.map(tool => ({
    type: 'function' as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema,
    },
  }))
}

/**
 * Parse OpenAI-compatible tool calls dari response.
 *
 * @param toolCalls - Raw tool calls dari API
 * @returns Parsed tool calls
 */
export function parseToolCalls(toolCalls?: any[]): ToolCall[] | undefined {
  if (!toolCalls || toolCalls.length === 0) return undefined

  const parsed = toolCalls.map((tc: any) => ({
    id: tc.id || crypto.randomUUID(),
    name: tc.function?.name || '',
    input: typeof tc.function?.arguments === 'string'
      ? JSON.parse(tc.function.arguments)
      : tc.function?.arguments || {},
  }))

  return parsed.length > 0 ? parsed : undefined
}
