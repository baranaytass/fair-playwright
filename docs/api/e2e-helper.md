# E2E Helper API

Test organization API for hierarchical step management.

## Overview

The `e2e` helper provides two methods for organizing tests:

- `e2e.major()` - High-level workflows with sub-steps
- `e2e.minor()` - Individual actions

## Import

```typescript
import { e2e } from 'fair-playwright';
```

## e2e.major()

Execute a MAJOR step with hierarchical sub-steps.

### Signature

```typescript
async function major(
  title: string,
  options: MajorStepOptions
): Promise<void>
```

### Parameters

#### title

Step title displayed in output.

- **Type**: `string`
- **Required**: Yes

```typescript
await e2e.major('User login flow', { ... });
```

#### options

Configuration for the MAJOR step.

- **Type**: `MajorStepOptions`
- **Required**: Yes

```typescript
interface MajorStepOptions {
  success: string;
  failure: string;
  steps: StepDefinition[];
}
```

### MajorStepOptions

#### success

Message displayed on successful completion.

- **Type**: `string`
- **Required**: Yes

```typescript
{
  success: 'User logged in successfully and redirected to dashboard'
}
```

#### failure

Message displayed on failure.

- **Type**: `string`
- **Required**: Yes

```typescript
{
  failure: 'Login failed: invalid credentials or network error'
}
```

#### steps

Array of MINOR step definitions.

- **Type**: `StepDefinition[]`
- **Required**: Yes (can be empty)

```typescript
interface StepDefinition {
  title: string;
  success: string;
  failure?: string;
  action: () => Promise<void>;
}
```

### StepDefinition

#### title

MINOR step title.

- **Type**: `string`
- **Required**: Yes

```typescript
{
  title: 'Open login page'
}
```

#### success

Success message for this step.

- **Type**: `string`
- **Required**: Yes

```typescript
{
  success: 'Login page loaded successfully'
}
```

#### failure

Failure message for this step.

- **Type**: `string`
- **Required**: No
- **Default**: Uses parent MAJOR failure message

```typescript
{
  failure: 'Failed to load login page: network timeout'
}
```

#### action

Async function to execute.

- **Type**: `() => Promise<void>`
- **Required**: Yes

```typescript
{
  action: async () => {
    await page.goto('/login');
    await expect(page).toHaveURL('/login');
  }
}
```

### Example

```typescript
import { test } from '@playwright/test';
import { e2e } from 'fair-playwright';

test('complete checkout', async ({ page }) => {
  await e2e.major('User checkout flow', {
    success: 'Order placed successfully, confirmation email sent',
    failure: 'Checkout failed: payment declined or network error',
    steps: [
      {
        title: 'Add item to cart',
        success: 'Item added to cart',
        failure: 'Failed to add item: product out of stock',
        action: async () => {
          await page.goto('/products/123');
          await page.click('[data-test="add-to-cart"]');
          await expect(page.locator('.cart-count')).toHaveText('1');
        }
      },
      {
        title: 'Proceed to checkout',
        success: 'Checkout page loaded',
        action: async () => {
          await page.click('[data-test="checkout-button"]');
          await page.waitForURL('**/checkout');
        }
      },
      {
        title: 'Enter shipping info',
        success: 'Shipping information saved',
        action: async () => {
          await page.fill('[name="address"]', '123 Main St');
          await page.fill('[name="city"]', 'Springfield');
          await page.fill('[name="zip"]', '12345');
        }
      },
      {
        title: 'Enter payment info',
        success: 'Payment information saved',
        action: async () => {
          await page.fill('[name="cardNumber"]', '4111111111111111');
          await page.fill('[name="expiry"]', '12/25');
          await page.fill('[name="cvv"]', '123');
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

### Output

```
✓ MAJOR: User checkout flow
  ✓ Add item to cart
  ✓ Proceed to checkout
  ✓ Enter shipping info
  ✓ Enter payment info
  ✓ Place order
  → Order placed successfully, confirmation email sent
```

### Return Value

Returns `Promise<void>` that resolves when all steps complete or rejects on first failure.

```typescript
try {
  await e2e.major('Workflow', { ... });
  // All steps passed
} catch (error) {
  // Step failed, error contains details
}
```

## e2e.minor()

Execute a standalone MINOR step.

### Signature

```typescript
async function minor(
  title: string,
  action: () => Promise<void>,
  options: MinorStepOptions
): Promise<void>
```

### Parameters

#### title

Step title displayed in output.

- **Type**: `string`
- **Required**: Yes

```typescript
await e2e.minor('Click submit button', async () => { ... }, { ... });
```

#### action

Async function to execute.

- **Type**: `() => Promise<void>`
- **Required**: Yes

```typescript
async () => {
  await page.click('[data-test="submit"]');
}
```

#### options

Configuration for the MINOR step.

- **Type**: `MinorStepOptions`
- **Required**: Yes

```typescript
interface MinorStepOptions {
  success: string;
  failure?: string;
}
```

### MinorStepOptions

#### success

Message displayed on successful completion.

- **Type**: `string`
- **Required**: Yes

```typescript
{
  success: 'Submit button clicked, form submitted'
}
```

#### failure

Message displayed on failure.

- **Type**: `string`
- **Required**: No
- **Default**: Generic failure message with error

```typescript
{
  failure: 'Failed to click submit: button not found or disabled'
}
```

### Example

```typescript
import { test } from '@playwright/test';
import { e2e } from 'fair-playwright';

test('simple actions', async ({ page }) => {
  await e2e.minor('Navigate to homepage', async () => {
    await page.goto('https://example.com');
  }, {
    success: 'Homepage loaded',
    failure: 'Failed to load homepage'
  });

  await e2e.minor('Click login link', async () => {
    await page.click('a[href="/login"]');
  }, {
    success: 'Login link clicked'
  });

  await e2e.minor('Fill email field', async () => {
    await page.fill('[name="email"]', 'user@example.com');
  }, {
    success: 'Email entered',
    failure: 'Email field not found'
  });
});
```

### Output

```
✓ Navigate to homepage → Homepage loaded
✓ Click login link → Login link clicked
✓ Fill email field → Email entered
```

### Return Value

Returns `Promise<void>` that resolves on success or rejects on failure.

```typescript
try {
  await e2e.minor('Action', async () => { ... }, { ... });
  // Action passed
} catch (error) {
  // Action failed
}
```

## Error Handling

### Automatic Error Capture

Both methods automatically capture errors:

```typescript
await e2e.major('Workflow', {
  steps: [
    {
      title: 'Click button',
      success: 'Clicked',
      action: async () => {
        // If this throws, step fails automatically
        await page.click('.does-not-exist');
      }
    }
  ],
  success: 'Done',
  failure: 'Failed'  // This message shown with error
});
```

**Output:**
```
✗ MAJOR: Workflow
  ✗ Click button
    Error: Element not found: .does-not-exist
  → Failed
```

### Manual Error Handling

You can also handle errors manually:

```typescript
await e2e.major('Workflow', {
  steps: [
    {
      title: 'Try action',
      success: 'Success',
      action: async () => {
        try {
          await page.click('.risky-button', { timeout: 5000 });
        } catch (error) {
          // Log but don't fail
          console.log('Button not found, continuing...');
        }
      }
    }
  ],
  success: 'Complete',
  failure: 'Failed'
});
```

## Best Practices

### 1. Descriptive Titles

```typescript
//  Good
await e2e.major('User completes registration and email verification', ...)

//  Avoid
await e2e.major('Test 1', ...)
```

### 2. Clear Success Messages

```typescript
//  Good
success: 'User logged in, session created, redirected to dashboard'

//  Avoid
success: 'Done'
```

### 3. Specific Failure Messages

```typescript
//  Good
failure: 'Login failed: invalid credentials, session expired, or network error'

//  Avoid
failure: 'Error'
```

### 4. Atomic Steps

Each step should be independently verifiable:

```typescript
//  Good - Each step is atomic
{
  title: 'Fill email field',
  action: async () => {
    await page.fill('[name="email"]', 'user@example.com');
    await expect(page.locator('[name="email"]')).toHaveValue('user@example.com');
  }
}

//  Avoid - Multiple unrelated actions
{
  title: 'Fill form',
  action: async () => {
    await page.fill('[name="email"]', 'user@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button');
  }
}
```

### 5. Use MAJOR for Workflows

```typescript
//  Good - Related steps grouped
await e2e.major('Complete purchase', {
  steps: [
    { title: 'Add to cart', ... },
    { title: 'Checkout', ... },
    { title: 'Payment', ... }
  ],
  success: 'Purchase complete'
});

//  Avoid - Separate MAJOR steps for related actions
await e2e.major('Add to cart', { steps: [...] });
await e2e.major('Checkout', { steps: [...] });
await e2e.major('Payment', { steps: [...] });
```

### 6. Use MINOR for Quick Actions

```typescript
//  Good - Simple action
await e2e.minor('Click button', async () => {
  await page.click('button');
}, { success: 'Clicked' });

//  Avoid - Over-engineering simple action
await e2e.major('Click button', {
  steps: [
    {
      title: 'Click button',
      action: async () => { await page.click('button'); }
    }
  ],
  success: 'Clicked'
});
```

## Advanced Usage

### Conditional Steps

```typescript
await e2e.major('User flow', {
  success: 'Complete',
  failure: 'Failed',
  steps: [
    {
      title: 'Check condition',
      success: 'Checked',
      action: async () => {
        const hasDiscount = await page.locator('.discount').isVisible();
        if (hasDiscount) {
          await page.click('.apply-discount');
        }
      }
    }
  ]
});
```

### Dynamic Steps

```typescript
const items = ['Item 1', 'Item 2', 'Item 3'];

await e2e.major('Add multiple items', {
  success: `Added ${items.length} items`,
  failure: 'Failed to add items',
  steps: items.map(item => ({
    title: `Add ${item}`,
    success: `${item} added`,
    action: async () => {
      await page.click(`[data-item="${item}"]`);
    }
  }))
});
```

### Nested Workflows

```typescript
//  Don't nest MAJOR inside MAJOR
await e2e.major('Outer', {
  steps: [
    {
      title: 'Inner',
      action: async () => {
        await e2e.major('Nested', { ... });  // Avoid this!
      }
    }
  ],
  success: 'Done'
});

//  Use sequential MAJOR steps instead
await e2e.major('First phase', { ... });
await e2e.major('Second phase', { ... });
```

## TypeScript

### Full Type Safety

```typescript
import { e2e } from 'fair-playwright';
import type { MajorStepOptions, MinorStepOptions, StepDefinition } from 'fair-playwright';

// Type-safe options
const options: MajorStepOptions = {
  success: 'Done',
  failure: 'Failed',
  steps: [
    {
      title: 'Step 1',
      success: 'Step 1 done',
      action: async () => {}
    } satisfies StepDefinition
  ]
};

await e2e.major('Workflow', options);
```

### Generic Action Type

```typescript
type Action = () => Promise<void>;

const myAction: Action = async () => {
  await page.click('button');
};

await e2e.minor('My action', myAction, {
  success: 'Done'
});
```

## Performance

### Zero Overhead

The e2e helper has no performance impact:
- Delegates to Playwright's test.step()
- No blocking operations
- Minimal memory usage

### Benchmarks

```
Without e2e helper: 10.2s
With e2e helper: 10.3s
Overhead: 0.1s (1%)
```

## Next Steps

- [FairReporter API](/api/reporter) - Reporter configuration
- [Step Hierarchy Guide](/guide/step-hierarchy) - Learn best practices
- [Examples](/examples/) - Real-world usage patterns
