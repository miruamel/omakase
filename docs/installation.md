# Installation

## Prerequisites

- [Bun](https://bun.sh) >= 1.3.0 (untuk development)
- Node.js >= 18 (untuk runtime)

## Install dari Source

```bash
git clone https://github.com/miruamel/omakase.git
cd omakase
bun install
bun run build
```

## Install dari Release

Download binary dari [GitHub Releases](https://github.com/miruamel/omakase/releases):

### Linux / macOS

```bash
curl -L https://github.com/miruamel/omakase/releases/latest/download/omakase -o omakase
chmod +x omakase
sudo mv omakase /usr/local/bin/
```

### Windows

Download `omakase.exe` dari releases page dan tambahkan ke PATH.

## Install via npm (coming soon)

```bash
npm install -g omakase
```

## Verify Installation

```bash
omakase --version
```

Output: `0.1.0`

## Next Steps

- [Configuration](configuration.md) — Setup API keys
- [Providers](providers.md) — Pilih LLM provider
