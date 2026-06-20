/**
 * Turn types.
 * @module types/messages/turn
 */

import type { Message } from './message.ts'

/**
 * Session information.
 */
export interface Session {
  /** Unique session ID */
  id: string
  /** Session start time */
  startTime: number
  /** Last activity time */
  lastActivity: number
  /** Messages in this session */
  messages: Message[]
}