import type { TestCase, TestResult, TestStep } from '@playwright/test/reporter';
import type { StepMetadata, StepLevel, StepStatus, TestMetadata } from '../types/index.js';

/**
 * Tracks test steps with MAJOR/MINOR hierarchy
 */
export class StepTracker {
  private tests: Map<string, TestMetadata> = new Map();
  private steps: Map<string, StepMetadata> = new Map();
  private durationThreshold: number;
  private autoDetect: boolean;

  constructor(options?: { durationThreshold?: number; autoDetect?: boolean }) {
    this.durationThreshold = options?.durationThreshold ?? 1000;
    this.autoDetect = options?.autoDetect ?? true;
  }

  /**
   * Start tracking a test
   */
  startTest(testCase: TestCase, result: TestResult): string {
    const testId = this.getTestId(testCase);
    const test: TestMetadata = {
      id: testId,
      title: testCase.title,
      file: testCase.location.file,
      status: 'running',
      startTime: Date.now(),
      steps: [],
      attachments: [],
    };

    this.tests.set(testId, test);
    return testId;
  }

  /**
   * Start tracking a step
   */
  startStep(
    testCase: TestCase,
    result: TestResult,
    step: TestStep,
    parentStepId?: string
  ): string {
    const testId = this.getTestId(testCase);
    const stepId = this.getStepId(testCase, step);

    const stepMetadata: StepMetadata = {
      id: stepId,
      title: step.title,
      level: this.classifyStep(step, parentStepId),
      status: 'running',
      startTime: Date.now(),
      parentId: parentStepId,
      childIds: [],
    };

    this.steps.set(stepId, stepMetadata);

    // Add to parent's children if exists
    if (parentStepId) {
      const parent = this.steps.get(parentStepId);
      if (parent) {
        parent.childIds.push(stepId);
      }
    }

    // Add to test's steps if it's a top-level step
    if (!parentStepId) {
      const test = this.tests.get(testId);
      if (test) {
        test.steps.push(stepMetadata);
      }
    }

    return stepId;
  }

  /**
   * End tracking a step
   */
  endStep(
    testCase: TestCase,
    result: TestResult,
    step: TestStep,
    stepId: string
  ): void {
    const stepMetadata = this.steps.get(stepId);
    if (!stepMetadata) return;

    stepMetadata.endTime = Date.now();
    stepMetadata.duration = stepMetadata.endTime - stepMetadata.startTime;
    stepMetadata.status = step.error ? 'failed' : 'passed';

    if (step.error) {
      stepMetadata.error = {
        message: step.error.message || 'Unknown error',
        stack: step.error.stack,
      };
    }

    // Re-classify based on duration if auto-detect is enabled
    if (this.autoDetect && stepMetadata.duration > this.durationThreshold) {
      stepMetadata.level = 'major';
    }
  }

  /**
   * End tracking a test
   */
  endTest(testCase: TestCase, result: TestResult): void {
    const testId = this.getTestId(testCase);
    const test = this.tests.get(testId);
    if (!test) return;

    test.endTime = Date.now();
    test.duration = result.duration;
    test.status = this.mapTestStatus(result.status);

    if (result.error) {
      test.error = {
        message: result.error.message || 'Unknown error',
        stack: result.error.stack,
        location: `${testCase.location.file}:${testCase.location.line}:${testCase.location.column}`,
      };
    }

    // Collect attachments
    test.attachments = result.attachments.map((att) => ({
      name: att.name,
      path: att.path,
      contentType: att.contentType,
    }));
  }

  /**
   * Get test metadata
   */
  getTest(testId: string): TestMetadata | undefined {
    return this.tests.get(testId);
  }

  /**
   * Get all tests
   */
  getAllTests(): TestMetadata[] {
    return Array.from(this.tests.values());
  }

  /**
   * Get step metadata
   */
  getStep(stepId: string): StepMetadata | undefined {
    return this.steps.get(stepId);
  }

  /**
   * Clear all tracking data
   */
  clear(): void {
    this.tests.clear();
    this.steps.clear();
  }

  /**
   * Generate unique test ID
   */
  private getTestId(testCase: TestCase): string {
    return `${testCase.location.file}::${testCase.title}`;
  }

  /**
   * Generate unique step ID
   */
  private getStepId(testCase: TestCase, step: TestStep): string {
    return `${this.getTestId(testCase)}::${step.title}::${Date.now()}`;
  }

  /**
   * Classify step as MAJOR or MINOR
   */
  private classifyStep(step: TestStep, parentStepId?: string): StepLevel {
    // If it has a parent, it's MINOR by default
    if (parentStepId) {
      return 'minor';
    }

    // Check if step title contains keywords that indicate MAJOR
    const majorKeywords = ['login', 'checkout', 'payment', 'register', 'setup', 'flow'];
    const titleLower = step.title.toLowerCase();

    if (majorKeywords.some((keyword) => titleLower.includes(keyword))) {
      return 'major';
    }

    // Default to MINOR for top-level steps
    return 'minor';
  }

  /**
   * Map Playwright test status to our status
   */
  private mapTestStatus(status: string): StepStatus {
    switch (status) {
      case 'passed':
        return 'passed';
      case 'failed':
        return 'failed';
      case 'skipped':
        return 'skipped';
      case 'timedOut':
        return 'failed';
      default:
        return 'failed';
    }
  }
}
