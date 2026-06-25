/**
 * Agent - unit eksekusi dalam sistem multi-agent.
 * @module core/agents
 */

import type { LLMProvider } from '../providers/interface.ts'
import type { Message } from '../../types/messages/message.ts'
import type { ToolDefinition } from '../../types/tools/definition.ts'
import type { AgentConfig, AgentTask, AgentStatus } from '../../types/agents/index.ts'
import { logger } from '../services/logger/logger/logger.ts'
import { TimeoutError } from '../errors/errors.ts'

/**
 * Agent yang dapat menjalankan task menggunakan LLM provider.
 */
export class Agent {
  /** Nama agent */
  public readonly name: string
  /** Peran agent */
  public readonly role: AgentConfig['role']
  /** System prompt */
  public readonly systemPrompt: string
  /** Tools yang tersedia */
  public readonly tools: string[]
  /** Maksimal langkah */
  public readonly maxSteps: number
  /** Timeout */
  public readonly timeout: number
  /** Status agent */
  private status: AgentStatus = 'idle'
  /** LLM provider */
  private provider: LLMProvider
  /** Daftar tools */
  private toolRegistry: Map<string, ToolDefinition>

  /**
   * Buat agent baru.
   * 
   * @param config - Konfigurasi agent
   * @param provider - LLM provider
   * @param toolRegistry - Registry tools yang tersedia
   */
  constructor(
    config: AgentConfig,
    provider: LLMProvider,
    toolRegistry: Map<string, ToolDefinition>
  ) {
    this.name = config.name
    this.role = config.role
    this.systemPrompt = config.systemPrompt || this.getDefaultSystemPrompt(config.role)
    this.tools = config.tools || []
    this.maxSteps = config.maxSteps || 10
    this.timeout = config.timeout || 60000
    this.provider = provider
    this.toolRegistry = toolRegistry
  }

  /**
   * Dapatkan system prompt default berdasarkan role.
   * 
   * @param role - Role agent
   * @returns System prompt
   */
  private getDefaultSystemPrompt(role: AgentConfig['role']): string {
    const prompts: Record<AgentConfig['role'], string> = {
      coordinator: 'You are a coordinator agent. Break down complex tasks and delegate to specialist agents.',
      worker: 'You are a worker agent. Execute assigned tasks efficiently and report results.',
      specialist: 'You are a specialist agent. Apply domain expertise to solve specific problems.',
      reviewer: 'You are a reviewer agent. Evaluate work quality and provide constructive feedback.',
    }
    return prompts[role]
  }

  /**
   * Dapatkan status agent saat ini.
   * 
   * @returns Status agent
   */
  getStatus(): AgentStatus {
    return this.status
  }

  /**
   * Eksekusi task menggunakan agent.
   * 
   * @param task - Task yang akan dijalankan
   * @returns Hasil eksekusi task
   */
  async execute(task: AgentTask): Promise<AgentTask> {
    this.status = 'busy'
    task.assignedTo = this.name
    task.status = 'busy'

    logger.info('Agent executing task', {
      agent: this.name,
      taskId: task.id,
      role: this.role,
    })

      let timeoutId: any
    try {
      const messages: Message[] = [
        { role: 'system', content: this.systemPrompt },
        { role: 'user', content: task.input },
      ]

      const availableTools = this.getAvailableTools()
      const responsePromise = this.provider.sendMessage(messages, availableTools)
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new TimeoutError(`Agent execution timed out after ${this.timeout}ms`))
        }, this.timeout)
      })
      const response = await Promise.race([responsePromise, timeoutPromise])
      if (timeoutId) clearTimeout(timeoutId)

      task.result = response.content || ''
      task.status = 'completed'
      task.completedAt = Date.now()
      this.status = 'completed'

      logger.info('Agent task completed', {
        agent: this.name,
        taskId: task.id,
      })

      return task
    } catch (error) {
      if (timeoutId) clearTimeout(timeoutId)
      task.error = error instanceof Error ? error.message : String(error)
      task.status = 'failed'
      task.completedAt = Date.now()
      this.status = 'failed'

      logger.error('Agent task failed', error as Error, {
        agent: this.name,
        taskId: task.id,
      })

      return task
    }
  }

  /**
   * Dapatkan tools yang tersedia untuk agent ini.
   * 
   * @returns Array tool definitions
   */
  private getAvailableTools(): ToolDefinition[] {
    const tools: ToolDefinition[] = []
    for (const toolName of this.tools) {
      const tool = this.toolRegistry.get(toolName)
      if (tool) {
        tools.push(tool)
      }
    }
    return tools
  }

  /**
   * Reset agent ke status idle.
   */
  reset(): void {
    this.status = 'idle'
  }
}