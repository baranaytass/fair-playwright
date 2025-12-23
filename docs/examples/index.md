# Examples

Real-world examples of using fair-playwright in your tests.

## Overview

This section contains complete, working examples organized by complexity and use case.

## Example Categories

### [Basic Usage](/examples/basic)

Simple examples for getting started:
- Single MAJOR step with MINOR steps
- Standalone MINOR steps
- Basic configuration
- Simple test patterns

**Best for:**
- New users
- Learning the fundamentals
- Quick reference

### [Advanced Tests](/examples/advanced)

Complex real-world scenarios:
- Multi-step workflows
- E-commerce checkout flows
- Form submissions with validation
- Error handling patterns
- Dynamic step generation

**Best for:**
- Production test suites
- Complex user flows
- Best practices

### [MCP Usage](/examples/mcp)

AI assistant integration examples:
- Claude Desktop setup
- Querying test results
- Analyzing failures
- Generating tests with AI
- Debugging with AI assistance

**Best for:**
- AI-powered testing
- Test analysis
- Automated debugging

## Running Examples

### Clone Repository

```bash
git clone https://github.com/baranaytass/fair-playwright.git
cd fair-playwright
```

### Install Dependencies

```bash
npm install
```

### Run Example Tests

```bash
# Run all examples
cd examples
npm test

# Run specific example
npm test basic.spec.ts
```

## Project Structure

```
examples/
├── playwright.config.ts   # Example configuration
├── package.json          # Dependencies
├── tests/
│   ├── basic.spec.ts     # Basic usage examples
│   ├── advanced.spec.ts  # Advanced patterns
│   └── mcp.spec.ts       # MCP integration examples
└── README.md            # Example-specific docs
```

## Quick Start Template

Create a new test with fair-playwright:

```typescript
import { test, expect } from '@playwright/test';
import { e2e } from 'fair-playwright';

test('my test', async ({ page }) => {
  await e2e.major('Test workflow', {
    success: 'Workflow completed successfully',
    failure: 'Workflow failed',
    steps: [
      {
        title: 'Step 1',
        success: 'Step 1 complete',
        action: async () => {
          // Your test code here
        }
      }
    ]
  });
});
```

## Configuration Template

Basic `playwright.config.ts`:

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [['fair-playwright', {
    mode: 'progressive',
    aiOptimized: true
  }]]
});
```

## Common Patterns

### Login Flow

```typescript
await e2e.major('User login', {
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
      title: 'Enter credentials',
      success: 'Credentials entered',
      action: async () => {
        await page.fill('[name="email"]', 'user@example.com');
        await page.fill('[name="password"]', 'password');
      }
    },
    {
      title: 'Submit form',
      success: 'Logged in',
      action: async () => {
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL('/dashboard');
      }
    }
  ]
});
```

### Form Submission

```typescript
await e2e.major('Submit contact form', {
  success: 'Form submitted',
  failure: 'Form submission failed',
  steps: [
    {
      title: 'Fill form fields',
      success: 'Fields filled',
      action: async () => {
        await page.fill('[name="name"]', 'John Doe');
        await page.fill('[name="email"]', 'john@example.com');
        await page.fill('[name="message"]', 'Hello!');
      }
    },
    {
      title: 'Submit',
      success: 'Submitted',
      action: async () => {
        await page.click('button[type="submit"]');
        await expect(page.locator('.success')).toBeVisible();
      }
    }
  ]
});
```

### API + UI Test

```typescript
await e2e.major('Create and verify item', {
  success: 'Item created and visible',
  failure: 'Item creation failed',
  steps: [
    {
      title: 'Create via API',
      success: 'API call succeeded',
      action: async () => {
        const response = await page.request.post('/api/items', {
          data: { name: 'Test Item' }
        });
        expect(response.ok()).toBeTruthy();
      }
    },
    {
      title: 'Verify in UI',
      success: 'Item visible',
      action: async () => {
        await page.reload();
        await expect(page.locator('text=Test Item')).toBeVisible();
      }
    }
  ]
});
```

## Tips

### 1. Keep Titles Descriptive

```typescript
// ✅ Good
title: 'Fill shipping address and validate zip code'

// ❌ Avoid
title: 'Step 1'
```

### 2. Use Success Messages for Context

```typescript
// ✅ Good
success: 'Form submitted, confirmation email sent, user redirected'

// ❌ Avoid
success: 'Done'
```

### 3. Group Related Actions

```typescript
// ✅ Good - Logical grouping
await e2e.major('Setup test data', { steps: [...] });
await e2e.major('Execute test', { steps: [...] });
await e2e.major('Verify results', { steps: [...] });

// ❌ Avoid - Too granular
await e2e.major('Click button 1', { steps: [...] });
await e2e.major('Click button 2', { steps: [...] });
```

### 4. Handle Errors Gracefully

```typescript
{
  title: 'Optional step',
  success: 'Step completed',
  action: async () => {
    try {
      await page.click('.optional-button', { timeout: 2000 });
    } catch {
      // Continue if button not found
    }
  }
}
```

## Next Steps

- [Basic Usage](/examples/basic) - Start with simple examples
- [Advanced Tests](/examples/advanced) - Learn complex patterns
- [MCP Usage](/examples/mcp) - Integrate with AI assistants
- [API Reference](/api/) - Full API documentation
