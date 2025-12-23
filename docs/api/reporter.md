# FairReporter API

Custom Playwright reporter with progressive output and AI optimization.

## Usage

### Basic Setup

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [['fair-playwright']]
});
```

### With Configuration

```typescript
export default defineConfig({
  reporter: [
    ['fair-playwright', {
      mode: 'progressive',
      aiOptimized: true,
      output: {
        console: true,
        ai: './test-results/ai-summary.md',
        json: './test-results/results.json'
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
    }]
  ]
});
```

## Configuration

### FairReporterConfig

```typescript
interface FairReporterConfig {
  mode?: OutputMode;
  aiOptimized?: boolean;
  output?: OutputConfig;
  stepClassification?: StepClassificationConfig;
  progressive?: ProgressiveConfig;
}
```

### mode

Output rendering mode.

- **Type**: `'progressive' | 'full' | 'minimal'`
- **Default**: `'progressive'`

```typescript
{
  mode: 'progressive'
}
```

**Values:**

| Mode | Description | Use Case |
|------|-------------|----------|
| `progressive` | Smart compression, live updates | Local development |
| `full` | All steps always visible | Debugging, CI with artifacts |
| `minimal` | Test names and results only | Fast CI feedback |

**Example:**

```typescript
{
  mode: process.env.CI ? 'minimal' : 'progressive'
}
```

### aiOptimized

Enable AI-optimized output formats.

- **Type**: `boolean`
- **Default**: `true`

```typescript
{
  aiOptimized: true
}
```

**When enabled:**
- Generates structured markdown summaries
- Optimizes for LLM context windows
- Enables MCP server integration
- Adds semantic markup

**When disabled:**
- Simpler output format
- Smaller file sizes
- Faster processing

### output

Configure output destinations.

- **Type**: `OutputConfig`
- **Default**: `{ console: true, ai: false, json: false }`

```typescript
interface OutputConfig {
  console?: boolean;
  ai?: string | false;
  json?: string | false;
}
```

**Properties:**

#### console

Write to terminal.

- **Type**: `boolean`
- **Default**: `true`

```typescript
{
  output: {
    console: true
  }
}
```

#### ai

AI-optimized markdown output path.

- **Type**: `string | false`
- **Default**: `false`

```typescript
{
  output: {
    ai: './test-results/ai-summary.md'
  }
}
```

**Generated file format:**

```markdown
# Test Run Summary

**Date**: 2024-12-23T10:30:00Z
**Duration**: 45.2s
**Status**: ✓ PASSED

## Overview
- Total: 15 tests
- Passed: 15
- Failed: 0

## Test Details

### ✓ user can login
**File**: tests/auth.spec.ts:10
**Duration**: 2.3s

#### MAJOR: User login flow ✓
- Open login page ✓
- Enter credentials ✓
- Submit form ✓
Result: User logged in successfully
```

#### json

JSON output path.

- **Type**: `string | false`
- **Default**: `false`

```typescript
{
  output: {
    json: './test-results/results.json'
  }
}
```

**Generated file format:**

```json
{
  "summary": {
    "total": 15,
    "passed": 15,
    "failed": 0,
    "skipped": 0,
    "duration": 45200,
    "startTime": "2024-12-23T10:30:00.000Z"
  },
  "tests": [
    {
      "name": "user can login",
      "file": "tests/auth.spec.ts",
      "line": 10,
      "status": "passed",
      "duration": 2300,
      "steps": [
        {
          "type": "MAJOR",
          "title": "User login flow",
          "status": "passed",
          "duration": 2300,
          "minorSteps": [
            {
              "title": "Open login page",
              "status": "passed",
              "duration": 500
            }
          ]
        }
      ]
    }
  ]
}
```

### stepClassification

Control automatic step classification.

- **Type**: `StepClassificationConfig`

```typescript
interface StepClassificationConfig {
  durationThreshold?: number;
  autoDetect?: boolean;
}
```

#### durationThreshold

Steps longer than this (ms) are classified as MAJOR.

- **Type**: `number`
- **Default**: `1000`
- **Unit**: milliseconds

```typescript
{
  stepClassification: {
    durationThreshold: 1000
  }
}
```

**Behavior:**
- Steps > threshold → MAJOR
- Steps ≤ threshold → MINOR
- Explicit `e2e.major()` → Always MAJOR
- Explicit `e2e.minor()` → Always MINOR

#### autoDetect

Automatically classify steps based on duration.

- **Type**: `boolean`
- **Default**: `true`

```typescript
{
  stepClassification: {
    autoDetect: true
  }
}
```

**When enabled:**
- Uses duration threshold
- Analyzes step patterns
- Smart classification

**When disabled:**
- Only explicit `e2e.major/minor` calls
- `test.step()` treated as MAJOR

### progressive

Fine-tune progressive mode behavior.

- **Type**: `ProgressiveConfig`

```typescript
interface ProgressiveConfig {
  clearCompleted?: boolean;
  updateInterval?: number;
  showTimings?: boolean;
}
```

#### clearCompleted

Compress completed steps to single line.

- **Type**: `boolean`
- **Default**: `true`

```typescript
{
  progressive: {
    clearCompleted: true
  }
}
```

**When true:**
```
✓ MAJOR: User login flow (3 steps) → User logged in
```

**When false:**
```
✓ MAJOR: User login flow
  ✓ Open login page
  ✓ Enter credentials
  ✓ Submit form
  → User logged in
```

#### updateInterval

Terminal update frequency in milliseconds.

- **Type**: `number`
- **Default**: `100`
- **Unit**: milliseconds
- **Range**: `50` - `1000`

```typescript
{
  progressive: {
    updateInterval: 100
  }
}
```

**Guidelines:**
- **50ms**: Fast terminals (10-20 FPS)
- **100ms**: Standard (default)
- **200ms**: Slow terminals or remote
- **500ms**: Very slow connections

#### showTimings

Show step duration in output.

- **Type**: `boolean`
- **Default**: `false`

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
```

## Reporter Lifecycle

### Interface

```typescript
class FairReporter implements Reporter {
  constructor(config?: FairReporterConfig);
  onBegin(config: FullConfig, suite: Suite): void;
  onTestBegin(test: TestCase, result: TestResult): void;
  onStepBegin(test: TestCase, result: TestResult, step: TestStep): void;
  onStepEnd(test: TestCase, result: TestResult, step: TestStep): void;
  onTestEnd(test: TestCase, result: TestResult): void;
  onEnd(result: FullResult): Promise<void>;
}
```

### Hooks

#### onBegin

Called once before test run starts.

```typescript
onBegin(config: FullConfig, suite: Suite): void
```

**Actions:**
- Initialize formatters
- Setup output streams
- Log test summary

#### onTestBegin

Called when each test starts.

```typescript
onTestBegin(test: TestCase, result: TestResult): void
```

**Actions:**
- Start test tracking
- Initialize step hierarchy
- Update progress

#### onStepBegin

Called when each step starts.

```typescript
onStepBegin(test: TestCase, result: TestResult, step: TestStep): void
```

**Actions:**
- Track step start time
- Classify MAJOR/MINOR
- Update live output

#### onStepEnd

Called when each step completes.

```typescript
onStepEnd(test: TestCase, result: TestResult, step: TestStep): void
```

**Actions:**
- Calculate duration
- Record success/failure
- Update terminal

#### onTestEnd

Called when each test completes.

```typescript
onTestEnd(test: TestCase, result: TestResult): void
```

**Actions:**
- Finalize test metadata
- Compress completed steps
- Capture artifacts

#### onEnd

Called once after all tests complete.

```typescript
onEnd(result: FullResult): Promise<void>
```

**Actions:**
- Generate AI summary
- Write JSON output
- Print final statistics

## Multiple Reporters

### Combine with Other Reporters

```typescript
export default defineConfig({
  reporter: [
    ['fair-playwright', { mode: 'progressive' }],
    ['html'],
    ['json', { outputFile: 'results.json' }],
    ['junit', { outputFile: 'junit.xml' }]
  ]
});
```

### Order Matters

fair-playwright should be first for best output:

```typescript
// ✅ Recommended
reporter: [
  ['fair-playwright'],  // First
  ['html']
]

// ⚠️ May interfere
reporter: [
  ['list'],             // list reporter may conflict
  ['fair-playwright']
]
```

## Environment Detection

### CI Environments

Automatically detected:

- GitHub Actions (`GITHUB_ACTIONS`)
- GitLab CI (`GITLAB_CI`)
- CircleCI (`CIRCLECI`)
- Travis CI (`TRAVIS`)
- Jenkins (`JENKINS_HOME`)
- Buildkite (`BUILDKITE`)

### TTY Detection

```typescript
const isTTY = process.stdout.isTTY;

// Automatically adjusts:
// - No TTY → Fallback to full mode
// - CI → Simpler ANSI codes
// - Reduced update frequency
```

### Manual Override

```typescript
{
  mode: process.env.CI
    ? 'minimal'
    : process.stdout.isTTY
      ? 'progressive'
      : 'full'
}
```

## Examples

### Development

```typescript
export default defineConfig({
  reporter: [
    ['fair-playwright', {
      mode: 'progressive',
      progressive: {
        showTimings: true,
        updateInterval: 100
      }
    }]
  ]
});
```

### CI with Artifacts

```typescript
export default defineConfig({
  reporter: [
    ['fair-playwright', {
      mode: 'full',
      output: {
        console: true,
        ai: './test-results/ai-summary.md',
        json: './test-results/results.json'
      }
    }],
    ['html']
  ]
});
```

### Fast CI Feedback

```typescript
export default defineConfig({
  reporter: [
    ['fair-playwright', {
      mode: 'minimal',
      aiOptimized: false
    }],
    ['github']  // For GitHub Actions
  ]
});
```

## Next Steps

- [E2E Helper API](/api/e2e-helper) - Test organization
- [Configuration Guide](/guide/configuration) - Detailed config
- [Examples](/examples/) - Real-world usage
