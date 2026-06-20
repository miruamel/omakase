/**
 * Permission result type.
 * @module core/tools/base/types/permission
 */

/**
 * Permission check result.
 */
export interface PermissionResult {
  /** Apakah permission granted */
  granted: boolean
  /** Optional prompt untuk user confirmation */
  prompt?: string
}