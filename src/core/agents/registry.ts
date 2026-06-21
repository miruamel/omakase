/**
 * Agent registry - mengelola kumpulan agent.
 * @module core/agents
 */

import { Agent } from './agent.ts'
import type { AgentConfig } from '../../types/agents/index.ts'
import type { LLMProvider } from '../providers/interface.ts'
import type { ToolDefinition } from '../../types/tools/definition.ts'

/**
 * Registry untuk mengelola agent dalam sistem multi-agent.
 */
export class AgentRegistry {
  /** Map nama agent ke instance */
  private agents: Map<string, Agent> = new Map()
  /** LLM provider */
  private provider: LLMProvider
  /** Tool registry */
  private toolRegistry: Map<string, ToolDefinition>

  /**
   * Buat agent registry baru.
   * 
   * @param provider - LLM provider
   * @param toolRegistry - Registry tools
   */
  constructor(provider: LLMProvider, toolRegistry: Map<string, ToolDefinition>) {
    this.provider = provider
    this.toolRegistry = toolRegistry
  }

  /**
   * Daftarkan agent baru.
   *
   * @param config - Konfigurasi agent
   * @returns Instance agent yang didaftarkan
   * @throws Error jika config tidak valid
   */
  register(config: AgentConfig): Agent {
    if (!config.name || typeof config.name !== 'string') {
      throw new Error('Agent name is required and must be a string')
    }
    if (!config.role || !['coordinator', 'worker', 'specialist', 'reviewer'].includes(config.role)) {
      throw new Error(`Invalid agent role: ${config.role}. Must be one of: coordinator, worker, specialist, reviewer`)
    }
    if (this.agents.has(config.name)) {
      throw new Error(`Agent with name "${config.name}" already exists`)
    }

    const agent = new Agent(config, this.provider, this.toolRegistry)
    this.agents.set(config.name, agent)
    return agent
  }

  /**
   * Dapatkan agent berdasarkan nama.
   * 
   * @param name - Nama agent
   * @returns Instance agent atau undefined
   */
  get(name: string): Agent | undefined {
    return this.agents.get(name)
  }

  /**
   * Dapatkan semua agent.
   * 
   * @returns Array semua agent
   */
  getAll(): Agent[] {
    return Array.from(this.agents.values())
  }

  /**
   * Hapus agent dari registry.
   * 
   * @param name - Nama agent
   * @returns True jika berhasil dihapus
   */
  unregister(name: string): boolean {
    return this.agents.delete(name)
  }

  /**
   * Dapatkan jumlah agent yang terdaftar.
   * 
   * @returns Jumlah agent
   */
  size(): number {
    return this.agents.size
  }
}