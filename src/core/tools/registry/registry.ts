/**
 * Tool registry singleton.
 * @module core/tools/registry
 */

import type { ToolDefinition } from '../../../types/tools/definition.ts'
import { BashTool } from '../shell/bash/tool.ts'
import { FileReadTool } from '../filesystem/read/tool.ts'
import { FileWriteTool } from '../filesystem/write/tool.ts'
import { GlobTool } from '../filesystem/glob/tool.ts'
import { GrepTool } from '../filesystem/grep/tool.ts'
import { TodoWriteTool } from '../utility/todo/tool.ts'
import { AskUserTool } from '../utility/ask/tool.ts'
import { ConfigTool } from '../configuration/config/tool.ts'
import { MemoryTool } from '../memory/manager/tool.ts'

/**
 * Tool registry singleton untuk manage semua tools.
 */
export class ToolRegistry {
  private static instance: ToolRegistry
  private tools: Map<string, ToolDefinition> = new Map()

  private constructor() {
    this.registerDefaults()
  }

  /**
   * Get singleton instance.
   */
  static getInstance(): ToolRegistry {
    if (!ToolRegistry.instance) {
      ToolRegistry.instance = new ToolRegistry()
    }
    return ToolRegistry.instance
  }

  /**
   * Register default tools.
   */
  private registerDefaults() {
    const defaults = [
      BashTool,
      FileReadTool,
      FileWriteTool,
      GlobTool,
      GrepTool,
      TodoWriteTool,
      AskUserTool,
      ConfigTool,
      MemoryTool,
    ]

    for (const tool of defaults) {
      this.register(tool)
    }
  }

  /**
   * Register tool.
   * 
   * @param tool - Tool definition untuk register
   */
  register(tool: ToolDefinition) {
    this.tools.set(tool.name, tool)
  }

  /**
   * Get tool by name.
   * 
   * @param name - Tool name
   * @returns Tool definition atau undefined
   */
  get(name: string): ToolDefinition | undefined {
    return this.tools.get(name)
  }

  /**
   * List semua registered tools.
   * 
   * @returns Array of tool definitions
   */
  list(): ToolDefinition[] {
    return Array.from(this.tools.values())
  }

  /**
   * Check if tool exists.
   * 
   * @param name - Tool name
   * @returns True jika tool registered
   */
  has(name: string): boolean {
    return this.tools.has(name)
  }
}

/**
 * List semua tools.
 * 
 * @returns Array of tool definitions
 */
export function listTools(): ToolDefinition[] {
  return ToolRegistry.getInstance().list()
}

/**
 * Get tool by name.
 * 
 * @param name - Tool name
 * @returns Tool definition
 */
export function getTool(name: string): ToolDefinition | undefined {
  return ToolRegistry.getInstance().get(name)
}