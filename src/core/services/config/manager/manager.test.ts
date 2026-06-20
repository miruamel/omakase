/**
 * Tests untuk ConfigManager.
 * @module core/services/config/manager/manager.test
 */

import { describe, it, expect, beforeEach, afterEach } from 'bun:test'
import { ConfigManager } from './manager.ts'
import { mkdtemp, rm, writeFile } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'

describe('ConfigManager', () => {
  let tempDir: string
  let configPath: string
  let manager: ConfigManager

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'omakase-config-'))
    configPath = join(tempDir, 'omakase.json')
    manager = new ConfigManager(configPath)
  })

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true })
  })

  it('should load defaults when config does not exist', async () => {
    const config = await manager.load()
    expect(config.provider).toBe('anthropic')
    expect(config.model).toBe('claude-sonnet-4-20250514')
  })

  it('should save and load config', async () => {
    await manager.save({
      provider: 'openai',
      model: 'gpt-4',
      maxTokens: 4096,
      temperature: 0.5,
      theme: 'light',
      permissionMode: 'confirm',
    })

    const config = await manager.load()
    expect(config.provider).toBe('openai')
    expect(config.model).toBe('gpt-4')
    expect(config.maxTokens).toBe(4096)
  })

  it('should update config key', async () => {
    await manager.update('model', 'gpt-4-turbo')
    const config = await manager.load()
    expect(config.model).toBe('gpt-4-turbo')
  })

  it('should reset config to defaults', async () => {
    await manager.save({
      provider: 'openai',
      model: 'gpt-4',
      maxTokens: 4096,
      temperature: 0.5,
      theme: 'light',
      permissionMode: 'confirm',
    })

    await manager.reset()
    const config = await manager.load()
    expect(config.provider).toBe('anthropic')
  })

  it('should handle invalid JSON gracefully', async () => {
    await writeFile(configPath, 'invalid json', 'utf-8')
    await expect(manager.load()).rejects.toThrow()
  })
})
