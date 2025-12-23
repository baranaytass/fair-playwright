# Getting Started

Get up and running with fair-playwright in minutes.

## Prerequisites

- Node.js 18 or higher
- Existing Playwright project (or create one)

## Installation

::: code-group

```bash [npm]
npm install -D fair-playwright
```

```bash [pnpm]
pnpm add -D fair-playwright
```

```bash [yarn]
yarn add -D fair-playwright
```

:::

## Basic Setup

### 1. Configure Playwright

Add fair-playwright as a reporter in your `playwright.config.ts`:

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [['fair-playwright']]
});
```

That's it! Zero configuration needed. The reporter works with sensible defaults.

### 2. Write Your First Test

Create a test file using the `e2e` helper:

```typescript
// tests/login.spec.ts
import { test, expect } from '@playwright/test';
import { e2e } from 'fair-playwright';

test('user can login', async ({ page }) => {
  await e2e.major('User login flow', {
    success: 'User logged in successfully',
    failure: 'Login failed',
    steps: [
      {
        title: 'Open login page',
        success: 'Login page loaded',
        action: async () => {
          await page.goto('https://example.com/login');
        }
      },
      {
        title: 'Enter credentials',
        success: 'Credentials entered',
        action: async () => {
          await page.getByLabel('Email').fill('user@example.com');
          await page.getByLabel('Password').fill('password123');
        }
      },
      {
        title: 'Submit form',
        success: 'Form submitted',
        action: async () => {
          await page.getByRole('button', { name: 'Login' }).click();
          await page.waitForURL('**/dashboard');
        }
      },
      {
        title: 'Verify dashboard',
        success: 'Dashboard loaded',
        action: async () => {
          await expect(page.getByText('Welcome back')).toBeVisible();
        }
      }
    ]
  });
});
```

### 3. Run Tests

Run your tests as usual:

```bash
npx playwright test
```

You'll see progressive output in the terminal:

```
✓ MAJOR: User login flow
  ✓ Open login page
  ✓ Enter credentials
  ✓ Submit form
  ✓ Verify dashboard
  → User logged in successfully
```

## Two API Styles

fair-playwright supports two styles of step definition:

### Declarative Style (Recommended)

Best for complex flows with multiple steps:

```typescript
await e2e.major('Checkout flow', {
  success: 'Order completed',
  failure: 'Checkout failed',
  steps: [
    {
      title: 'Add to cart',
      success: 'Item added',
      action: async () => {
        await page.click('[data-test="add-to-cart"]');
      }
    },
    {
      title: 'Proceed to checkout',
      success: 'Checkout page loaded',
      action: async () => {
        await page.click('[data-test="checkout"]');
      }
    }
  ]
});
```

### Inline Style

Best for quick, single-step operations:

```typescript
await e2e.minor('Click submit button', async () => {
  await page.click('[data-test="submit"]');
}, {
  success: 'Button clicked',
  failure: 'Button not found'
});
```

## Output Modes

Configure output behavior in `playwright.config.ts`:

```typescript
export default defineConfig({
  reporter: [
    ['fair-playwright', {
      mode: 'progressive',  // 'progressive' | 'full' | 'minimal'
      aiOptimized: true,
      output: {
        console: true,
        ai: './test-results/ai-summary.md',
        json: './test-results/results.json'
      }
    }]
  ]
});
```

### Progressive Mode (Default)

- Completed steps compress to one line
- Current step shows details
- Failed steps preserve context

### Full Mode

- All steps always visible
- No compression
- Useful for debugging

### Minimal Mode

- Only shows test names and results
- Minimal terminal output
- Fast for CI environments

## Next Steps

- [Configuration](/guide/configuration) - Customize reporter behavior
- [Step Hierarchy](/guide/step-hierarchy) - Understand MAJOR/MINOR steps
- [Progressive Output](/guide/progressive-output) - Learn about terminal rendering
- [Examples](/examples/) - See more usage patterns
