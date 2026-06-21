/**
 * Help command tests.
 * @module commands/builtin/help.test
 */

import { describe, it, expect } from 'bun:test'
import { helpCommand } from './help.ts'

describe('helpCommand', () => {
  it('should have correct name and description', () => {
    expect(helpCommand.name).toBe('help')
    expect(helpCommand.description).toBeTruthy()
  })

  it('should return help text', async () => {
    const result = await helpCommand.execute('', {} as any)
    expect(result.type).toBe('text')
    expect(result.content).toContain('Omakase')
    expect(result.content).toContain('/help')
    expect(result.content).toContain('/exit')
    expect(result.content).toContain('/agents')
    expect(result.content).toContain('/chronos')
  })

  it('should list all providers', async () => {
    const result = await helpCommand.execute('', {} as any)
    expect(result.content).toContain('anthropic')
    expect(result.content).toContain('openai')
    expect(result.content).toContain('ollama')
    expect(result.content).toContain('nvidia')
  })

  it('should include usage examples', async () => {
    const result = await helpCommand.execute('', {} as any)
    expect(result.content).toContain('Examples')
    expect(result.content).toContain('Usage')
  })
})
