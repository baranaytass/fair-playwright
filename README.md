# fair-playwright

> AI-optimized Playwright test reporter with progressive terminal output and hierarchical step management

[![npm version](https://img.shields.io/npm/v/fair-playwright.svg)](https://www.npmjs.com/package/fair-playwright)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🤖 **AI-First Design** - Structured output optimized for LLM context and AI code assistants
- 📊 **MAJOR/MINOR Step Hierarchy** - Track test flows at two levels for better organization
- ⚡ **Progressive Terminal Output** - Live updates with smart compression
- 🎯 **Zero Config** - Sensible defaults, works out of the box
- 🪶 **Lightweight** - Minimal dependencies, <100KB bundle size
- 🔒 **Type Safe** - Full TypeScript support with exported types
- 🔌 **MCP Server** - Built-in integration for AI coding assistants

## Installation

```bash
npm install -D fair-playwright
```

## Quick Start

### 1. Configure Playwright

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [['fair-playwright']]
});
```

### 2. Write Tests with Step Hierarchy

**Inline Mode (Quick tests):**

```typescript
import { test } from '@playwright/test';
import { e2e } from 'fair-playwright';

test('user login', async ({ page }) => {
  await e2e.minor('Open login page', async () => {
    await page.goto('/login');
  }, { success: 'Page opened', failure: 'Failed to open' });

  await e2e.minor('Fill credentials', async () => {
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
  }, { success: 'Filled', failure: 'Failed to fill' });

  await e2e.minor('Submit form', async () => {
    await page.getByRole('button', { name: 'Login' }).click();
  }, { success: 'Submitted', failure: 'Failed to submit' });
});
```

**Declarative Mode (Complex flows):**

```typescript
await e2e.major('User login flow', {
  success: 'User logged in successfully',
  failure: 'Login failed',
  steps: [
    {
      title: 'Open login page',
      success: 'Page opened',
      failure: 'Failed to open',
      action: async () => {
        await page.goto('/login');
      }
    },
    {
      title: 'Fill credentials',
      success: 'Credentials filled',
      failure: 'Failed to fill',
      action: async () => {
        await page.getByLabel('Email').fill('test@example.com');
        await page.getByLabel('Password').fill('password123');
      }
    },
    {
      title: 'Submit form',
      success: 'Form submitted',
      failure: 'Failed to submit',
      action: async () => {
        await page.getByRole('button', { name: 'Login' }).click();
      }
    }
  ]
});
```

## Configuration

```typescript
// playwright.config.ts
export default defineConfig({
  reporter: [
    ['fair-playwright', {
      mode: 'progressive',          // 'progressive' | 'full' | 'minimal'
      aiOptimized: true,
      output: {
        console: true,
        ai: './test-results/ai-summary.md',
        json: './test-results/results.json'
      },
      stepClassification: {
        durationThreshold: 1000,    // Steps > 1s are MAJOR
        autoDetect: true
      },
      progressive: {
        clearCompleted: true,
        updateInterval: 100         // ms
      }
    }]
  ]
});
```

## MAJOR vs MINOR Steps

- **MAJOR steps**: High-level user flows (e.g., "User logs in", "Checkout process")
- **MINOR steps**: Detailed actions within a major step (e.g., "Fill email", "Click submit")

This two-level hierarchy helps both humans and AI understand test structure at a glance.

## MCP Server Integration

Fair-playwright includes a full **Model Context Protocol (MCP)** server for AI assistant integration.

### Features

The MCP server exposes:
- **3 Resources**: Test results, summary, and failure details
- **5 Tools**: Query tests, filter by status, get step details, and more
- **Streaming Support**: Real-time test result updates

### Setup with Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "fair-playwright": {
      "command": "npx",
      "args": ["fair-playwright-mcp"],
      "env": {
        "FAIR_PLAYWRIGHT_RESULTS": "./test-results/results.json"
      }
    }
  }
}
```

### Available Resources

- `fair-playwright://test-results` - Complete test execution data (JSON)
- `fair-playwright://test-summary` - AI-optimized summary (Markdown)
- `fair-playwright://failures` - Detailed failure information (Markdown)

### Available Tools

- `get_test_results` - Get all test results with full details
- `get_failure_summary` - Get AI-optimized failure summary
- `query_test` - Search for specific test by title
- `get_tests_by_status` - Filter tests by passed/failed/skipped
- `get_step_details` - Get MAJOR/MINOR step details for a test

### CLI Options

```bash
npx fair-playwright-mcp --help
npx fair-playwright-mcp --results-path ./custom-results.json --verbose
```

## Output Examples

### Terminal (Progressive Mode)

```
✓ Authentication (2/2 tests, 1.2s)

⏳ Payment Processing (1/3 tests)
  ✓ Validate cart (234ms)
  ⟳ Process payment (running 2.1s)
    Step 1/4: Navigate to checkout ✓
    Step 2/4: Fill payment form ✓
    Step 3/4: Submit payment ⟳

⏸ Remaining: Order Confirmation (0/2 tests)
```

### AI-Optimized Output (Markdown)

Generates structured markdown summaries perfect for AI analysis:

```markdown
# Test Results: E2E Payment Flow

**Status**: ❌ FAILED (2/3 test suites passed)
**Duration**: 15.4s

## ✅ Authentication Suite (2/2 tests, 1.2s)
All tests passed.

## ❌ Payment Processing (1/2 tests, 8.3s)

### ❌ Payment Submission (5.1s - FAILED)

**Error**: Timeout waiting for element
**Location**: tests/payment.spec.ts:45:12

**Steps Executed**:
1. ✅ Navigate to /checkout (189ms)
2. ✅ Fill payment form (456ms)
3. ❌ Click submit button - Element not found

**Artifacts**:
- Screenshot: ./test-results/payment-fail-001.png
- Trace: ./test-results/trace.zip
```

## Why fair-playwright?

- **For Developers**: Progressive output keeps you focused on what matters
- **For AI**: Structured markdown summaries help AI understand test failures instantly
- **For Teams**: Hierarchical steps document test flows automatically

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Run integration tests
npm run test:integration
```

## License

MIT © [Baran Aytas](https://github.com/baranaytass)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Links

- [GitHub Repository](https://github.com/baranaytass/fair-playwright)
- [Issue Tracker](https://github.com/baranaytass/fair-playwright/issues)
- [npm Package](https://www.npmjs.com/package/fair-playwright)
