/**
 * Circuit breaker pattern implementation.
 * @module core/resilience/circuit-breaker
 */

import { CIRCUIT_BREAKER } from '../providers/constants.ts'
import { logger } from '../services/logger/logger/logger.ts'

/**
 * Circuit breaker states.
 */
export enum CircuitState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half_open',
}

/**
 * Circuit breaker configuration.
 */
export interface CircuitBreakerConfig {
  failureThreshold: number
  resetTimeout: number
  halfOpenMaxCalls: number
}

/**
 * Circuit breaker for preventing cascading failures.
 */
export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED
  private failureCount: number = 0
  private successCount: number = 0
  private lastFailureTime: number = 0
  private halfOpenCalls: number = 0
  private config: CircuitBreakerConfig

  constructor(cfg: Partial<CircuitBreakerConfig> = {}) {
    const defaults = {
      failureThreshold: CIRCUIT_BREAKER.failureThreshold,
      resetTimeout: CIRCUIT_BREAKER.resetTimeout,
      halfOpenMaxCalls: CIRCUIT_BREAKER.halfOpenMaxCalls,
    }
    const merged = { ...defaults, ...cfg }
    this.config = {
      failureThreshold: merged.failureThreshold,
      resetTimeout: merged.resetTimeout,
      halfOpenMaxCalls: merged.halfOpenMaxCalls,
    }
  }

  async call<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() - this.lastFailureTime >= this.config.resetTimeout) {
        this.state = CircuitState.HALF_OPEN
        this.halfOpenCalls = 0
        logger.debug('Circuit breaker entering half-open state')
      } else {
        throw new Error('Circuit breaker is OPEN - request rejected')
      }
    }

    if (this.state === CircuitState.HALF_OPEN) {
      if (this.halfOpenCalls >= this.config.halfOpenMaxCalls) {
        throw new Error('Circuit breaker is HALF_OPEN - max calls reached')
      }
      this.halfOpenCalls++
    }

    try {
      const result = await operation()
      this.recordSuccess()
      return result
    } catch (error) {
      this.recordFailure()
      throw error
    }
  }

  recordSuccess(): void {
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++
      if (this.successCount >= this.config.halfOpenMaxCalls) {
        this.reset()
        logger.debug('Circuit breaker closed after successful recovery')
      }
    } else {
      this.failureCount = 0
    }
  }

  recordFailure(): void {
    this.failureCount++
    this.lastFailureTime = Date.now()

    if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.OPEN
      this.successCount = 0
      logger.warn('Circuit breaker tripped to OPEN', { failureCount: this.failureCount })
    } else if (this.failureCount >= this.config.failureThreshold) {
      this.state = CircuitState.OPEN
      logger.warn('Circuit breaker tripped to OPEN', { failureCount: this.failureCount })
    }
  }

  getState(): CircuitState {
    return this.state
  }

  getFailureCount(): number {
    return this.failureCount
  }

  private reset(): void {
    this.state = CircuitState.CLOSED
    this.failureCount = 0
    this.successCount = 0
    this.halfOpenCalls = 0
  }
}