# Providers

Omakase mendukung 4 LLM providers.

## Anthropic

```bash
export ANTHROPIC_API_KEY="sk-ant-..."
omakase --provider anthropic --model claude-sonnet-4-20250514
```

Models:
- `claude-sonnet-4-20250514` (default)
- `claude-opus-4-20250514`
- `claude-3-5-sonnet-20241022`
- `claude-3-5-haiku-20241022`

## OpenAI

```bash
export OPENAI_API_KEY="sk-..."
omakase --provider openai --model gpt-4
```

Models:
- `gpt-4`
- `gpt-4-turbo`
- `gpt-4o`
- `gpt-4o-mini`
- `o1`
- `o1-mini`

## Ollama (Local)

```bash
# Install Ollama: https://ollama.com
ollama pull llama3

export OMAKASE_OLLAMA_ENDPOINT="http://localhost:11434"
omakase --provider ollama --model llama3
```

Models: Semua model yang tersedia di [Ollama library](https://ollama.com/library).

## NVIDIA NIM

```bash
export NVIDIA_API_KEY="nvapi-..."
omakase --provider nvidia --model meta/llama-3.1-70b-instruct
```

Models:
- `meta/llama-3.1-70b-instruct`
- `meta/llama-3.1-8b-instruct`
- `mistralai/mistral-large`
- `google/gemma-2-27b-it`

## Switching Providers

```bash
# Via CLI flag
omakase --provider openai --model gpt-4

# Via config
omakase /config set provider openai
omakase /config set model gpt-4

# Via environment
export OMAKASE_PROVIDER=openai
export OMAKASE_MODEL=gpt-4
omakase
```

## Next Steps

- [Multi-Agent](multi-agent.md) — Use multiple agents
