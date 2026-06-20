/**
 * Agent types.
 * @module types/agents
 */

/**
 * Role yang dapat dijalankan oleh agent dalam sistem multi-agent.
 */
export type AgentRole = 'coordinator' | 'worker' | 'specialist' | 'reviewer'

/**
 * Status eksekusi agent.
 */
export type AgentStatus = 'idle' | 'busy' | 'waiting' | 'completed' | 'failed'

/**
 * Konfigurasi untuk membuat agent baru.
 */
export interface AgentConfig {
  /** Nama unik agent */
  name: string
  /** Peran agent dalam tim */
  role: AgentRole
  /** System prompt untuk agent */
  systemPrompt?: string
  /** Daftar nama tools yang tersedia untuk agent */
  tools?: string[]
  /** Maksimal langkah eksekusi */
  maxSteps?: number
  /** Timeout dalam milliseconds */
  timeout?: number
}

/**
 * Task yang dijalankan oleh agent.
 */
export interface AgentTask {
  /** ID unik task */
  id: string
  /** Deskripsi task */
  description: string
  /** Input dari user */
  input: string
  /** Agent yang ditugaskan */
  assignedTo?: string
  /** Status task */
  status: AgentStatus
  /** Hasil eksekusi */
  result?: string
  /** Error message jika gagal */
  error?: string
  /** Timestamp dibuat */
  createdAt: number
  /** Timestamp selesai */
  completedAt?: number
}

/**
 * Pesan antar agent dalam sistem.
 */
export interface AgentMessage {
  /** Pengirim pesan */
  from: string
  /** Penerima pesan */
  to: string
  /** Isi pesan */
  content: string
  /** Timestamp pesan */
  timestamp: number
  /** Tipe pesan */
  type: 'task' | 'result' | 'query' | 'info'
}