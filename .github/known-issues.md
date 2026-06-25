# Known Issues

## Current Limitations

### Provider Health
- [ ] Health check requests count towards API rate limits (mitigation: increase interval to 60s)
- [ ] Circuit breaker doesn't persist across sessions (reset on restart)

### Multi-Agent
- [ ] Agent coordination can deadlock in parallel mode with shared resources
- [ ] No built-in timeout for long-running agent tasks

### Chronos Scheduler
- [ ] Scheduled tasks lost on application restart (no persistence)
- [ ] Cron expressions with timezone not supported (always uses UTC)

### Tools
- [ ] FileWrite doesn't create parent directories automatically
- [ ] Bash tool output limited to 10KB (truncation without warning)

## Workarounds

### API Rate Limits
```json
// omakase.json
{
  "healthCheckInterval": 60000  // Increase to 60 seconds
}
```

### Task Persistence
Manually save scheduled tasks to `chronos.json`:
```json
{
  "tasks": [
    {
      "name": "Daily backup",
      "cron": "0 0 * * *",
      "command": "/backup.sh"
    }
  ]
}
```

## Reporting New Issues

Please [open an issue](https://github.com/miruamel/omakase/issues/new) with:
1. Steps to reproduce
2. Expected vs actual behavior
3. Environment details (OS, Bun version, Omakase version)
4. Logs or screenshots if applicable

## Fixed Issues

See [CHANGELOG.md](../CHANGELOG.md) for resolved issues.
