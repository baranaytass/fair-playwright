/**
 * Type definitions for fair-playwright reporter
 */

import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
  TestStep,
} from '@playwright/test/reporter';

export type { FullConfig, FullResult, Reporter, Suite, TestCase, TestResult, TestStep };

/**
 * Step level in the hierarchy
 */
export type StepLevel = 'major' | 'minor';

/**
 * Step status
 */
export type StepStatus = 'pending' | 'running' | 'passed' | 'failed' | 'skipped';

/**
 * Output mode for the reporter
 */
export type OutputMode = 'progressive' | 'full' | 'minimal';

/**
 * Configuration for the Fair Playwright reporter
 */
export interface FairReporterConfig {
  /**
   * Output mode: progressive (live updates), full (all details), minimal (summary only)
   * @default 'progressive'
   */
  mode?: OutputMode;

  /**
   * Enable AI-optimized markdown output
   * @default true
   */
  aiOptimized?: boolean;

  /**
   * Output file configurations
   */
  output?: {
    /**
     * Enable console output
     * @default true
     */
    console?: boolean;

    /**
     * AI-optimized markdown output file path, or true for default location
     * @default false
     */
    ai?: boolean | string;

    /**
     * JSON output file path, or true for default location
     * @default false
     */
    json?: boolean | string;
  };

  /**
   * Step classification settings
   */
  stepClassification?: {
    /**
     * Duration threshold in ms - steps longer than this are considered MAJOR
     * @default 1000
     */
    durationThreshold?: number;

    /**
     * Auto-detect step level based on context and duration
     * @default true
     */
    autoDetect?: boolean;
  };

  /**
   * Progressive mode settings
   */
  progressive?: {
    /**
     * Clear completed tests from terminal
     * @default true
     */
    clearCompleted?: boolean;

    /**
     * Update interval in milliseconds
     * @default 100
     */
    updateInterval?: number;
  };

  /**
   * Compression settings for output
   */
  compression?: {
    /**
     * How to display passed tests: summary, hide, or full
     * @default 'summary'
     */
    passedTests?: 'summary' | 'hide' | 'full';

    /**
     * Failure context settings
     */
    failureContext?: {
      /**
       * Number of steps to show before failure
       * @default 3
       */
      steps?: number;

      /**
       * Include screenshot in failure context
       * @default true
       */
      screenshot?: boolean;

      /**
       * Include trace in failure context
       * @default true
       */
      trace?: boolean;

      /**
       * Include console logs in failure context
       * @default true
       */
      logs?: boolean;
    };
  };
}

/**
 * Step metadata for tracking
 */
export interface StepMetadata {
  /**
   * Unique identifier for the step
   */
  id: string;

  /**
   * Step title/description
   */
  title: string;

  /**
   * Step level (major or minor)
   */
  level: StepLevel;

  /**
   * Current status
   */
  status: StepStatus;

  /**
   * Start timestamp
   */
  startTime: number;

  /**
   * End timestamp (undefined if not finished)
   */
  endTime?: number;

  /**
   * Duration in milliseconds
   */
  duration?: number;

  /**
   * Success message
   */
  successMessage?: string;

  /**
   * Failure message
   */
  failureMessage?: string;

  /**
   * Error details if failed
   */
  error?: {
    message: string;
    stack?: string;
    location?: string;
  };

  /**
   * Parent step ID (for nested steps)
   */
  parentId?: string;

  /**
   * Child step IDs
   */
  childIds: string[];
}

/**
 * Test metadata for tracking
 */
export interface TestMetadata {
  /**
   * Unique identifier
   */
  id: string;

  /**
   * Test title
   */
  title: string;

  /**
   * Test file path
   */
  file: string;

  /**
   * Test status
   */
  status: StepStatus;

  /**
   * Start timestamp
   */
  startTime: number;

  /**
   * End timestamp
   */
  endTime?: number;

  /**
   * Duration in milliseconds
   */
  duration?: number;

  /**
   * Steps in this test
   */
  steps: StepMetadata[];

  /**
   * Error details if failed
   */
  error?: {
    message: string;
    stack?: string;
    location?: string;
  };

  /**
   * Attachments (screenshots, traces, etc.)
   */
  attachments: Array<{
    name: string;
    path?: string;
    contentType: string;
  }>;

  /**
   * Browser console errors captured during test execution
   */
  consoleErrors?: Array<{
    type: string;
    message: string;
    location?: string;
    timestamp: number;
  }>;
}

/**
 * Options for e2e step execution (inline mode)
 */
export interface StepOptions {
  /**
   * Success message to display
   */
  success?: string;

  /**
   * Failure message to display
   */
  failure?: string;
}

/**
 * Step definition for declarative mode
 */
export interface StepDefinition {
  /**
   * Step title
   */
  title: string;

  /**
   * Success message
   */
  success?: string;

  /**
   * Failure message
   */
  failure?: string;

  /**
   * Action to execute
   */
  action: () => Promise<void>;
}

/**
 * Options for major step execution (declarative mode)
 */
export interface MajorStepOptions {
  /**
   * Success message for the major step
   */
  success?: string;

  /**
   * Failure message for the major step
   */
  failure?: string;

  /**
   * Child steps to execute
   */
  steps?: StepDefinition[];
}

/**
 * Quick step definition - simplified tuple syntax
 * [title, action] or [title, action, options]
 */
export type QuickStepDefinition =
  | [string, () => Promise<void>]
  | [string, () => Promise<void>, StepOptions];

/**
 * Options for quick mode execution
 */
export interface QuickModeOptions extends StepOptions {
  // Future: parallel execution support
}

/**
 * E2E test helper interface
 */
export interface E2EHelper {
  /**
   * Execute a major step (inline mode)
   */
  major(title: string, action: () => Promise<void>, options?: StepOptions): Promise<void>;

  /**
   * Execute a major step with child steps (declarative mode)
   */
  major(title: string, options: MajorStepOptions): Promise<void>;

  /**
   * Execute a minor step
   */
  minor(title: string, action: () => Promise<void>, options?: StepOptions): Promise<void>;

  /**
   * Execute a quick workflow with simplified syntax (v1.1.0+)
   * Compact API for simple test cases
   *
   * @param title - Major step title
   * @param steps - Array of [title, action] or [title, action, options] tuples
   * @param options - Optional success/failure messages for major step
   *
   * @example
   * await e2e.quick('User login', [
   *   ['Open page', async () => { await page.goto('/login') }],
   *   ['Fill form', async () => { await page.fill('#email', 'test@example.com') }],
   *   ['Submit', async () => { await page.click('button[type="submit"]') }]
   * ])
   */
  quick(
    title: string,
    steps: QuickStepDefinition[],
    options?: QuickModeOptions
  ): Promise<void>;
}
