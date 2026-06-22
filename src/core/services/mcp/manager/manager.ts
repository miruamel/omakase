/**
 * MCP manager untuk manage multiple MCP servers.
 * @module core/services/mcp/manager
 */

import { MCPClient } from '../client/client.ts'
import { logger } from '../../logger/logger/logger.ts'
import type { MCPServerConfig, MCPTool } from '../types.ts'

/**
 * MCP manager untuk manage multiple MCP server connections.
 */
export class MCPManager {
  private clients: Map<string, MCPClient> = new Map()
  private configs: MCPServerConfig[] = []

  /**
   * Add MCP server configuration.
   *
   * @param config - Server configuration
   */
  addServer(config: MCPServerConfig): void {
    if (!config.name || typeof config.name !== 'string') {
      throw new Error('MCP server name is required and must be a string')
    }

    if (this.configs.some(c => c.name === config.name)) {
      throw new Error(`MCP server "${config.name}" already added`)
    }

    this.configs.push(config)
    logger.info('MCP server added', { name: config.name })
  }

  /**
   * Connect ke semua configured servers.
   */
  async connectAll(): Promise<void> {
    for (const config of this.configs) {
      try {
        const client = new MCPClient(config)
        await client.connect()
        this.clients.set(config.name, client)
        logger.info('Connected to MCP server', { name: config.name })
      } catch (error) {
        logger.error('Failed to connect to MCP server', error as Error, {
          name: config.name,
        })
      }
    }
  }

  /**
   * Disconnect dari semua servers.
   */
  async disconnectAll(): Promise<void> {
    for (const [name, client] of this.clients) {
      try {
        await client.disconnect()
        logger.info('Disconnected from MCP server', { name })
      } catch (error) {
        logger.error('Failed to disconnect from MCP server', error as Error, {
          name,
        })
      }
    }
    this.clients.clear()
  }

  /**
   * Get client by server name.
   *
   * @param name - Server name
   * @returns MCP client atau undefined
   */
  getClient(name: string): MCPClient | undefined {
    return this.clients.get(name)
  }

  /**
   * Get semua tools dari semua connected servers.
   *
   * @returns Array of tools dengan server info
   */
  async getAllTools(): Promise<Array<MCPTool & { server: string }>> {
    const allTools: Array<MCPTool & { server: string }> = []

    for (const [serverName, client] of this.clients) {
      try {
        const tools = await client.listTools()
        for (const tool of tools) {
          allTools.push({ ...tool, server: serverName })
        }
      } catch (error) {
        logger.error('Failed to list tools from MCP server', error as Error, {
          name: serverName,
        })
      }
    }

    return allTools
  }

  /**
   * Get list of connected server names.
   *
   * @returns Array of server names
   */
  getConnectedServers(): string[] {
    return Array.from(this.clients.keys())
  }

  /**
   * Check apakah server connected.
   *
   * @param name - Server name
   * @returns True jika connected
   */
  isConnected(name: string): boolean {
    return this.clients.has(name) && this.clients.get(name)!.isConnected()
  }
}
