/**
 * Anthropic error handler.
 * @module core/providers/anthropic/errors
 */

import { 
  AuthenticationError, 
  RateLimitError, 
  LLMError,
  TimeoutError 
} from '../../../errors/errors.ts'

/**
 * Handle Anthropic API errors.
 * 
 * @param error - Error dari Anthropic SDK
 * @returns Appropriate Omakase error
 */
export function handleAnthropicError(error: unknown): Error {
  // Guard: check if error is an object with statusCode property
  if (error && typeof error === 'object' && 'statusCode' in error) {
    const e = error as Record<string, unknown>
    if (e.statusCode === 401) {
      return new AuthenticationError('Authentication failed. Check your API key.')
    }
    if (e.statusCode === 429) {
      return new RateLimitError('Rate limit exceeded. Please wait and retry.')
    }
    if (e.statusCode === 408) {
      return new TimeoutError('Request timeout.')
    }
    if (e.type === 'invalid_request_error' && typeof e.message === 'string') {
      return new LLMError(`Invalid request: ${e.message}`)
    }
  }
  
  // Extract message safely
  let message = 'Unknown Anthropic error'
  if (error && typeof error === 'object') {
    if ('message' in error) {
      const msg = (error as Record<string, unknown>).message
      if (typeof msg === 'string') {
        message = msg
      }
    }
  }
  
  return new LLMError(message)
}