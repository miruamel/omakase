/**
 * MCP client implementation.
 * @module core/services/mcp/client
 */

import { spawn, type ChildProcess } from 'child_process'
import { logger } from '../../logger/logger/logger.ts'
import type {
  MCPServerConfig,
  MCPTool,
  MCPToolResult,
  JSONRPCRequest,
  JSONRPCResponse,
} from '../types.ts'

/**
 * MCP client untuk connect ke MCP server.
 */
export class MCPClient {
  private config: MCPServerConfig
  private process: ChildProcess | null = null
  private requestId: number = 0
  private pendingRequests: Map<number, {
    resolve: (value: unknown) => void
    reject: (error: Error) => void
  }> = new Map()
  private buffer: string = ''
  private connected: boolean = false
  private tools: MCPTool[] = []

  /**
   * Buat MCP client baru.
   *
   * @param config - Server configuration
   */
  constructor(config: MCPServerConfig) {
    this.config = config
  }

  /**
   * Connect ke MCP server.
   *
   * @returns Promise yang resolve ketika connected
   */
  async connect(): Promise<void> {
    if (this.connected) {
      return
    }

    if (this.config.transport === 'http') {
      throw new Error('HTTP transport not yet implemented')
    }

    return new Promise((resolve, reject) => {
      try {
        logger.info('Connecting to MCP server', {
          name: this.config.name,
          command: this.config.command,
        })

        this.process = spawn(this.config.command, this.config.args || [], {
          env: { ...process.env, ...this.config.env },
          stdio: ['pipe', 'pipe', 'pipe'],
        })

        this.process.stdout?.on('data', (data: Buffer) => {
          this.handleData(data.toString())
        })

        this.process.stderr?.on('data', (data: Buffer) => {
          logger.debug('MCP server stderr', {
            name: this.config.name,
            data: data.toString(),
          })
        })

        this.process.on('error', (error) => {
          logger.error('MCP server error', error, { name: this.config.name })
          reject(error)
        })

        this.process.on('exit', (code) => {
          logger.info('MCP server exited', { name: this.config.name, code })
          this.connected = false
          this.process = null
        })

        this.connected = true
        resolve()
      } catch (error) {
        reject(error as Error)
      }
    })
  }

  /**
   * Disconnect dari MCP server.
   */
  async disconnect(): Promise<void> {
    if (this.process) {
      this.process.kill()
      this.process = null
    }
    this.connected = false
    this.pendingRequests.clear()
    logger.info('Disconnected from MCP server', { name: this.config.name })
  }

  /**
   * Check apakah connected.
   *
   * @returns True jika connected
   */
  isConnected(): boolean {
    return this.connected
  }

  /**
   * List available tools dari server.
   *
   * @returns Array of available tools
   */
  async listTools(): Promise<MCPTool[]> {
    if (!this.connected) {
      throw new Error('Not connected to MCP server')
    }

    const response = await this.sendRequest<{ tools: MCPTool[] }>('tools/list', {})
    this.tools = response.tools || []
    return this.tools
  }

  /**
   * Call tool di MCP server.
   *
   * @param name - Tool name
   * @param args - Tool arguments
   * @returns Tool result
   */
  async callTool(name: string, args: Record<string, unknown>): Promise<MCPToolResult> {
    if (!this.connected) {
      throw new Error('Not connected to MCP server')
    }

    return this.sendRequest<MCPToolResult>('tools/call', {
      name,
      arguments: args,
    })
  }

  /**
   * Get cached tools list.
   *
   * @returns Cached tools
   */
  getCachedTools(): MCPTool[] {
    return this.tools
  }

  /**
   * Send JSON-RPC request ke server.
   *
   * @param method - RPC method
   * @param params - RPC params
   * @returns RPC result
   */
  private sendRequest<T>(method: string, params: unknown): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.process?.stdin) {
        reject(new Error('MCP server not connected'))
        return
      }

      const id = ++this.requestId
      const request: JSONRPCRequest = {
        jsonrpc: '2.0',
        id,
        method,
        params,
      }

      this.pendingRequests.set(id, { resolve: resolve as (value: unknown) => void, reject })

      const message = JSON.stringify(request) + '\n'
      this.process.stdin.write(message, (error) => {
        if (error) {
          this.pendingRequests.delete(id)
          reject(error)
        }
      })
    })
  }

  /**
   * Handle incoming data dari server.
   *
   * @param data - Raw data
   */
  private handleData(data: string): void {
    this.buffer += data

    const lines = this.buffer.split('\n')
    this.buffer = lines.pop() || ''

    for (const line of lines) {
      if (!line.trim()) continue

      try {
        const response: JSONRPCResponse = JSON.parse(line)

        if (response.id && this.pendingRequests.has(response.id)) {
          const { resolve, reject } = this.pendingRequests.get(response.id)!
          this.pendingRequests.delete(response.id)

          if (response.error) {
            reject(new Error(`MCP error: ${response.error.message}`))
          } else {
            resolve(response.result)
          }
        }
      } catch (error) {
        logger.error('Failed to parse MCP response', error as Error, {
          data: line,
        })
      }
    }
  }
}
