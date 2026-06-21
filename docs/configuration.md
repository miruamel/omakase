# Configuration

Omakase menggunakan file `omakase.json` untuk konfigurasi.

## Lokasi File

- **Linux/macOS**: `~/.config/omakase/omakase.json`
- **Windows**: `%APPDATA%\omakase\omakase.json`
- **Custom**: Gunakan `--config <path>` flag

## Schema

```json
{
  "provider": "anthropic",
  "model": "claude-sonnet-4-20250514",
  "maxTokens": 8192,
  "temperature": 0.7,
  "theme": "dark",
  "permissionMode": "auto",
  "nvidiaEndpoint": "https://integrate.api.nvidia.com/v1"
}
```

## Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `provider` | enum | `anthropic` | LLM provider: `anthropic`, `openai`, `ollama`, `nvidia` |
| `model` | string | `claude-sonnet-4-20250514` | Model name |
| `maxTokens` | number | `8192` | Max tokens untuk response |
| `temperature` | number | `0.7` | Sampling temperature (0-1) |
| `theme` | enum | `dark` | UI theme: `light`, `dark` |
| `permissionMode` | enum | `auto` | Permission mode: `auto`, `confirm`, `readonly` |
| `nvidiaEndpoint` | string | - | NVIDIA API endpoint |

## Environment Variables

API keys dibaca dari environment variables:

```bash
export ANTHROPIC_API_KEY="sk-ant-..."
export OPENAI_API_KEY="sk-..."
export NVIDIA_API_KEY="nvapi-..."
export OMAKASE_OLLAMA_ENDPOINT="http://localhost:11434"
export OMAKASE_NVIDIA_ENDPOINT="https://integrate.api.nvidia.com/v1"
```

## Commands

```bash
# Lihat config saat ini
omakase /config show

# Set provider
omakase /config set provider openai

# Set model
omakase /config set model gpt-4

# Reset ke default
omakase /config reset
```

## Next Steps

- [Providers](providers.md) — Setup specific provider
