/**
 * Tests untuk PluginManager.
 * @module core/services/plugins/manager/manager.test
 */

import { describe, it, expect, beforeEach, afterEach } from 'bun:test'
import { PluginManager } from './manager.ts'
import { mkdtemp, rm, writeFile, mkdir } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'

describe('PluginManager', () => {
  let tempDir: string
  let manager: PluginManager

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'omakase-plugins-'))
    manager = new PluginManager(tempDir)
  })

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true })
  })

  it('should return empty list when no plugins', async () => {
    const plugins = await manager.list()
    expect(plugins).toEqual([])
  })

  it('should get plugins path', () => {
    expect(manager.getPluginsPath()).toBe(tempDir)
  })

  it('should list installed plugins', async () => {
    const pluginDir = join(tempDir, 'test-plugin')
    await mkdir(pluginDir, { recursive: true })
    await writeFile(
      join(pluginDir, 'plugin.json'),
      JSON.stringify({
        name: 'test-plugin',
        version: '1.0.0',
        description: 'Test plugin',
        main: 'index.js',
      })
    )

    const plugins = await manager.list()
    expect(plugins.length).toBe(1)
    expect(plugins[0].name).toBe('test-plugin')
  })

  it('should skip invalid manifests', async () => {
    const pluginDir = join(tempDir, 'bad-plugin')
    await mkdir(pluginDir, { recursive: true })
    await writeFile(join(pluginDir, 'plugin.json'), 'invalid json')

    const plugins = await manager.list()
    expect(plugins.length).toBe(0)
  })

  it('should uninstall non-existent plugin', async () => {
    const result = await manager.uninstall('non-existent')
    expect(result).toBe(false)
  })

  it('should uninstall existing plugin', async () => {
    const pluginDir = join(tempDir, 'test-plugin')
    await mkdir(pluginDir, { recursive: true })
    await writeFile(
      join(pluginDir, 'plugin.json'),
      JSON.stringify({
        name: 'test-plugin',
        version: '1.0.0',
        description: 'Test',
        main: 'index.js',
      })
    )

    const result = await manager.uninstall('test-plugin')
    expect(result).toBe(true)
  })

  it('should throw on unknown source format', async () => {
    await expect(
      manager.install('test', 'unknown-format')
    ).rejects.toThrow('Unknown source format')
  })
})
