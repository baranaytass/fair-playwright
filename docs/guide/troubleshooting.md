# Troubleshooting

Common issues and solutions when using fair-playwright.

## Installation Issues

### Package Not Found

**Problem:**
```bash
npm ERR! 404 Not Found - GET https://registry.npmjs.org/fair-playwright
```

**Solution:**
```bash
# Ensure correct package name
npm install -D fair-playwright

# Check npm registry
npm view fair-playwright

# Clear npm cache if needed
npm cache clean --force
npm install -D fair-playwright
```

### TypeScript Types Missing

**Problem:**
```typescript
import { e2e } from 'fair-playwright';
// Cannot find module 'fair-playwright' or its corresponding type declarations
```

**Solution:**
```bash
# Reinstall with types
npm install -D fair-playwright

# Verify package.json includes types
cat node_modules/fair-playwright/package.json | grep "types"

# Restart TypeScript server in VS Code
# Cmd+Shift+P → "TypeScript: Restart TS Server"
```

### Build Errors

**Problem:**
```
Error: Cannot find module './dist/index.js'
```

**Solution:**

The package includes pre-built files. If you're installing from GitHub:

```bash
# Install from npm (recommended)
npm install -D fair-playwright

# Or build from source
cd node_modules/fair-playwright
npm install
npm run build
```

## Configuration Issues

### Reporter Not Running

**Problem:**
Tests run but no fair-playwright output appears.

**Solution:**

Check `playwright.config.ts`:

```typescript
// ❌ Wrong
export default defineConfig({
  reporter: 'fair-playwright'  // String format may not work
});

// ✅ Correct
export default defineConfig({
  reporter: [['fair-playwright']]  // Array format
});
```

### Configuration Not Applied

**Problem:**
Configuration options seem ignored.

**Solution:**

```typescript
// ✅ Correct format
export default defineConfig({
  reporter: [
    ['fair-playwright', {
      mode: 'progressive',
      aiOptimized: true
    }]
  ]
});

// Verify config is loaded
npx playwright test --reporter=fair-playwright
```

### Multiple Reporters Conflict

**Problem:**
fair-playwright conflicts with other reporters.

**Solution:**

Order matters:

```typescript
export default defineConfig({
  reporter: [
    ['fair-playwright'],   // fair-playwright first
    ['html'],              // Then other reporters
    ['json', { outputFile: 'results.json' }]
  ]
});
```

## Runtime Issues

### Progressive Mode Not Working

**Problem:**
Progressive mode shows full output instead of compressing.

**Solution:**

Check TTY support:

```bash
# Test TTY
node -e "console.log('TTY:', process.stdout.isTTY)"
# Should output: TTY: true

# If false, progressive mode won't work
# Use full or minimal mode instead
```

Update config for non-TTY:

```typescript
export default defineConfig({
  reporter: [
    ['fair-playwright', {
      mode: process.stdout.isTTY ? 'progressive' : 'full'
    }]
  ]
});
```

### Terminal Output Garbled

**Problem:**
Weird characters or garbled output in terminal.

**Solution:**

1. Check terminal ANSI support:
```bash
echo -e "\033[32mGreen\033[0m"
```

2. Update terminal emulator
3. Set TERM environment:
```bash
export TERM=xterm-256color
npx playwright test
```

4. Use minimal mode for problematic terminals:
```typescript
{
  mode: 'minimal'
}
```

### Steps Not Showing

**Problem:**
e2e.major() or e2e.minor() calls not appearing in output.

**Solution:**

Verify reporter is configured:

```typescript
// Make sure you imported from fair-playwright
import { e2e } from 'fair-playwright';  // ✅

// Not from @playwright/test
import { test } from '@playwright/test';  // This is correct
import { test as e2e } from '@playwright/test';  // ❌ Wrong
```

Verify steps are awaited:

```typescript
// ❌ Missing await
test('my test', async ({ page }) => {
  e2e.major('Step', { ... });  // Won't work!
});

// ✅ With await
test('my test', async ({ page }) => {
  await e2e.major('Step', { ... });  // Works!
});
```

### Browser Console Errors Not Captured

**Problem:**
Browser console errors not showing in output.

**Solution:**

fair-playwright automatically captures console errors. If not showing:

```typescript
// Explicitly listen (already done by fair-playwright)
page.on('console', msg => {
  if (msg.type() === 'error') {
    console.error('Browser error:', msg.text());
  }
});

// Check if browser is headless
// Console capture works best in headless mode
export default defineConfig({
  use: {
    headless: true  // Recommended for console capture
  }
});
```

## MCP Server Issues

### MCP Server Not Starting

**Problem:**
Claude Desktop doesn't show fair-playwright MCP server.

**Solution:**

1. Verify config location:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

2. Check JSON syntax:
```json
{
  "mcpServers": {
    "fair-playwright": {
      "command": "npx",
      "args": ["fair-playwright-mcp"],
      "env": {
        "FAIR_PLAYWRIGHT_RESULTS": "/absolute/path/to/results"
      }
    }
  }
}
```

3. Use absolute paths (not relative):
```json
// ❌ Wrong
"FAIR_PLAYWRIGHT_RESULTS": "./test-results"

// ✅ Correct
"FAIR_PLAYWRIGHT_RESULTS": "/Users/you/project/test-results"
```

4. Restart Claude Desktop completely

5. Check logs:
```bash
tail -f ~/Library/Logs/Claude/mcp.log
```

### Results Not Found

**Problem:**
```
Error: Test results not found at path: ...
```

**Solution:**

1. Run tests first to generate results:
```bash
npx playwright test
```

2. Verify path exists:
```bash
ls -la /path/to/test-results
```

3. Check write permissions:
```bash
ls -ld /path/to/test-results
# Should show write permissions (drwxr-xr-x)
```

4. Generate JSON output:
```typescript
export default defineConfig({
  reporter: [
    ['fair-playwright', {
      output: {
        json: './test-results/results.json'  // Required for MCP
      }
    }]
  ]
});
```

### MCP Server Crashes

**Problem:**
MCP server crashes on startup or during queries.

**Solution:**

Run with verbose mode:

```bash
npx fair-playwright-mcp --verbose
```

Check Node.js version:

```bash
node --version
# Should be >= 18
```

Verify package installation:

```bash
npm list fair-playwright
# Should show installed version
```

## Performance Issues

### Tests Running Slowly

**Problem:**
Tests seem slower with fair-playwright.

**Solution:**

fair-playwright should have **zero impact** on test speed. If tests are slow:

1. Measure baseline:
```bash
# Without fair-playwright
npx playwright test --reporter=list

# With fair-playwright
npx playwright test --reporter=fair-playwright
```

2. Check update interval:
```typescript
{
  progressive: {
    updateInterval: 100  // Increase if terminal is slow
  }
}
```

3. Use minimal mode for many tests:
```typescript
{
  mode: process.env.CI ? 'minimal' : 'progressive'
}
```

### High Memory Usage

**Problem:**
Memory usage increases during test runs.

**Solution:**

1. Limit output file writes:
```typescript
{
  output: {
    console: true,
    ai: false,        // Disable if not needed
    json: false       // Disable if not needed
  }
}
```

2. Use progressive mode to compress output:
```typescript
{
  mode: 'progressive',
  progressive: {
    clearCompleted: true  // Compress completed steps
  }
}
```

## CI/CD Issues

### GitHub Actions

**Problem:**
Progressive mode doesn't work in GitHub Actions.

**Solution:**

Use conditional config:

```typescript
export default defineConfig({
  reporter: [
    ['fair-playwright', {
      mode: process.env.CI ? 'full' : 'progressive'
    }]
  ]
});
```

Or check GitHub-specific env:

```typescript
{
  mode: process.env.GITHUB_ACTIONS ? 'minimal' : 'progressive'
}
```

### GitLab CI

**Problem:**
ANSI colors not showing correctly.

**Solution:**

Enable color output:

```yaml
# .gitlab-ci.yml
test:
  script:
    - npx playwright test
  variables:
    FORCE_COLOR: "1"
```

### Docker

**Problem:**
TTY issues in Docker containers.

**Solution:**

Run with TTY flag:

```bash
docker run -it your-image npx playwright test
```

Or use full mode:

```typescript
{
  mode: 'full'  // Always works in Docker
}
```

## Common Errors

### Error: "Reporter is not a constructor"

**Problem:**
```
Error: Reporter is not a constructor
```

**Solution:**

Update Playwright:

```bash
npm install -D @playwright/test@latest
```

Verify compatibility:
- Playwright >= 1.40.0
- Node.js >= 18

### Error: "Cannot read property 'steps'"

**Problem:**
```
TypeError: Cannot read property 'steps' of undefined
```

**Solution:**

Ensure steps array is provided:

```typescript
// ❌ Missing steps
await e2e.major('Title', {
  success: 'Done',
  failure: 'Failed'
});

// ✅ With steps
await e2e.major('Title', {
  success: 'Done',
  failure: 'Failed',
  steps: []  // Can be empty
});
```

### Error: "Module not found"

**Problem:**
```
Error: Cannot find module 'fair-playwright'
```

**Solution:**

Check import path:

```typescript
// ✅ Correct
import { e2e } from 'fair-playwright';

// ❌ Wrong
import { e2e } from 'fair-playwright/e2e';
import { e2e } from '@fair-playwright';
```

Reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
```

## Getting Help

### Before Opening an Issue

1. Check this troubleshooting guide
2. Search [existing issues](https://github.com/baranaytass/fair-playwright/issues)
3. Verify your environment:
   ```bash
   node --version
   npm list @playwright/test
   npm list fair-playwright
   ```

### Creating an Issue

Include:

1. **Environment:**
   - OS and version
   - Node.js version
   - Playwright version
   - fair-playwright version

2. **Configuration:**
   ```typescript
   // Your playwright.config.ts
   ```

3. **Minimal reproduction:**
   ```typescript
   // Minimal test that shows the issue
   ```

4. **Expected vs actual behavior**

5. **Screenshots or logs** (if applicable)

### Getting Support

- **GitHub Issues**: [Report bugs](https://github.com/baranaytass/fair-playwright/issues)
- **Documentation**: Check all [guide pages](/guide/)
- **Examples**: See [examples directory](/examples/)

## Debug Mode

Enable debug logging:

```bash
# Set debug environment variable
DEBUG=fair-playwright npx playwright test

# Or use verbose logging
DEBUG=fair-playwright:* npx playwright test
```

Output:
```
[fair-playwright] Initializing reporter
[fair-playwright] Mode: progressive
[fair-playwright] Test started: user can login
[fair-playwright] MAJOR step: User login flow
[fair-playwright:formatter] Updating terminal output
...
```

## Next Steps

- [Configuration](/guide/configuration) - Fine-tune settings
- [Examples](/examples/) - See working examples
- [GitHub Issues](https://github.com/baranaytass/fair-playwright/issues) - Report bugs
