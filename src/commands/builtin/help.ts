/**
 * /help command.
 * @module commands/builtin/help
 */

import type { CommandDefinition } from '../../types/commands/definition.ts'

/**
 * Help command untuk show available commands.
 */
export const helpCommand: CommandDefinition = {
  name: 'help',
  description: 'Show available commands',
  async execute(args, context) {
    const helpText = `
Omakase CLI - Available Commands:

/help - Show this help message
/exit - Exit Omakase
/clear - Clear screen
/tools - List available tools
/status - Show current status
/config - Manage configuration
/memory - Manage memory
/plugin - Manage plugins
/agents - Manage multi-agent system
/chronos - Manage scheduled tasks

Providers:
  anthropic - Requires ANTHROPIC_API_KEY
  openai - Requires OPENAI_API_KEY
  ollama - Local LLM (http://localhost:11434)
  nvidia - Requires NVIDIA_API_KEY (https://integrate.api.nvidia.com/v1)

Usage: <command> [args]

Examples:
  /help
  /config get model
  /memory add "Project structure"
  /plugin list
  /agents list
  /agents register researcher specialist
  /agents run "Analyze the codebase structure"
  /chronos list
  /chronos schedule backup-check interval 3600000
  omakase -p ollama
  omakase -p openai -m gpt-4
  omakase -p nvidia -m nvidia/llama-3.1-nemotron-70b-instruct
`.trim()

    return {
      type: 'text',
      content: helpText,
    }
  },
}