/**
 * /agents command - manage multi-agent system.
 * @module commands/builtin/agents
 */

import type { CommandDefinition } from '../../types/commands/definition.ts'
import { requireRuntime } from '../../core/runtime/index.ts'
import type { AgentRole } from '../../types/agents/index.ts'
import { logger } from '../../core/services/logger/logger/logger.ts'

/**
 * Agents command untuk manage multi-agent system.
 */
export const agentsCommand: CommandDefinition = {
  name: 'agents',
  description: 'Manage multi-agent system',
  async execute(args, context) {
    const subcommand = args[0] || 'help'

    try {
      const runtime = requireRuntime()
      const registry = runtime.agentRegistry

      switch (subcommand) {
        case 'list': {
          const agents = registry.getAll()
          if (agents.length === 0) {
            return {
              type: 'text',
              content: 'No agents registered.\nUse /agents register <name> <role> to add one.',
            }
          }
          const lines = agents.map(a => `  - ${a.name} (${a.role}) [${a.getStatus()}]`)
          return {
            type: 'text',
            content: `Registered agents (${agents.length}):\n${lines.join('\n')}`,
          }
        }

        case 'register': {
          const name = args[1]
          const role = args[2] as AgentRole
          if (!name || !role) {
            return {
              type: 'text',
              content: 'Usage: /agents register <name> <role>\nRoles: coordinator, worker, specialist, reviewer',
            }
          }
          if (!['coordinator', 'worker', 'specialist', 'reviewer'].includes(role)) {
            return {
              type: 'text',
              content: `Invalid role: ${role}. Valid roles: coordinator, worker, specialist, reviewer`,
            }
          }
          const agent = registry.register({ name, role })
          return {
            type: 'text',
            content: `Registered agent: ${agent.name} (${agent.role})`,
          }
        }

        case 'unregister': {
          const name = args[1]
          if (!name) {
            return { type: 'text', content: 'Usage: /agents unregister <name>' }
          }
          const ok = registry.unregister(name)
          return {
            type: 'text',
            content: ok ? `Unregistered agent: ${name}` : `Agent not found: ${name}`,
          }
        }

        case 'run': {
          const taskInput = args.slice(1).join(' ')
          if (!taskInput) {
            return { type: 'text', content: 'Usage: /agents run <task>' }
          }
          const agents = registry.getAll()
          if (agents.length === 0) {
            return {
              type: 'text',
              content: 'No agents registered. Use /agents register first.',
            }
          }
          const coordinator = runtime.getCoordinator()
          const result = await coordinator.run(taskInput)
          const summary = Array.from(result.stepResults.values())
            .map(t => `[${t.assignedTo}] ${t.status}: ${(t.result || t.error || '').slice(0, 200)}`)
            .join('\n')
          return {
            type: 'text',
            content: `Coordinator finished in ${result.duration}ms (${result.status}):\n${summary}`,
          }
        }

        case 'help':
        default:
          return {
            type: 'text',
            content: `
Multi-Agent Commands:
  /agents list - List registered agents
  /agents register <name> <role> - Register new agent
  /agents unregister <name> - Remove agent
  /agents run <task> - Run task with coordinator
  /agents help - Show this help

Roles: coordinator, worker, specialist, reviewer
`.trim(),
          }
      }
    } catch (error) {
      logger.error('Agents command failed', error as Error)
      return {
        type: 'text',
        content: `Error: ${error instanceof Error ? error.message : String(error)}`,
      }
    }
  },
}
