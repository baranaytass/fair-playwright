# Basic Usage Examples

Simple examples to get started with fair-playwright.

## Example 1: Simple Login

Basic login flow with MAJOR step and MINOR sub-steps.

```typescript
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
          await expect(page).toHaveTitle(/Login/);
        }
      },
      {
        title: 'Enter email',
        success: 'Email entered',
        action: async () => {
          await page.getByLabel('Email').fill('user@example.com');
        }
      },
      {
        title: 'Enter password',
        success: 'Password entered',
        action: async () => {
          await page.getByLabel('Password').fill('password123');
        }
      },
      {
        title: 'Click login button',
        success: 'Login button clicked',
        action: async () => {
          await page.getByRole('button', { name: 'Login' }).click();
        }
      },
      {
        title: 'Verify redirect',
        success: 'Redirected to dashboard',
        action: async () => {
          await page.waitForURL('**/dashboard');
          await expect(page.getByText('Welcome back')).toBeVisible();
        }
      }
    ]
  });
});
```

**Output:**
```
✓ MAJOR: User login flow
  ✓ Open login page
  ✓ Enter email
  ✓ Enter password
  ✓ Click login button
  ✓ Verify redirect
  → User logged in successfully
```

## Example 2: Standalone MINOR Steps

Simple actions using inline MINOR steps.

```typescript
import { test, expect } from '@playwright/test';
import { e2e } from 'fair-playwright';

test('navigate and click', async ({ page }) => {
  await e2e.minor('Navigate to homepage', async () => {
    await page.goto('https://example.com');
  }, {
    success: 'Homepage loaded',
    failure: 'Failed to load homepage'
  });

  await e2e.minor('Click "About" link', async () => {
    await page.getByRole('link', { name: 'About' }).click();
  }, {
    success: 'About page opened'
  });

  await e2e.minor('Verify about page content', async () => {
    await expect(page.getByRole('heading', { name: 'About Us' })).toBeVisible();
  }, {
    success: 'Content verified',
    failure: 'About page content not found'
  });
});
```

**Output:**
```
✓ Navigate to homepage → Homepage loaded
✓ Click "About" link → About page opened
✓ Verify about page content → Content verified
```

## Example 3: Simple Form Submission

Contact form with validation.

```typescript
import { test, expect } from '@playwright/test';
import { e2e } from 'fair-playwright';

test('submit contact form', async ({ page }) => {
  await e2e.major('Submit contact form', {
    success: 'Form submitted, confirmation shown',
    failure: 'Form submission failed',
    steps: [
      {
        title: 'Navigate to contact page',
        success: 'Contact page loaded',
        action: async () => {
          await page.goto('https://example.com/contact');
        }
      },
      {
        title: 'Fill name field',
        success: 'Name entered',
        action: async () => {
          await page.getByLabel('Name').fill('John Doe');
        }
      },
      {
        title: 'Fill email field',
        success: 'Email entered',
        action: async () => {
          await page.getByLabel('Email').fill('john@example.com');
        }
      },
      {
        title: 'Fill message field',
        success: 'Message entered',
        action: async () => {
          await page.getByLabel('Message').fill('Hello, this is a test message');
        }
      },
      {
        title: 'Submit form',
        success: 'Form submitted',
        action: async () => {
          await page.getByRole('button', { name: 'Submit' }).click();
        }
      },
      {
        title: 'Verify success message',
        success: 'Success message displayed',
        action: async () => {
          await expect(page.getByText('Thank you for your message')).toBeVisible();
        }
      }
    ]
  });
});
```

**Output:**
```
✓ MAJOR: Submit contact form
  ✓ Navigate to contact page
  ✓ Fill name field
  ✓ Fill email field
  ✓ Fill message field
  ✓ Submit form
  ✓ Verify success message
  → Form submitted, confirmation shown
```

## Example 4: Search Functionality

Search with results validation.

```typescript
import { test, expect } from '@playwright/test';
import { e2e } from 'fair-playwright';

test('search for product', async ({ page }) => {
  await e2e.major('Search for laptop', {
    success: 'Search completed, results shown',
    failure: 'Search failed',
    steps: [
      {
        title: 'Open homepage',
        success: 'Homepage loaded',
        action: async () => {
          await page.goto('https://example.com');
        }
      },
      {
        title: 'Enter search term',
        success: 'Search term entered',
        action: async () => {
          await page.getByPlaceholder('Search').fill('laptop');
        }
      },
      {
        title: 'Click search button',
        success: 'Search executed',
        action: async () => {
          await page.getByRole('button', { name: 'Search' }).click();
        }
      },
      {
        title: 'Wait for results',
        success: 'Results loaded',
        action: async () => {
          await page.waitForSelector('.product-list');
        }
      },
      {
        title: 'Verify results count',
        success: 'Results found',
        action: async () => {
          const count = await page.locator('.product-item').count();
          expect(count).toBeGreaterThan(0);
        }
      }
    ]
  });
});
```

**Output:**
```
✓ MAJOR: Search for laptop
  ✓ Open homepage
  ✓ Enter search term
  ✓ Click search button
  ✓ Wait for results
  ✓ Verify results count
  → Search completed, results shown
```

## Example 5: Navigation Test

Multi-page navigation.

```typescript
import { test, expect } from '@playwright/test';
import { e2e } from 'fair-playwright';

test('navigate through pages', async ({ page }) => {
  await e2e.minor('Open homepage', async () => {
    await page.goto('https://example.com');
    await expect(page).toHaveTitle(/Home/);
  }, {
    success: 'Homepage loaded'
  });

  await e2e.minor('Go to products page', async () => {
    await page.getByRole('link', { name: 'Products' }).click();
    await expect(page).toHaveURL(/products/);
  }, {
    success: 'Products page loaded'
  });

  await e2e.minor('Go to about page', async () => {
    await page.getByRole('link', { name: 'About' }).click();
    await expect(page).toHaveURL(/about/);
  }, {
    success: 'About page loaded'
  });

  await e2e.minor('Return to homepage', async () => {
    await page.getByRole('link', { name: 'Home' }).click();
    await expect(page).toHaveURL('https://example.com');
  }, {
    success: 'Returned to homepage'
  });
});
```

**Output:**
```
✓ Open homepage → Homepage loaded
✓ Go to products page → Products page loaded
✓ Go to about page → About page loaded
✓ Return to homepage → Returned to homepage
```

## Example 6: Error Handling

Handling expected errors gracefully.

```typescript
import { test, expect } from '@playwright/test';
import { e2e } from 'fair-playwright';

test('login with invalid credentials', async ({ page }) => {
  await e2e.major('Attempt login with invalid credentials', {
    success: 'Error message shown',
    failure: 'Login validation failed',
    steps: [
      {
        title: 'Open login page',
        success: 'Login page loaded',
        action: async () => {
          await page.goto('https://example.com/login');
        }
      },
      {
        title: 'Enter invalid email',
        success: 'Email entered',
        action: async () => {
          await page.getByLabel('Email').fill('invalid@example.com');
        }
      },
      {
        title: 'Enter invalid password',
        success: 'Password entered',
        action: async () => {
          await page.getByLabel('Password').fill('wrongpassword');
        }
      },
      {
        title: 'Click login button',
        success: 'Login attempted',
        action: async () => {
          await page.getByRole('button', { name: 'Login' }).click();
        }
      },
      {
        title: 'Verify error message',
        success: 'Error message displayed',
        action: async () => {
          await expect(page.getByText('Invalid credentials')).toBeVisible();
          // Should stay on login page
          await expect(page).toHaveURL(/login/);
        }
      }
    ]
  });
});
```

**Output:**
```
✓ MAJOR: Attempt login with invalid credentials
  ✓ Open login page
  ✓ Enter invalid email
  ✓ Enter invalid password
  ✓ Click login button
  ✓ Verify error message
  → Error message shown
```

## Example 7: Configuration

Different configurations for different scenarios.

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [
    ['fair-playwright', {
      // Development: Progressive mode with timings
      mode: process.env.CI ? 'minimal' : 'progressive',
      progressive: {
        showTimings: !process.env.CI,
        clearCompleted: true,
        updateInterval: 100
      },
      // Enable AI summaries in CI
      output: {
        console: true,
        ai: process.env.CI ? './test-results/ai-summary.md' : false,
        json: process.env.CI ? './test-results/results.json' : false
      }
    }]
  ]
});
```

## Best Practices from Examples

### 1. Use Descriptive Titles

```typescript
//  Good
title: 'Verify user redirected to dashboard after login'

//  Avoid
title: 'Check redirect'
```

### 2. Include Context in Success Messages

```typescript
//  Good
success: 'Login page loaded, form visible, ready for input'

//  Avoid
success: 'Done'
```

### 3. Group Related Actions

```typescript
//  Good - Logical MAJOR step
await e2e.major('Complete registration', {
  steps: [
    { title: 'Fill personal info', ... },
    { title: 'Fill address', ... },
    { title: 'Accept terms', ... },
    { title: 'Submit', ... }
  ]
});

//  Avoid - Unrelated actions grouped
await e2e.major('Do stuff', {
  steps: [
    { title: 'Login', ... },
    { title: 'Search products', ... },
    { title: 'Logout', ... }
  ]
});
```

### 4. Use MINOR for Simple Actions

```typescript
//  Good - Simple action
await e2e.minor('Click button', async () => {
  await page.click('button');
}, { success: 'Clicked' });

//  Avoid - Over-engineering
await e2e.major('Click button', {
  steps: [
    { title: 'Find button', action: async () => {} },
    { title: 'Click button', action: async () => {} }
  ]
});
```

## Next Steps

- [Advanced Tests](/examples/advanced) - Complex patterns
- [MCP Usage](/examples/mcp) - AI integration
- [API Reference](/api/) - Full documentation
- [Migration Guide](/guide/migration) - Convert existing tests
