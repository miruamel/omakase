# Plugin Examples

Example plugins untuk Omakase.

## plugin-hello

Plugin sederhana yang menambahkan command `/hello`.

### Struktur

```
plugin-hello/
├── plugin.json    # Plugin manifest
└── index.js       # Plugin entry point
```

### plugin.json

```json
{
  "name": "plugin-hello",
  "version": "1.0.0",
  "description": "Example Omakase plugin",
  "main": "index.js",
  "author": "Your Name",
  "license": "MIT"
}
```

### Install

```bash
# Dari local path
omakase /plugin install hello ./examples/plugin-hello

# Dari npm (jika dipublish)
omakase /plugin install hello npm:omakase-plugin-hello

# Dari git
omakase /plugin install hello git:https://github.com/user/plugin-hello.git
```

### Plugin API

Plugin harus export minimal satu dari:

- `command` — Command definition untuk di-register ke Omakase
- `default` — Default export dengan command atau hooks
- `tools` — Array of tool definitions
- `agents` — Array of agent configs

Lihat `index.js` untuk contoh lengkap.
