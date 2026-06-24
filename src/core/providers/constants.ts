/**
 * Provider constants.
 * @module core/providers/constants
 */

/**
 * Default model names for each provider
 */
export const DEFAULT_MODELS = {
  anthropic: 'claude-3-opus-20240229',
  openai: 'gpt-4-turbo',
  nvidia: 'nvidia/llama-3.1-nemotron-70b-instruct',
  ollama: 'llama2',
} as const

/**
 * Default max tokens for completions
 */
export const DEFAULT_MAX_TOKENS = {
  anthropic: 4096,
  openai: 4096,
  nvidia: 2048,
  ollama: 2048,
} as const

/**
 * Default temperature
 */
export const DEFAULT_TEMPERATURE = 0.7

/**
 * Timeout values in milliseconds
 */
export const TIMEOUTS = {
  request: 30000, // 30 seconds
  connect: 10000, // 10 seconds
} as const