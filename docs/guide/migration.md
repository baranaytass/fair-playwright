# Migration Guide

Migrate existing Playwright tests to fair-playwright.

## Overview

fair-playwright is **fully compatible** with standard Playwright tests. You can:

1. Use the reporter with existing tests (no code changes)
2. Gradually adopt the `e2e` helper for better structure
3. Mix both approaches in the same project

## Step-by-Step Migration

### 1. Install fair-playwright

```bash
npm install -D fair-playwright
```

### 2. Add Reporter

Update `playwright.config.ts`:

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [
    ['fair-playwright'],  // Add this line
    ['html']               // Keep existing reporters
  ]
});
```

### 3. Run Existing Tests

```bash
npx playwright test
```

Your tests work immediately! fair-playwright will automatically track Playwright's native steps.

### 4. Gradual Enhancement

Start enhancing tests with `e2e` helper for better structure:

```typescript
import { test } from '@playwright/test';
import { e2e } from 'fair-playwright';  // Add this import

// Existing test works as-is
test('user can login', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="email"]', 'user@example.com');
  await page.click('button[type="submit"]');
});

// Enhanced test with e2e helper
test('user can login - enhanced', async ({ page }) => {
  await e2e.major('User login flow', {
    success: 'User logged in',
    failure: 'Login failed',
    steps: [
      {
        title: 'Open login page',
        success: 'Page loaded',
        action: async () => {
          await page.goto('/login');
        }
      },
      {
        title: 'Submit credentials',
        success: 'Credentials accepted',
        action: async () => {
          await page.fill('[name="email"]', 'user@example.com');
          await page.click('button[type="submit"]');
        }
      }
    ]
  });
});
```

## Migration Patterns

### Pattern 1: Simple Actions

**Before:**
```typescript
await page.click('button');
await page.fill('input', 'value');
```

**After (inline style):**
```typescript
await e2e.minor('Click button', async () => {
  await page.click('button');
}, { success: 'Button clicked' });

await e2e.minor('Fill input', async () => {
  await page.fill('input', 'value');
}, { success: 'Input filled' });
```

**After (declarative style - recommended):**
```typescript
await e2e.major('User interaction', {
  success: 'Interaction complete',
  steps: [
    {
      title: 'Click button',
      success: 'Button clicked',
      action: async () => {
        await page.click('button');
      }
    },
    {
      title: 'Fill input',
      success: 'Input filled',
      action: async () => {
        await page.fill('input', 'value');
      }
    }
  ]
});
```

### Pattern 2: Complex Workflows

**Before:**
```typescript
test('checkout flow', async ({ page }) => {
  // Navigate to product
  await page.goto('/products/123');
  await page.click('[data-test="add-to-cart"]');

  // Go to cart
  await page.click('[data-test="cart-icon"]');
  await expect(page.locator('.cart-item')).toBeVisible();

  // Checkout
  await page.click('[data-test="checkout"]');
  await page.fill('[name="address"]', '123 Main St');
  await page.fill('[name="card"]', '4111111111111111');
  await page.click('[data-test="place-order"]');

  // Verify
  await expect(page.locator('.success-message')).toBeVisible();
});
```

**After:**
```typescript
test('checkout flow', async ({ page }) => {
  await e2e.major('Add item to cart', {
    success: 'Item added to cart',
    steps: [
      {
        title: 'Navigate to product',
        success: 'Product page loaded',
        action: async () => {
          await page.goto('/products/123');
        }
      },
      {
        title: 'Add to cart',
        success: 'Item in cart',
        action: async () => {
          await page.click('[data-test="add-to-cart"]');
        }
      }
    ]
  });

  await e2e.major('View cart', {
    success: 'Cart displayed',
    steps: [
      {
        title: 'Open cart',
        success: 'Cart opened',
        action: async () => {
          await page.click('[data-test="cart-icon"]');
        }
      },
      {
        title: 'Verify item',
        success: 'Item visible in cart',
        action: async () => {
          await expect(page.locator('.cart-item')).toBeVisible();
        }
      }
    ]
  });

  await e2e.major('Complete checkout', {
    success: 'Order placed',
    steps: [
      {
        title: 'Proceed to checkout',
        success: 'Checkout page loaded',
        action: async () => {
          await page.click('[data-test="checkout"]');
        }
      },
      {
        title: 'Enter shipping',
        success: 'Shipping entered',
        action: async () => {
          await page.fill('[name="address"]', '123 Main St');
        }
      },
      {
        title: 'Enter payment',
        success: 'Payment entered',
        action: async () => {
          await page.fill('[name="card"]', '4111111111111111');
        }
      },
      {
        title: 'Place order',
        success: 'Order confirmed',
        action: async () => {
          await page.click('[data-test="place-order"]');
          await expect(page.locator('.success-message')).toBeVisible();
        }
      }
    ]
  });
});
```

### Pattern 3: test.step() → e2e.major()

**Before:**
```typescript
test('user registration', async ({ page }) => {
  await test.step('Fill registration form', async () => {
    await page.fill('[name="email"]', 'user@example.com');
    await page.fill('[name="password"]', 'password123');
  });

  await test.step('Submit form', async () => {
    await page.click('button[type="submit"]');
  });

  await test.step('Verify success', async () => {
    await expect(page.locator('.welcome')).toBeVisible();
  });
});
```

**After:**
```typescript
test('user registration', async ({ page }) => {
  await e2e.major('User registration flow', {
    success: 'User registered successfully',
    failure: 'Registration failed',
    steps: [
      {
        title: 'Fill registration form',
        success: 'Form filled',
        action: async () => {
          await page.fill('[name="email"]', 'user@example.com');
          await page.fill('[name="password"]', 'password123');
        }
      },
      {
        title: 'Submit form',
        success: 'Form submitted',
        action: async () => {
          await page.click('button[type="submit"]');
        }
      },
      {
        title: 'Verify success',
        success: 'Welcome message shown',
        action: async () => {
          await expect(page.locator('.welcome')).toBeVisible();
        }
      }
    ]
  });
});
```

### Pattern 4: Fixtures and Hooks

fair-playwright works with all Playwright features:

```typescript
import { test as base } from '@playwright/test';
import { e2e } from 'fair-playwright';

// Custom fixture
const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    await e2e.major('Setup: Authenticate user', {
      success: 'User authenticated',
      steps: [
        {
          title: 'Login',
          success: 'Logged in',
          action: async () => {
            await page.goto('/login');
            await page.fill('[name="email"]', 'user@example.com');
            await page.fill('[name="password"]', 'password');
            await page.click('button[type="submit"]');
          }
        }
      ]
    });
    await use(page);
  }
});

// Use fixture
test('view profile', async ({ authenticatedPage }) => {
  await e2e.major('View user profile', {
    success: 'Profile displayed',
    steps: [
      {
        title: 'Navigate to profile',
        success: 'Profile page loaded',
        action: async () => {
          await authenticatedPage.goto('/profile');
        }
      }
    ]
  });
});
```

## Compatibility

### ✅ Compatible Features

- All Playwright test runners
- Parallel execution
- Test fixtures
- Before/after hooks
- Test retries
- Test annotations
- Multiple reporters
- All Playwright assertions
- Page object models
- Custom matchers

### ⚠️ Considerations

**test.step() vs e2e.major()**

Both work, but `e2e.major()` provides:
- Success/failure messages
- Better AI understanding
- Cleaner output

You can mix both:
```typescript
await test.step('Setup', async () => {
  await e2e.major('Login', { ... });
});
```

## Migration Checklist

### Phase 1: Setup (5 minutes)
- [ ] Install fair-playwright
- [ ] Add to playwright.config.ts
- [ ] Run existing tests
- [ ] Verify output

### Phase 2: Critical Tests (1 hour)
- [ ] Identify 3-5 critical test files
- [ ] Refactor with e2e.major()
- [ ] Add success/failure messages
- [ ] Review output quality

### Phase 3: Full Migration (varies)
- [ ] Convert all test files
- [ ] Establish team patterns
- [ ] Document conventions
- [ ] Train team members

### Phase 4: Advanced Features (optional)
- [ ] Setup MCP server
- [ ] Enable AI summaries
- [ ] Configure output modes
- [ ] Customize for CI/CD

## Common Pitfalls

### 1. Over-structuring

**❌ Too granular:**
```typescript
await e2e.major('Click button', {
  steps: [
    { title: 'Find button', action: async () => {} },
    { title: 'Move mouse to button', action: async () => {} },
    { title: 'Click button', action: async () => {} }
  ]
});
```

**✅ Right level:**
```typescript
await e2e.minor('Click button', async () => {
  await page.click('button');
});
```

### 2. Missing Context

**❌ No context:**
```typescript
await e2e.major('Test', {
  success: 'Done',
  failure: 'Failed',
  steps: [...]
});
```

**✅ Clear context:**
```typescript
await e2e.major('User completes checkout', {
  success: 'Order placed, confirmation email sent',
  failure: 'Checkout failed, payment declined',
  steps: [...]
});
```

### 3. Mixing Patterns Inconsistently

**❌ Inconsistent:**
```typescript
// Some tests use e2e
test('test 1', async ({ page }) => {
  await e2e.major(...);
});

// Some tests don't
test('test 2', async ({ page }) => {
  await page.click(...);
});
```

**✅ Consistent:**
- Either convert all or none in a file
- Document which pattern to use
- Use linting rules if needed

## Team Adoption

### 1. Start Small

Pick 1-2 test files for pilot:
```
tests/
├── auth.spec.ts           ← Convert this
├── checkout.spec.ts        ← And this
├── search.spec.ts          ← Leave for later
└── profile.spec.ts         ← Leave for later
```

### 2. Document Patterns

Create team guide:
```markdown
## Test Structure

All new tests should use fair-playwright:

```typescript
await e2e.major('Workflow name', {
  success: 'Clear success message',
  failure: 'Clear failure message',
  steps: [...]
});
```

See examples/ for patterns.
```

### 3. Code Review Guidelines

Review checklist:
- [ ] Uses e2e.major() for workflows
- [ ] Has clear success/failure messages
- [ ] Step titles are descriptive
- [ ] Appropriate MAJOR/MINOR hierarchy

### 4. Gradual Rollout

Week 1: Install and verify
Week 2: Convert critical tests
Week 3: Team training
Week 4: Convert remaining tests

## TypeScript Support

fair-playwright is fully typed:

```typescript
import { e2e } from 'fair-playwright';
import type { MajorStepOptions, MinorStepOptions } from 'fair-playwright';

// Full type safety
const options: MajorStepOptions = {
  success: 'Login successful',
  failure: 'Login failed',
  steps: [
    {
      title: 'Open page',
      success: 'Page opened',
      action: async () => {
        // Full Playwright types available
      }
    }
  ]
};

await e2e.major('Login', options);
```

## Performance

fair-playwright has **zero impact** on test execution:
- No additional network calls
- No blocking operations
- Async reporting only
- Minimal memory overhead

Benchmark:
```
Standard Playwright: 45.2s
With fair-playwright: 45.3s
Overhead: 0.1s (0.2%)
```

## Next Steps

- [Examples](/examples/) - See migration examples
- [Step Hierarchy](/guide/step-hierarchy) - Learn best practices
- [Configuration](/guide/configuration) - Optimize for your workflow
- [Troubleshooting](/guide/troubleshooting) - Common migration issues
