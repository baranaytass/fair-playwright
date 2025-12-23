import { describe, it, expect, beforeEach } from 'vitest';
import { StepTracker } from './StepTracker.js';
import type { TestCase, TestResult, TestStep } from '@playwright/test/reporter';

describe('StepTracker', () => {
  let tracker: StepTracker;

  beforeEach(() => {
    tracker = new StepTracker({
      durationThreshold: 1000,
      autoDetect: true,
    });
  });

  describe('Test Tracking', () => {
    it('should track a test', () => {
      const testCase = createMockTestCase('test1');
      const result = createMockTestResult();

      const testId = tracker.startTest(testCase, result);

      expect(testId).toBe('test.spec.ts::test1');
      const test = tracker.getTest(testId);
      expect(test).toBeDefined();
      expect(test?.title).toBe('test1');
      expect(test?.status).toBe('running');
    });

    it('should end a test with passed status', () => {
      const testCase = createMockTestCase('test1');
      const result = createMockTestResult('passed');

      tracker.startTest(testCase, result);
      tracker.endTest(testCase, result);

      const testId = 'test.spec.ts::test1';
      const test = tracker.getTest(testId);
      expect(test?.status).toBe('passed');
      expect(test?.duration).toBe(1000);
    });

    it('should capture test error on failure', () => {
      const testCase = createMockTestCase('test1');
      const result = createMockTestResult('failed', new Error('Test failed'));

      tracker.startTest(testCase, result);
      tracker.endTest(testCase, result);

      const testId = 'test.spec.ts::test1';
      const test = tracker.getTest(testId);
      expect(test?.status).toBe('failed');
      expect(test?.error?.message).toBe('Test failed');
    });
  });

  describe('Step Classification', () => {
    it('should classify step with [MAJOR] prefix as major', () => {
      const testCase = createMockTestCase('test1');
      const result = createMockTestResult();
      const step = createMockStep('[MAJOR] User login');

      tracker.startTest(testCase, result);
      const stepId = tracker.startStep(testCase, result, step);

      const stepMeta = tracker.getStep(stepId);
      expect(stepMeta?.level).toBe('major');
      expect(stepMeta?.title).toBe('User login'); // Prefix removed
    });

    it('should classify step with [MINOR] prefix as minor', () => {
      const testCase = createMockTestCase('test1');
      const result = createMockTestResult();
      const step = createMockStep('[MINOR] Click button');

      tracker.startTest(testCase, result);
      const stepId = tracker.startStep(testCase, result, step);

      const stepMeta = tracker.getStep(stepId);
      expect(stepMeta?.level).toBe('minor');
      expect(stepMeta?.title).toBe('Click button');
    });

    it('should classify step with login keyword as major', () => {
      const testCase = createMockTestCase('test1');
      const result = createMockTestResult();
      const step = createMockStep('User login flow');

      tracker.startTest(testCase, result);
      const stepId = tracker.startStep(testCase, result, step);

      const stepMeta = tracker.getStep(stepId);
      expect(stepMeta?.level).toBe('major');
    });

    it('should classify step with checkout keyword as major', () => {
      const testCase = createMockTestCase('test1');
      const result = createMockTestResult();
      const step = createMockStep('Checkout process');

      tracker.startTest(testCase, result);
      const stepId = tracker.startStep(testCase, result, step);

      const stepMeta = tracker.getStep(stepId);
      expect(stepMeta?.level).toBe('major');
    });

    it('should classify step without keywords as minor', () => {
      const testCase = createMockTestCase('test1');
      const result = createMockTestResult();
      const step = createMockStep('Click button');

      tracker.startTest(testCase, result);
      const stepId = tracker.startStep(testCase, result, step);

      const stepMeta = tracker.getStep(stepId);
      expect(stepMeta?.level).toBe('minor');
    });

    it('should classify child steps as minor', () => {
      const testCase = createMockTestCase('test1');
      const result = createMockTestResult();
      const parentStep = createMockStep('Parent step');
      const childStep = createMockStep('Child step');

      tracker.startTest(testCase, result);
      const parentId = tracker.startStep(testCase, result, parentStep);
      const childId = tracker.startStep(testCase, result, childStep, parentId);

      const childMeta = tracker.getStep(childId);
      expect(childMeta?.level).toBe('minor');
    });
  });

  describe('Step Duration Classification', () => {
    it('should reclassify long-running step as major', () => {
      const testCase = createMockTestCase('test1');
      const result = createMockTestResult();
      const step = createMockStep('Click button');

      tracker.startTest(testCase, result);
      const stepId = tracker.startStep(testCase, result, step);

      // Initially minor
      let stepMeta = tracker.getStep(stepId);
      expect(stepMeta?.level).toBe('minor');

      // Simulate 2 second duration
      if (stepMeta) {
        stepMeta.startTime = Date.now() - 2000;
      }

      tracker.endStep(testCase, result, step, stepId);

      // Should be reclassified as major
      stepMeta = tracker.getStep(stepId);
      expect(stepMeta?.level).toBe('major');
    });
  });

  describe('getAllTests', () => {
    it('should return all tracked tests', () => {
      const testCase1 = createMockTestCase('test1');
      const testCase2 = createMockTestCase('test2');
      const result = createMockTestResult();

      tracker.startTest(testCase1, result);
      tracker.startTest(testCase2, result);

      const allTests = tracker.getAllTests();
      expect(allTests).toHaveLength(2);
      expect(allTests.map((t) => t.title)).toContain('test1');
      expect(allTests.map((t) => t.title)).toContain('test2');
    });
  });

  describe('clear', () => {
    it('should clear all tracked data', () => {
      const testCase = createMockTestCase('test1');
      const result = createMockTestResult();

      tracker.startTest(testCase, result);
      expect(tracker.getAllTests()).toHaveLength(1);

      tracker.clear();
      expect(tracker.getAllTests()).toHaveLength(0);
    });
  });
});

// Helper functions to create mock objects
function createMockTestCase(title: string): TestCase {
  return {
    title,
    location: {
      file: 'test.spec.ts',
      line: 1,
      column: 1,
    },
  } as TestCase;
}

function createMockTestResult(status: string = 'passed', error?: Error): TestResult {
  return {
    status,
    duration: 1000,
    errors: [],
    attachments: [],
    stdout: [],
    stderr: [],
    error: error
      ? {
          message: error.message,
          stack: error.stack,
        }
      : undefined,
  } as unknown as TestResult;
}

function createMockStep(title: string): TestStep {
  return {
    title,
    category: 'test.step',
  } as TestStep;
}
