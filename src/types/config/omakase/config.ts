/**
 * Omakase config schema.
 * @module types/config/omakase/config
 */

import { z } from 'zod'

/**
 * Omakase configuration schema.
 */
export const OmakaseConfigSchema = z.object({
  /** LLM provider name */
  provider: z.enum(['anthropic', 'openai', 'ollama', 'nvidia']).default('anthropic'),
  /** Model name */
  model: z.string().default('claude-sonnet-4-20250514'),
  /** Max tokens untuk response */
  maxTokens: z.number().default(8192),
  /** Temperature untuk sampling */
  temperature: z.number().default(0.7),
  /** Theme untuk UI terminal */
  theme: z.enum(['light', 'dark']).default('dark'),
  /** Permission mode */
  permissionMode: z.enum(['auto', 'confirm', 'readonly']).default('auto'),
  /** NVIDIA endpoint */
  nvidiaEndpoint: z.string().optional(),
})

/**
 * Omakase configuration type.
 */
export type OmakaseConfig = z.infer<typeof OmakaseConfigSchema>
