/**
 * Coordinator tests.
 * @module core/coordinator/coordinator.test
 */

import { describe, it, expect, mock } from 'bun:test'
import { Coordinator } from './coordinator.ts'
import { AgentRegistry } from '../agents/registry.ts'
import type { LLMProvider, LLMResponse } from '../providers/interface.ts'
import type { AgentConfig } from '../../types/agents/index.ts'

function createMockProvider(response: LLMResponse): LLMProvider {
  return {
    name: 'mock',
    sendMessage: mock(async (): Promise<LLMResponse> => response),
  }
}

function createMockAgentConfig(name: string): AgentConfig {
  return {
    name,
    role: 'coder',
    description: `Mock agent ${name}`,
    systemPrompt: 'You are a mock agent',
  }
}

describe('Coordinator', () => {
  it('should create coordinator with config', () => {
    const provider = createMockProvider({ content: '{}' })
    const registry = new AgentRegistry()
    const coordinator = new Coordinator(
      {
        name: 'test-coordinator',
        strategy: 'sequential',
      },
      registry,
      provider
    )

    expect(coordinator.name).toBe('test-coordinator')
    expect(coordinator.strategy).toBe('sequential')
    expect(coordinator.getStatus()).toBe('idle')
  })

  it('should run with sequential strategy', async () => {
    const planJson = JSON.stringify({
      description: 'Test plan',
      steps: [
        {
          id: 'step-1',
          description: 'First step',
          agentName: 'agent-1',
          task: { description: 'Do thing 1', input: 'input 1' },
        },
      ],
    })

    const provider = createMockProvider({ content: planJson })
    const registry = new AgentRegistry()
    registry.register(createMockAgentConfig('agent-1'))

    const coordinator = new Coordinator(
      {
        name: 'test',
        strategy: 'sequential',
      },
      registry,
      provider
    )

    const result = await coordinator.run('Test task')

    expect(result.status).toBe('completed')
    expect(result.stepResults.size).toBe(1)
    expect(coordinator.getStatus()).toBe('completed')
  })

  it('should run with parallel strategy', async () => {
    const planJson = JSON.stringify({
      description: 'Parallel plan',
      steps: [
        {
          id: 'step-1',
          description: 'Step 1',
          agentName: 'agent-1',
          task: { description: 'Task 1', input: 'input 1' },
        },
        {
          id: 'step-2',
          description: 'Step 2',
          agentName: 'agent-2',
          task: { description: 'Task 2', input: 'input 2' },
        },
      ],
    })

    const provider = createMockProvider({ content: planJson })
    const registry = new AgentRegistry()
    registry.register(createMockAgentConfig('agent-1'))
    registry.register(createMockAgentConfig('agent-2'))

    const coordinator = new Coordinator(
      {
        name: 'test',
        strategy: 'parallel',
      },
      registry,
      provider
    )

    const result = await coordinator.run('Test task')

    expect(result.status).toBe('completed')
    expect(result.stepResults.size).toBe(2)
  })

  it('should handle missing agent gracefully', async () => {
    const planJson = JSON.stringify({
      description: 'Plan with missing agent',
      steps: [
        {
          id: 'step-1',
          description: 'Step 1',
          agentName: 'nonexistent-agent',
          task: { description: 'Task 1', input: 'input 1' },
        },
      ],
    })

    const provider = createMockProvider({ content: planJson })
    const registry = new AgentRegistry()

    const coordinator = new Coordinator(
      {
        name: 'test',
        strategy: 'sequential',
      },
      registry,
      provider
    )

    const result = await coordinator.run('Test task')

    expect(result.status).toBe('completed')
    const stepResult = result.stepResults.get('step-1')
    expect(stepResult?.status).toBe('failed')
    expect(stepResult?.error).toContain('Agent not found')
  })

  it('should fallback to single-step plan on parse error', async () => {
    const provider = createMockProvider({ content: 'not valid json' })
    const registry = new AgentRegistry()
    registry.register(createMockAgentConfig('agent-1'))

    const coordinator = new Coordinator(
      {
        name: 'test',
        strategy: 'sequential',
      },
      registry,
      provider
    )

    const result = await coordinator.run('Test task')

    expect(result.status).toBe('completed')
    expect(result.stepResults.size).toBe(1)
  })

  it('should handle adaptive strategy with dependencies', async () => {
    const planJson = JSON.stringify({
      description: 'Adaptive plan',
      steps: [
        {
          id: 'step-1',
          description: 'Step 1',
          agentName: 'agent-1',
          task: { description: 'Task 1', input: 'input 1' },
        },
        {
          id: 'step-2',
          description: 'Step 2',
          agentName: 'agent-2',
          task: { description: 'Task 2', input: 'input 2' },
          dependsOn: ['step-1'],
        },
      ],
    })

    const provider = createMockProvider({ content: planJson })
    const registry = new AgentRegistry()
    registry.register(createMockAgentConfig('agent-1'))
    registry.register(createMockAgentConfig('agent-2'))

    const coordinator = new Coordinator(
      {
        name: 'test',
        strategy: 'adaptive',
      },
      registry,
      provider
    )

    const result = await coordinator.run('Test task')

    expect(result.status).toBe('completed')
    expect(result.stepResults.size).toBe(2)
  })
})
