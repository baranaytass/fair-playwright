# Progressive Output

Learn how fair-playwright's progressive terminal output works.

## What is Progressive Output?

Progressive output is a terminal rendering mode that:

- **Compresses completed steps** to a single line
- **Expands current step** to show details
- **Preserves failed steps** with full context
- **Updates in real-time** during test execution

This keeps developers focused on what's happening **now** rather than scrolling through completed steps.

## How It Works

### Initial State

When a test starts, nothing is shown:

```
Running tests...
```

### First Step Running

The first MAJOR step expands:

```
 MAJOR: User login flow
   Open login page
```

### First Step Complete

Completed steps compress:

```
✓ MAJOR: User login flow (3 steps) → User logged in successfully
```

### Multiple Steps

As tests progress, only current and failed steps are visible:

```
✓ MAJOR: User login flow (3 steps) → User logged in successfully
 MAJOR: Update profile
  ✓ Open profile page
   Upload avatar
```

### Failure

Failed steps expand and remain visible:

```
✓ MAJOR: User login flow (3 steps) → User logged in successfully
✗ MAJOR: Update profile
  ✓ Open profile page
  ✓ Upload avatar
  ✗ Save changes
    Error: Save button not found
  → Update failed
```

## Terminal Rendering

### Symbols

| Symbol | Meaning |
|--------|---------|
|  | Running |
| ✓ | Passed |
| ✗ | Failed |
|  | Skipped |
| → | Result message |

### Colors

- **Green**: Passed steps
- **Red**: Failed steps
- **Yellow**: Running steps
- **Gray**: Skipped steps
- **Blue**: Result messages

### Indentation

- MAJOR steps: No indentation
- MINOR steps: 2 spaces
- Error messages: 4 spaces

## Configuration

### Mode Selection

```typescript
// playwright.config.ts
{
  reporter: [
    ['fair-playwright', {
      mode: 'progressive'  // 'progressive' | 'full' | 'minimal'
    }]
  ]
}
```

### Progressive Options

```typescript
{
  progressive: {
    clearCompleted: true,    // Compress completed steps
    updateInterval: 100,     // Terminal update frequency (ms)
    showTimings: false       // Show step durations
  }
}
```

### With Timings

Enable step durations:

```typescript
{
  progressive: {
    showTimings: true
  }
}
```

**Output:**
```
✓ MAJOR: User login flow (2.3s)
  ✓ Open login page (0.5s)
  ✓ Enter credentials (0.2s)
  ✓ Submit form (1.2s)
  → User logged in successfully
```

## Full Mode

Show all steps, always expanded:

```typescript
{
  mode: 'full'
}
```

**Output:**
```
✓ MAJOR: User login flow
  ✓ Open login page
  ✓ Enter credentials
  ✓ Submit form
  → User logged in successfully

✓ MAJOR: Update profile
  ✓ Open profile page
  ✓ Upload avatar
  ✓ Save changes
  → Profile updated successfully
```

**When to use:**
- Debugging specific tests
- Recording test execution videos
- Detailed CI logs

## Minimal Mode

Show only test names and results:

```typescript
{
  mode: 'minimal'
}
```

**Output:**
```
✓ user can login
✓ user can update profile
✗ user can delete account
```

**When to use:**
- Fast CI feedback
- Many tests (100+)
- Quick smoke tests

## CI Environment Detection

fair-playwright automatically detects CI environments and adjusts:

### Detected Environments

- GitHub Actions
- GitLab CI
- CircleCI
- Travis CI
- Jenkins
- Buildkite

### Automatic Adjustments

1. **No TTY detection**: Falls back to simpler output
2. **Reduced update frequency**: Less terminal flickering
3. **Simpler ANSI codes**: Better compatibility

### Manual Override

```typescript
{
  mode: process.env.CI ? 'minimal' : 'progressive'
}
```

## Terminal Compatibility

### Supported Terminals

- **macOS**: Terminal.app, iTerm2, Hyper
- **Linux**: gnome-terminal, konsole, xterm
- **Windows**: Windows Terminal, ConEmu, Git Bash

### Fallback Behavior

When TTY is not available:
- Progressive mode → Full mode
- Colors → Basic ANSI or none
- Live updates → Line-by-line output

### Testing TTY Support

```bash
node -e "console.log(process.stdout.isTTY)"
# true = TTY supported
# undefined = No TTY (CI, pipe, etc.)
```

## Performance

### Update Frequency

Default: 100ms (10 FPS)

```typescript
{
  progressive: {
    updateInterval: 100  // Adjust for your terminal
  }
}
```

**Guidelines:**
- Fast terminals: 50ms
- Standard terminals: 100ms (default)
- Slow terminals or remote: 200ms

### Memory Usage

Progressive mode uses `log-update` for terminal refreshing:
- Single buffer for output
- Efficient ANSI escape codes
- Minimal memory overhead

### Test Execution Impact

Progressive output has **zero impact** on test execution time:
- Runs in separate thread
- Async I/O operations
- No blocking operations

## Browser Console Integration

fair-playwright captures browser console errors automatically:

```
✗ MAJOR: User login flow
  ✓ Open login page
  ✗ Submit form
    Browser Console Errors:
    - [ERROR] Failed to load resource: net::ERR_CONNECTION_REFUSED
    - [WARN] Unhandled promise rejection
  → Login failed
```

Configure capture:

```typescript
// Tests automatically capture console errors
// No configuration needed
```

## Debugging Output

### Verbose Mode

Enable detailed logging:

```bash
DEBUG=fair-playwright npx playwright test
```

**Output:**
```
[fair-playwright] Starting test: user can login
[fair-playwright] MAJOR step started: User login flow
[fair-playwright] MINOR step started: Open login page
[fair-playwright] MINOR step completed: Open login page (523ms)
...
```

### Log Files

Write output to files for later analysis:

```typescript
{
  output: {
    console: true,
    ai: './test-results/ai-summary.md',
    json: './test-results/results.json'
  }
}
```

## Real-World Examples

### Successful Test Run

```
✓ MAJOR: User registration flow (4.2s)
✓ MAJOR: Email verification (2.1s)
✓ MAJOR: Profile setup (3.5s)

3 passed (9.8s)
```

### Failed Test Run

```
✓ MAJOR: User registration flow (4.2s)
✗ MAJOR: Email verification
  ✓ Request verification email
  ✓ Open email inbox
  ✗ Click verification link
    Error: Element not found: a[href*="verify"]
    Browser Console:
    - [ERROR] 404 Not Found: /api/verify
  → Email verification failed

1 passed, 1 failed (6.3s)
```

### Parallel Execution

With 3 workers:

```
Worker 1: ✓ test-1.spec.ts (3 tests)
Worker 2:  test-2.spec.ts
   MAJOR: Data import
Worker 3: ✓ test-3.spec.ts (5 tests)

8 passed, 1 running
```

## Best Practices

### 1. Use Appropriate Mode

- **Local development**: `progressive`
- **CI with artifacts**: `full`
- **Fast CI feedback**: `minimal`

### 2. Keep Step Counts Reasonable

Progressive works best with:
- 2-10 MAJOR steps per test
- 3-7 MINOR steps per MAJOR
- Total < 50 steps per test

### 3. Meaningful Progress Messages

```typescript
//  Good - Shows progress
success: 'Uploaded 5 files, processing complete'

//  Avoid - No context
success: 'Done'
```

### 4. Terminal Width

Design output for 80+ character terminals:
- Keep titles < 60 characters
- Truncate long messages gracefully

## Troubleshooting

**Issue**: Progressive mode not updating

**Solution**: Check TTY support:
```bash
node -e "console.log(process.stdout.isTTY)"
```

**Issue**: Garbled output in CI

**Solution**: Use minimal mode for CI:
```typescript
{
  mode: process.env.CI ? 'minimal' : 'progressive'
}
```

**Issue**: Terminal flickering

**Solution**: Increase update interval:
```typescript
{
  progressive: {
    updateInterval: 200
  }
}
```

See [Troubleshooting Guide](/guide/troubleshooting) for more.

## Next Steps

- [Configuration](/guide/configuration) - Fine-tune output behavior
- [MCP Integration](/guide/mcp) - AI-optimized output formats
- [Examples](/examples/) - See output in action
