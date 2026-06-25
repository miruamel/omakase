# Refactoring Guide

Best practices for refactoring Omakase codebase.

## Refactoring Principles

### 1. Small, Incremental Changes
- Refactor in small commits
- Each commit should pass tests
- Easy to revert if needed

### 2. Test Coverage First
- Ensure tests exist before refactoring
- Add tests if missing
- Never refactor without safety net

### 3. Maintain Behavior
- External behavior should not change
- Only internal structure improves
- Document any intentional behavior changes

## Common Refactoring Patterns

### Extract Function

**Before:**
```typescript
async function sendMessage(messages: Message[]) {
  // 50 lines of mixed logic
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000)
  // ... more code
}
```

**After:**
```typescript
async function sendMessage(messages: Message[]) {
  const controller = createTimeoutController(30000)
  // ... cleaner code
}

function createTimeoutController(timeout: number) {
  const controller = new AbortController()
  setTimeout(() => controller.abort(), timeout)
  return controller
}
```

### Split Large Classes

**Before:**
```typescript
class QueryEngine {
  // 500 lines doing everything
  sendMessage() { }
  retry() { }
  executeTool() { }
  // ...
}
```

**After:**
```typescript
class QueryEngine {
  constructor(
    private sender: MessageSender,
    private retryer: RetryHandler,
    private executor: ToolExecutor
  ) { }
}

class MessageSender { }
class RetryHandler { }
class ToolExecutor { }
```

### Introduce Interface

**Before:**
```typescript
class AnthropicProvider {
  sendMessage(messages, tools) { }
}

class OpenAIProvider {
  sendMessage(messages, tools) { }
}
```

**After:**
```typescript
interface LLMProvider {
  sendMessage(messages: Message[], tools?: ToolDefinition[]): Promise<LLMResponse>
}

class AnthropicProvider implements LLMProvider { }
class OpenAIProvider implements LLMProvider { }
```

## Refactoring Checklist

### Before Refactoring
- [ ] Tests passing
- [ ] Branch created
- [ ] Scope defined
- [ ] Rollback plan ready
- [ ] Team notified (if breaking)

### During Refactoring
- [ ] Small commits
- [ ] Tests passing after each commit
- [ ] No functionality changes (unless intentional)
- [ ] Code review requested

### After Refactoring
- [ ] All tests passing
- [ ] Performance benchmarks OK
- [ ] Documentation updated
- [ ] Changelog updated (if user-facing)
- [ ] Deprecations announced (if breaking)

## Performance Considerations

### Measure Before & After
```bash
# Before
./scripts/benchmark.sh > before.txt

# Refactor...

# After
./scripts/benchmark.sh > after.txt

# Compare
diff before.txt after.txt
```

### Performance Budget
Don't regress beyond:
- Cold start: 500ms
- Memory: 200MB idle
- Test suite: 30s

## Breaking Changes

### Deprecation Process
1. Add `@deprecated` JSDoc tag
2. Add warning logs
3. Wait 1-2 releases
4. Remove in next major version

**Example:**
```typescript
/**
 * @deprecated Use createTimeoutController instead
 */
function oldTimeoutMethod() {
  logger.warn('oldTimeoutMethod is deprecated')
  return createTimeoutController(30000)
}
```

### Migration Guide
Provide migration path:
```markdown
## Migration from v0.1 to v0.2

Old:
```typescript
const engine = new QueryEngine()
```

New:
```typescript
const engine = QueryEngine.createDefault()
```
```

## Code Smells to Watch

### Long Method (>50 lines)
**Fix:** Extract smaller functions

### Large Class (>300 lines)
**Fix:** Split into focused classes

### Feature Envy
```typescript
// Bad - reached into other class
class A {
  method(b: B) {
    return b.internalData.value * 2
  }
}

// Good - ask don't tell
class A {
  method(b: B) {
    return b.getDoubledValue()
  }
}
```

### Duplicate Code
**Fix:** Extract shared function/module

### Primitive Obsession
```typescript
// Bad
function createUser(name: string, email: string, age: number)

// Good
function createUser(profile: UserProfile)
```

## Testing During Refactoring

### Golden Master Test
```typescript
test('refactored behavior matches original', () => {
  const original = originalImplementation(input)
  const refactored = newImplementation(input)
  expect(refactored).toEqual(original)
})
```

### Regression Tests
- Add tests for edge cases
- Test error conditions
- Performance regression tests

## Documentation Updates

### Update These When Refactoring:
- API documentation
- Code comments (JSDoc)
- Architecture diagrams
- Examples in guides

## Tools & Automation

### TypeScript
```bash
# Type check after each change
bun run typecheck
```

### Formatter
```bash
# Keep code consistent
./scripts/format.sh
```

### Linter
```bash
# Catch issues early
./scripts/lint.sh
```

## Case Studies

### Successful Refactoring: Provider Health System

**Before:**
- Scattered retry logic
- No circuit breaker
- Manual failover

**After:**
- Centralized ProviderHealthManager
- Circuit breaker pattern
- Automatic failover

**Benefits:**
- 99.9% uptime
- Better error handling
- Easier to add providers

**Commits:** 14 small commits over 2 days

**Tests Added:** 20 tests

---

**Remember:** Refactoring is investment in future velocity. Do it regularly, do it safely.

**Last Updated:** 2026-06-25
