/**
 * CLI entrypoint.
 * @module entrypoints/cli
 */

import { Command } from 'commander'
import React from 'react'
import { render } from 'ink'
import { App } from '../App.js'
import { appState } from '../core/state/AppStateStore.js'
import { logger } from '../core/services/logger/logger/logger.js'

const program = new Command()

program
  .name('omakase')
  .description('AI coding assistant CLI')
  .version('0.0.1')
  .option('-c, --config <path>', 'Config file path')
  .option('-m, --model <model>', 'Model name')
  .option('-p, --provider <provider>', 'LLM provider (anthropic, openai, ollama, nvidia)')
  .option('--endpoint <url>', 'Endpoint URL (Ollama: http://localhost:11434, NVIDIA: https://integrate.api.nvidia.com/v1)')
  .option('--no-interactive', 'Non-interactive mode')
  .action((options) => {
    if (options.config) {
      logger.info('Loading config', { path: options.config })
    }

    if (options.model) {
      appState.updateSettings({ model: options.model })
    }

    if (options.provider) {
      appState.updateSettings({ provider: options.provider })
    }

    if (options.endpoint) {
      if (options.provider === 'nvidia') {
        process.env.OMAKASE_NVIDIA_ENDPOINT = options.endpoint
      } else {
        process.env.OMAKASE_OLLAMA_ENDPOINT = options.endpoint
      }
    }

    if (!options.interactive) {
      console.log('Non-interactive mode not implemented yet')
      process.exit(0)
    }

    // Create session
    appState.createSession()

    // Render App
    render(<App />)
  })

program.parse()