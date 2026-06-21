/**
 * Config command tests.
 * @module commands/builtin/config.test
 */

import { describe, it, expect, beforeEach, afterEach } from 'bun:test'
import { mkdtempSync, rmSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { configCommand } from './config.ts'

let tempDir: string
let originalCwd: string

describe('configCommand', () => {
  beforeEach(() => {
    originalCwd = process.cwd()
    tempDir = mkdtempSync(join(tmpdir(), 'omakase-config-test-'))
    process.chdir(tempDir)
  })

  afterEach(() => {
    process.chdir(originalCwd)
    rmSync(tempDir, { recursive: true, force: true })
  })

  it('should have correct name and description', () => {
    expect(configCommand.name).toBe('config')
    expect(configCommand.description).toBeTruthy()
  })

  it('should show usage when no action provided', async () => {
    const result = await configCommand.execute([], {} as any)
    expect(result.type).toBe('text')
    expect(result.content).toContain('Usage')
  })

  it('should get all config when no key provided', async () => {
    const result = await configCommand.execute(['get'], {} as any)
    expect(result.type).toBe('text')
    expect(result.content).toContain('provider')
  })

  it('should get specific config key', async () => {
    const result = await configCommand.execute(['get', 'provider'], {} as any)
    expect(result.type).toBe('text')
    expect(result.content).toContain('provider:')
  })

  it('should set a config value', async () => {
    const result = await configCommand.execute(['set', 'provider', 'anthropic'], {} as any)
    expect(result.type).toBe('text')
    expect(result.content).toContain('Set provider = anthropic')
  })

  it('should reset config to defaults', async () => {
    await configCommand.execute(['set', 'provider', 'openai'], {} as any)
    const result = await configCommand.execute(['reset'], {} as any)
    expect(result.type).toBe('text')
    expect(result.content).toContain('reset')
  })

  it('should reject set without key', async () => {
    const result = await configCommand.execute(['set'], {} as any)
    expect(result.type).toBe('text')
    expect(result.content).toContain('Usage')
  })

  it('should reject set without value', async () => {
    const result = await configCommand.execute(['set', 'provider'], {} as any)
    expect(result.type).toBe('text')
    expect(result.content).toContain('Usage')
  })

  it('should reject unknown action', async () => {
    const result = await configCommand.execute(['unknown'], {} as any)
    expect(result.type).toBe('text')
    expect(result.content).toContain('Usage')
  })

  it('should load existing config file', async () => {
    writeFileSync(join(tempDir, 'omakase.json'), JSON.stringify({
      provider: 'ollama',
      permissionMode: 'auto',
    }))
    const result = await configCommand.execute(['get', 'provider'], {} as any)
    expect(result.type).toBe('text')
    expect(result.content).toContain('ollama')
  })
})
