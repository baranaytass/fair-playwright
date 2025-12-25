# API Reference

Complete API documentation for fair-playwright.

## Overview

fair-playwright provides three main interfaces:

1. **[FairReporter](/api/reporter)** - Playwright custom reporter
2. **[E2E Helper](/api/e2e-helper)** - Test organization API
3. **[MCP Server](/api/mcp-server)** - AI assistant integration

## Quick Reference

### Reporter

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [
    ['fair-playwright', {
      mode: 'progressive',
      aiOptimized: true,
      output: {
        console: true,
        ai: './test-results/ai-summary.md',
        json: './test-results/results.json'
      }
    }]
  ]
});
```

### E2E Helper

```typescript
import { e2e } from 'fair-playwright';

// MAJOR step
await e2e.major('Title', {
  success: 'Success message',
  failure: 'Failure message',
  steps: [/* ... */]
});

// MINOR step
await e2e.minor('Title', async () => {
  // Action here
}, {
  success: 'Success message',
  failure: 'Failure message'
});
```

### MCP Server

```bash
# Start server
npx fair-playwright-mcp --results-path ./test-results

# With environment variable
export FAIR_PLAYWRIGHT_RESULTS=/path/to/results
npx fair-playwright-mcp
```

## Exports

### Main Exports

```typescript
import {
  e2e,              // E2E helper singleton
  E2EHelper,        // E2E helper class
  FairReporter,     // Reporter class
  createMCPServer   // MCP server factory
} from 'fair-playwright';
```

### Type Exports

```typescript
import type {
  FairReporterConfig,
  MajorStepOptions,
  MinorStepOptions,
  StepDefinition,
  TestMetadata,
  StepMetadata,
  OutputMode,
  MCPServerConfig
} from 'fair-playwright';
```

## Core Concepts

### Reporter Lifecycle

```typescript
class FairReporter implements Reporter {
  onBegin(config: FullConfig, suite: Suite): void;
  onTestBegin(test: TestCase, result: TestResult): void;
  onStepBegin(test: TestCase, result: TestResult, step: TestStep): void;
  onStepEnd(test: TestCase, result: TestResult, step: TestStep): void;
  onTestEnd(test: TestCase, result: TestResult): void;
  onEnd(result: FullResult): Promise<void>;
}
```

### Step Hierarchy

```
Test
└── MAJOR Step
    ├── MINOR Step 1
    ├── MINOR Step 2
    └── MINOR Step 3
```

### Output Flow

```
Reporter → StepTracker → Formatter → Output
                      ├→ Console
                      ├→ AI Summary (Markdown)
                      └→ JSON File
```

## Configuration Schema

```typescript
interface FairReporterConfig {
  mode?: 'progressive' | 'full' | 'minimal';
  aiOptimized?: boolean;
  output?: {
    console?: boolean;
    ai?: string | false;
    json?: string | false;
  };
  stepClassification?: {
    durationThreshold?: number;
    autoDetect?: boolean;
  };
  progressive?: {
    clearCompleted?: boolean;
    updateInterval?: number;
    showTimings?: boolean;
  };
}
```

## Default Values

```typescript
const defaults: FairReporterConfig = {
  mode: 'progressive',
  aiOptimized: true,
  output: {
    console: true,
    ai: false,
    json: false
  },
  stepClassification: {
    durationThreshold: 1000,
    autoDetect: true
  },
  progressive: {
    clearCompleted: true,
    updateInterval: 100,
    showTimings: false
  }
};
```

## TypeScript Support

fair-playwright is written in TypeScript with full type definitions:

```typescript
import { test } from '@playwright/test';
import { e2e } from 'fair-playwright';
import type { MajorStepOptions } from 'fair-playwright';

test('typed test', async ({ page }) => {
  const options: MajorStepOptions = {
    success: 'Login successful',
    failure: 'Login failed',
    steps: [
      {
        title: 'Open page',
        success: 'Page opened',
        action: async () => {
          await page.goto('/login');
        }
      }
    ]
  };

  await e2e.major('User login', options);
});
```

## Error Handling

All APIs use Playwright's error handling:

```typescript
try {
  await e2e.major('Workflow', {
    steps: [
      {
        title: 'Action',
        success: 'Done',
        action: async () => {
          // If this throws, step fails
          await page.click('.not-exist');
        }
      }
    ],
    success: 'Success',
    failure: 'Failed'  // This message shown on error
  });
} catch (error) {
  // Error is caught and reported by fair-playwright
  // Test fails with proper context
}
```

## Async/Await

All e2e methods are async and must be awaited:

```typescript
//  Correct
await e2e.major('Step', { ... });
await e2e.minor('Action', async () => {}, { ... });

//  Wrong - will not work
e2e.major('Step', { ... });
e2e.minor('Action', async () => {}, { ... });
```

## Performance

### Zero Overhead

- Reporter runs in separate thread
- Non-blocking I/O
- Efficient memory usage
- No impact on test execution

### Benchmarks

```
Standard Playwright: 45.2s
With fair-playwright: 45.3s
Overhead: 0.1s (0.2%)

Memory usage: +2MB avg
Bundle size: 28KB compressed
```

## Browser Support

Works with all Playwright-supported browsers:

- Chromium
- Firefox
- WebKit
- Electron
- Android
- Custom browsers

## Platform Support

- **Node.js**: >= 18
- **OS**: macOS, Linux, Windows
- **CI**: GitHub Actions, GitLab CI, CircleCI, etc.
- **Terminal**: Any TTY-compatible terminal

## Versioning

fair-playwright follows [Semantic Versioning](https://semver.org/):

- **Major**: Breaking changes
- **Minor**: New features (backward compatible)
- **Patch**: Bug fixes

Current version: 1.1.0

## Migration

See [Migration Guide](/guide/migration) for upgrading between versions.

## Next Steps

- [FairReporter API](/api/reporter) - Reporter configuration
- [E2E Helper API](/api/e2e-helper) - Test organization
- [MCP Server API](/api/mcp-server) - AI integration
- [TypeScript Types](/api/types) - Type definitions
