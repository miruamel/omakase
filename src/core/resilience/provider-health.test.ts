/**
 * Unit tests untuk ProviderHealthManager.
 * @module core/resilience/provider-health.test
 */

import { describe, it, expect, beforeEach, afterEach } from 'bun:test'
import { ProviderHealthManager } from './provider-health.ts'
import type { LLMProvider } from '../providers/interface.ts'
import type { Message } from '../../types/messages/message.ts'
import type { ToolDefinition } from '../../types/tools/definition.ts'

/**
 * Mock LLMProvider untuk testing.
 */
class MockProvider implements LLMProvider {
  name: string
  shouldFail: boolean = false
  callCount: number = 0
  failUntilCall: number = 0

  constructor(name: string, shouldFail: boolean = false, failUntilCall: number = 0) {
    this.name = name
    this.shouldFail = shouldFail
    this.failUntilCall = failUntilCall
  }

  async sendMessage(messages: Message[], tools?: ToolDefinition[]) {
    this.callCount++
    
    if (this.shouldFail && this.callCount <= this.failUntilCall) {
      throw new Error(`${this.name} provider error`)
    }

    if (this.shouldFail) {
      throw new Error(`${this.name} provider always fails`)
    }

    return {
      content: `Response from ${this.name}`,
      toolCalls: [],
      usage: { inputTokens: 10, outputTokens: 5 },
    }
  }
}

describe('ProviderHealthManager', () => {
  let healthManager: ProviderHealthManager

  beforeEach(() => {
    healthManager = new ProviderHealthManager({
      providerOrder: ['anthropic', 'openai', 'ollama'],
      healthCheckInterval: 1000,
      enableHealthCheck: false, // Disable auto health checks for tests
    })
  })

  afterEach(() => {
    healthManager.stopHealthChecks()
  })

  describe('registerProvider', () => {
    it('should register a provider successfully', () => {
      const provider = new MockProvider('anthropic')
      healthManager.registerProvider(provider)

      const registered = healthManager.getProvider('anthropic')
      expect(registered).not.toBeNull()
      expect(registered?.name).toBe('anthropic')
    })

    it('should register multiple providers', () => {
      const anthropic = new MockProvider('anthropic')
      const openai = new MockProvider('openai')
      const ollama = new MockProvider('ollama')

      healthManager.registerProvider(anthropic)
      healthManager.registerProvider(openai)
      healthManager.registerProvider(ollama)

      expect(healthManager.getProvider('anthropic')).not.toBeNull()
      expect(healthManager.getProvider('openai')).not.toBeNull()
      expect(healthManager.getProvider('ollama')).not.toBeNull()
    })
  })

  describe('getHealthyProvider', () => {
    it('should return healthy provider', async () => {
      const provider = new MockProvider('anthropic')
      healthManager.registerProvider(provider)

      const healthy = await healthManager.getHealthyProvider()
      expect(healthy).not.toBeNull()
      expect(healthy?.name).toBe('anthropic')
    })

    it('should failover to next provider when primary fails', async () => {
      const anthropic = new MockProvider('anthropic', true, 0) // Always fails
      const openai = new MockProvider('openai')

      healthManager.registerProvider(anthropic)
      healthManager.registerProvider(openai)

      // Force anthropic circuit breaker to trip by recording failures
      for (let i = 0; i < 5; i++) {
        healthManager.recordFailure('anthropic', new Error('Test failure'))
      }

      const healthy = await healthManager.getHealthyProvider()
      expect(healthy).not.toBeNull()
      expect(healthy?.name).toBe('openai')
    })

    it('should return null when all providers are unhealthy', async () => {
      const anthropic = new MockProvider('anthropic', true)
      const openai = new MockProvider('openai', true)

      healthManager.registerProvider(anthropic)
      healthManager.registerProvider(openai)

      // Trip all circuit breakers
      for (const provider of ['anthropic', 'openai']) {
        for (let i = 0; i < 5; i++) {
          healthManager.recordFailure(provider, new Error('Test failure'))
        }
      }

      const healthy = await healthManager.getHealthyProvider()
      expect(healthy).toBeNull()
    })

    it('should prefer specified provider if healthy', async () => {
      const anthropic = new MockProvider('anthropic')
      const openai = new MockProvider('openai')

      healthManager.registerProvider(anthropic)
      healthManager.registerProvider(openai)

      const preferred = await healthManager.getHealthyProvider('openai')
      expect(preferred).not.toBeNull()
      expect(preferred?.name).toBe('openai')
    })
  })

  describe('executeWithFailover', () => {
    it('should execute operation successfully', async () => {
      const provider = new MockProvider('anthropic')
      healthManager.registerProvider(provider)

      const result = await healthManager.executeWithFailover(async p => {
        return p.sendMessage([])
      })

      expect(result.content).toBe('Response from anthropic')
      expect(provider.callCount).toBe(1)
    })

    it('should failover when provider fails', async () => {
      const anthropic = new MockProvider('anthropic', true, 0)
      const openai = new MockProvider('openai')

      healthManager.registerProvider(anthropic)
      healthManager.registerProvider(openai)

      const result = await healthManager.executeWithFailover(async p => {
        return p.sendMessage([])
      })

      expect(result.content).toBe('Response from openai')
      expect(anthropic.callCount).toBe(1) // Tried but failed
      expect(openai.callCount).toBe(1) // Succeeded on failover
    })

    it('should record success after successful operation', async () => {
      const provider = new MockProvider('anthropic')
      healthManager.registerProvider(provider)

      await healthManager.executeWithFailover(async p => p.sendMessage([]))

      const status = healthManager.getProviderStatuses().find(s => s.name === 'anthropic')
      expect(status?.isHealthy).toBe(true)
    })

    it('should record failure after failed operation', async () => {
      const provider = new MockProvider('anthropic', true)
      healthManager.registerProvider(provider)

      await expect(
        healthManager.executeWithFailover(async p => p.sendMessage([]))
      ).rejects.toThrow()

      const status = healthManager.getProviderStatuses().find(s => s.name === 'anthropic')
      expect(status?.failureCount).toBeGreaterThan(0)
    })

    it('should throw error when all providers fail', async () => {
      const anthropic = new MockProvider('anthropic', true)
      const openai = new MockProvider('openai', true)

      healthManager.registerProvider(anthropic)
      healthManager.registerProvider(openai)

      await expect(
        healthManager.executeWithFailover(async p => p.sendMessage([]))
      ).rejects.toThrow('All providers failed')
    })
  })

  describe('getProviderStatuses', () => {
    it('should return status for all registered providers', () => {
      const anthropic = new MockProvider('anthropic')
      const openai = new MockProvider('openai')

      healthManager.registerProvider(anthropic)
      healthManager.registerProvider(openai)

      const statuses = healthManager.getProviderStatuses()
      expect(statuses.length).toBe(2)
      expect(statuses.map(s => s.name)).toContain('anthropic')
      expect(statuses.map(s => s.name)).toContain('openai')
    })

    it('should show unhealthy status for tripped circuit breaker', () => {
      const provider = new MockProvider('anthropic')
      healthManager.registerProvider(provider)

      // Trip circuit breaker
      for (let i = 0; i < 5; i++) {
        healthManager.recordFailure('anthropic', new Error('Test failure'))
      }

      const status = healthManager.getProviderStatuses().find(s => s.name === 'anthropic')
      expect(status?.isHealthy).toBe(false)
    })
  })

  describe('setProviderEnabled', () => {
    it('should disable provider', async () => {
      const anthropic = new MockProvider('anthropic')
      healthManager.registerProvider(anthropic)

      healthManager.setProviderEnabled('anthropic', false)

      const healthy = await healthManager.getHealthyProvider()
      expect(healthy).toBeNull()
    })

    it('should re-enable provider', async () => {
      const anthropic = new MockProvider('anthropic')
      healthManager.registerProvider(anthropic)

      healthManager.setProviderEnabled('anthropic', false)
      healthManager.setProviderEnabled('anthropic', true)

      const healthy = await healthManager.getHealthyProvider()
      expect(healthy).not.toBeNull()
      expect(healthy?.name).toBe('anthropic')
    })

    it('should trigger failover when disabling current provider', async () => {
      const anthropic = new MockProvider('anthropic')
      const openai = new MockProvider('openai')

      healthManager.registerProvider(anthropic)
      healthManager.registerProvider(openai)

      healthManager.setProviderEnabled('anthropic', false)

      const healthy = await healthManager.getHealthyProvider()
      expect(healthy?.name).toBe('openai')
    })
  })

  describe('resetCircuit', () => {
    it('should reset circuit breaker', async () => {
      const provider = new MockProvider('anthropic')
      healthManager.registerProvider(provider)

      // Trip circuit breaker
      for (let i = 0; i < 5; i++) {
        healthManager.recordFailure('anthropic', new Error('Test failure'))
      }

      let status = healthManager.getProviderStatuses().find(s => s.name === 'anthropic')
      expect(status?.isHealthy).toBe(false)

      // Reset circuit breaker
      healthManager.resetCircuit('anthropic')

      status = healthManager.getProviderStatuses().find(s => s.name === 'anthropic')
      expect(status?.isHealthy).toBe(true)
    })
  })

  describe('health check polling', () => {
    it('should start and stop health checks', () => {
      const provider = new MockProvider('anthropic')
      healthManager.registerProvider(provider)

      healthManager.startHealthChecks()
      healthManager.stopHealthChecks()
    })

    it('should perform health check successfully', async () => {
      const provider = new MockProvider('anthropic')
      healthManager.registerProvider(provider)

      await healthManager['performHealthChecks']()

      const status = healthManager.getProviderStatuses().find(s => s.name === 'anthropic')
      expect(status?.lastHealthCheck).toBeDefined()
      expect(status?.isHealthy).toBe(true)
    })

    it('should mark provider unhealthy after multiple failures', async () => {
      const provider = new MockProvider('anthropic', true)
      healthManager.registerProvider(provider)

      // Run health checks multiple times to trip circuit breaker
      for (let i = 0; i < 5; i++) {
        await healthManager['performHealthChecks']()
      }

      const status = healthManager.getProviderStatuses().find(s => s.name === 'anthropic')
      expect(status?.isHealthy).toBe(false)
      expect(status?.failureCount).toBeGreaterThanOrEqual(5)
    })
  })
})