/**
 * Clear command tests.
 * @module commands/builtin/clear.test
 */

import { describe, it, expect } from 'bun:test'
import { clearCommand } from './clear.ts'

describe('clearCommand', () => {
  it('should have correct name and description', () => {
    expect(clearCommand.name).toBe('clear')
    expect(clearCommand.description).toBeTruthy()
  })

  it('should return success message', async () => {
    const result = await clearCommand.execute([], {} as any)
    expect(result.type).toBe('text')
    expect(result.content).toContain('cleared')
  })
})
