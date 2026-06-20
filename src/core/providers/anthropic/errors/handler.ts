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
export function handleAnthropicError(error: any): Error {
  if (error.statusCode === 401) {
    return new AuthenticationError('Authentication failed. Check your API key.')
  }
  
  if (error.statusCode === 429) {
    return new RateLimitError('Rate limit exceeded. Please wait and retry.')
  }
  
  if (error.statusCode === 408) {
    return new TimeoutError('Request timeout.')
  }
  
  if (error.type === 'invalid_request_error') {
    return new LLMError(`Invalid request: ${error.message}`)
  }
  
  return new LLMError(error.message || 'Unknown Anthropic error')
}