/**
 * ConfigTool tests.
 * @module core/tools/configuration/config/tool.test
 */

import { describe, it, expect, beforeEach, afterEach } from 'bun:test'
import { ConfigTool } from './tool.ts'
import { mkdtemp, rm, writeFile } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import type { ToolContext } from '../../../../types/tools/context.ts'
import type { Session } from '../../../../types/messages/turn.ts'

function createMockContext(): ToolContext {
  const session: Session = {
    id: 'test-session',
    startTime: Date.now(),
    lastActivity: Date.now(),
    messages: [],
  }
  return {
    session,
    workingDirectory: '/tmp',
  }
}

describe('ConfigTool', () => {
  let tempDir: string
  let context: ToolContext

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'omakase-config-'))
    context = createMockContext()
  })

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true })
  })

  it('should have correct name and description', () => {
    expect(ConfigTool.name).toBe('Config')
    expect(ConfigTool.description).toBeTruthy()
  })

  it('should get all config', async () => {
    const result = await ConfigTool.call({ action: 'get' }, context)
    expect(result.success).toBe(true)
    expect(result.data).toBeDefined()
  })

  it('should get specific config key', async () => {
    const result = await ConfigTool.call({ action: 'get', key: 'provider' }, context)
    expect(result.success).toBe(true)
    expect(result.data.provider).toBeDefined()
  })

  it('should set config value', async () => {
    const result = await ConfigTool.call({
      action: 'set',
      key: 'provider',
      value: 'openai',
    }, context)
    expect(result.success).toBe(true)
    expect(result.data.updated).toBe('provider')
    expect(result.data.value).toBe('openai')
  })

  it('should reset config', async () => {
    const result = await ConfigTool.call({ action: 'reset' }, context)
    expect(result.success).toBe(true)
    expect(result.data.reset).toBe(true)
  })

  it('should fail on set without key', async () => {
    const result = await ConfigTool.call({
      action: 'set',
      value: 'openai',
    }, context)
    expect(result.success).toBe(false)
  })

  it('should fail on set without value', async () => {
    const result = await ConfigTool.call({
      action: 'set',
      key: 'provider',
    }, context)
    expect(result.success).toBe(false)
  })

  it('should grant permission', async () => {
    const permission = await ConfigTool.checkPermissions!({ action: 'get' })
    expect(permission.granted).toBe(true)
  })
})
