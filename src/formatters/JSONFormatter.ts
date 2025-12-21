import { writeFile, mkdir } from 'fs/promises';
import { dirname } from 'path';
import type { FullResult } from '@playwright/test/reporter';
import type { FairReporterConfig, TestMetadata } from '../types/index.js';

/**
 * JSON formatter for machine-readable output
 */
export class JSONFormatter {
  private config: Required<FairReporterConfig>;
  private outputPath: string;

  constructor(config: Required<FairReporterConfig>, outputPath: string) {
    this.config = config;
    this.outputPath = outputPath;
  }

  async write(allTests: TestMetadata[], result: FullResult): Promise<void> {
    const passed = allTests.filter((t) => t.status === 'passed').length;
    const failed = allTests.filter((t) => t.status === 'failed').length;
    const skipped = allTests.filter((t) => t.status === 'skipped').length;
    const totalDuration = allTests.reduce((sum, t) => sum + (t.duration || 0), 0);

    const output = {
      status: failed > 0 ? 'failed' : 'passed',
      summary: {
        total: allTests.length,
        passed,
        failed,
        skipped,
        duration: totalDuration,
      },
      timestamp: new Date().toISOString(),
      tests: allTests.map((test) => ({
        id: test.id,
        title: test.title,
        file: test.file,
        status: test.status,
        duration: test.duration,
        startTime: test.startTime,
        endTime: test.endTime,
        error: test.error
          ? {
              message: test.error.message,
              stack: test.error.stack,
              location: test.error.location,
            }
          : undefined,
        steps: test.steps.map((step) => ({
          id: step.id,
          title: step.title,
          level: step.level,
          status: step.status,
          duration: step.duration,
          error: step.error
            ? {
                message: step.error.message,
                stack: step.error.stack,
              }
            : undefined,
        })),
        attachments: test.attachments,
      })),
    };

    try {
      // Ensure directory exists
      await mkdir(dirname(this.outputPath), { recursive: true });

      // Write file
      await writeFile(this.outputPath, JSON.stringify(output, null, 2), 'utf-8');
    } catch (error) {
      console.error(`Failed to write JSON output: ${error}`);
    }
  }
}
