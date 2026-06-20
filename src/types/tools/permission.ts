/**
 * Permission result type.
 * @module types/tools/permission
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