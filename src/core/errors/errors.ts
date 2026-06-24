/**
 * Base error class.
 * @module core/errors
 */

/**
 * Omakase error base class.
 */
export class OmakaseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

/**
 * Tool error.
 */
export class ToolError extends OmakaseError {
  constructor(message: string, public toolName: string) {
    super(message)
  }
}

/**
 * Permission error.
 */
export class PermissionError extends OmakaseError {
  constructor(message: string) {
    super(message)
  }
}

/**
 * Configuration error.
 */
export class ConfigError extends OmakaseError {
  constructor(message: string) {
    super(message)
  }
}

/**
 * File error.
 */
export class FileError extends OmakaseError {
  constructor(message: string) {
    super(message)
  }
}

/**
 * LLM error.
 */
export class LLMError extends OmakaseError {
  constructor(message: string) {
    super(message)
  }
}

/**
 * Authentication error.
 */
export class AuthenticationError extends OmakaseError {
  constructor(message: string) {
    super(message)
  }
}

/**
 * Rate limit error.
 */
export class RateLimitError extends OmakaseError {
  constructor(message: string) {
    super(message)
  }
}

/**
 * Timeout error.
 */
export class TimeoutError extends OmakaseError {
  constructor(message: string) {
    super(message)
  }
}

/**
 * Validation error.
 */
export class ValidationError extends OmakaseError {
  constructor(message: string) {
    super(message)
  }
}
/**
 * Transient error - can be retried.
 */
export class TransientError extends OmakaseError {
  constructor(message: string, public retryable: boolean = true) {
    super(message)
  }
}

/**
 * Permanent error - should not be retried.
 */
export class PermanentError extends OmakaseError {
  constructor(message: string) {
    super(message)
  }
}