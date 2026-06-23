/**
 * Performance benchmarks untuk Omakase core components.
 * @module tests/benchmarks
 */

import { describe, it, expect } from 'bun:test'
import { QueryEngine } from '../../core/engine/engine.ts'
import { AgentRegistry } from '../../core/agents/registry.ts'
import { Chronos } from '../../core/chronos/chronos.ts'
import { getNextCronTime } from '../../core/chronos/cron-parser.ts'
import { mapMessages, mapTools, parseToolCalls } from '../../core/providers/http-client.ts'
import type { LLMProvider } from '../../core/providers/interface.ts'
import type { Message } from '../../types/messages/message.ts'
import { z } from 'zod'
import type { ToolDefinition } from '../../types/tools/definition.ts'

describe('Benchmarks', () => {
  describe('QueryEngine', () => {
    it('should handle 100 messages in under 200ms', async () => {
      const mockProvider: LLMProvider = {
        name: 'mock',
        async sendMessage() {
          return { content: 'response', usage: { inputTokens: 10, outputTokens: 5 } }
        },
      }

      const engine = new QueryEngine(mockProvider, { maxRetries: 1, retryDelay: 1 })
      const messages: Message[] = Array.from({ length: 100 }, (_, i) => ({
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: `Message ${i}`,
      }))

      const start = performance.now()
      await engine.sendMessage(messages)
      const duration = performance.now() - start

      expect(duration).toBeLessThan(200)
    })

    it('should handle 1000 messages in under 1000ms', async () => {
      const mockProvider: LLMProvider = {
        name: 'mock',
        async sendMessage() {
          return { content: 'response', usage: { inputTokens: 10, outputTokens: 5 } }
        },
      }

      const engine = new QueryEngine(mockProvider, { maxRetries: 1, retryDelay: 1 })
      const messages: Message[] = Array.from({ length: 1000 }, (_, i) => ({
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: `Message ${i}`,
      }))

      const start = performance.now()
      await engine.sendMessage(messages)
      const duration = performance.now() - start

      expect(duration).toBeLessThan(1000)
    })
  })

  describe('AgentRegistry', () => {
    it('should register 100 agents in under 100ms', () => {
      const mockProvider: LLMProvider = {
        name: 'mock',
        async sendMessage() {
          return { content: 'response' }
        },
      }

      const registry = new AgentRegistry(mockProvider, new Map())

      const start = performance.now()
      for (let i = 0; i < 100; i++) {
        registry.register({ name: `agent-${i}`, role: 'worker' })
      }
      const duration = performance.now() - start

      expect(duration).toBeLessThan(100)
      expect(registry.size()).toBe(100)
    })

    it('should lookup agents in under 50ms', () => {
      const mockProvider: LLMProvider = {
        name: 'mock',
        async sendMessage() {
          return { content: 'response' }
        },
      }

      const registry = new AgentRegistry(mockProvider, new Map())
      for (let i = 0; i < 100; i++) {
        registry.register({ name: `agent-${i}`, role: 'worker' })
      }

      const start = performance.now()
      for (let i = 0; i < 1000; i++) {
        registry.get(`agent-${i % 100}`)
      }
      const duration = performance.now() - start

      expect(duration).toBeLessThan(50)
    })
  })

  describe('Chronos', () => {
    it('should schedule 100 tasks in under 100ms', () => {
      const chronos = new Chronos()

      const start = performance.now()
      for (let i = 0; i < 100; i++) {
        chronos.schedule({
          name: `task-${i}`,
          type: 'once',
          delayMs: 1000,
          handler: async () => {},
        })
      }
      const duration = performance.now() - start

      expect(duration).toBeLessThan(100)
      chronos.shutdown()
    })
  })

  describe('Cron Parser', () => {
    it('should compute next time 1000 times in under 200ms', () => {
      const start = performance.now()
      for (let i = 0; i < 1000; i++) {
        getNextCronTime('*/5 * * * *')
      }
      const duration = performance.now() - start

      expect(duration).toBeLessThan(200)
    })
  })

  describe('HTTP Client Utilities', () => {
    it('should map 1000 messages in under 50ms', () => {
      const messages: Message[] = Array.from({ length: 1000 }, (_, i) => ({
        role: 'user',
        content: `Message ${i}`,
      }))

      const start = performance.now()
      mapMessages(messages)
      const duration = performance.now() - start

      expect(duration).toBeLessThan(50)
    })

    it('should map 100 tools in under 20ms', () => {
      const tools: ToolDefinition[] = Array.from({ length: 100 }, (_, i) => ({
        name: `tool-${i}`,
        description: `Tool ${i}`,
        inputSchema: z.object({ properties: z.record(z.string(), z.any()) }),
        call: async () => ({ toolCallId: 'test', success: true }),
      }))

      const start = performance.now()
      mapTools(tools)
      const duration = performance.now() - start

      expect(duration).toBeLessThan(20)
    })

    it('should parse 1000 tool calls in under 100ms', () => {
      const toolCalls = Array.from({ length: 1000 }, (_, i) => ({
        id: `call-${i}`,
        function: {
          name: `tool-${i}`,
          arguments: JSON.stringify({ arg: i }),
        },
      }))

      const start = performance.now()
      parseToolCalls(toolCalls)
      const duration = performance.now() - start

      expect(duration).toBeLessThan(100)
    })
  })
})
