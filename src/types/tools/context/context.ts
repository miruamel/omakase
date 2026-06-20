/** Context yang diberikan ke tool saat eksekusi */
export interface ToolContext {
  session: string
  workingDirectory: string
  settings: Record<string, unknown>
}