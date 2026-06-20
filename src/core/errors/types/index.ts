/**
 * Error types barrel.
 * @module core/errors/types
 */

export { ErrorConstructor, OmakaseError } from './base/base.ts'
export { AuthErrorClass as AuthenticationError } from './auth/auth.ts'
export { ConfigErrorClass as ConfigError } from './config/config.ts'
export { FileErrorClass as FileError } from './file/file.ts'
export { LLMErrorClass as LLMError } from './llm/llm.ts'
export { PermissionErrorClass as PermissionError } from './permission/permission.ts'
export { RateLimitErrorClass as RateLimitError } from './rate-limit/rate-limit.ts'
export { TimeoutErrorClass as TimeoutError } from './timeout/timeout.ts'
export { ValidationErrorClass as ValidationError } from './validation/validation.ts'
export { ToolErrorClass as ToolError } from './tool/tool.ts'