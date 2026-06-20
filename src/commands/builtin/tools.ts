/**
 * /tools command.
 * @module commands/builtin/tools
 */

import type { CommandDefinition } from '../../types/commands/definition.ts'
import { listTools } from '../../core/tools/index.ts'

/**
 * Tools command untuk list available tools.
 */
export const toolsCommand: CommandDefinition = {
  name: 'tools',
  description: 'List available tools',
  async execute() {
    const tools = listTools()
    
    const toolList = tools
      .map(tool => `  - ${tool.name}: ${tool.description}`)
      .join('\n')

    return {
      type: 'text',
      content: `Available tools:\n\n${toolList}`,
    }
  },
}