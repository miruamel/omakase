/**
 * Plugin types barrel.
 * @module types/core/plugins
 */

/**
 * Plugin manifest.
 */
export interface PluginManifest {
  /** Plugin name */
  name: string
  /** Plugin version */
  version: string
  /** Plugin description */
  description: string
  /** Plugin entry point */
  main: string
  /** Plugin author */
  author?: string
  /** Plugin license */
  license?: string
}