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
   * Print failed test details with progressive MAJOR step display
   */
  private printFailedTest(test: TestMetadata): void {
    console.log(pc.red(`✗ ${test.title}`));
    console.log('');

    // Group steps by MAJOR hierarchy
    const majorSteps = test.steps.filter((s) => s.level === 'major' && !s.parentId);

    if (majorSteps.length > 0) {
      majorSteps.forEach((majorStep, index) => {
        const stepNumber = index + 1;

        if (majorStep.status === 'passed') {
          // Completed MAJOR steps: show single line
          const duration = majorStep.duration ? pc.dim(` (${majorStep.duration}ms)`) : '';
          const successMsg = majorStep.successMessage
            ? pc.dim(` - ${majorStep.successMessage}`)
            : '';
          console.log(pc.green(`  ${stepNumber}. ✓ [MAJOR] ${majorStep.title}${successMsg}${duration}`));
        } else if (majorStep.status === 'failed') {
          // Failed MAJOR step: show detailed breakdown
          console.log(pc.red(`  ${stepNumber}. ✗ [MAJOR] ${majorStep.title}`));

          // Show all MINOR steps of this MAJOR step
          const minorSteps = test.steps.filter((s) => s.parentId === majorStep.id);

          if (minorSteps.length > 0) {
            minorSteps.forEach((minorStep, minorIndex) => {
              const minorNumber = minorIndex + 1;
              const duration = minorStep.duration ? pc.dim(` (${minorStep.duration}ms)`) : '';

              if (minorStep.status === 'passed') {
                console.log(pc.green(`      ${minorNumber}. ✓ [minor] ${minorStep.title}${duration}`));
              } else if (minorStep.status === 'failed') {
                console.log(pc.red(`      ${minorNumber}. ✗ [minor] ${minorStep.title}${duration}`));
                if (minorStep.error) {
                  console.log(pc.dim(`         ${minorStep.error.message}`));
                }
              } else {
                console.log(pc.dim(`      ${minorNumber}. ⊘ [minor] ${minorStep.title}`));
              }
            });
          }

          // Show MAJOR step error if exists
          if (majorStep.error) {
            console.log('');
            console.log(pc.red(`  Error: ${majorStep.error.message}`));
          }
        } else if (majorStep.status === 'skipped') {
          console.log(pc.yellow(`  ${stepNumber}. ⊘ [MAJOR] ${majorStep.title} (skipped)`));
        }
      });
    }

    // Show test-level error details
    if (test.error) {
      console.log('');
      console.log(pc.red(`  Error Message: ${test.error.message}`));

      if (test.error.stack) {
        console.log('');
        console.log(pc.dim('  Stack Trace:'));
        const stackLines = test.error.stack.split('\n').slice(0, 5);
        stackLines.forEach((line) => {
          console.log(pc.dim(`    ${line}`));
        });
      }

      if (test.error.location) {
        console.log(pc.dim(`  Location: ${test.error.location}`));
      }
    }

    // Show browser console errors if any
    if (test.consoleErrors && test.consoleErrors.length > 0) {
      console.log('');
      console.log(pc.yellow(`  Browser Console Errors (${test.consoleErrors.length}):`));
      test.consoleErrors.forEach((consoleError, index) => {
        console.log(pc.yellow(`    ${index + 1}. [${consoleError.type}] ${consoleError.message}`));
        if (consoleError.location) {
          console.log(pc.dim(`       at ${consoleError.location}`));
        }
      });
    }

    console.log(''); // Empty line after failed test
  }
}
