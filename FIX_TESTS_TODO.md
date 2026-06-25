# Test Fix TODO - engine.test.ts

## Issue
5 tests failing in `src/core/engine/engine.test.ts` setelah refactoring QueryEngine untuk support ProviderHealthManager.

## Failing Tests
1. `should send message successfully` - Error: "Failed to send message"
2. `should retry on failure` - Error message mismatch
3. `should succeed on retry` - Same issue
4. `should execute tool call` - Tool execution failing
5. `should handle tool execution error` - Same

## Root Cause
- QueryEngine sekarang support `ProviderHealthManager` di constructor
- Mock provider di tests tidak compatible dengan circuit breaker logic
- `mock()` function dari Bun.test tidak track calls dengan benar

## Fix Plan

### Step 1: Update Mock Provider
```typescript
function createMockProvider(
  response: LLMResponse,
  shouldFail = false,
  error?: Error
): LLMProvider {
  let callCount = 0
  
  return {
    name: 'mock',
    sendMessage: async (messages: Message[], tools?: ToolDefinition[]) => {
      callCount++
      if (shouldFail && error) throw error
      return response
    },
    _getCallCount: () => callCount, // For assertions
  }
}
```

### Step 2: Fix Test Assertions
- Gunakan `_getCallCount()` bukan `mock().toHaveBeenCalledTimes()`
- Perbaiki error assertion (gunakan `.toThrow(error)` bukan string)
- Set `maxRetries: 0` untuk test yang tidak butuh retry

### Step 3: Test Tool Execution
- Mock ToolRegistry dengan benar
- Pastikan ToolContext lengkap
- Test error handling

## Priority
**HIGH** - Block other development

## Assigned To
@miruamel

## Estimated Time
30-60 minutes
