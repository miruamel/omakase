/**
 * Plugin command tests.
 * @module commands/builtin/plugin.test
 */

import { describe, it, expect, beforeEach, afterEach } from 'bun:test'
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { pluginCommand } from './plugin.ts'

let tempDir: string
let originalCwd: string

describe('pluginCommand', () => {
  beforeEach(() => {
    originalCwd = process.cwd()
    tempDir = mkdtempSync(join(tmpdir(), 'omakase-plugin-test-'))
    process.chdir(tempDir)
  })

  afterEach(() => {
    process.chdir(originalCwd)
    rmSync(tempDir, { recursive: true, force: true })
  })

  it('should have correct name and description', () => {
    expect(pluginCommand.name).toBe('plugin')
    expect(pluginCommand.description).toBeTruthy()
  })

  it('should show usage when no action provided', async () => {
    const result = await pluginCommand.execute([], {} as any)
    expect(result.type).toBe('text')
    expect(result.content).toContain('Usage')
  })

  it('should show usage for unknown action', async () => {
    const result = await pluginCommand.execute(['unknown'], {} as any)
    expect(result.type).toBe('text')
    expect(result.content).toContain('Usage')
  })

  it('should list empty plugins', async () => {
    const result = await pluginCommand.execute(['list'], {} as any)
    expect(result.type).toBe('text')
    expect(result.content).toContain('No plugins installed')
  })

  it('should install plugin from local path', async () => {
    const sourceDir = join(tempDir, 'source-plugin')
    mkdirSync(sourceDir, { recursive: true })
    writeFileSync(join(sourceDir, 'plugin.json'), JSON.stringify({
      name: 'test-plugin',
      version: '1.0.0',
      description: 'A test plugin',
      main: 'index.js',
    }))
    writeFileSync(join(sourceDir, 'index.js'), 'module.exports = {}')

    const result = await pluginCommand.execute(['install', 'test-plugin', sourceDir], {} as any)
    expect(result.type).toBe('text')
    expect(result.content).toContain('Installed plugin: test-plugin')
  })

  it('should list installed plugins', async () => {
    const sourceDir = join(tempDir, 'source-plugin')
    mkdirSync(sourceDir, { recursive: true })
    writeFileSync(join(sourceDir, 'plugin.json'), JSON.stringify({
      name: 'listed-plugin',
      version: '2.0.0',
      description: 'Listed plugin',
      main: 'index.js',
    }))
    writeFileSync(join(sourceDir, 'index.js'), 'module.exports = {}')

    await pluginCommand.execute(['install', 'listed-plugin', sourceDir], {} as any)
    const result = await pluginCommand.execute(['list'], {} as any)
    expect(result.type).toBe('text')
    expect(result.content).toContain('Installed plugins (1)')
    expect(result.content).toContain('listed-plugin')
    expect(result.content).toContain('2.0.0')
  })

  it('should uninstall a plugin', async () => {
    const sourceDir = join(tempDir, 'source-plugin')
    mkdirSync(sourceDir, { recursive: true })
    writeFileSync(join(sourceDir, 'plugin.json'), JSON.stringify({
      name: 'removable',
      version: '1.0.0',
      description: 'Removable',
      main: 'index.js',
    }))
    writeFileSync(join(sourceDir, 'index.js'), 'module.exports = {}')

    await pluginCommand.execute(['install', 'removable', sourceDir], {} as any)
    const result = await pluginCommand.execute(['uninstall', 'removable'], {} as any)
    expect(result.type).toBe('text')
    expect(result.content).toContain('Uninstalled plugin: removable')
  })

  it('should report when uninstalling non-existent plugin', async () => {
    const result = await pluginCommand.execute(['uninstall', 'nonexistent'], {} as any)
    expect(result.type).toBe('text')
    expect(result.content).toContain('Plugin not found')
  })

  it('should reject install without name', async () => {
    const result = await pluginCommand.execute(['install'], {} as any)
    expect(result.type).toBe('text')
    expect(result.content).toContain('Usage')
  })

  it('should reject uninstall without name', async () => {
    const result = await pluginCommand.execute(['uninstall'], {} as any)
    expect(result.type).toBe('text')
    expect(result.content).toContain('Usage')
  })
})
