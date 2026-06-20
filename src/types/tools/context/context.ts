/**
 * Tool context types.
 * @module types/tools/context/context
 */

/**
 * Context yang diberikan ke tool saat eksekusi.
 */
export interface ToolContext {
  /** Session ID */
  session: string
  /** Working directory saat ini */
  workingDirectory: string
  /** User settings */
  settings: Record<string, unknown>
}
