# Release v0.2.0 - Provider Health & Resilience

🎉 **Major release introducing production-grade fault tolerance!**

## 🚀 New Features

### Provider Health System
- **Automatic Failover** - Seamlessly switch between providers when issues occur
- **Circuit Breaker Pattern** - Prevent cascading failures with intelligent circuit breaking
- **Health Check Polling** - Monitor provider health every 30 seconds
- **Real-time Status** - See provider health in the StatusBar

### Failover Chain
Priority order: `Anthropic → OpenAI → Ollama → Nvidia`

When your primary provider experiences issues, Omakase automatically fails over to the next healthy provider!

## 📊 Stats

- **New Files:** 4
- **Tests Added:** 20 (all passing ✅)
- **Documentation:** 1 comprehensive guide
- **CI Workflows:** 2 new automated workflows

## 🛡️ Reliability Improvements

| Feature | Before | After |
|---------|--------|-------|
| Provider Downtime | Manual intervention | Automatic failover (<1s) |
| Error Detection | Reactive (user reports) | Proactive (health checks) |
| Recovery Time | Minutes | Seconds |
| Monitoring | None | Real-time UI indicator |

## 📝 Documentation

- [Resilience Guide](docs/resilience.md) - Complete fault tolerance documentation
- [Contributing Guide](.github/CONTRIBUTING_GUIDE.md) - How to contribute
- [PR Template](.github/pull_request_template.md) - Standardized PR process

## 🔧 Technical Details

### Circuit Breaker States
- **CLOSED** - Normal operation
- **OPEN** - Provider failing, requests blocked
- **HALF_OPEN** - Testing recovery (3 test requests)

### Configuration
```typescript
CIRCUIT_BREAKER = {
  failureThreshold: 5,      // failures before opening
  resetTimeout: 30000,      // 30s before half-open
  halfOpenMaxCalls: 3,      // test calls in half-open
}
```

## 🧪 Testing

All new features covered by comprehensive tests:
```bash
bun test src/core/resilience/provider-health.test.ts
# 20 pass, 0 fail ✅
```

## 🎯 Migration Guide

No breaking changes! Existing configurations work as-is.

To enable multi-provider failover:
```json
// omakase.json
{
  "provider": "anthropic",  // Primary provider
  // Fallback providers auto-detected from env vars
}
```

## 🙏 Thanks

Built with community feedback and inspired by production resilience patterns.

---

**Full Changelog:** [0.1.0...0.2.0](https://github.com/miruamel/omakase/compare/v0.1.0...v0.2.0)
