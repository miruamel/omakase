/**
 * MCP (Model Context Protocol) types.
 * @module core/services/mcp/types
 */

/**
 * MCP server configuration.
 */
export interface MCPServerConfig {
  /** Server name */
  name: string
  /** Command to execute (for stdio transport) */
  command: string
  /** Command arguments */
  args?: string[]
  /** Environment variables */
  env?: Record<string, string>
  /** Transport type */
  transport?: 'stdio' | 'http'
  /** HTTP URL (for http transport) */
  url?: string
}

/**
 * MCP tool definition.
 */
export interface MCPTool {
  /** Tool name */
  name: string
  /** Tool description */
  description: string
  /** Input schema (JSON Schema) */
  inputSchema: {
    type: 'object'
    properties?: Record<string, unknown>
    required?: string[]
  }
}

/**
 * MCP tool call result.
 */
export interface MCPToolResult {
  /** Content blocks */
  content: Array<{
    type: 'text' | 'image' | 'resource'
    text?: string
    data?: string
    mimeType?: string
  }>
  /** Whether the result is an error */
  isError?: boolean
}

/**
 * JSON-RPC request.
 */
export interface JSONRPCRequest {
  jsonrpc: '2.0'
  id: number
  method: string
  params?: unknown
}

/**
 * JSON-RPC response.
 */
export interface JSONRPCResponse<T = unknown> {
  jsonrpc: '2.0'
  id: number
  result?: T
  error?: {
    code: number
    message: string
    data?: unknown
  }
}
