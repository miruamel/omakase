/**
 * MCP client tests.
 * @module core/services/mcp/client.test
 */

import { describe, it, expect, beforeEach, afterEach } from 'bun:test'
import { MCPClient } from './client/client.ts'
import { MCPManager } from './manager/manager.ts'

describe('MCPClient', () => {
  let client: MCPClient

  beforeEach(() => {
    client = new MCPClient({
      name: 'test-server',
      command: 'echo',
      args: ['test'],
    })
  })

  afterEach(async () => {
    await client.disconnect()
  })

  it('should create client with config', () => {
    expect(client.isConnected()).toBe(false)
  })

  it('should reject listTools when not connected', async () => {
    await expect(client.listTools()).rejects.toThrow('Not connected')
  })

  it('should reject callTool when not connected', async () => {
    await expect(client.callTool('test', {})).rejects.toThrow('Not connected')
  })

  it('should return empty cached tools initially', () => {
    expect(client.getCachedTools()).toEqual([])
  })
})

describe('MCPManager', () => {
  let manager: MCPManager

  beforeEach(() => {
    manager = new MCPManager()
  })

  afterEach(async () => {
    await manager.disconnectAll()
  })

  it('should add server config', () => {
    manager.addServer({
      name: 'server1',
      command: 'echo',
    })
    expect(manager.getConnectedServers()).toEqual([])
  })

  it('should reject empty server name', () => {
    expect(() => manager.addServer({
      name: '',
      command: 'echo',
    })).toThrow('name is required')
  })

  it('should reject duplicate server name', () => {
    manager.addServer({
      name: 'server1',
      command: 'echo',
    })
    expect(() => manager.addServer({
      name: 'server1',
      command: 'echo',
    })).toThrow('already added')
  })

  it('should return undefined for non-existent client', () => {
    expect(manager.getClient('nonexistent')).toBeUndefined()
  })

  it('should return false for non-connected server', () => {
    expect(manager.isConnected('nonexistent')).toBe(false)
  })

  it('should return empty tools when no servers connected', async () => {
    const tools = await manager.getAllTools()
    expect(tools).toEqual([])
  })

  it('should return empty connected servers initially', () => {
    expect(manager.getConnectedServers()).toEqual([])
  })
})
