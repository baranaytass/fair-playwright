import pc from 'picocolors';
import logUpdate from 'log-update';
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
  private skippedTests: number = 0;
  private currentTest?: TestMetadata;
  private runningSteps: Map<string, StepMetadata> = new Map();
  private isCI: boolean;
  private useProgressiveMode: boolean;
  private updateTimer?: NodeJS.Timeout;

  constructor(config: Required<FairReporterConfig>) {
    this.config = config;

    // Detect CI environment
    this.isCI = this.detectCI();

    // Use progressive mode only if:
    // 1. Config mode is 'progressive'
    // 2. Not in CI environment
    // 3. stdout is a TTY
    this.useProgressiveMode =
      config.mode === 'progressive' &&
      !this.isCI &&
      process.stdout.isTTY === true;
  }

  /**
   * Detect if running in CI environment
   */
  private detectCI(): boolean {
    return !!(
      process.env.CI ||
      process.env.CONTINUOUS_INTEGRATION ||
      process.env.GITHUB_ACTIONS ||
      process.env.GITLAB_CI ||
      process.env.CIRCLECI ||
      process.env.TRAVIS ||
      process.env.JENKINS_URL
    );
  }

  onBegin(totalTests: number): void {
    this.totalTests = totalTests;
    const header = pc.bold(pc.blue('🎭 Fair Playwright Reporter'));
    const subheader = pc.dim(`Running ${totalTests} test(s)...`);

    if (this.useProgressiveMode) {
      console.log(`\n${header}\n${subheader}\n`);
    } else {
      console.log(`\n${header}\n${subheader}\n`);
    }
  }

  onTestBegin(test: { title: string }): void {
    // Progressive mode will handle this in render()
    if (!this.useProgressiveMode && this.config.mode !== 'minimal') {
      console.log(pc.dim(`⏳ ${test.title}`));
    }
  }

  onStepBegin(step: StepMetadata): void {
    this.runningSteps.set(step.id, step);

    if (this.useProgressiveMode) {
      this.scheduleUpdate();
    } else if (this.config.mode === 'full') {
      const indent = step.parentId ? '    ' : '  ';
      const icon = step.level === 'major' ? '▶' : '▸';
      console.log(pc.dim(`${indent}${icon} ${step.title}...`));
    }
  }

  onStepEnd(step: StepMetadata): void {
    this.runningSteps.delete(step.id);

    if (this.useProgressiveMode) {
      this.scheduleUpdate();
    } else if (this.config.mode === 'full') {
      const indent = step.parentId ? '    ' : '  ';
      const icon = step.status === 'passed' ? pc.green('✓') : pc.red('✗');
      const duration = step.duration ? pc.dim(` (${step.duration}ms)`) : '';
      const levelBadge = step.level === 'major' ? pc.blue('[MAJOR]') : pc.dim('[minor]');
      console.log(`${indent}${icon} ${levelBadge} ${step.title}${duration}`);
    }
  }

  onTestEnd(test: TestMetadata): void {
    this.completedTests++;
    this.currentTest = undefined;

    if (test.status === 'passed') {
      this.passedTests++;
    } else if (test.status === 'failed') {
      this.failedTests++;
    } else if (test.status === 'skipped') {
      this.skippedTests++;
    }

    if (this.useProgressiveMode) {
      // In progressive mode, only show failed tests immediately
      if (test.status === 'failed') {
        this.clearUpdate();
        this.printFailedTest(test);
      }
      this.scheduleUpdate();
    } else {
      // Non-progressive mode: show all test results
      if (test.status === 'passed') {
        if (this.config.compression.passedTests !== 'hide') {
          const icon = pc.green('✓');
          const duration = pc.dim(` (${test.duration}ms)`);
          console.log(`${icon} ${pc.dim(test.title)}${duration}`);
        }
      } else if (test.status === 'failed') {
        this.printFailedTest(test);
      } else if (test.status === 'skipped') {
        console.log(pc.yellow(`⊘ ${test.title} (skipped)`));
      }
    }
  }

  onEnd(allTests: TestMetadata[], _result: FullResult): void {
    // Clear progressive updates
    if (this.useProgressiveMode) {
      this.clearUpdate();
      if (this.updateTimer) {
        clearTimeout(this.updateTimer);
      }
    }

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
    if (this.useProgressiveMode) {
      this.clearUpdate();
    }
    console.error(pc.red(`\n❌ Reporter Error: ${error.message}`));
    if (error.stack) {
      console.error(pc.dim(error.stack));
    }
  }

  /**
   * Schedule a progressive update
   */
  private scheduleUpdate(): void {
    if (!this.useProgressiveMode) return;

    if (this.updateTimer) {
      clearTimeout(this.updateTimer);
    }

    this.updateTimer = setTimeout(() => {
      this.render();
    }, this.config.progressive.updateInterval);
  }

  /**
   * Render progressive output
   */
  private render(): void {
    if (!this.useProgressiveMode) return;

    const lines: string[] = [];

    // Progress bar
    const progress = this.totalTests > 0
      ? Math.floor((this.completedTests / this.totalTests) * 100)
      : 0;

    lines.push(
      pc.dim(`Progress: ${this.completedTests}/${this.totalTests} tests `) +
      pc.green(`(${progress}%)`)
    );

    // Status counts
    const statusParts: string[] = [];
    if (this.passedTests > 0) statusParts.push(pc.green(`✓ ${this.passedTests}`));
    if (this.failedTests > 0) statusParts.push(pc.red(`✗ ${this.failedTests}`));
    if (this.skippedTests > 0) statusParts.push(pc.yellow(`⊘ ${this.skippedTests}`));

    if (statusParts.length > 0) {
      lines.push(statusParts.join(' '));
    }

    // Running steps
    if (this.runningSteps.size > 0) {
      lines.push('');
      lines.push(pc.dim('Running:'));

      const runningStepsArray = Array.from(this.runningSteps.values());
      runningStepsArray.slice(0, 5).forEach((step) => {
        const indent = step.parentId ? '    ' : '  ';
        const icon = step.level === 'major' ? '▶' : '▸';
        const levelBadge = step.level === 'major' ? pc.blue('[MAJOR]') : pc.dim('[minor]');
        const elapsed = Date.now() - step.startTime;
        lines.push(`${indent}${icon} ${levelBadge} ${step.title} ${pc.dim(`(${elapsed}ms)`)}`);
      });

      if (runningStepsArray.length > 5) {
        lines.push(pc.dim(`  ... and ${runningStepsArray.length - 5} more`));
      }
    }

    logUpdate(lines.join('\n'));
  }

  /**
   * Clear progressive update
   */
  private clearUpdate(): void {
    if (this.useProgressiveMode) {
      logUpdate.clear();
    }
  }

  /**
   * Print failed test details
   */
  private printFailedTest(test: TestMetadata): void {
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
        const levelBadge = step.level === 'major' ? pc.blue('[MAJOR]') : pc.dim('[minor]');
        console.log(pc.red(`    ✗ ${levelBadge} ${step.title}`));
        if (step.error) {
          console.log(pc.dim(`      ${step.error.message}`));
        }
      });
    }

    console.log(''); // Empty line after failed test
  }
}
