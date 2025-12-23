# TypeScript Types

Complete type definitions for fair-playwright.

## Overview

fair-playwright is written in TypeScript with full type definitions exported for use in your tests.

## Import Types

```typescript
import type {
  // Reporter Types
  FairReporterConfig,
  OutputMode,
  OutputConfig,
  StepClassificationConfig,
  ProgressiveConfig,

  // E2E Helper Types
  MajorStepOptions,
  MinorStepOptions,
  StepDefinition,

  // Metadata Types
  TestMetadata,
  StepMetadata,
  StepType,
  StepStatus,

  // MCP Types
  MCPServerConfig
} from 'fair-playwright';
```

## Reporter Types

### FairReporterConfig

Main configuration interface for FairReporter.

```typescript
interface FairReporterConfig {
  /**
   * Output rendering mode
   * @default 'progressive'
   */
  mode?: OutputMode;

  /**
   * Enable AI-optimized output formats
   * @default true
   */
  aiOptimized?: boolean;

  /**
   * Configure output destinations
   */
  output?: OutputConfig;

  /**
   * Step classification rules
   */
  stepClassification?: StepClassificationConfig;

  /**
   * Progressive mode configuration
   */
  progressive?: ProgressiveConfig;
}
```

**Usage:**

```typescript
import { defineConfig } from '@playwright/test';
import type { FairReporterConfig } from 'fair-playwright';

const reporterConfig: FairReporterConfig = {
  mode: 'progressive',
  aiOptimized: true
};

export default defineConfig({
  reporter: [['fair-playwright', reporterConfig]]
});
```

### OutputMode

Output rendering mode.

```typescript
type OutputMode = 'progressive' | 'full' | 'minimal';
```

**Values:**
- `'progressive'`: Smart compression, live updates
- `'full'`: All steps always visible
- `'minimal'`: Test names and results only

**Usage:**

```typescript
const mode: OutputMode = 'progressive';
```

### OutputConfig

Configure output destinations.

```typescript
interface OutputConfig {
  /**
   * Write to terminal
   * @default true
   */
  console?: boolean;

  /**
   * AI-optimized markdown output path
   * Set to false to disable
   * @default false
   */
  ai?: string | false;

  /**
   * JSON output path
   * Set to false to disable
   * @default false
   */
  json?: string | false;
}
```

**Usage:**

```typescript
const output: OutputConfig = {
  console: true,
  ai: './test-results/ai-summary.md',
  json: './test-results/results.json'
};
```

### StepClassificationConfig

Control automatic step classification.

```typescript
interface StepClassificationConfig {
  /**
   * Steps longer than this (ms) are MAJOR
   * @default 1000
   */
  durationThreshold?: number;

  /**
   * Automatically classify steps
   * @default true
   */
  autoDetect?: boolean;
}
```

**Usage:**

```typescript
const classification: StepClassificationConfig = {
  durationThreshold: 1000,
  autoDetect: true
};
```

### ProgressiveConfig

Fine-tune progressive mode behavior.

```typescript
interface ProgressiveConfig {
  /**
   * Compress completed steps
   * @default true
   */
  clearCompleted?: boolean;

  /**
   * Terminal update frequency (ms)
   * @default 100
   */
  updateInterval?: number;

  /**
   * Show step durations
   * @default false
   */
  showTimings?: boolean;
}
```

**Usage:**

```typescript
const progressive: ProgressiveConfig = {
  clearCompleted: true,
  updateInterval: 100,
  showTimings: true
};
```

## E2E Helper Types

### MajorStepOptions

Configuration for MAJOR steps.

```typescript
interface MajorStepOptions {
  /**
   * Success message displayed on completion
   */
  success: string;

  /**
   * Failure message displayed on error
   */
  failure: string;

  /**
   * Array of MINOR step definitions
   */
  steps: StepDefinition[];
}
```

**Usage:**

```typescript
import { e2e } from 'fair-playwright';
import type { MajorStepOptions } from 'fair-playwright';

const options: MajorStepOptions = {
  success: 'User logged in',
  failure: 'Login failed',
  steps: [
    {
      title: 'Open page',
      success: 'Page opened',
      action: async () => {}
    }
  ]
};

await e2e.major('Login', options);
```

### MinorStepOptions

Configuration for MINOR steps.

```typescript
interface MinorStepOptions {
  /**
   * Success message displayed on completion
   */
  success: string;

  /**
   * Failure message displayed on error
   * Optional, generic message used if not provided
   */
  failure?: string;
}
```

**Usage:**

```typescript
import { e2e } from 'fair-playwright';
import type { MinorStepOptions } from 'fair-playwright';

const options: MinorStepOptions = {
  success: 'Button clicked',
  failure: 'Button not found'
};

await e2e.minor('Click button', async () => {
  await page.click('button');
}, options);
```

### StepDefinition

Definition of a MINOR step within a MAJOR step.

```typescript
interface StepDefinition {
  /**
   * Step title displayed in output
   */
  title: string;

  /**
   * Success message
   */
  success: string;

  /**
   * Failure message (optional)
   */
  failure?: string;

  /**
   * Async function to execute
   */
  action: () => Promise<void>;
}
```

**Usage:**

```typescript
import type { StepDefinition } from 'fair-playwright';

const steps: StepDefinition[] = [
  {
    title: 'Open page',
    success: 'Page opened',
    failure: 'Failed to open page',
    action: async () => {
      await page.goto('/login');
    }
  },
  {
    title: 'Fill form',
    success: 'Form filled',
    action: async () => {
      await page.fill('[name="email"]', 'user@example.com');
    }
  }
];
```

## Metadata Types

### TestMetadata

Internal test execution metadata.

```typescript
interface TestMetadata {
  /**
   * Unique test identifier
   */
  id: string;

  /**
   * Test name
   */
  name: string;

  /**
   * Test file path
   */
  file: string;

  /**
   * Line number in file
   */
  line: number;

  /**
   * Test execution status
   */
  status: StepStatus;

  /**
   * Test duration (ms)
   */
  duration: number;

  /**
   * Start timestamp
   */
  startTime: string;

  /**
   * End timestamp
   */
  endTime?: string;

  /**
   * Test steps
   */
  steps: StepMetadata[];

  /**
   * Error if failed
   */
  error?: {
    message: string;
    stack?: string;
  };

  /**
   * Browser console logs
   */
  consoleLogs?: Array<{
    type: 'log' | 'error' | 'warning';
    text: string;
    timestamp: string;
  }>;
}
```

**Usage:**

```typescript
import type { TestMetadata } from 'fair-playwright';

function analyzeTest(test: TestMetadata) {
  console.log(`Test: ${test.name}`);
  console.log(`Status: ${test.status}`);
  console.log(`Duration: ${test.duration}ms`);
  console.log(`Steps: ${test.steps.length}`);
}
```

### StepMetadata

Internal step execution metadata.

```typescript
interface StepMetadata {
  /**
   * Unique step identifier
   */
  id: string;

  /**
   * Step type
   */
  type: StepType;

  /**
   * Step title
   */
  title: string;

  /**
   * Step status
   */
  status: StepStatus;

  /**
   * Step duration (ms)
   */
  duration: number;

  /**
   * Start timestamp
   */
  startTime: string;

  /**
   * End timestamp
   */
  endTime?: string;

  /**
   * Success message
   */
  successMessage?: string;

  /**
   * Failure message
   */
  failureMessage?: string;

  /**
   * Error if failed
   */
  error?: {
    message: string;
    stack?: string;
  };

  /**
   * Child steps (for MAJOR steps)
   */
  minorSteps?: StepMetadata[];
}
```

**Usage:**

```typescript
import type { StepMetadata } from 'fair-playwright';

function analyzeStep(step: StepMetadata) {
  console.log(`Step: ${step.title}`);
  console.log(`Type: ${step.type}`);
  console.log(`Status: ${step.status}`);

  if (step.type === 'MAJOR' && step.minorSteps) {
    console.log(`Minor steps: ${step.minorSteps.length}`);
  }
}
```

### StepType

Step classification.

```typescript
type StepType = 'MAJOR' | 'MINOR';
```

**Usage:**

```typescript
const type: StepType = 'MAJOR';

if (type === 'MAJOR') {
  console.log('This is a major step');
}
```

### StepStatus

Step execution status.

```typescript
type StepStatus = 'passed' | 'failed' | 'skipped' | 'running';
```

**Usage:**

```typescript
const status: StepStatus = 'passed';

switch (status) {
  case 'passed':
    console.log('✓ Success');
    break;
  case 'failed':
    console.log('✗ Failed');
    break;
  case 'skipped':
    console.log('⊘ Skipped');
    break;
  case 'running':
    console.log('⏳ Running');
    break;
}
```

## MCP Types

### MCPServerConfig

Configuration for MCP server.

```typescript
interface MCPServerConfig {
  /**
   * Path to test results directory
   * @default './test-results'
   */
  resultsPath?: string;

  /**
   * Enable verbose logging
   * @default false
   */
  verbose?: boolean;
}
```

**Usage:**

```typescript
import { createMCPServer } from 'fair-playwright';
import type { MCPServerConfig } from 'fair-playwright';

const config: MCPServerConfig = {
  resultsPath: './test-results',
  verbose: true
};

const server = await createMCPServer(config);
```

## Type Guards

### isMAJOR

Check if step is MAJOR.

```typescript
function isMAJOR(step: StepMetadata): boolean {
  return step.type === 'MAJOR';
}
```

**Usage:**

```typescript
import type { StepMetadata } from 'fair-playwright';

function processStep(step: StepMetadata) {
  if (isMAJOR(step)) {
    console.log('Processing MAJOR step');
    step.minorSteps?.forEach(minor => {
      console.log(`  - ${minor.title}`);
    });
  }
}
```

### isFailed

Check if test/step failed.

```typescript
function isFailed(item: TestMetadata | StepMetadata): boolean {
  return item.status === 'failed';
}
```

**Usage:**

```typescript
import type { TestMetadata } from 'fair-playwright';

function reportFailures(tests: TestMetadata[]) {
  const failed = tests.filter(isFailed);
  console.log(`Failed tests: ${failed.length}`);
}
```

## Generic Types

### Action

Generic async action type.

```typescript
type Action = () => Promise<void>;
```

**Usage:**

```typescript
import type { Action } from 'fair-playwright';

const myAction: Action = async () => {
  await page.click('button');
};

await e2e.minor('Click button', myAction, {
  success: 'Clicked'
});
```

### ResultHandler

Generic result handler type.

```typescript
type ResultHandler<T> = (result: T) => void | Promise<void>;
```

**Usage:**

```typescript
import type { ResultHandler, TestMetadata } from 'fair-playwright';

const handleTest: ResultHandler<TestMetadata> = async (test) => {
  if (test.status === 'failed') {
    console.error(`Test failed: ${test.name}`);
  }
};
```

## Complete Example

```typescript
import { test, defineConfig } from '@playwright/test';
import { e2e } from 'fair-playwright';
import type {
  FairReporterConfig,
  MajorStepOptions,
  StepDefinition,
  OutputMode
} from 'fair-playwright';

// Configure reporter
const mode: OutputMode = process.env.CI ? 'minimal' : 'progressive';

const reporterConfig: FairReporterConfig = {
  mode,
  aiOptimized: true,
  output: {
    console: true,
    ai: './test-results/ai-summary.md',
    json: './test-results/results.json'
  },
  progressive: {
    clearCompleted: true,
    showTimings: true
  }
};

export default defineConfig({
  reporter: [['fair-playwright', reporterConfig]]
});

// Write tests
test('user login', async ({ page }) => {
  const steps: StepDefinition[] = [
    {
      title: 'Open login page',
      success: 'Login page loaded',
      action: async () => {
        await page.goto('/login');
      }
    },
    {
      title: 'Enter credentials',
      success: 'Credentials entered',
      action: async () => {
        await page.fill('[name="email"]', 'user@example.com');
        await page.fill('[name="password"]', 'password');
      }
    }
  ];

  const options: MajorStepOptions = {
    success: 'User logged in',
    failure: 'Login failed',
    steps
  };

  await e2e.major('User login flow', options);
});
```

## Type Utilities

### Partial Configuration

```typescript
import type { FairReporterConfig } from 'fair-playwright';

// All fields optional
const partialConfig: Partial<FairReporterConfig> = {
  mode: 'progressive'
};
```

### Required Configuration

```typescript
import type { FairReporterConfig } from 'fair-playwright';

// All fields required
const requiredConfig: Required<FairReporterConfig> = {
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

### Pick Specific Types

```typescript
import type { FairReporterConfig } from 'fair-playwright';

// Only output config
type OutputOnly = Pick<FairReporterConfig, 'output'>;

const config: OutputOnly = {
  output: {
    console: true
  }
};
```

## Next Steps

- [FairReporter API](/api/reporter) - Full reporter documentation
- [E2E Helper API](/api/e2e-helper) - Helper methods
- [Examples](/examples/) - Real-world usage
