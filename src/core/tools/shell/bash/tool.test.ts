/**
 * BashTool tests.
 * @module core/tools/shell/bash/tool.test
 */

import { describe, it, expect } from 'bun:test'
import { BashTool } from './tool.ts'
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

describe('BashTool', () => {
  it('should have correct name and description', () => {
    expect(BashTool.name).toBe('Bash')
    expect(BashTool.description).toBeTruthy()
  })

  it('should execute simple command', async () => {
    const context = createMockContext()
    const result = await BashTool.call({ command: 'echo hello' }, context)
    expect(result.success).toBe(true)
    expect(result.data.stdout).toContain('hello')
  })

  it('should handle command failure', async () => {
    const context = createMockContext()
    const result = await BashTool.call({ command: 'exit 1' }, context)
    expect(result.success).toBe(false)
  })

  it('should reject dangerous command rm -rf', async () => {
    const permission = await BashTool.checkPermissions!({ command: 'rm -rf /' })
    expect(permission.granted).toBe(false)
    expect(permission.prompt).toBeTruthy()
  })

  it('should reject dangerous command sudo', async () => {
    const permission = await BashTool.checkPermissions!({ command: 'sudo apt update' })
    expect(permission.granted).toBe(false)
  })

  it('should reject dangerous command dd', async () => {
    const permission = await BashTool.checkPermissions!({ command: 'dd if=/dev/zero of=/dev/sda' })
    expect(permission.granted).toBe(false)
  })

  it('should reject dangerous command mkfs', async () => {
    const permission = await BashTool.checkPermissions!({ command: 'mkfs.ext4 /dev/sda1' })
    expect(permission.granted).toBe(false)
  })

  it('should allow safe command', async () => {
    const permission = await BashTool.checkPermissions!({ command: 'ls -la' })
    expect(permission.granted).toBe(true)
  })
})
