/**
 * OpenAI error handler.
 * @module core/providers/openai/errors
 */

import { 
  AuthenticationError, 
  RateLimitError, 
  LLMError,
  TimeoutError 
} from '../../../errors/errors.ts'

/**
 * Handle OpenAI API errors.
 * 
 * @param error - Error dari OpenAI SDK
 * @returns Appropriate Omakase error
 */
export function handleOpenAIError(error: unknown): Error {
  // Guard: check if error is an object with status property
  if (error && typeof error === 'object' && 'status' in error) {
    const e = error as Record<string, unknown>
    if (e.status === 401) {
      return new AuthenticationError('Authentication failed. Check your API key.')
    }
    if (e.status === 429) {
      return new RateLimitError('Rate limit exceeded. Please wait and retry.')
    }
    if (e.code === 'timeout') {
      return new TimeoutError('Request timeout.')
    }
    if (e.type === 'invalid_request_error' && typeof e.message === 'string') {
      return new LLMError(`Invalid request: ${e.message}`)
    }
  }
  
  // Guard: check for timeout code
  if (error && typeof error === 'object' && 'code' in error) {
    const e = error as Record<string, unknown>
    if (e.code === 'timeout') {
      return new TimeoutError('Request timeout.')
    }
  }
  
  // Extract message safely
  let message = 'Unknown OpenAI error'
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