# Tool API

## ToolDefinition

```typescript
interface ToolDefinition {
  name: string
  description: string
  inputSchema: z.ZodType
  call: (args: any, context: ToolContext) => Promise<ToolResult>
  checkPermissions?: (args: any) => Promise<PermissionResult>
}
```

## ToolResult

```typescript
interface ToolResult {
  toolCallId: string
  success: boolean
  data?: any
  error?: string
}
```

## ToolContext

```typescript
interface ToolContext {
  session: Session
  settings?: UserSettings
  workingDirectory: string
  permissionMode?: 'auto' | 'confirm' | 'readonly'
}
```

## PermissionResult

```typescript
interface PermissionResult {
  granted: boolean
  prompt?: string
}
```

## Creating Custom Tools

```typescript
import { z } from 'zod'
import { buildTool } from 'omakase/core/tools/base/builder'

const MyTool = buildTool({
  name: 'MyTool',
  description: 'My custom tool',
  inputSchema: z.object({
    input: z.string(),
  }),
  
  async call(args, context) {
    return {
      toolCallId: crypto.randomUUID(),
      success: true,
      data: `Processed: ${args.input}`,
    }
  },
  
  async checkPermissions(args) {
    return { granted: true }
  },
})
```

## Tool Registry

```typescript
import { ToolRegistry, listTools, getTool } from 'omakase/core/tools/registry'

const registry = ToolRegistry.getInstance()
registry.register(MyTool)

const tools = listTools()
const tool = getTool('MyTool')
```
