/**
 * Tool context types.
 * @module core/tools/base/types/context
 */

/**
 * ToolContext diberikan ke tool saat eksekusi.
 */
export interface ToolContext {
  /** Session ID saat ini */
  session: string
  /** Working directory untuk operasi file/shell */
  workingDirectory: string
  /** Settings user saat ini */
  settings: Record<string, unknown>
}