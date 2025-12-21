import type { TestMetadata, StepMetadata } from '../types/index.js';

/**
 * Buffer entry for a single test or step
 */
interface BufferEntry {
  type: 'test' | 'step';
  data: TestMetadata | StepMetadata;
  timestamp: number;
  workerId?: string;
}

/**
 * Smart output buffer for handling parallel test execution
 * Manages logs per worker and compresses passed test output
 */
export class OutputBuffer {
  private buffers: Map<string, BufferEntry[]> = new Map();
  private maxBufferSize: number;
  private compressPassedTests: boolean;

  constructor(options?: {
    maxBufferSize?: number;
    compressPassedTests?: boolean;
  }) {
    this.maxBufferSize = options?.maxBufferSize ?? 1000;
    this.compressPassedTests = options?.compressPassedTests ?? true;
  }

  /**
   * Add a test to the buffer
   */
  addTest(test: TestMetadata, workerId?: string): void {
    const key = workerId || 'default';

    if (!this.buffers.has(key)) {
      this.buffers.set(key, []);
    }

    const buffer = this.buffers.get(key)!;

    // Check buffer size limit
    if (buffer.length >= this.maxBufferSize) {
      // Remove oldest passed test to make room
      this.removeOldestPassedTest(key);
    }

    buffer.push({
      type: 'test',
      data: test,
      timestamp: Date.now(),
      workerId,
    });
  }

  /**
   * Add a step to the buffer
   */
  addStep(step: StepMetadata, workerId?: string): void {
    const key = workerId || 'default';

    if (!this.buffers.has(key)) {
      this.buffers.set(key, []);
    }

    const buffer = this.buffers.get(key)!;

    // Check buffer size limit
    if (buffer.length >= this.maxBufferSize) {
      this.removeOldestPassedTest(key);
    }

    buffer.push({
      type: 'step',
      data: step,
      timestamp: Date.now(),
      workerId,
    });
  }

  /**
   * Get all tests from a worker's buffer
   */
  getTests(workerId?: string): TestMetadata[] {
    const key = workerId || 'default';
    const buffer = this.buffers.get(key) || [];

    return buffer
      .filter((entry) => entry.type === 'test')
      .map((entry) => entry.data as TestMetadata);
  }

  /**
   * Get all tests from all workers
   */
  getAllTests(): TestMetadata[] {
    const allTests: TestMetadata[] = [];

    for (const buffer of this.buffers.values()) {
      const tests = buffer
        .filter((entry) => entry.type === 'test')
        .map((entry) => entry.data as TestMetadata);
      allTests.push(...tests);
    }

    return allTests;
  }

  /**
   * Get failed tests only
   */
  getFailedTests(workerId?: string): TestMetadata[] {
    const tests = workerId ? this.getTests(workerId) : this.getAllTests();
    return tests.filter((test) => test.status === 'failed');
  }

  /**
   * Get passed tests only
   */
  getPassedTests(workerId?: string): TestMetadata[] {
    const tests = workerId ? this.getTests(workerId) : this.getAllTests();
    return tests.filter((test) => test.status === 'passed');
  }

  /**
   * Compress passed tests to save memory
   * Removes step details from passed tests
   */
  compressPassedTest(test: TestMetadata): TestMetadata {
    if (!this.compressPassedTests || test.status !== 'passed') {
      return test;
    }

    // Create a compressed copy with minimal data
    return {
      ...test,
      steps: [], // Remove step details
      attachments: [], // Remove attachments for passed tests
    };
  }

  /**
   * Clear buffer for a specific worker
   */
  clear(workerId?: string): void {
    if (workerId) {
      this.buffers.delete(workerId);
    } else {
      this.buffers.clear();
    }
  }

  /**
   * Get buffer statistics
   */
  getStats(): {
    totalEntries: number;
    totalTests: number;
    totalSteps: number;
    workerCount: number;
    bufferSizes: Map<string, number>;
  } {
    let totalEntries = 0;
    let totalTests = 0;
    let totalSteps = 0;
    const bufferSizes = new Map<string, number>();

    for (const [workerId, buffer] of this.buffers.entries()) {
      totalEntries += buffer.length;
      bufferSizes.set(workerId, buffer.length);

      for (const entry of buffer) {
        if (entry.type === 'test') {
          totalTests++;
        } else {
          totalSteps++;
        }
      }
    }

    return {
      totalEntries,
      totalTests,
      totalSteps,
      workerCount: this.buffers.size,
      bufferSizes,
    };
  }

  /**
   * Remove oldest passed test from buffer to free up space
   */
  private removeOldestPassedTest(workerId: string): void {
    const buffer = this.buffers.get(workerId);
    if (!buffer) return;

    // Find oldest passed test
    let oldestIndex = -1;
    let oldestTimestamp = Infinity;

    for (let i = 0; i < buffer.length; i++) {
      const entry = buffer[i];
      if (
        entry.type === 'test' &&
        (entry.data as TestMetadata).status === 'passed' &&
        entry.timestamp < oldestTimestamp
      ) {
        oldestIndex = i;
        oldestTimestamp = entry.timestamp;
      }
    }

    // Remove if found, otherwise remove oldest entry
    if (oldestIndex >= 0) {
      buffer.splice(oldestIndex, 1);
    } else if (buffer.length > 0) {
      buffer.shift(); // Remove first entry
    }
  }

  /**
   * Merge buffers from multiple workers
   * Useful for generating final reports
   */
  mergeWorkerBuffers(): TestMetadata[] {
    const allTests = this.getAllTests();

    // Sort by timestamp (test start time)
    return allTests.sort((a, b) => a.startTime - b.startTime);
  }

  /**
   * Get memory usage estimate in bytes
   */
  getMemoryEstimate(): number {
    let totalSize = 0;

    for (const buffer of this.buffers.values()) {
      for (const entry of buffer) {
        // Rough estimate: each entry is ~1KB on average
        totalSize += 1024;

        if (entry.type === 'test') {
          const test = entry.data as TestMetadata;
          // Add size of steps
          totalSize += test.steps.length * 512;
          // Add size of attachments metadata
          totalSize += test.attachments.length * 256;
        }
      }
    }

    return totalSize;
  }
}
