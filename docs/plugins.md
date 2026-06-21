# Plugin Development

Omakase mendukung plugins untuk extend functionality.

## Plugin Structure

```
my-plugin/
├── plugin.json    # Plugin manifest
└── index.js       # Plugin entry point
```

## plugin.json

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "My awesome plugin",
  "main": "index.js",
  "author": "Your Name",
  "license": "Apache-2.0 OR MIT"
}
```

## Plugin API

Plugin harus export minimal satu dari:

### Command

```javascript
export const command = {
  name: 'hello',
  description: 'Say hello',
  async execute(args) {
    console.log(`Hello, ${args || 'World'}!`)
  },
}
```

### Tools

```javascript
export const tools = [
  {
    name: 'my-tool',
    description: 'My custom tool',
    inputSchema: {
      type: 'object',
      properties: {
        input: { type: 'string' },
      },
    },
    async call(args, context) {
      return {
        toolCallId: crypto.randomUUID(),
        success: true,
        data: `Processed: ${args.input}`,
      }
    },
  },
]
```

### Agents

```javascript
export const agents = [
  {
    name: 'my-agent',
    role: 'worker',
    description: 'My custom agent',
    systemPrompt: 'You are a helpful assistant.',
  },
]
```

### Default Export

```javascript
export default {
  command,
  tools,
  agents,
}
```

## Install Plugin

```bash
# Dari local path
omakase /plugin install my-plugin ./path/to/plugin

# Dari npm
omakase /plugin install my-plugin npm:my-plugin-package

# Dari git
omakase /plugin install my-plugin git:https://github.com/user/plugin.git
```

## Uninstall Plugin

```bash
omakase /plugin uninstall my-plugin
```

## List Plugins

```bash
omakase /plugin list
```

## Example Plugin

Lihat [examples/plugin-hello](../examples/plugin-hello/) untuk contoh lengkap.

## Next Steps

- [Tools](tools.md) — Built-in tools reference
