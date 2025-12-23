# MCP Usage Examples

Examples of using fair-playwright with AI assistants via MCP (Model Context Protocol).

## Setup

### 1. Configure Claude Desktop

Add fair-playwright MCP server to Claude Desktop:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "fair-playwright": {
      "command": "npx",
      "args": ["fair-playwright-mcp"],
      "env": {
        "FAIR_PLAYWRIGHT_RESULTS": "/Users/you/project/test-results"
      }
    }
  }
}
```

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "fair-playwright": {
      "command": "npx",
      "args": ["fair-playwright-mcp"],
      "env": {
        "FAIR_PLAYWRIGHT_RESULTS": "C:\\Users\\you\\project\\test-results"
      }
    }
  }
}
```

### 2. Enable AI-Optimized Output

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [
    ['fair-playwright', {
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

### 3. Run Tests

```bash
npx playwright test
```

### 4. Restart Claude Desktop

Close and reopen Claude Desktop to load the MCP server.

## Example Queries

### Basic Queries

#### Get Test Summary

**Query:**
```
Show me a summary of the test run
```

**Claude Response:**
```markdown
Based on the test results:

## Test Run Summary
- Total tests: 15
- Passed: 12 (80%)
- Failed: 3 (20%)
- Duration: 45.2 seconds

## Failed Tests:
1. user can checkout - Payment validation failed
2. user can update profile - Avatar upload failed
3. user can delete account - Confirmation modal issue

Would you like me to analyze any specific failure?
```

#### List Failed Tests

**Query:**
```
What tests failed?
```

**Claude Response:**
```markdown
3 tests failed:

### 1. user can checkout
- File: tests/checkout.spec.ts:45
- Error: Payment button not found
- Browser console: [ERROR] 500 Internal Server Error at /api/payment

### 2. user can update profile
- File: tests/profile.spec.ts:23
- Error: Avatar upload timeout after 30s
- No browser console errors

### 3. user can delete account
- File: tests/account.spec.ts:67
- Error: Confirmation modal did not appear
- Browser console: [WARN] Modal container not mounted

Would you like detailed analysis of any specific failure?
```

### Detailed Analysis

#### Analyze Specific Failure

**Query:**
```
Why did the checkout test fail? Analyze the error and suggest fixes.
```

**Claude Response:**
```markdown
## Failure Analysis: user can checkout

### What Happened
The test failed at the "Submit payment" step within the "Complete checkout" major workflow.

**Error:** Payment button not found
**Step Context:**
- ✓ Add items to cart (passed)
- ✓ Proceed to checkout (passed)
- ✓ Fill shipping info (passed)
- ✓ Fill payment info (passed)
- ✗ Submit payment (failed)

### Browser Console Errors
```
[ERROR] 500 Internal Server Error
URL: /api/payment
Response: {"error": "Payment gateway timeout"}
```

### Root Cause
The payment API returned a 500 error, which likely caused the payment form to not render properly, resulting in the missing payment button.

### Suggested Fixes

1. **Immediate Fix - Increase Timeout**
   ```typescript
   await page.getByRole('button', { name: 'Submit Payment' })
     .click({ timeout: 10000 });
   ```

2. **Better Fix - Check API Health First**
   ```typescript
   // Add step to verify payment API is available
   {
     title: 'Verify payment service',
     success: 'Payment service healthy',
     action: async () => {
       const response = await page.request.get('/api/payment/health');
       expect(response.ok()).toBeTruthy();
     }
   }
   ```

3. **Best Fix - Handle API Errors Gracefully**
   ```typescript
   {
     title: 'Submit payment',
     success: 'Payment submitted',
     failure: 'Payment service unavailable',
     action: async () => {
       await page.getByRole('button', { name: 'Submit Payment' }).click();

       // Check for error message
       const errorVisible = await page.locator('.payment-error')
         .isVisible({ timeout: 2000 })
         .catch(() => false);

       if (errorVisible) {
         const errorText = await page.locator('.payment-error').textContent();
         throw new Error(`Payment failed: ${errorText}`);
       }

       await expect(page.locator('.payment-success')).toBeVisible();
     }
   }
   ```

### Investigation Steps
1. Check if payment gateway is operational
2. Review payment API logs for the test timeframe
3. Verify network connectivity in test environment
4. Check if payment form requires additional validation

Would you like me to review other failed tests or help implement these fixes?
```

### Test Generation

#### Generate Similar Test

**Query:**
```
Generate a new test similar to the login test, but for user registration
```

**Claude Response:**
```typescript
// Based on your successful "user can login" test pattern:

import { test, expect } from '@playwright/test';
import { e2e } from 'fair-playwright';

test('user can register', async ({ page }) => {
  await e2e.major('User registration flow', {
    success: 'User registered successfully and logged in',
    failure: 'Registration failed',
    steps: [
      {
        title: 'Open registration page',
        success: 'Registration page loaded',
        action: async () => {
          await page.goto('https://example.com/register');
          await expect(page).toHaveTitle(/Register/);
        }
      },
      {
        title: 'Fill personal information',
        success: 'Personal info entered',
        action: async () => {
          await page.getByLabel('First Name').fill('John');
          await page.getByLabel('Last Name').fill('Doe');
          await page.getByLabel('Email').fill('john.doe@example.com');
        }
      },
      {
        title: 'Set password',
        success: 'Password set',
        action: async () => {
          await page.getByLabel('Password').fill('SecurePass123!');
          await page.getByLabel('Confirm Password').fill('SecurePass123!');
        }
      },
      {
        title: 'Accept terms',
        success: 'Terms accepted',
        action: async () => {
          await page.getByLabel('I accept the terms and conditions').check();
        }
      },
      {
        title: 'Submit registration',
        success: 'Registration submitted',
        action: async () => {
          await page.getByRole('button', { name: 'Register' }).click();
        }
      },
      {
        title: 'Verify successful registration',
        success: 'Redirected to dashboard',
        action: async () => {
          await page.waitForURL('**/dashboard');
          await expect(page.getByText(/Welcome, John/i)).toBeVisible();
        }
      }
    ]
  });
});
```

**Explanation:**
This test follows the same pattern as your login test:
1. Navigate to the target page
2. Fill required fields step by step
3. Submit the form
4. Verify successful completion

Key differences:
- Registration requires more fields (first/last name)
- Password confirmation field
- Terms acceptance checkbox
- Different success indicator (welcome message with name)

Would you like me to add email verification flow or additional validation?
```

### Code Review

#### Review Test Quality

**Query:**
```
Review my tests and suggest improvements
```

**Claude Response:**
```markdown
## Test Suite Review

### Summary
- **Tests analyzed:** 15
- **Overall quality:** Good
- **Pass rate:** 80%
- **Areas for improvement:** 3

### Strengths ✅

1. **Good use of MAJOR/MINOR hierarchy**
   - Clear separation of workflows
   - Logical step grouping
   - Easy to understand test intent

2. **Descriptive success messages**
   - Most steps have context-rich success messages
   - Failure messages are informative

3. **Consistent patterns**
   - Login/logout flows are well-structured
   - Good use of page object patterns

### Suggested Improvements 💡

#### 1. Add Explicit Waits

**Issue:** Some tests may be flaky due to missing waits

**Example:** `tests/profile.spec.ts:45`
```typescript
// Current (potentially flaky)
await page.click('.save-button');
await expect(page.locator('.success-message')).toBeVisible();

// Suggested improvement
await page.click('.save-button');
await page.waitForLoadState('networkidle');
await expect(page.locator('.success-message')).toBeVisible();
```

#### 2. Extract Common Flows

**Issue:** Login flow repeated in multiple tests

**Suggested refactoring:**
```typescript
// tests/helpers/auth.ts
export async function loginUser(page: Page, email: string, password: string) {
  await e2e.major('User login', {
    success: 'User logged in',
    failure: 'Login failed',
    steps: [
      {
        title: 'Navigate to login',
        success: 'Login page loaded',
        action: async () => {
          await page.goto('/login');
        }
      },
      {
        title: 'Enter credentials',
        success: 'Credentials entered',
        action: async () => {
          await page.getByLabel('Email').fill(email);
          await page.getByLabel('Password').fill(password);
        }
      },
      {
        title: 'Submit',
        success: 'Logged in',
        action: async () => {
          await page.getByRole('button', { name: 'Login' }).click();
          await page.waitForURL('**/dashboard');
        }
      }
    ]
  });
}

// In tests
import { loginUser } from './helpers/auth';

test('user can update profile', async ({ page }) => {
  await loginUser(page, 'user@example.com', 'password');
  // Rest of test...
});
```

#### 3. Add Cleanup Steps

**Issue:** Some tests don't clean up created data

**Example:** `tests/todo.spec.ts:89`
```typescript
// Add cleanup
test.afterEach(async ({ request }) => {
  // Delete created todos
  await request.delete('/api/todos/cleanup');
});
```

#### 4. Improve Error Messages

**Issue:** Some failure messages are generic

**Example:** `tests/checkout.spec.ts:120`
```typescript
// Current
failure: 'Failed'

// Better
failure: 'Checkout failed: payment declined, network timeout, or cart expired'
```

### Test-Specific Recommendations

#### tests/checkout.spec.ts
- ✅ Good workflow structure
- ⚠️ Add payment API health check before proceeding
- ⚠️ Handle network failures gracefully

#### tests/profile.spec.ts
- ✅ Good use of MAJOR steps
- ⚠️ Avatar upload timeout needs investigation
- 💡 Consider adding file size validation

#### tests/account.spec.ts
- ⚠️ Confirmation modal timing issue
- 💡 Add explicit wait for modal to render
- 💡 Consider testing modal accessibility

### Priority Action Items

1. **High Priority:**
   - Fix avatar upload timeout in profile test
   - Add payment API health check in checkout test

2. **Medium Priority:**
   - Extract common login flow to helper
   - Add explicit waits in profile test

3. **Low Priority:**
   - Improve generic error messages
   - Add test data cleanup

Would you like me to help implement any of these improvements?
```

## Advanced MCP Queries

### Compare Test Runs

**Query:**
```
Compare the current test run with previous ones
```

### Find Flaky Tests

**Query:**
```
Which tests are flaky? Show me tests that sometimes pass and sometimes fail
```

### Test Coverage Analysis

**Query:**
```
What user flows are not covered by tests?
```

### Performance Analysis

**Query:**
```
Which tests are slowest? Can you suggest optimizations?
```

## MCP Server Commands

### Start Server Manually

```bash
# Basic
npx fair-playwright-mcp

# With options
npx fair-playwright-mcp --results-path ./test-results --verbose

# With environment variable
export FAIR_PLAYWRIGHT_RESULTS=/path/to/results
npx fair-playwright-mcp
```

### Debug Mode

```bash
DEBUG=fair-playwright:mcp npx fair-playwright-mcp --verbose
```

**Output:**
```
[fair-playwright:mcp] Starting MCP server
[fair-playwright:mcp] Results path: /path/to/results
[fair-playwright:mcp] Registered 3 resources
[fair-playwright:mcp] Registered 5 tools
[fair-playwright:mcp] Server ready on stdio
```

## Troubleshooting

### MCP Server Not Showing

**Issue:** Claude Desktop doesn't show fair-playwright server

**Solution:**

1. Verify config path:
```bash
# macOS
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json

# Windows
type %APPDATA%\Claude\claude_desktop_config.json
```

2. Check JSON syntax is valid
3. Use absolute paths (not relative)
4. Restart Claude Desktop completely

### Results Not Found

**Issue:** "Test results not found" error

**Solution:**

1. Run tests first:
```bash
npx playwright test
```

2. Verify results path:
```bash
ls -la /path/to/test-results
```

3. Check JSON output is enabled:
```typescript
{
  output: {
    json: './test-results/results.json'
  }
}
```

## Best Practices

### 1. Keep Test Results Fresh

Run tests before querying:
```bash
npm test && # Claude can now see latest results
```

### 2. Use AI-Optimized Output

Always enable AI summaries:
```typescript
{
  aiOptimized: true,
  output: {
    ai: './test-results/ai-summary.md'
  }
}
```

### 3. Descriptive Step Messages

Help AI understand context:
```typescript
// ✅ Good - Context-rich
success: 'Payment processed, confirmation email sent, order #12345 created'

// ❌ Avoid - No context
success: 'Done'
```

### 4. Structure Complex Workflows

Use MAJOR/MINOR hierarchy:
```typescript
// ✅ Good - Clear structure for AI
await e2e.major('E-commerce checkout', {
  steps: [
    { title: 'Add to cart', ... },
    { title: 'Enter shipping', ... },
    { title: 'Enter payment', ... },
    { title: 'Place order', ... }
  ]
});
```

## Next Steps

- [MCP Integration Guide](/guide/mcp) - Detailed setup
- [API Reference](/api/mcp-server) - Server documentation
- [Troubleshooting](/guide/troubleshooting) - Common issues
- [MCP Protocol Docs](https://modelcontextprotocol.io) - Official MCP docs
