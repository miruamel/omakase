/**
 * Tests untuk RuntimeContext.
 * @module core/runtime/runtime.test
 */

import { describe, it, expect, beforeEach, afterEach } from 'bun:test'
import { RuntimeContext, setRuntime, getRuntime, requireRuntime } from './runtime.ts'
import type { LLMProvider, LLMResponse } from '../providers/interface.ts'
import type { ToolDefinition } from '../../types/tools/definition.ts'

function createMockProvider(): LLMProvider {
  return {
    name: 'mock',
    async sendMessage(): Promise<LLMResponse> {
      return { content: 'response' }
    },
  }
}

const mockTool: ToolDefinition = {
  name: 'mock-tool',
  description: 'A mock tool',
  inputSchema: {} as any,
  async call() {
    return { toolCallId: 'mock', success: true, data: 'result' }
  },
}

describe('RuntimeContext', () => {
  let runtime: RuntimeContext

  beforeEach(() => {
    runtime = new RuntimeContext(createMockProvider(), [mockTool])
  })

  afterEach(() => {
    runtime.shutdown()
  })

  it('should initialize with provider and tools', () => {
    expect(runtime.agentRegistry).toBeDefined()
    expect(runtime.chronos).toBeDefined()
    expect(runtime.getProvider()).toBeDefined()
    expect(runtime.getToolRegistry().size).toBe(1)
  })

  it('should return same coordinator instance', () => {
    const c1 = runtime.getCoordinator()
    const c2 = runtime.getCoordinator()
    expect(c1).toBe(c2)
  })

  it('should return same provider instance', () => {
    const p1 = runtime.getProvider()
    const p2 = runtime.getProvider()
    expect(p1).toBe(p2)
  })

  it('should return same tool registry instance', () => {
    const t1 = runtime.getToolRegistry()
    const t2 = runtime.getToolRegistry()
    expect(t1).toBe(t2)
  })

  it('should shutdown chronos', () => {
    runtime.chronos.schedule({
      name: 'test',
      type: 'once',
      handler: () => {},
    })
    expect(runtime.chronos.getAll().length).toBe(1)
    runtime.shutdown()
  })
})

describe('Global runtime', () => {
  beforeEach(() => {
    setRuntime(new RuntimeContext(createMockProvider(), [mockTool]))
  })

  it('should get runtime after set', () => {
    const r = getRuntime()
    expect(r).not.toBeNull()
  })

  it('should require runtime', () => {
    const r = requireRuntime()
    expect(r).toBeDefined()
  })
})
