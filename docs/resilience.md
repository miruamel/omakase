# Resilience & Fault Tolerance

Omakase implements production-grade resilience patterns to ensure reliable operation even when LLM providers experience issues.

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                  ProviderHealthManager                        │
│  - Circuit breaker per provider                              │
│  - Health check polling (30s interval)                       │
│  - Automatic failover chain                                  │
└──────────────────────────────────────────────────────────────┘
                             ↓
┌──────────────────────────────────────────────────────────────┐
│              Failover Chain (Priority Order)                  │
│  Anthropic → OpenAI → Ollama → Nvidia                        │
└──────────────────────────────────────────────────────────────┘
```

## Circuit Breaker Pattern

### States

| State | Behavior | Transition |
|-------|----------|------------|
| **CLOSED** | Normal operation, requests flow through | → OPEN (after 5 failures) |
| **OPEN** | Requests blocked, failover triggered | → HALF_OPEN (after 30s timeout) |
| **HALF_OPEN** | Test requests allowed (max 3) | → CLOSED (on success) or OPEN (on failure) |

### Configuration

```typescript
CIRCUIT_BREAKER = {
  failureThreshold: 5,      // failures before opening
  resetTimeout: 30000,      // ms before trying half-open
  halfOpenMaxCalls: 3,      // test calls in half-open
}
```

## Health Check System

### Automatic Polling

- **Interval:** 30 seconds
- **Timeout:** 5 seconds per provider
- **Method:** Send minimal health check message

### Health Check Response

```typescript
interface ProviderHealthStatus {
  name: string
  state: CircuitState      // CLOSED | OPEN | HALF_OPEN
  failureCount: number
  isHealthy: boolean
  lastHealthCheck?: number
}
```

## Automatic Failover

### Failover Chain

1. **Anthropic** (Primary) - claude-3-opus
2. **OpenAI** (Secondary) - gpt-4-turbo
3. **Ollama** (Local fallback) - llama2
4. **Nvidia** (Alternative) - nemotron-70b

### Failover Logic

```typescript
// QueryEngine automatically handles failover
const response = await queryEngine.sendMessage(messages, tools)
// If primary provider fails → auto-retry with next healthy provider
```

## UI Integration

### StatusBar

Shows real-time provider health:
```
Ready | Providers: 3/4 healthy
```

- **Green:** At least one provider healthy
- **Red:** All providers unhealthy

## Usage

### Manual Provider Control

```typescript
import { ProviderHealthManager } from './core/resilience'

const healthManager = new ProviderHealthManager()

// Register providers
healthManager.registerProvider(anthropicProvider)
healthManager.registerProvider(openaiProvider)

// Start health checks
healthManager.startHealthChecks()

// Get healthy provider (auto-failover)
const provider = await healthManager.getHealthyProvider()

// Manual override
healthManager.setProviderEnabled('anthropic', false)  // Disable
healthManager.setProviderEnabled('anthropic', true)   // Re-enable
healthManager.resetCircuit('anthropic')               // Reset circuit breaker
```

### Monitoring

```typescript
// Get all provider statuses
const statuses = healthManager.getProviderStatuses()

// Example output:
[
  { name: 'anthropic', state: 'CLOSED', isHealthy: true },
  { name: 'openai', state: 'CLOSED', isHealthy: true },
  { name: 'ollama', state: 'OPEN', isHealthy: false },  // Tripped
  { name: 'nvidia', state: 'CLOSED', isHealthy: true },
]
```

## Error Handling

### Timeout Protection

- **Provider request timeout:** 30 seconds
- **Health check timeout:** 5 seconds
- **Agent execution timeout:** Configurable (default 60s)

### Error Recovery

1. **Transient errors** → Automatic retry with backoff
2. **Persistent errors** → Circuit breaker trips, failover triggered
3. **All providers down** → User notified, manual intervention required

## Best Practices

### For Users

1. **Configure multiple providers** in `omakase.json` for redundancy
2. **Monitor StatusBar** for provider health indicators
3. **Check logs** for failover events: `Provider failover successful`

### For Developers

1. **Always use** `ProviderHealthManager` for provider access
2. **Handle** `TimeoutError` gracefully
3. **Log** provider switches for observability
4. **Test** failover scenarios in staging

## Testing

Run provider health tests:
```bash
bun test src/core/resilience/provider-health.test.ts
```

### Test Coverage

- ✅ Circuit breaker state transitions
- ✅ Automatic failover logic
- ✅ Health check polling
- ✅ Manual provider enable/disable
- ✅ Circuit breaker reset
- ✅ Failover chain priority

## Future Enhancements

- [ ] Provider latency tracking and ranking
- [ ] Geographic-based provider selection
- [ ] Cost-aware failover (cheapest healthy provider)
- [ ] Predictive health checks (ML-based failure prediction)
- [ ] Provider-specific retry strategies

## Related

- [Architecture](architecture.md) - System overview
- [Providers](providers.md) - Provider configuration
- [Configuration](configuration.md) - Settings reference
