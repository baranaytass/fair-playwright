import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
  TestStep,
  TestError,
} from '@playwright/test/reporter';
import type { FairReporterConfig } from '../types/index.js';
import { StepTracker } from './StepTracker.js';
import { ConsoleFormatter } from '../formatters/ConsoleFormatter.js';
import { AIFormatter } from '../formatters/AIFormatter.js';
import { JSONFormatter } from '../formatters/JSONFormatter.js';

/**
 * Fair Playwright Reporter
 * AI-optimized reporter with progressive terminal output and hierarchical step management
 */
export class FairReporter implements Reporter {
  private config: Required<FairReporterConfig>;
  private stepTracker: StepTracker;
  private consoleFormatter?: ConsoleFormatter;
  private aiFormatter?: AIFormatter;
  private jsonFormatter?: JSONFormatter;
  private stepIdMap: Map<TestStep, string> = new Map();

  constructor(config?: FairReporterConfig) {
    // Merge with defaults
    this.config = {
      mode: config?.mode ?? 'progressive',
      aiOptimized: config?.aiOptimized ?? true,
      output: {
        console: config?.output?.console ?? true,
        ai: config?.output?.ai ?? false,
        json: config?.output?.json ?? false,
      },
      stepClassification: {
        durationThreshold: config?.stepClassification?.durationThreshold ?? 1000,
        autoDetect: config?.stepClassification?.autoDetect ?? true,
      },
      progressive: {
        clearCompleted: config?.progressive?.clearCompleted ?? true,
        updateInterval: config?.progressive?.updateInterval ?? 100,
      },
      compression: {
        passedTests: config?.compression?.passedTests ?? 'summary',
        failureContext: {
          steps: config?.compression?.failureContext?.steps ?? 3,
          screenshot: config?.compression?.failureContext?.screenshot ?? true,
          trace: config?.compression?.failureContext?.trace ?? true,
          logs: config?.compression?.failureContext?.logs ?? true,
        },
      },
    };

    // Initialize step tracker
    this.stepTracker = new StepTracker({
      durationThreshold: this.config.stepClassification.durationThreshold,
      autoDetect: this.config.stepClassification.autoDetect,
    });

    // Initialize formatters based on config
    if (this.config.output.console) {
      this.consoleFormatter = new ConsoleFormatter(this.config);
    }

    if (this.config.output.ai) {
      const outputPath =
        typeof this.config.output.ai === 'string'
          ? this.config.output.ai
          : './test-results/ai-summary.md';
      this.aiFormatter = new AIFormatter(this.config, outputPath);
    }

    if (this.config.output.json) {
      const outputPath =
        typeof this.config.output.json === 'string'
          ? this.config.output.json
          : './test-results/results.json';
      this.jsonFormatter = new JSONFormatter(this.config, outputPath);
    }
  }

  /**
   * Called once before running tests
   */
  onBegin(_config: FullConfig, suite: Suite): void {
    const totalTests = suite.allTests().length;

    if (this.consoleFormatter) {
      this.consoleFormatter.onBegin(totalTests);
    }
  }

  /**
   * Called when a test begins
   */
  onTestBegin(test: TestCase, result: TestResult): void {
    this.stepTracker.startTest(test, result);

    if (this.consoleFormatter) {
      this.consoleFormatter.onTestBegin(test);
    }
  }

  /**
   * Called when a test step begins
   */
  onStepBegin(test: TestCase, result: TestResult, step: TestStep): void {
    // Find parent step if exists
    let parentStepId: string | undefined;
    if (step.parent) {
      parentStepId = this.stepIdMap.get(step.parent);
    }

    const stepId = this.stepTracker.startStep(test, result, step, parentStepId);
    this.stepIdMap.set(step, stepId);

    if (this.consoleFormatter) {
      const stepMetadata = this.stepTracker.getStep(stepId);
      if (stepMetadata) {
        this.consoleFormatter.onStepBegin(stepMetadata);
      }
    }
  }

  /**
   * Called when a test step ends
   */
  onStepEnd(test: TestCase, result: TestResult, step: TestStep): void {
    const stepId = this.stepIdMap.get(step);
    if (!stepId) return;

    this.stepTracker.endStep(test, result, step, stepId);

    if (this.consoleFormatter) {
      const stepMetadata = this.stepTracker.getStep(stepId);
      if (stepMetadata) {
        this.consoleFormatter.onStepEnd(stepMetadata);
      }
    }
  }

  /**
   * Called when a test ends
   */
  onTestEnd(test: TestCase, result: TestResult): void {
    this.stepTracker.endTest(test, result);

    if (this.consoleFormatter) {
      const testId = `${test.location.file}::${test.title}`;
      const testMetadata = this.stepTracker.getTest(testId);
      if (testMetadata) {
        this.consoleFormatter.onTestEnd(testMetadata);
      }
    }
  }

  /**
   * Called once after all tests have finished
   */
  async onEnd(result: FullResult): Promise<void> {
    const allTests = this.stepTracker.getAllTests();

    // Console output
    if (this.consoleFormatter) {
      this.consoleFormatter.onEnd(allTests, result);
    }

    // AI-optimized markdown output
    if (this.aiFormatter) {
      await this.aiFormatter.write(allTests, result);
    }

    // JSON output
    if (this.jsonFormatter) {
      await this.jsonFormatter.write(allTests, result);
    }

    // Clean up
    this.stepIdMap.clear();
  }

  /**
   * Optional: Called on error
   */
  onError(error: TestError): void {
    if (this.consoleFormatter) {
      this.consoleFormatter.onError(error as unknown as Error);
    }
  }
}

// Export as default for Playwright config
export default FairReporter;
