/**
 * Status command tests.
 * @module commands/builtin/status.test
 */

import { describe, it, expect } from 'bun:test'
import { statusCommand } from './status.ts'

describe('statusCommand', () => {
  it('should have correct name and description', () => {
    expect(statusCommand.name).toBe('status')
    expect(statusCommand.description).toBeTruthy()
  })

  it('should return status text', async () => {
    const result = await statusCommand.execute('', {} as any)
    expect(result.type).toBe('text')
    expect(result.content).toContain('Status')
    expect(result.content).toContain('Provider')
    expect(result.content).toContain('Model')
  })
})
