import { test } from '@playwright/test';
import type { E2EHelper, StepOptions, MajorStepOptions } from './types/index.js';

/**
 * E2E test helper for MAJOR/MINOR step hierarchy
 */
class E2EHelperImpl implements E2EHelper {
  /**
   * Execute a major step
   * Supports both inline and declarative modes
   */
  async major(
    title: string,
    actionOrOptions: (() => Promise<void>) | MajorStepOptions,
    options?: StepOptions
  ): Promise<void> {
    // Declarative mode: options object with steps
    if (typeof actionOrOptions === 'object' && 'steps' in actionOrOptions) {
      return this.majorDeclarative(title, actionOrOptions);
    }

    // Inline mode: action function
    if (typeof actionOrOptions === 'function') {
      return this.majorInline(title, actionOrOptions, options);
    }

    throw new Error('Invalid arguments for e2e.major()');
  }

  /**
   * Execute a minor step (inline mode only)
   */
  async minor(
    title: string,
    action: () => Promise<void>,
    options?: StepOptions
  ): Promise<void> {
    const stepTitle = this.formatStepTitle(title, 'minor', options);

    return test.step(stepTitle, async () => {
      try {
        await action();
        // If success message is provided, we could log it or store it
        // For now, Playwright's test.step will handle the status
      } catch (error) {
        // If failure message is provided, we could enhance the error
        if (options?.failure) {
          const enhancedError = new Error(`${options.failure}: ${(error as Error).message}`);
          enhancedError.stack = (error as Error).stack;
          throw enhancedError;
        }
        throw error;
      }
    });
  }

  /**
   * Inline mode for major steps
   */
  private async majorInline(
    title: string,
    action: () => Promise<void>,
    options?: StepOptions
  ): Promise<void> {
    const stepTitle = this.formatStepTitle(title, 'major', options);

    return test.step(stepTitle, async () => {
      try {
        await action();
      } catch (error) {
        if (options?.failure) {
          const enhancedError = new Error(`${options.failure}: ${(error as Error).message}`);
          enhancedError.stack = (error as Error).stack;
          throw enhancedError;
        }
        throw error;
      }
    });
  }

  /**
   * Declarative mode for major steps with child steps
   */
  private async majorDeclarative(
    title: string,
    options: MajorStepOptions
  ): Promise<void> {
    const stepTitle = this.formatStepTitle(title, 'major', options);

    return test.step(stepTitle, async () => {
      if (!options.steps || options.steps.length === 0) {
        return;
      }

      // Execute each child step sequentially
      for (const childStep of options.steps) {
        const childTitle = this.formatStepTitle(childStep.title, 'minor', childStep);

        await test.step(childTitle, async () => {
          try {
            await childStep.action();
          } catch (error) {
            if (childStep.failure) {
              const enhancedError = new Error(
                `${childStep.failure}: ${(error as Error).message}`
              );
              enhancedError.stack = (error as Error).stack;
              throw enhancedError;
            }
            throw error;
          }
        });
      }
    });
  }

  /**
   * Format step title with metadata for the reporter
   * The reporter will parse this metadata to classify steps
   */
  private formatStepTitle(
    title: string,
    level: 'major' | 'minor',
    _options?: StepOptions
  ): string {
    // For now, we'll use a simple prefix system
    // The reporter can parse these prefixes to identify MAJOR/MINOR steps
    const prefix = level === 'major' ? '[MAJOR]' : '[MINOR]';
    return `${prefix} ${title}`;
  }
}

/**
 * Global e2e helper instance
 * Usage:
 * import { e2e } from 'fair-playwright'
 * await e2e.major('User login', ...)
 */
export const e2e: E2EHelper = new E2EHelperImpl();
