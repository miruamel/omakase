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
/**
 * Retry configuration for transient errors
 */
export const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second base delay
  maxDelay: 10000, // 10 seconds max delay
  backoffMultiplier: 2, // exponential backoff
} as const

/**
 * Agent default limits
 */
export const AGENT_LIMITS = {
  maxSteps: 10,
  defaultTimeout: 60000, // 60 seconds
} as const

/**
 * Circuit breaker thresholds
 */
export const CIRCUIT_BREAKER = {
  failureThreshold: 5,
  resetTimeout: 30000, // 30 seconds
  halfOpenMaxCalls: 3,
} as const