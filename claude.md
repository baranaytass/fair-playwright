# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**fair-playwright** is an AI-optimized Playwright test reporter with progressive terminal output and hierarchical step management. It delivers structured test results optimized for both human developers and AI code assistants.

## Core Principles

- **AI-First Design**: Structured, parseable output optimized for LLM context
- **Progressive Disclosure**: Clear completed steps, expand current, preserve failures
- **MAJOR/MINOR Step Hierarchy**: The key differentiator - track test flows at two levels
- **Zero Config**: Sensible defaults, opt-in customization
- **Lightweight**: Minimal dependencies, <100KB bundle size
- **Type Safe**: Full TypeScript with exported types

## Architecture

### Package Structure

```
fair-playwright/
├── src/
│   ├── reporter/
│   │   ├── FairReporter.ts      # Main Playwright reporter
│   │   ├── StepTracker.ts       # MAJOR/MINOR step hierarchy tracking
│   │   └── OutputBuffer.ts      # Smart log buffering
│   ├── formatters/
│   │   ├── ConsoleFormatter.ts  # Progressive terminal output
│   │   ├── AIFormatter.ts       # AI-optimized markdown
│   │   └── JSONFormatter.ts     # Machine-readable output
│   ├── mcp/
│   │   └── server.ts            # MCP server for AI integration
│   ├── types/
│   │   └── index.ts             # TypeScript types
│   └── index.ts                 # Main export
├── test-project/                # Local Playwright project for testing
│   ├── tests/
│   │   └── example.spec.ts
│   └── playwright.config.ts
├── .github/
│   └── workflows/
│       ├── ci.yml               # CI/CD pipeline
│       └── release.yml          # Automated releases
└── package.json
```

### Core Components

**Reporter Engine**
- `FairReporter`: Implements Playwright Reporter interface
- `StepTracker`: Hierarchical MAJOR/MINOR step tracking with automatic status detection
- `OutputBuffer`: Smart log compression & context preservation

**Formatters**
- `ConsoleFormatter`: Progressive terminal output with ANSI (fallback for CI)
- `AIFormatter`: Structured markdown for AI consumption
- `JSONFormatter`: Machine-readable output for tooling

**MCP Server**
- Exposes test results and live progress to AI coding assistants
- Integrates with Claude Desktop and other MCP clients

## MAJOR/MINOR Step Concept (Key Feature)

The reporter supports a **two-level hierarchy** for test steps:

- **MAJOR steps**: High-level user flows (e.g., "User logs in", "Checkout process")
- **MINOR steps**: Detailed actions within a major step (e.g., "Fill email", "Click submit")

### Hybrid API Usage

**Option 1: Inline (Quick tests)**
```typescript
import { test } from '@playwright/test'
import { e2e } from 'fair-playwright'

test('user login', async ({ page }) => {
  await e2e.minor('Open login page', async () => {
    await page.goto('/login')
  }, { success: 'Page opened', failure: 'Failed to open page' })
})
```

**Option 2: Declarative (Complex flows)**
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
        await page.goto('/login')
      }
    },
    {
      title: 'Fill credentials',
      success: 'Credentials filled',
      failure: 'Failed to fill',
      action: async () => {
        await page.getByLabel('Email').fill('test@example.com')
        await page.getByLabel('Password').fill('123456')
      }
    },
    {
      title: 'Submit form',
      success: 'Form submitted',
      failure: 'Submit failed',
      action: async () => {
        await page.getByRole('button', { name: 'Login' }).click()
      }
    }
  ]
})
```

### Step Classification (Automatic)

Steps are automatically classified based on:
- Explicit `e2e.major()` or `e2e.minor()` calls
- Playwright's native `test.step()` (treated as MAJOR by default)
- Built-in actions (click, fill, etc.) - treated as MINOR
- Duration thresholds (configurable)

## Configuration

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test'

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
})
```

## Development Commands

### Setup
```bash
npm install
```

### Build
```bash
npm run build          # Build to dist/ (CJS + ESM)
npm run build:watch    # Watch mode
```

### Testing
```bash
npm test               # Run unit tests (Vitest)
npm run test:watch     # Watch mode
npm run test:integration  # Run integration tests in test-project/
```

### Linting & Formatting
```bash
npm run lint           # ESLint
npm run format         # Prettier
npm run typecheck      # TypeScript type checking
```

### Release
```bash
npm run changeset      # Create changeset for release
npm run release        # Automated release (CI only)
```

## Technical Stack

### Dependencies (Minimal)
- `picocolors` (~11KB): Terminal colors (lighter than chalk)
- `log-update`: Terminal refresh for progressive mode
- `@playwright/test`: Peer dependency

### Dev Dependencies
- TypeScript 5.x
- Vitest for unit testing
- TSUp for building (CJS + ESM)
- ESLint + Prettier
- Changesets for versioning

### Build Output
```
dist/
├── index.js          # CommonJS
├── index.mjs         # ES Modules
└── index.d.ts        # TypeScript definitions
```

## Code Quality Standards

- **100% TypeScript**: Strict mode enabled
- **No `any` types**: Except for Playwright's API types when necessary
- **ESLint**: Airbnb base + TypeScript rules
- **Prettier**: 2 space indent, single quotes, trailing commas
- **Test Coverage**: 80%+ for core logic

## Playwright Integration

### Reporter Interface Implementation
```typescript
class FairReporter implements Reporter {
  onBegin(config: FullConfig, suite: Suite): void
  onTestBegin(test: TestCase, result: TestResult): void
  onStepBegin(test: TestCase, result: TestResult, step: TestStep): void
  onStepEnd(test: TestCase, result: TestResult, step: TestStep): void
  onTestEnd(test: TestCase, result: TestResult): void
  onEnd(result: FullResult): Promise<void>
}
```

### Artifact Access
- Screenshots: `result.attachments.filter(a => a.contentType.startsWith('image/'))`
- Traces: `result.attachments.filter(a => a.name === 'trace')`
- Logs: Available via `testInfo.outputDir`

## MCP Server

The package includes an MCP server for AI integration:

### Operations Exposed
- `getTestResults`: Query completed test results
- `streamProgress`: Live test execution progress
- `getAISummary`: AI-optimized failure summaries
- `querySteps`: Search specific test steps

### Usage with Claude Desktop
```json
// claude_desktop_config.json
{
  "mcpServers": {
    "fair-playwright": {
      "command": "npx",
      "args": ["fair-playwright-mcp"]
    }
  }
}
```

## Edge Cases to Handle

### Terminal Handling
- CI environments without TTY → fallback to simple mode
- Terminal width < 80 chars → responsive layout
- Windows vs Unix terminal differences
- No ANSI color support → graceful degradation

### Test Scenarios
- Parallel test execution → separate buffers per worker
- Very long test/step names → intelligent truncation
- Flaky tests with retries → show retry history
- Skipped/todo tests → appropriate visual treatment

### File System
- Permission errors when writing output files
- Concurrent writes from parallel workers
- Cross-platform path resolution

### Memory Management
- Long test runs (1000+ tests)
- Large attachments (videos, traces)
- Progressive mode memory leaks

## CI/CD

### GitHub Actions
- **ci.yml**: Runs on PR - lint, test, build, integration tests
- **release.yml**: Automated npm publish with changesets
- **Platform matrix**: Tests on Linux, macOS, Windows

### Publishing
- Automated via changesets
- npm provenance enabled
- Semantic versioning with conventional commits
- GitHub releases with auto-generated changelogs

## Non-Goals

- ❌ Not a test runner, only a reporter
- ❌ Not replacing Playwright, complementing it
- ❌ Not storing historical data
- ❌ Not providing test mocking or fixtures

## File Organization

- Keep `src/` focused on core reporter logic
- Put formatters in separate files for maintainability
- MCP server is optional but included by default
- Types exported from `src/types/index.ts`
- Integration tests live in `test-project/`

## Performance Requirements

- **Bundle size**: <100KB
- **Test overhead**: Zero impact on test execution time
- **Terminal updates**: Max 10fps to avoid flicker
- **Memory**: Efficient for 1000+ test runs
- **Async I/O**: Non-blocking file writes

---

**Development Philosophy**: Lightweight, flexible, AI-optimized. Focus on the MAJOR/MINOR step hierarchy as the core differentiator. Keep dependencies minimal. Support both inline and declarative APIs for maximum flexibility.
