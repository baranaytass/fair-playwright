import pc from 'picocolors';
import type { FullResult } from '@playwright/test/reporter';
import type { FairReporterConfig, TestMetadata, StepMetadata } from '../types/index.js';

/**
 * Console formatter with progressive terminal output
 */
export class ConsoleFormatter {
  private config: Required<FairReporterConfig>;
  private totalTests: number = 0;
  private completedTests: number = 0;
  private passedTests: number = 0;
  private failedTests: number = 0;

  constructor(config: Required<FairReporterConfig>) {
    this.config = config;
  }

  onBegin(totalTests: number): void {
    this.totalTests = totalTests;
    console.log(pc.bold(pc.blue('\n🎭 Fair Playwright Reporter\n')));
    console.log(pc.dim(`Running ${totalTests} test(s)...\n`));
  }

  onTestBegin(test: { title: string }): void {
    if (this.config.mode !== 'minimal') {
      console.log(pc.dim(`⏳ ${test.title}`));
    }
  }

  onStepBegin(step: StepMetadata): void {
    if (this.config.mode === 'full') {
      const indent = step.parentId ? '    ' : '  ';
      const icon = step.level === 'major' ? '▶' : '▸';
      console.log(pc.dim(`${indent}${icon} ${step.title}...`));
    }
  }

  onStepEnd(step: StepMetadata): void {
    if (this.config.mode === 'full') {
      const indent = step.parentId ? '    ' : '  ';
      const icon = step.status === 'passed' ? pc.green('✓') : pc.red('✗');
      const duration = step.duration ? pc.dim(` (${step.duration}ms)`) : '';
      console.log(`${indent}${icon} ${step.title}${duration}`);
    }
  }

  onTestEnd(test: TestMetadata): void {
    this.completedTests++;

    if (test.status === 'passed') {
      this.passedTests++;
      if (this.config.compression.passedTests !== 'hide') {
        const icon = pc.green('✓');
        const duration = pc.dim(` (${test.duration}ms)`);
        console.log(`${icon} ${pc.dim(test.title)}${duration}`);
      }
    } else if (test.status === 'failed') {
      this.failedTests++;
      console.log(pc.red(`✗ ${test.title}`));

      // Show error details
      if (test.error) {
        console.log(pc.red(`  Error: ${test.error.message}`));
        if (test.error.location) {
          console.log(pc.dim(`  at ${test.error.location}`));
        }
      }

      // Show failed steps
      const failedSteps = test.steps.filter((s) => s.status === 'failed');
      if (failedSteps.length > 0) {
        console.log(pc.dim('  Failed steps:'));
        failedSteps.forEach((step) => {
          console.log(pc.red(`    ✗ ${step.title}`));
          if (step.error) {
            console.log(pc.dim(`      ${step.error.message}`));
          }
        });
      }

      console.log(''); // Empty line after failed test
    } else if (test.status === 'skipped') {
      console.log(pc.yellow(`⊘ ${test.title} (skipped)`));
    }
  }

  onEnd(allTests: TestMetadata[], result: FullResult): void {
    console.log('');
    console.log(pc.bold('─'.repeat(60)));
    console.log('');

    const passed = allTests.filter((t) => t.status === 'passed').length;
    const failed = allTests.filter((t) => t.status === 'failed').length;
    const skipped = allTests.filter((t) => t.status === 'skipped').length;

    const totalDuration = allTests.reduce((sum, t) => sum + (t.duration || 0), 0);

    // Summary
    if (failed > 0) {
      console.log(pc.red(pc.bold(`✗ ${failed} failed`)));
    }
    if (passed > 0) {
      console.log(pc.green(`✓ ${passed} passed`));
    }
    if (skipped > 0) {
      console.log(pc.yellow(`⊘ ${skipped} skipped`));
    }

    console.log(pc.dim(`\nTotal: ${allTests.length} test(s)`));
    console.log(pc.dim(`Duration: ${(totalDuration / 1000).toFixed(2)}s`));

    // AI output location
    if (this.config.output.ai) {
      const aiPath =
        typeof this.config.output.ai === 'string'
          ? this.config.output.ai
          : './test-results/ai-summary.md';
      console.log(pc.dim(`\n📝 AI Summary: ${aiPath}`));
    }

    console.log('');
  }

  onError(error: Error): void {
    console.error(pc.red(`\n❌ Reporter Error: ${error.message}`));
    if (error.stack) {
      console.error(pc.dim(error.stack));
    }
  }
}
