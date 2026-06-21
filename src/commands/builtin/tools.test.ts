/**
 * Tools command tests.
 * @module commands/builtin/tools.test
 */

import { describe, it, expect } from 'bun:test'
import { toolsCommand } from './tools.ts'

describe('toolsCommand', () => {
  it('should have correct name and description', () => {
    expect(toolsCommand.name).toBe('tools')
    expect(toolsCommand.description).toBeTruthy()
  })

  it('should list available tools', async () => {
    const result = await toolsCommand.execute('', {} as any)
    expect(result.type).toBe('text')
    expect(result.content).toContain('Available tools')
    expect(result.content).toContain('Bash')
    expect(result.content).toContain('FileRead')
    expect(result.content).toContain('FileWrite')
  })
})
