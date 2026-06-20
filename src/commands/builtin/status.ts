/**
 * /status command.
 * @module commands/builtin/status
 */

import type { CommandDefinition } from '../../types/commands/definition.ts'
import { appState } from '../../core/state/AppStateStore.ts'

/**
 * Status command untuk show current status.
 */
export const statusCommand: CommandDefinition = {
  name: 'status',
  description: 'Show current status',
  async execute() {
    const state = appState.getState()
    const session = state.session
    
    const status = `
Status:
  Provider: ${state.settings.provider}
  Model: ${state.settings.model}
  Session: ${session ? session.id : 'None'}
  Messages: ${session ? session.messages.length : 0}
  Loading: ${state.isLoading}
  Error: ${state.error || 'None'}
`.trim()

    return {
      type: 'text',
      content: status,
    }
  },
}