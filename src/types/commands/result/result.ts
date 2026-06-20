/**
 * Command result types.
 * @module commands/result
 */

import type { Message } from '../../messages/message.ts'

/**
 * CommandResult adalah output dari command execution.
 * Tergantung type command, content bisa berbeda.
 */
export interface CommandResult {
  /**
   * Tipe result menentukan format content:
   * - `text`: Plain text string
   * - `jsx`: React JSX element
   * - `prompt`: Array messages untuk dikirim ke LLM
   */
  type: 'text' | 'jsx' | 'prompt'
  
  /**
   * Content hasil command.
   * Type sesuai dengan type field.
   */
  content: string | React.ReactNode | Message[]
}