/**
 * Provider health management dengan circuit breaker per provider dan automatic failover.
 * @module core/resilience/provider-health
 */

import { CircuitBreaker, CircuitState } from './circuit-breaker.ts'
import { CIRCUIT_BREAKER, TIMEOUTS } from '../providers/constants.ts'
import { logger } from '../services/logger/logger/logger.ts'
import type { LLMProvider } from '../providers/interface.ts'
import type { Message } from '../../types/messages/message.ts'
import type { ToolDefinition } from '../../types/tools/definition.ts'

/**
 * Provider health status.
 */
export interface ProviderHealthStatus {
  name: string
  state: CircuitState
  failureCount: number
  isHealthy: boolean
  lastHealthCheck?: number
}

/**
 * Provider dengan wrapper circuit breaker.
 */
interface WrappedProvider {
  provider: LLMProvider
  circuitBreaker: CircuitBreaker
  lastHealthCheck?: number
  healthCheckAbortController?: AbortController
}

/**
 * Failover chain configuration.
 */
export interface FailoverChainConfig {
  /** Provider priorities (index 0 = highest priority) */
  providerOrder: string[]
  /** Health check interval in ms */
  healthCheckInterval: number
  /** Enable automatic health check polling */
  enableHealthCheck: boolean
}

/**
 * Default failover chain: Anthropic → OpenAI → Ollama → Nvidia.
 */
const DEFAULT_FAILOVER_ORDER = ['anthropic', 'openai', 'ollama', 'nvidia'] as const

/**
 * ProviderHealthManager mengelola health status per provider dengan automatic failover.
 */
export class ProviderHealthManager {
  private providers: Record<string, WrappedProvider> = {}
  private config: FailoverChainConfig
  private healthCheckTimer?: ReturnType<typeof setInterval>
  private currentProviderIndex: number = 0

  constructor(config?: Partial<FailoverChainConfig>) {
    this.config = {
      providerOrder: config?.providerOrder || [...DEFAULT_FAILOVER_ORDER],
      healthCheckInterval: config?.healthCheckInterval || 30000,
      enableHealthCheck: config?.enableHealthCheck ?? true,
    }
  }

  /**
   * Register provider ke health manager.
   */
  registerProvider(provider: LLMProvider): void {
    this.providers[provider.name] = {
      provider,
      circuitBreaker: new CircuitBreaker({
        failureThreshold: CIRCUIT_BREAKER.failureThreshold,
        resetTimeout: CIRCUIT_BREAKER.resetTimeout,
        halfOpenMaxCalls: CIRCUIT_BREAKER.halfOpenMaxCalls,
      }),
    }
    logger.debug('Provider registered', { name: provider.name })
  }

  /**
   * Start automatic health check polling.
   */
  startHealthChecks(): void {
    if (!this.config.enableHealthCheck) {
      logger.debug('Health check polling disabled')
      return
    }

    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer)
    }

    this.healthCheckTimer = setInterval(() => {
      this.performHealthChecks()
    }, this.config.healthCheckInterval)

    logger.info('Provider health check polling started', {
      interval: this.config.healthCheckInterval,
    })
  }

  /**
   * Stop health check polling.
   */
  stopHealthChecks(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer)
      this.healthCheckTimer = undefined
    }

    for (const wrapped of Object.values(this.providers)) {
      if (wrapped.healthCheckAbortController) {
        wrapped.healthCheckAbortController.abort()
      }
    }

    logger.info('Provider health check polling stopped')
  }

  /**
   * Perform health check ke semua registered providers.
   */
  private async performHealthChecks(): Promise<void> {
    const healthCheckPromises = Object.values(this.providers).map(async wrapped => {
      const { provider, circuitBreaker } = wrapped

      const abortController = new AbortController()
      wrapped.healthCheckAbortController = abortController

      try {
        const { promise, resolve, reject } = Promise.withResolvers<void>()

        const healthCheckTimeout = setTimeout(() => {
          abortController.abort()
          reject(new Error('Health check timeout'))
        }, TIMEOUTS.connect)

        void provider.sendMessage([], []).then(
          () => {
            clearTimeout(healthCheckTimeout)
            resolve()
          },
          error => {
            clearTimeout(healthCheckTimeout)
            reject(error)
          }
        )

        await promise

        circuitBreaker.recordSuccess()
        wrapped.lastHealthCheck = Date.now()
        logger.debug('Provider health check passed', { name: provider.name })
      } catch (error) {
        circuitBreaker.recordFailure()
        logger.warn('Provider health check failed', error as Error, {
          name: provider.name,
          state: circuitBreaker.getState(),
        })
      }
    })

    await Promise.all(healthCheckPromises)
  }

  /**
   * Get healthy provider dengan automatic failover.
   */
  async getHealthyProvider(preferredName?: string): Promise<LLMProvider | null> {
    const providersToTry = this.getProviderOrder()

    if (preferredName) {
      const wrapped = this.providers[preferredName]
      if (wrapped && (await this.isProviderHealthy(wrapped))) {
        return wrapped.provider
      }
    }

    for (const providerName of providersToTry) {
      if (providerName === preferredName) continue

      const wrapped = this.providers[providerName]
      if (!wrapped) {
        continue
      }

      if (await this.isProviderHealthy(wrapped)) {
        return wrapped.provider
      }

      logger.debug('Provider unhealthy, trying next', {
        name: providerName,
        state: wrapped.circuitBreaker.getState(),
      })
    }

    return null
  }

  /**
   * Check apakah provider specific healthy.
   */
  private async isProviderHealthy(wrapped: WrappedProvider): Promise<boolean> {
    const { circuitBreaker } = wrapped

    const state = circuitBreaker.getState()
    if (state === CircuitState.OPEN) {
      return false
    }

    try {
      await circuitBreaker.call(async () => {
        const testMessage: Message[] = []
        await wrapped.provider.sendMessage(testMessage, [])
      })
      wrapped.lastHealthCheck = Date.now()
      return true
    } catch {
      return false
    }
  }

  /**
   * Execute operation dengan automatic failover.
   */
  async executeWithFailover<T>(
    operation: (provider: LLMProvider) => Promise<T>
  ): Promise<T> {
    const providersToTry = this.getProviderOrder()
    const errors: Array<{ provider: string; error: Error }> = []

    for (const providerName of providersToTry) {
      const wrapped = this.providers[providerName]
      if (!wrapped) {
        continue
      }

      try {
        const result = await wrapped.circuitBreaker.call(async () => {
          return operation(wrapped.provider)
        })

        wrapped.circuitBreaker.recordSuccess()
        wrapped.lastHealthCheck = Date.now()

        if (providerName !== this.getCurrentProviderName()) {
          logger.info('Provider failover successful', {
            from: this.getCurrentProviderName(),
            to: providerName,
          })
          this.setCurrentProvider(providerName)
        }

        return result
      } catch (error) {
        wrapped.circuitBreaker.recordFailure()
        errors.push({ provider: providerName, error: error as Error })

        logger.warn('Provider operation failed', error as Error, {
          name: providerName,
          state: wrapped.circuitBreaker.getState(),
          attemptIndex: providersToTry.indexOf(providerName),
        })
      }
    }

    const allErrors = errors.map(e => `${e.provider}: ${e.error.message}`).join('; ')
    throw new Error(`All providers failed: ${allErrors}`)
  }

  /**
   * Get status semua providers.
   */
  getProviderStatuses(): ProviderHealthStatus[] {
    return Object.values(this.providers).map(wrapped => ({
      name: wrapped.provider.name,
      state: wrapped.circuitBreaker.getState(),
      failureCount: wrapped.circuitBreaker.getFailureCount(),
      isHealthy: wrapped.circuitBreaker.getState() !== CircuitState.OPEN,
      lastHealthCheck: wrapped.lastHealthCheck,
    }))
  }

  /**
   * Record failure untuk provider (untuk testing).
   */
  recordFailure(providerName: string, error: Error): void {
    const wrapped = this.providers[providerName]
    if (wrapped) {
      wrapped.circuitBreaker.recordFailure()
    }
  }

  /**
   * Enable/disable provider manually.
   */
  setProviderEnabled(providerName: string, enabled: boolean): void {
    const wrapped = this.providers[providerName]
    if (wrapped) {
      if (enabled) {
        // Reset circuit breaker completely
        wrapped.circuitBreaker = new CircuitBreaker()
      } else {
        // Force trip circuit breaker
        for (let i = 0; i < 10; i++) {
          wrapped.circuitBreaker.recordFailure()
        }
      }
    }
  }

  /**
   * Reset circuit breaker untuk provider.
   */
  resetCircuit(providerName: string): void {
    const wrapped = this.providers[providerName]
    if (wrapped) {
      wrapped.circuitBreaker = new CircuitBreaker()
    }
  }

  /**
   * Get provider by name.
   */
  getProvider(name: string): LLMProvider | null {
    const wrapped = this.providers[name]
    return wrapped?.provider || null
  }

  private getProviderOrder(): string[] {
    return this.config.providerOrder
  }

  private getCurrentProviderName(): string | null {
    const providerName = this.config.providerOrder[this.currentProviderIndex]
    return providerName || null
  }

  private setCurrentProvider(name: string): void {
    const index = this.config.providerOrder.indexOf(name as never)
    if (index !== -1) {
      this.currentProviderIndex = index
    }
  }
}