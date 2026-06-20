/**
 * Coordinator types - multi-agent orchestration.
 * @module types/coordinator
 */

import type { AgentConfig, AgentTask, AgentMessage } from '../agents/index.ts'

/**
 * Status coordinator.
 */
export type CoordinatorStatus = 'idle' | 'planning' | 'executing' | 'completed' | 'failed'

/**
 * Strategi eksekusi untuk coordinator.
 */
export type ExecutionStrategy = 'sequential' | 'parallel' | 'adaptive'

/**
 * Konfigurasi coordinator.
 */
export interface CoordinatorConfig {
  /** Nama coordinator */
  name: string
  /** Strategi eksekusi */
  strategy: ExecutionStrategy
  /** Daftar agent yang tersedia */
  agents: AgentConfig[]
  /** Maksimal iterasi planning */
  maxPlanningIterations?: number
  /** Timeout eksekusi total */
  totalTimeout?: number
}

/**
 * Plan yang dihasilkan oleh coordinator.
 */
export interface ExecutionPlan {
  /** ID plan */
  id: string
  /** Deskripsi plan */
  description: string
  /** Langkah-langkah eksekusi */
  steps: PlanStep[]
  /** Timestamp dibuat */
  createdAt: number
}

/**
 * Langkah dalam execution plan.
 */
export interface PlanStep {
  /** ID step */
  id: string
  /** Deskripsi step */
  description: string
  /** Agent yang ditugaskan */
  agentName: string
  /** Task yang akan dijalankan */
  task: AgentTask
  /** Dependencies dengan step lain */
  dependsOn?: string[]
}

/**
 * Hasil eksekusi coordinator.
 */
export interface CoordinatorResult {
  /** Status akhir */
  status: CoordinatorStatus
  /** Hasil dari setiap step */
  stepResults: Map<string, AgentTask>
  /** Pesan antar agent */
  messages: AgentMessage[]
  /** Total waktu eksekusi */
  duration: number
}