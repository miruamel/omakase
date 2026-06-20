/**
 * Tool base barrel file.
 * @module core/tools/base
 */

export { buildTool } from './builder/builder.ts'
export type { ToolCallFn, PermissionCheckFn } from './builder/builder.ts'
export type { ToolDefinitionBase } from './types/definition.ts'
export type { BuildToolOptions } from './types/options.ts'
export type { PermissionResult } from './types/permission.ts'