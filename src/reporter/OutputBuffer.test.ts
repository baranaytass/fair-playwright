import { describe, it, expect, beforeEach } from 'vitest';
import { OutputBuffer } from './OutputBuffer.js';
import type { TestMetadata } from '../types/index.js';

describe('OutputBuffer', () => {
  let buffer: OutputBuffer;

  beforeEach(() => {
    buffer = new OutputBuffer({
      maxBufferSize: 10,
      compressPassedTests: true,
    });
  });

  describe('Test Management', () => {
    it('should add and retrieve tests', () => {
      const test = createMockTest('test1', 'passed');

      buffer.addTest(test);

      const tests = buffer.getTests();
      expect(tests).toHaveLength(1);
      expect(tests[0].title).toBe('test1');
    });

    it('should handle multiple workers', () => {
      const test1 = createMockTest('test1', 'passed');
      const test2 = createMockTest('test2', 'passed');

      buffer.addTest(test1, 'worker1');
      buffer.addTest(test2, 'worker2');

      const worker1Tests = buffer.getTests('worker1');
      const worker2Tests = buffer.getTests('worker2');

      expect(worker1Tests).toHaveLength(1);
      expect(worker2Tests).toHaveLength(1);
      expect(buffer.getAllTests()).toHaveLength(2);
    });
  });

  describe('Failed Tests', () => {
    it('should return only failed tests', () => {
      const passedTest = createMockTest('test1', 'passed');
      const failedTest = createMockTest('test2', 'failed');

      buffer.addTest(passedTest);
      buffer.addTest(failedTest);

      const failedTests = buffer.getFailedTests();
      expect(failedTests).toHaveLength(1);
      expect(failedTests[0].title).toBe('test2');
    });
  });

  describe('Passed Tests', () => {
    it('should return only passed tests', () => {
      const passedTest = createMockTest('test1', 'passed');
      const failedTest = createMockTest('test2', 'failed');

      buffer.addTest(passedTest);
      buffer.addTest(failedTest);

      const passedTests = buffer.getPassedTests();
      expect(passedTests).toHaveLength(1);
      expect(passedTests[0].title).toBe('test1');
    });
  });

  describe('Buffer Size Limit', () => {
    it('should remove oldest passed test when buffer is full', () => {
      // Fill buffer with 10 tests
      for (let i = 0; i < 10; i++) {
        buffer.addTest(createMockTest(`test${i}`, 'passed'));
      }

      expect(buffer.getAllTests()).toHaveLength(10);

      // Add one more - should remove oldest
      buffer.addTest(createMockTest('test10', 'passed'));

      const tests = buffer.getAllTests();
      expect(tests).toHaveLength(10);
      expect(tests.map((t) => t.title)).not.toContain('test0');
    });

    it('should preserve failed tests when buffer is full', () => {
      // Fill buffer with passed tests
      for (let i = 0; i < 9; i++) {
        buffer.addTest(createMockTest(`test${i}`, 'passed'));
      }

      // Add a failed test
      buffer.addTest(createMockTest('failedTest', 'failed'));

      // Fill buffer more
      buffer.addTest(createMockTest('test10', 'passed'));

      const tests = buffer.getAllTests();
      expect(tests.map((t) => t.title)).toContain('failedTest');
    });
  });

  describe('Clear', () => {
    it('should clear all tests', () => {
      buffer.addTest(createMockTest('test1', 'passed'));
      buffer.addTest(createMockTest('test2', 'passed'));

      buffer.clear();

      expect(buffer.getAllTests()).toHaveLength(0);
    });

    it('should clear specific worker', () => {
      buffer.addTest(createMockTest('test1', 'passed'), 'worker1');
      buffer.addTest(createMockTest('test2', 'passed'), 'worker2');

      buffer.clear('worker1');

      expect(buffer.getTests('worker1')).toHaveLength(0);
      expect(buffer.getTests('worker2')).toHaveLength(1);
    });
  });

  describe('Statistics', () => {
    it('should provide buffer statistics', () => {
      buffer.addTest(createMockTest('test1', 'passed'), 'worker1');
      buffer.addTest(createMockTest('test2', 'passed'), 'worker2');

      const stats = buffer.getStats();

      expect(stats.totalTests).toBe(2);
      expect(stats.workerCount).toBe(2);
      expect(stats.bufferSizes.get('worker1')).toBe(1);
      expect(stats.bufferSizes.get('worker2')).toBe(1);
    });
  });

  describe('Merge Workers', () => {
    it('should merge and sort tests from multiple workers', () => {
      const test1 = createMockTest('test1', 'passed');
      const test2 = createMockTest('test2', 'passed');
      const test3 = createMockTest('test3', 'passed');

      test1.startTime = 1000;
      test2.startTime = 2000;
      test3.startTime = 1500;

      buffer.addTest(test1, 'worker1');
      buffer.addTest(test2, 'worker2');
      buffer.addTest(test3, 'worker1');

      const merged = buffer.mergeWorkerBuffers();

      expect(merged).toHaveLength(3);
      expect(merged[0].title).toBe('test1'); // Earliest
      expect(merged[1].title).toBe('test3');
      expect(merged[2].title).toBe('test2'); // Latest
    });
  });
});

function createMockTest(title: string, status: 'passed' | 'failed' | 'skipped'): TestMetadata {
  return {
    id: `test-${title}`,
    title,
    file: 'test.spec.ts',
    status,
    startTime: Date.now(),
    steps: [],
    attachments: [],
  };
}
