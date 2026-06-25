# Support and Help

Need help with Omakase? Here are the best ways to get support:

## Documentation

- **[Getting Started](../README.md#install)** - Installation and quick start
- **[Configuration Guide](../docs/configuration.md)** - All configuration options
- **[Resilience Guide](../docs/resilience.md)** - Provider health and failover
- **[API Reference](../docs/api/)** - Complete API documentation

## Common Issues

### Provider Connection Failed
```bash
# Check API keys are set
echo $ANTHROPIC_API_KEY
echo $OPENAI_API_KEY

# Test connectivity
curl -I https://api.anthropic.com
```

### Health Check Failing
```json
// omakase.json - increase interval
{
  "healthCheckInterval": 60000
}
```

### Tool Permission Denied
Press `y` when prompted, or set permission mode to "auto" in config.

## Getting Help

### 1. Search Existing Issues
Check if your issue is already reported: [GitHub Issues](https://github.com/miruamel/omakase/issues)

### 2. Ask in Discussions
For questions and troubleshooting: [GitHub Discussions](https://github.com/miruamel/omakase/discussions)

### 3. Open an Issue
If you found a bug: [New Issue](https://github.com/miruamel/omakase/issues/new)

### 4. Community Channels
- Discord: [Link pending]
- Twitter: [@your_handle](https://twitter.com/your_handle)

## Response Times

| Channel | Expected Response |
|---------|------------------|
| GitHub Issues (bugs) | 1-3 days |
| GitHub Discussions | 1-5 days |
| Security reports | 24-48 hours |

## What to Include When Asking for Help

1. **Version info:** `omakase --version`
2. **Environment:** OS, Bun version
3. **Config:** Relevant parts of `omakase.json`
4. **Logs:** Error messages or stack traces
5. **Steps to reproduce:** Clear, minimal reproduction

## Supporting the Project

- ⭐ Star the repo on GitHub
- 💖 Sponsor via [GitHub Sponsors](FUNDING.yml)
- 📢 Share on social media
- 📝 Contribute docs or bug fixes

---

**Note:** This is a community project maintained in spare time. Please be patient and respectful.
