/**
 * Coordinator - orchestrate multiple agents.
 * @module core/coordinator
 */

import type { Agent } from '../agents/agent.ts'
import type { AgentRegistry } from '../agents/registry.ts'
import type { LLMProvider } from '../providers/interface.ts'
import type { Message } from '../../types/messages/message.ts'
import type { AgentTask } from '../../types/agents/index.ts'
import type {
  CoordinatorConfig,
  CoordinatorResult,
  CoordinatorStatus,
  ExecutionPlan,
  ExecutionStrategy,
  PlanStep,
} from '../../types/coordinator/index.ts'
import { logger } from '../services/logger/logger/logger.ts'

/**
 * Coordinator untuk orchestrate multiple agents dalam menyelesaikan task kompleks.
 */
export class Coordinator {
  /** Nama coordinator */
  public readonly name: string
  /** Strategi eksekusi */
  public readonly strategy: ExecutionStrategy
  /** Agent registry */
  private registry: AgentRegistry
  /** LLM provider untuk planning */
  private provider: LLMProvider
  /** Maksimal iterasi planning */
  private maxPlanningIterations: number
  /** Total timeout */
  private totalTimeout: number
  /** Status coordinator */
  private status: CoordinatorStatus = 'idle'

  /**
   * Buat coordinator baru.
   * 
   * @param config - Konfigurasi coordinator
   * @param registry - Agent registry
   * @param provider - LLM provider untuk planning
   */
  constructor(
    config: CoordinatorConfig,
    registry: AgentRegistry,
    provider: LLMProvider
  ) {
    this.name = config.name
    this.strategy = config.strategy
    this.registry = registry
    this.provider = provider
    this.maxPlanningIterations = config.maxPlanningIterations || 3
    this.totalTimeout = config.totalTimeout || 300000
  }

  /**
   * Dapatkan status coordinator saat ini.
   * 
   * @returns Status coordinator
   */
  getStatus(): CoordinatorStatus {
    return this.status
  }

  /**
   * Jalankan task kompleks dengan orchestrasi multiple agents.
   * 
   * @param input - Input task dari user
   * @returns Hasil eksekusi
   */
  async run(input: string): Promise<CoordinatorResult> {
    const startTime = Date.now()
    this.status = 'planning'

    logger.info('Coordinator starting', {
      name: this.name,
      strategy: this.strategy,
    })

    try {
      const plan = await this.createPlan(input)
      this.status = 'executing'

      const stepResults = await this.executePlan(plan)
      const messages = this.collectMessages(stepResults)

      this.status = 'completed'
      const duration = Date.now() - startTime

      logger.info('Coordinator completed', {
        name: this.name,
        duration,
        steps: stepResults.size,
      })

      return {
        status: this.status,
        stepResults,
        messages,
        duration,
      }
    } catch (error) {
      this.status = 'failed'
      logger.error('Coordinator failed', error as Error, { name: this.name })
      throw error
    }
  }

  /**
   * Buat execution plan menggunakan LLM.
   * 
   * @param input - Input task
   * @returns Execution plan
   */
  private async createPlan(input: string): Promise<ExecutionPlan> {
    const agents = this.registry.getAll()
    const agentList = agents.map(a => `- ${a.name} (${a.role})`).join('\n')

    const planningPrompt = `You are a coordinator. Break down this task into steps and assign each step to an appropriate agent.

Available agents:
${agentList}

Task: ${input}

Respond with a JSON plan in this format:
{
  "description": "overall plan description",
  "steps": [
    {
      "id": "step-1",
      "description": "what this step does",
      "agentName": "agent-name",
      "task": { "description": "step description", "input": "step input" }
    }
  ]
}`

    const messages: Message[] = [
      { role: 'user', content: planningPrompt },
    ]

    const response = await this.provider.sendMessage(messages)
    const planData = this.parsePlanResponse(response.content || '')

    return {
      id: crypto.randomUUID(),
      description: planData.description,
      steps: planData.steps.map(s => ({
        id: s.id,
        description: s.description,
        agentName: s.agentName,
        task: {
          id: crypto.randomUUID(),
          description: s.task.description,
          input: s.task.input,
          status: 'idle',
          createdAt: Date.now(),
        },
        dependsOn: s.dependsOn,
      })),
      createdAt: Date.now(),
    }
  }

  /**
   * Parse response LLM menjadi plan data.
   * 
   * @param content - Response content dari LLM
   * @returns Plan data yang diparse
   */
  private parsePlanResponse(content: string): {
    description: string
    steps: Array<{
      id: string
      description: string
      agentName: string
      task: { description: string; input: string }
      dependsOn?: string[]
    }>
  } {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    } catch (error) {
      logger.warn('Failed to parse plan JSON, using fallback', { error: String(error) })
    }

    return {
      description: 'Execute task',
      steps: [{
        id: 'step-1',
        description: 'Execute the task',
        agentName: this.registry.getAll()[0]?.name || 'default',
        task: { description: 'Execute', input: content },
      }],
    }
  }

  /**
   * Eksekusi plan berdasarkan strategi.
   * 
   * @param plan - Execution plan
   * @returns Map hasil step
   */
  private async executePlan(plan: ExecutionPlan): Promise<Map<string, AgentTask>> {
    const results = new Map<string, AgentTask>()

    switch (this.strategy) {
      case 'sequential':
        await this.executeSequential(plan, results)
        break
      case 'parallel':
        await this.executeParallel(plan, results)
        break
      case 'adaptive':
        await this.executeAdaptive(plan, results)
        break
    }

    return results
  }

  /**
   * Eksekusi plan secara sequential.
   * 
   * @param plan - Execution plan
   * @param results - Map untuk menyimpan hasil
   */
  private async executeSequential(plan: ExecutionPlan, results: Map<string, AgentTask>): Promise<void> {
    for (const step of plan.steps) {
      const result = await this.executeStep(step)
      results.set(step.id, result)
    }
  }

  /**
   * Eksekusi plan secara parallel.
   * 
   * @param plan - Execution plan
   * @param results - Map untuk menyimpan hasil
   */
  private async executeParallel(plan: ExecutionPlan, results: Map<string, AgentTask>): Promise<void> {
    const promises = plan.steps.map(step => this.executeStep(step))
    const stepResults = await Promise.all(promises)
    plan.steps.forEach((step, i) => {
      results.set(step.id, stepResults[i])
    })
  }

  /**
   * Eksekusi plan secara adaptive (parallel dengan dependencies).
   * 
   * @param plan - Execution plan
   * @param results - Map untuk menyimpan hasil
   */
  private async executeAdaptive(plan: ExecutionPlan, results: Map<string, AgentTask>): Promise<void> {
    const completed = new Set<string>()
    const remaining = [...plan.steps]

    while (remaining.length > 0) {
      const ready = remaining.filter(step => {
        if (!step.dependsOn || step.dependsOn.length === 0) return true
        return step.dependsOn.every(dep => completed.has(dep))
      })

      if (ready.length === 0) break

      const promises = ready.map(step => this.executeStep(step))
      const stepResults = await Promise.all(promises)

      ready.forEach((step, i) => {
        results.set(step.id, stepResults[i])
        completed.add(step.id)
      })

      const readyIds = new Set(ready.map(s => s.id))
      const newRemaining = remaining.filter(s => !readyIds.has(s.id))
      remaining.length = 0
      remaining.push(...newRemaining)
    }
  }

  /**
   * Eksekusi satu step.
   * 
   * @param step - Plan step
   * @returns Hasil task
   */
  private async executeStep(step: PlanStep): Promise<AgentTask> {
    const agent = this.registry.get(step.agentName)
    if (!agent) {
      const failedTask: AgentTask = {
        ...step.task,
        status: 'failed',
        error: `Agent not found: ${step.agentName}`,
        completedAt: Date.now(),
      }
      return failedTask
    }

    return await agent.execute(step.task)
  }

  /**
   * Kumpulkan pesan dari hasil step.
   * 
   * @param results - Map hasil step
   * @returns Array pesan
   */
  private collectMessages(results: Map<string, AgentTask>): Array<{
    from: string
    to: string
    content: string
    timestamp: number
    type: 'task' | 'result' | 'query' | 'info'
  }> {
    const messages: Array<{
      from: string
      to: string
      content: string
      timestamp: number
      type: 'task' | 'result' | 'query' | 'info'
    }> = []

    for (const [stepId, task] of results) {
      if (task.result) {
        messages.push({
          from: task.assignedTo || 'unknown',
          to: 'coordinator',
          content: task.result,
          timestamp: task.completedAt || Date.now(),
          type: 'result',
        })
      }
    }

    return messages
  }
}