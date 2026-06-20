/** Hasil permission check untuk tool */
export interface PermissionResult {
  granted: boolean
  reason?: string
  prompt?: string
}