/**
 * Permission result types.
 * @module types/tools/permissions/result
 */

/**
 * Hasil permission check untuk tool.
 */
export interface PermissionResult {
  /** Apakah permission diberikan */
  granted: boolean
  /** Alasan jika ditolak */
  reason?: string
  /** Prompt untuk user jika perlu konfirmasi */
  prompt?: string
}
