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
export function handleOpenAIError(error: any): Error {
  if (error.status === 401) {
    return new AuthenticationError('Authentication failed. Check your API key.')
  }
  
  if (error.status === 429) {
    return new RateLimitError('Rate limit exceeded. Please wait and retry.')
  }
  
  if (error.code === 'timeout') {
    return new TimeoutError('Request timeout.')
  }
  
  if (error.type === 'invalid_request_error') {
    return new LLMError(`Invalid request: ${error.message}`)
  }
  
  return new LLMError(error.message || 'Unknown OpenAI error')
}