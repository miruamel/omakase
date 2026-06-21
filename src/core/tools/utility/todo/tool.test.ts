/**
 * TodoWriteTool tests.
 * @module core/tools/utility/todo/tool.test
 */

import { describe, it, expect } from 'bun:test'
import { TodoWriteTool } from './tool.ts'
import type { ToolContext } from '../../../../types/tools/context.ts'
import type { Session } from '../../../../types/messages/turn.ts'

function createMockContext(): ToolContext {
  const session: Session = {
    id: 'test-session',
    startTime: Date.now(),
    lastActivity: Date.now(),
    messages: [],
  }
  return {
    session,
    workingDirectory: '/tmp',
  }
}

describe('TodoWriteTool', () => {
  it('should have correct name and description', () => {
    expect(TodoWriteTool.name).toBe('TodoWrite')
    expect(TodoWriteTool.description).toBeTruthy()
  })

  it('should render todo list', async () => {
    const context = createMockContext()
    const result = await TodoWriteTool.call({
      todos: [
        { content: 'Task 1', status: 'pending' },
        { content: 'Task 2', status: 'in_progress' },
        { content: 'Task 3', status: 'completed' },
      ],
    }, context)

    expect(result.success).toBe(true)
    expect(result.data.rendered).toContain('Task 1')
    expect(result.data.rendered).toContain('Task 2')
    expect(result.data.rendered).toContain('Task 3')
  })

  it('should show priority when provided', async () => {
    const context = createMockContext()
    const result = await TodoWriteTool.call({
      todos: [
        { content: 'Important task', status: 'pending', priority: 'high' },
      ],
    }, context)

    expect(result.data.rendered).toContain('(high)')
  })

  it('should use correct icons for each status', async () => {
    const context = createMockContext()
    const result = await TodoWriteTool.call({
      todos: [
        { content: 'Pending', status: 'pending' },
        { content: 'In progress', status: 'in_progress' },
        { content: 'Completed', status: 'completed' },
        { content: 'Cancelled', status: 'cancelled' },
      ],
    }, context)

    expect(result.data.rendered).toContain('○')
    expect(result.data.rendered).toContain('●')
    expect(result.data.rendered).toContain('✓')
    expect(result.data.rendered).toContain('✗')
  })

  it('should grant permission', async () => {
    const permission = await TodoWriteTool.checkPermissions!({ todos: [] })
    expect(permission.granted).toBe(true)
  })

  it('should handle empty todo list', async () => {
    const context = createMockContext()
    const result = await TodoWriteTool.call({ todos: [] }, context)
    expect(result.success).toBe(true)
    expect(result.data.rendered).toBe('')
  })
})
