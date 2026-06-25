# Performance Guide

This guide covers Omakase performance characteristics, benchmarks, and optimization tips.

## Performance Targets

| Metric | Target | Current Status |
|--------|--------|----------------|
| Cold Start | <500ms | ✅ ~200-300ms |
| Type Check | <5s | ✅ ~2-3s |
| Test Suite | <30s | ✅ ~10-15s |
| Build | <10s | ✅ ~5-8s |
| Memory (idle) | <200MB | ✅ ~150MB |

## Benchmarking

### Run Benchmarks

```bash
./scripts/benchmark.sh
```

### GitHub CI Benchmarks

Performance is automatically measured on every push via the [Performance Benchmark](../.github/workflows/performance.yml) workflow.

## Optimization Tips

### For Users

1. **Use Local Providers for Development**
   ```json
   {
     "provider": "ollama",
     "ollamaEndpoint": "http://localhost:11434"
   }
   ```
   Reduces API latency and cost during development.

2. **Adjust Health Check Interval**
   ```json
   {
     "healthCheck": {
       "interval": 60000  // 60s instead of default 30s
     }
   }
   ```

3. **Limit Concurrent Agents**
   ```json
   {
     "agents": {
       "maxConcurrent": 2  // Reduce if experiencing slowdowns
     }
   }
   ```

4. **Use Permission Auto-Mode for Safe Operations**
   ```json
   {
     "permissionMode": "auto"
   }
   ```

### For Developers

1. **Lazy Loading**
   Heavy dependencies are loaded on-demand:
   ```typescript
   // Good - lazy load
   const heavyModule = await import('./heavy-module')
   
   // Bad - eager load
   import heavyModule from './heavy-module'
   ```

2. **Avoid Unnecessary Re-renders**
   Use React.memo and useCallback:
   ```typescript
   const MemoizedComponent = React.memo(Component)
   const handler = useCallback(() => {...}, [])
   ```

3. **Efficient File Operations**
   ```typescript
   // Good - batch operations
   await Promise.all(files.map(f => read(f)))
   
   // Bad - sequential
   for (const f of files) await read(f)
   ```

4. **Circuit Breaker Tuning**
   Adjust based on your reliability needs:
   ```json
   {
     "circuitBreaker": {
       "failureThreshold": 3,  // Lower = faster failover
       "resetTimeout": 15000   // Lower = faster recovery test
     }
   }
   ```

## Performance Monitoring

### Startup Time
```bash
time bun run src/entrypoints/cli.tsx --help
```

### Memory Usage
```bash
# Linux
ps -o rss,command -p $(pgrep -f omakase)

# macOS
ps -o rss,command -p $(pgrep -f omakase)
```

### API Latency
Check logs for response times:
```
[INFO] Provider 'anthropic' response: 1.2s
```

## Known Performance Issues

### High Memory Usage
**Symptom:** Memory grows over time
**Cause:** Message history not truncated
**Fix:** Implement message history limits

### Slow Startup
**Symptom:** >1s cold start
**Cause:** Too many eager imports
**Fix:** Audit imports, lazy load heavy modules

### Test Flakiness
**Symptom:** Tests timeout intermittently
**Cause:** Real timers in tests
**Fix:** Use fake timers, mock external calls

## Future Optimizations

- [ ] Response streaming for large completions
- [ ] Incremental type checking
- [ ] Parallel test execution
- [ ] Build artifact caching
- [ ] Provider connection pooling
- [ ] Command buffering and batching

## Performance Regression Policy

Any PR that introduces >20% regression in key metrics requires:
1. Performance justification
2. Optimization plan
3. Maintainer approval

---

**Last Updated:** 2026-06-25
**Benchmark Script:** `scripts/benchmark.sh`
**CI Workflow:** `.github/workflows/performance.yml`
