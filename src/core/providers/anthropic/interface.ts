/**
 * Anthropic provider interface.
 * @module core/providers/anthropic/interface
 */

import type { LLMProvider } from '../interface.ts'

/**
 * Create Anthropic provider instance.
 * 
 * @param apiKey - Anthropic API key (sk-ant-...)
 * @returns LLMProvider instance untuk Anthropic
 * 
 * @example
 * ```typescript
 * const provider = createAnthropicProvider(process.env.ANTHROPIC_API_KEY)
 * ```
 */
export function createAnthropicProvider(apiKey: string): LLMProvider {
  throw new Error('Not implemented - use src/core/providers/anthropic/client.ts')
}