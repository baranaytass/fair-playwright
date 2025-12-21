# Development Plan - fair-playwright

## Current Status: ~70% Complete

### ✅ Completed
- [x] Basic reporter architecture
- [x] TypeScript types and exports
- [x] AI markdown formatter
- [x] JSON formatter
- [x] Basic console output
- [x] Build system (tsup)
- [x] GitHub Actions CI/CD
- [x] Package structure

### 🚧 In Progress / Broken

## Phase 1: Core Functionality Fixes (Critical)

### 1. MAJOR/MINOR Prefix Parsing
**Priority:** 🔴 Critical
**Status:** Broken
**Task:** StepTracker should parse `[MAJOR]` and `[MINOR]` prefixes from e2e helper

**Files to modify:**
- `src/reporter/StepTracker.ts` - Add prefix detection in `classifyStep()`

**Test:**
```typescript
await e2e.major('Login') // Should be classified as MAJOR
await e2e.minor('Fill form') // Should be classified as MINOR
```

---

### 2. Progressive Terminal Output
**Priority:** 🔴 Critical
**Status:** Not implemented
**Task:** Use log-update for live terminal updates

**Files to modify:**
- `src/formatters/ConsoleFormatter.ts` - Replace console.log with log-update

**Features:**
- Live updating terminal
- Clear completed tests
- Show only current running test
- Summary at the end

---

### 3. OutputBuffer Implementation
**Priority:** 🟡 High
**Status:** Missing
**Task:** Add smart log buffering and compression

**Files to create:**
- `src/reporter/OutputBuffer.ts`

**Features:**
- Buffer logs per worker (parallel execution)
- Compress passed test output
- Preserve failure context
- Memory efficient

---

## Phase 2: Testing & Validation

### 4. Unit Tests
**Priority:** 🟡 High
**Status:** None exist
**Task:** Add tests for core components

**Files to create:**
- `src/reporter/StepTracker.test.ts`
- `src/formatters/ConsoleFormatter.test.ts`
- `src/e2e.test.ts`

**Coverage target:** 80%+

---

### 5. Integration Tests
**Priority:** 🟡 High
**Status:** Placeholder only
**Task:** Real working integration tests

**Files to modify:**
- `test-project/tests/example.spec.ts` - Use e2e helper
- `test-project/package.json` - Remove webServer (no real app)

**Test cases:**
- Basic test with e2e.major/minor
- Nested steps
- Failed tests
- Multiple test suites

---

## Phase 3: Production Hardening

### 6. CI Environment Detection
**Priority:** 🟢 Medium
**Status:** Not implemented
**Task:** Auto-detect CI and disable progressive mode

**Files to modify:**
- `src/formatters/ConsoleFormatter.ts` - Add TTY check
- `src/reporter/FairReporter.ts` - Auto-configure based on env

**Detection:**
- Check `process.stdout.isTTY`
- Check `CI` env variable
- Fallback to simple mode in CI

---

### 7. Error Handling Improvements
**Priority:** 🟢 Medium
**Status:** Basic only
**Task:** Better error messages and edge case handling

**Areas:**
- File write permissions
- Invalid configuration
- Parallel test race conditions
- Missing attachments

---

## Phase 4: Advanced Features (Optional)

### 8. MCP Server
**Priority:** 🟢 Low (Future)
**Status:** Not implemented
**Task:** AI integration via MCP protocol

**Files to create:**
- `src/mcp/server.ts`
- `src/mcp/handlers.ts`

**Features:**
- Query test results
- Stream live progress
- Generate AI summaries

---

### 9. Performance Optimizations
**Priority:** 🟢 Low
**Status:** Good enough
**Task:** Optimize for large test suites (1000+ tests)

**Areas:**
- Reduce memory footprint
- Async I/O improvements
- Stream large outputs

---

## Implementation Order

1. ✅ **MAJOR/MINOR Prefix Parsing** (30 min) - Unblocks core feature
2. ✅ **Progressive Terminal Output** (1 hour) - Major UX improvement
3. ✅ **OutputBuffer** (1 hour) - Needed for parallel tests
4. ✅ **Integration Tests** (30 min) - Validate everything works
5. ✅ **CI Environment Detection** (20 min) - Production ready
6. ✅ **Unit Tests** (1-2 hours) - Quality assurance
7. ⏸️ **MCP Server** (2-3 hours) - Future enhancement
8. ⏸️ **Performance Optimization** (Ongoing)

---

## Success Criteria

- [x] Build passes without errors
- [ ] All integration tests pass
- [ ] e2e.major() and e2e.minor() work correctly
- [ ] Progressive terminal output works
- [ ] AI markdown includes MAJOR/MINOR labels
- [ ] Works in both terminal and CI environments
- [ ] 80%+ test coverage
- [ ] Memory efficient for 100+ tests

---

## Notes

- Each feature must be tested before committing
- Build must pass before each commit
- Integration tests run in test-project/
- Keep dependencies minimal
- Maintain backward compatibility with native test.step()
