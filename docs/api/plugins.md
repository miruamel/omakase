# Plugin API

## PluginManifest

```typescript
interface PluginManifest {
  name: string
  version: string
  description: string
  main: string
  author?: string
  license?: string
}
```

## PluginManager

```typescript
import { PluginManager } from 'omakase/core/services/plugins/manager'

const manager = new PluginManager()

// Install plugin
await manager.install('my-plugin', 'npm:my-plugin-package')

// List plugins
const plugins = await manager.list()

// Load plugin
const module = await manager.load(manifest)

// Uninstall plugin
await manager.uninstall('my-plugin')
```

## Plugin Sources

- `npm:<package>` — Install dari npm
- `git:<url>` — Clone dari git repository
- `file:<path>` atau `/path` atau `./path` — Copy dari local path

## Plugin Exports

Plugin harus export minimal satu dari:

- `command` — Command definition
- `tools` — Array of tool definitions
- `agents` — Array of agent configs
- `default` — Default export dengan salah satu di atas

Lihat [Plugin Development](../plugins.md) untuk detail lengkap.
