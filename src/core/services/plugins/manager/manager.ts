/**
 * Plugin manager.
 * @module core/services/plugins/manager
 */

import { readFile, writeFile, access, mkdir, rm, readdir } from 'fs/promises'
import { join, dirname } from 'path'
import { logger } from '../../logger/logger/logger.ts'
import type { PluginManifest } from '../../../../types/core/plugins.ts'

/**
 * Plugin manager untuk install/uninstall/load plugins.
 */
export class PluginManager {
  /** Path ke direktori plugins */
  private pluginsPath: string

  /**
   * Buat plugin manager baru.
   *
   * @param pluginsPath - Path ke direktori plugins (default: .omakase/plugins)
   */
  constructor(pluginsPath?: string) {
    this.pluginsPath = pluginsPath || join(process.cwd(), '.omakase', 'plugins')
  }

  /**
   * Install plugin dari source.
   *
   * @param name - Plugin name
   * @param source - Plugin source (npm package, git repo, local path)
   * @returns Plugin manifest yang diinstall
   */
  async install(name: string, source?: string): Promise<PluginManifest> {
    logger.info('Installing plugin', { name, source })

    const targetDir = join(this.pluginsPath, name)

    try {
      await mkdir(this.pluginsPath, { recursive: true })
    } catch (error) {
      logger.error('Failed to create plugins directory', error as Error)
      throw new Error(`Cannot create plugins directory: ${error instanceof Error ? error.message : String(error)}`)
    }

    if (source) {
      if (source.startsWith('npm:')) {
        const pkg = source.slice(4)
        await this.installFromNpm(name, pkg, targetDir)
      } else if (source.startsWith('git:')) {
        const url = source.slice(4)
        await this.installFromGit(name, url, targetDir)
      } else if (source.startsWith('file:') || source.startsWith('/') || source.startsWith('.')) {
        const localPath = source.startsWith('file:') ? source.slice(5) : source
        await this.installFromLocal(name, localPath, targetDir)
      } else {
        throw new Error(`Unknown source format: ${source}. Use npm:<pkg>, git:<url>, or file:<path>`)
      }
    } else {
      await this.installFromNpm(name, name, targetDir)
    }

    const manifest = await this.readManifest(targetDir)
    logger.info('Plugin installed', { name, version: manifest.version })
    return manifest
  }

  /**
   * Install plugin dari npm package.
   *
   * @param name - Plugin name
   * @param pkg - Package specifier
   * @param targetDir - Target directory
   */
  private async installFromNpm(name: string, pkg: string, targetDir: string): Promise<void> {
    const proc = Bun.spawn(['npm', 'install', '--prefix', targetDir, pkg], {
      stdout: 'pipe',
      stderr: 'pipe',
    })
    const exitCode = await proc.exited
    if (exitCode !== 0) {
      const stderr = await new Response(proc.stderr).text()
      throw new Error(`npm install failed: ${stderr}`)
    }
  }

  /**
   * Install plugin dari git repository.
   *
   * @param name - Plugin name
   * @param url - Git URL
   * @param targetDir - Target directory
   */
  private async installFromGit(name: string, url: string, targetDir: string): Promise<void> {
    const proc = Bun.spawn(['git', 'clone', url, targetDir], {
      stdout: 'pipe',
      stderr: 'pipe',
    })
    const exitCode = await proc.exited
    if (exitCode !== 0) {
      const stderr = await new Response(proc.stderr).text()
      throw new Error(`git clone failed: ${stderr}`)
    }
  }

  /**
   * Install plugin dari local path.
   *
   * @param name - Plugin name
   * @param sourcePath - Source path
   * @param targetDir - Target directory
   */
  private async installFromLocal(name: string, sourcePath: string, targetDir: string): Promise<void> {
    const resolved = sourcePath.startsWith('/') ? sourcePath : join(process.cwd(), sourcePath)
    try {
      await access(resolved)
    } catch {
      throw new Error(`Source path not found: ${resolved}`)
    }
    const proc = Bun.spawn(['cp', '-r', resolved, targetDir], {
      stdout: 'pipe',
      stderr: 'pipe',
    })
    const exitCode = await proc.exited
    if (exitCode !== 0) {
      const stderr = await new Response(proc.stderr).text()
      throw new Error(`cp failed: ${stderr}`)
    }
  }

  /**
   * Uninstall plugin.
   *
   * @param name - Plugin name
   * @returns True jika berhasil dihapus
   */
  async uninstall(name: string): Promise<boolean> {
    logger.info('Uninstalling plugin', { name })
    const targetDir = join(this.pluginsPath, name)
    try {
      await access(targetDir)
    } catch {
      logger.warn('Plugin not found', { name })
      return false
    }
    await rm(targetDir, { recursive: true, force: true })
    logger.info('Plugin uninstalled', { name })
    return true
  }

  /**
   * List installed plugins.
   *
   * @returns Array of plugin manifests
   */
  async list(): Promise<PluginManifest[]> {
    try {
      await access(this.pluginsPath)
    } catch {
      return []
    }

    const entries = await readdir(this.pluginsPath, { withFileTypes: true })
    const manifests: PluginManifest[] = []

    for (const entry of entries) {
      if (!entry.isDirectory()) continue
      try {
        const manifest = await this.readManifest(join(this.pluginsPath, entry.name))
        manifests.push(manifest)
      } catch (error) {
        logger.warn('Failed to read plugin manifest', {
          name: entry.name,
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }

    return manifests
  }

  /**
   * Load plugin.
   *
   * @param manifest - Plugin manifest
   * @returns Plugin module exports
   */
  async load(manifest: PluginManifest): Promise<Record<string, unknown>> {
    logger.info('Loading plugin', { name: manifest.name })
    const pluginDir = join(this.pluginsPath, manifest.name)
    const mainPath = join(pluginDir, manifest.main)

    try {
      await access(mainPath)
    } catch {
      throw new Error(`Plugin entry not found: ${mainPath}`)
    }

    const module = await import(mainPath)
    logger.info('Plugin loaded', { name: manifest.name })
    return module
  }

  /**
   * Read plugin manifest dari direktori.
   *
   * @param pluginDir - Plugin directory
   * @returns Plugin manifest
   */
  private async readManifest(pluginDir: string): Promise<PluginManifest> {
    const manifestPath = join(pluginDir, 'plugin.json')
    const content = await readFile(manifestPath, 'utf-8')
    return JSON.parse(content) as PluginManifest
  }

  /**
   * Get plugins path.
   *
   * @returns Plugins directory path
   */
  getPluginsPath(): string {
    return this.pluginsPath
  }
}
