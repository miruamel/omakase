/**
 * Tool error type.
 * @module core/errors/types/tool
 */

import type { ErrorConstructor } from '../base/base.ts'
import { ToolError } from '../../errors.ts'

/**
 * Tool error class.
 */
export class ToolExecutionError extends ToolError {
  constructor(message: string, public toolName: string) {
    super(message, toolName)
    this.name = 'ToolExecutionError'
  }
}

/**
 * Tool error constructor.
 */
export const ToolErrorClass: ErrorConstructor = ToolExecutionError as any