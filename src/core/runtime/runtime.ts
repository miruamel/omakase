/**
 * Runtime singletons - manage shared instances untuk multi-agent system.
 * @module core/runtime
 */

import { AgentRegistry } from '../agents/registry.ts'
import { Coordinator } from '../coordinator/coordinator.ts'
import { Chronos } from '../chronos/chronos.ts'
import type { LLMProvider } from '../providers/interface.ts'
import type { ToolDefinition } from '../../types/tools/definition.ts'
import { logger } from '../services/logger/logger/logger.ts'

/**
 * Runtime context yang menyimpan shared instances.
 */
export class RuntimeContext {
  /** Agent registry */
  public readonly agentRegistry: AgentRegistry
  /** Chronos scheduler */
  public readonly chronos: Chronos
  /** Coordinator (lazy-initialized) */
  private _coordinator: Coordinator | null = null
  /** LLM provider */
  private provider: LLMProvider
  /** Tool registry map */
  private toolRegistry: Map<string, ToolDefinition>

  /**
   * Buat runtime context baru.
   *
   * @param provider - LLM provider
   * @param tools - Array tool definitions
   */
  constructor(provider: LLMProvider, tools: ToolDefinition[]) {
    this.provider = provider
    this.toolRegistry = new Map()
    for (const tool of tools) {
      this.toolRegistry.set(tool.name, tool)
    }
    this.agentRegistry = new AgentRegistry(provider, this.toolRegistry)
    this.chronos = new Chronos()
    logger.info('Runtime context initialized', {
      tools: this.toolRegistry.size,
    })
  }

  /**
   * Dapatkan atau buat coordinator.
   *
   * @returns Coordinator instance
   */
  getCoordinator(): Coordinator {
    if (!this._coordinator) {
      this._coordinator = new Coordinator(
        {
          name: 'default-coordinator',
          strategy: 'adaptive',
          agents: [],
          maxPlanningIterations: 3,
          totalTimeout: 300000,
        },
        this.agentRegistry,
        this.provider
      )
    }
    return this._coordinator
  }

  /**
   * Dapatkan LLM provider.
   *
   * @returns LLM provider
   */
  getProvider(): LLMProvider {
    return this.provider
  }

  /**
   * Dapatkan tool registry.
   *
   * @returns Map tool definitions
   */
  getToolRegistry(): Map<string, ToolDefinition> {
    return this.toolRegistry
  }

  /**
   * Shutdown semua background tasks.
   */
  shutdown(): void {
    this.chronos.shutdown()
    logger.info('Runtime context shutdown')
  }
}

/**
 * Global runtime instance (lazy-initialized).
 */
let _runtime: RuntimeContext | null = null

/**
 * Set runtime context.
 *
 * @param runtime - Runtime context
 */
export function setRuntime(runtime: RuntimeContext): void {
  _runtime = runtime
}

/**
 * Get runtime context.
 *
 * @returns Runtime context atau null jika belum diinisialisasi
 */
export function getRuntime(): RuntimeContext | null {
  return _runtime
}

/**
 * Get runtime context atau throw jika belum diinisialisasi.
 *
 * @returns Runtime context
 */
export function requireRuntime(): RuntimeContext {
  if (!_runtime) {
    throw new Error('Runtime context not initialized. Call setRuntime() first.')
  }
  return _runtime
}
