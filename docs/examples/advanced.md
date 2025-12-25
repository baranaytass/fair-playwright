# Advanced Test Examples

Complex real-world testing patterns with fair-playwright.

## Example 1: E-commerce Checkout Flow

Complete checkout process with multiple steps.

```typescript
import { test, expect } from '@playwright/test';
import { e2e } from 'fair-playwright';

test('complete purchase flow', async ({ page }) => {
  // Step 1: Add items to cart
  await e2e.major('Add items to cart', {
    success: 'Cart ready with 2 items',
    failure: 'Failed to add items to cart',
    steps: [
      {
        title: 'Navigate to products',
        success: 'Product page loaded',
        action: async () => {
          await page.goto('https://example.com/products');
        }
      },
      {
        title: 'Add first product',
        success: 'Product 1 added',
        action: async () => {
          await page.locator('.product-card').first().click();
          await page.getByRole('button', { name: 'Add to cart' }).click();
          await expect(page.locator('.cart-count')).toHaveText('1');
        }
      },
      {
        title: 'Return to products',
        success: 'Back to product list',
        action: async () => {
          await page.goBack();
        }
      },
      {
        title: 'Add second product',
        success: 'Product 2 added',
        action: async () => {
          await page.locator('.product-card').nth(1).click();
          await page.getByRole('button', { name: 'Add to cart' }).click();
          await expect(page.locator('.cart-count')).toHaveText('2');
        }
      }
    ]
  });

  // Step 2: Review cart
  await e2e.major('Review cart', {
    success: 'Cart verified',
    failure: 'Cart validation failed',
    steps: [
      {
        title: 'Open cart',
        success: 'Cart page opened',
        action: async () => {
          await page.getByRole('link', { name: 'Cart' }).click();
          await expect(page).toHaveURL(/cart/);
        }
      },
      {
        title: 'Verify items count',
        success: '2 items in cart',
        action: async () => {
          const count = await page.locator('.cart-item').count();
          expect(count).toBe(2);
        }
      },
      {
        title: 'Verify total price',
        success: 'Price calculated correctly',
        action: async () => {
          const total = await page.locator('.cart-total').textContent();
          expect(total).toMatch(/\$\d+\.\d{2}/);
        }
      }
    ]
  });

  // Step 3: Complete checkout
  await e2e.major('Complete checkout', {
    success: 'Order placed successfully, confirmation #12345',
    failure: 'Checkout failed',
    steps: [
      {
        title: 'Proceed to checkout',
        success: 'Checkout page loaded',
        action: async () => {
          await page.getByRole('button', { name: 'Checkout' }).click();
          await page.waitForURL('**/checkout');
        }
      },
      {
        title: 'Fill shipping information',
        success: 'Shipping info saved',
        action: async () => {
          await page.getByLabel('Full Name').fill('John Doe');
          await page.getByLabel('Address').fill('123 Main St');
          await page.getByLabel('City').fill('Springfield');
          await page.getByLabel('State').selectOption('IL');
          await page.getByLabel('ZIP Code').fill('62701');
          await page.getByLabel('Phone').fill('555-0123');
        }
      },
      {
        title: 'Fill payment information',
        success: 'Payment info saved',
        action: async () => {
          await page.getByLabel('Card Number').fill('4111111111111111');
          await page.getByLabel('Cardholder Name').fill('John Doe');
          await page.getByLabel('Expiry Date').fill('12/25');
          await page.getByLabel('CVV').fill('123');
        }
      },
      {
        title: 'Review order',
        success: 'Order details confirmed',
        action: async () => {
          await expect(page.locator('.order-summary')).toBeVisible();
          await expect(page.locator('.shipping-address')).toContainText('123 Main St');
        }
      },
      {
        title: 'Place order',
        success: 'Order placed',
        action: async () => {
          await page.getByRole('button', { name: 'Place Order' }).click();
          await page.waitForURL('**/confirmation');
        }
      },
      {
        title: 'Verify confirmation',
        success: 'Confirmation page displayed',
        action: async () => {
          await expect(page.getByText(/Order confirmed/i)).toBeVisible();
          await expect(page.getByText(/Order #\d+/)).toBeVisible();
        }
      }
    ]
  });
});
```

**Output:**
```
✓ MAJOR: Add items to cart (4 steps) → Cart ready with 2 items
✓ MAJOR: Review cart (3 steps) → Cart verified
✓ MAJOR: Complete checkout
  ✓ Proceed to checkout
  ✓ Fill shipping information
  ✓ Fill payment information
  ✓ Review order
  ✓ Place order
  ✓ Verify confirmation
  → Order placed successfully, confirmation #12345
```

## Example 2: User Registration with Email Verification

Multi-step registration with external email verification.

```typescript
import { test, expect } from '@playwright/test';
import { e2e } from 'fair-playwright';

test('complete registration with email verification', async ({ page, context }) => {
  let verificationLink: string;

  await e2e.major('User registration', {
    success: 'Registration form submitted',
    failure: 'Registration failed',
    steps: [
      {
        title: 'Open registration page',
        success: 'Registration page loaded',
        action: async () => {
          await page.goto('https://example.com/register');
        }
      },
      {
        title: 'Fill personal information',
        success: 'Personal info entered',
        action: async () => {
          await page.getByLabel('First Name').fill('John');
          await page.getByLabel('Last Name').fill('Doe');
          await page.getByLabel('Date of Birth').fill('1990-01-01');
        }
      },
      {
        title: 'Fill account credentials',
        success: 'Credentials entered',
        action: async () => {
          await page.getByLabel('Email').fill('john.doe@example.com');
          await page.getByLabel('Username').fill('johndoe');
          await page.getByLabel('Password').fill('SecurePass123!');
          await page.getByLabel('Confirm Password').fill('SecurePass123!');
        }
      },
      {
        title: 'Accept terms and conditions',
        success: 'Terms accepted',
        action: async () => {
          await page.getByLabel('I accept the terms').check();
        }
      },
      {
        title: 'Submit registration',
        success: 'Registration submitted',
        action: async () => {
          await page.getByRole('button', { name: 'Register' }).click();
          await expect(page.getByText(/Check your email/i)).toBeVisible();
        }
      }
    ]
  });

  await e2e.major('Email verification', {
    success: 'Email verified, account activated',
    failure: 'Email verification failed',
    steps: [
      {
        title: 'Access verification email',
        success: 'Verification email found',
        action: async () => {
          // Simulate getting verification link from email service
          // In real tests, you'd integrate with an email API
          verificationLink = 'https://example.com/verify?token=abc123';
        }
      },
      {
        title: 'Click verification link',
        success: 'Verification page loaded',
        action: async () => {
          await page.goto(verificationLink);
        }
      },
      {
        title: 'Verify account activation',
        success: 'Account activated',
        action: async () => {
          await expect(page.getByText(/Account verified/i)).toBeVisible();
          await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
        }
      }
    ]
  });

  await e2e.major('First login', {
    success: 'Logged in successfully',
    failure: 'First login failed',
    steps: [
      {
        title: 'Navigate to login',
        success: 'Login page opened',
        action: async () => {
          await page.getByRole('link', { name: 'Login' }).click();
        }
      },
      {
        title: 'Enter credentials',
        success: 'Credentials entered',
        action: async () => {
          await page.getByLabel('Email').fill('john.doe@example.com');
          await page.getByLabel('Password').fill('SecurePass123!');
        }
      },
      {
        title: 'Submit login',
        success: 'Logged in',
        action: async () => {
          await page.getByRole('button', { name: 'Login' }).click();
          await page.waitForURL('**/dashboard');
          await expect(page.getByText(/Welcome, John/i)).toBeVisible();
        }
      }
    ]
  });
});
```

## Example 3: Dynamic Content with API Integration

Test with API calls and dynamic data.

```typescript
import { test, expect } from '@playwright/test';
import { e2e } from 'fair-playwright';

test('manage todo items', async ({ page, request }) => {
  const todoIds: number[] = [];

  await e2e.major('Create todo items via API', {
    success: '3 todos created',
    failure: 'Failed to create todos',
    steps: [
      {
        title: 'Create todo 1',
        success: 'Todo 1 created',
        action: async () => {
          const response = await request.post('https://api.example.com/todos', {
            data: { title: 'Buy groceries', completed: false }
          });
          expect(response.ok()).toBeTruthy();
          const data = await response.json();
          todoIds.push(data.id);
        }
      },
      {
        title: 'Create todo 2',
        success: 'Todo 2 created',
        action: async () => {
          const response = await request.post('https://api.example.com/todos', {
            data: { title: 'Write tests', completed: false }
          });
          expect(response.ok()).toBeTruthy();
          const data = await response.json();
          todoIds.push(data.id);
        }
      },
      {
        title: 'Create todo 3',
        success: 'Todo 3 created',
        action: async () => {
          const response = await request.post('https://api.example.com/todos', {
            data: { title: 'Review PRs', completed: false }
          });
          expect(response.ok()).toBeTruthy();
          const data = await response.json();
          todoIds.push(data.id);
        }
      }
    ]
  });

  await e2e.major('Verify todos in UI', {
    success: 'All todos visible',
    failure: 'Todos not displayed correctly',
    steps: [
      {
        title: 'Navigate to todos page',
        success: 'Todos page loaded',
        action: async () => {
          await page.goto('https://example.com/todos');
        }
      },
      {
        title: 'Verify todo count',
        success: 'Count matches',
        action: async () => {
          const count = await page.locator('.todo-item').count();
          expect(count).toBeGreaterThanOrEqual(3);
        }
      },
      {
        title: 'Verify todo titles',
        success: 'All titles visible',
        action: async () => {
          await expect(page.getByText('Buy groceries')).toBeVisible();
          await expect(page.getByText('Write tests')).toBeVisible();
          await expect(page.getByText('Review PRs')).toBeVisible();
        }
      }
    ]
  });

  await e2e.major('Complete and delete todos', {
    success: 'Todos managed successfully',
    failure: 'Failed to manage todos',
    steps: [
      {
        title: 'Mark first todo complete',
        success: 'Todo 1 completed',
        action: async () => {
          await page.locator('.todo-item').first().locator('.checkbox').check();
          await expect(page.locator('.todo-item').first()).toHaveClass(/completed/);
        }
      },
      {
        title: 'Delete second todo',
        success: 'Todo 2 deleted',
        action: async () => {
          const initialCount = await page.locator('.todo-item').count();
          await page.locator('.todo-item').nth(1).locator('.delete-btn').click();
          await expect(page.locator('.todo-item')).toHaveCount(initialCount - 1);
        }
      },
      {
        title: 'Verify remaining todos',
        success: 'State verified',
        action: async () => {
          const count = await page.locator('.todo-item').count();
          expect(count).toBeGreaterThanOrEqual(2);
          await expect(page.getByText('Buy groceries')).toBeVisible();
          await expect(page.getByText('Write tests')).not.toBeVisible();
        }
      }
    ]
  });
});
```

## Example 4: File Upload with Validation

Complex file upload scenario.

```typescript
import { test, expect } from '@playwright/test';
import { e2e } from 'fair-playwright';
import path from 'path';

test('upload and process file', async ({ page }) => {
  const testFile = path.join(__dirname, 'fixtures', 'test-document.pdf');

  await e2e.major('Upload document', {
    success: 'Document uploaded and validated',
    failure: 'Upload failed',
    steps: [
      {
        title: 'Navigate to upload page',
        success: 'Upload page loaded',
        action: async () => {
          await page.goto('https://example.com/upload');
        }
      },
      {
        title: 'Select file',
        success: 'File selected',
        action: async () => {
          await page.setInputFiles('input[type="file"]', testFile);
        }
      },
      {
        title: 'Add file description',
        success: 'Description added',
        action: async () => {
          await page.getByLabel('Description').fill('Test PDF document');
        }
      },
      {
        title: 'Start upload',
        success: 'Upload started',
        action: async () => {
          await page.getByRole('button', { name: 'Upload' }).click();
        }
      },
      {
        title: 'Wait for processing',
        success: 'File processed',
        action: async () => {
          await page.waitForSelector('.upload-complete', { timeout: 30000 });
        }
      },
      {
        title: 'Verify upload',
        success: 'Upload verified',
        action: async () => {
          await expect(page.getByText(/Successfully uploaded/i)).toBeVisible();
          await expect(page.locator('.file-name')).toContainText('test-document.pdf');
        }
      }
    ]
  });
});
```

## Example 5: Multi-Tab Workflow

Handling multiple browser tabs.

```typescript
import { test, expect } from '@playwright/test';
import { e2e } from 'fair-playwright';

test('multi-tab workflow', async ({ page, context }) => {
  await e2e.major('Initiate external payment', {
    success: 'Payment initiated',
    failure: 'Failed to start payment',
    steps: [
      {
        title: 'Start checkout',
        success: 'Checkout started',
        action: async () => {
          await page.goto('https://example.com/checkout');
        }
      },
      {
        title: 'Select external payment',
        success: 'Payment method selected',
        action: async () => {
          await page.getByLabel('Pay with PaymentProvider').check();
        }
      },
      {
        title: 'Click pay now',
        success: 'Redirecting to payment provider',
        action: async () => {
          const newTabPromise = context.waitForEvent('page');
          await page.getByRole('button', { name: 'Pay Now' }).click();
          const paymentTab = await newTabPromise;
          await paymentTab.waitForLoadState();
          expect(paymentTab.url()).toContain('payment-provider.com');
        }
      }
    ]
  });

  await e2e.major('Complete external payment', {
    success: 'Payment completed',
    failure: 'Payment failed',
    steps: [
      {
        title: 'Get payment tab',
        success: 'Payment tab accessed',
        action: async () => {
          const pages = context.pages();
          expect(pages.length).toBe(2);
        }
      },
      {
        title: 'Fill payment details',
        success: 'Payment details entered',
        action: async () => {
          const paymentTab = context.pages()[1];
          await paymentTab.getByLabel('Card Number').fill('4111111111111111');
          await paymentTab.getByLabel('Expiry').fill('12/25');
          await paymentTab.getByLabel('CVV').fill('123');
        }
      },
      {
        title: 'Submit payment',
        success: 'Payment submitted',
        action: async () => {
          const paymentTab = context.pages()[1];
          await paymentTab.getByRole('button', { name: 'Pay' }).click();
          await paymentTab.waitForURL('**/success');
        }
      },
      {
        title: 'Return to main tab',
        success: 'Returned to shop',
        action: async () => {
          await page.bringToFront();
          await page.waitForURL('**/order-confirmation');
          await expect(page.getByText(/Payment successful/i)).toBeVisible();
        }
      }
    ]
  });
});
```

## Best Practices from Advanced Examples

### 1. Sequential MAJOR Steps

```typescript
//  Good - Clear workflow phases
await e2e.major('Phase 1: Setup', { ... });
await e2e.major('Phase 2: Execute', { ... });
await e2e.major('Phase 3: Verify', { ... });
```

### 2. Store Dynamic Data

```typescript
//  Good - Reuse data across steps
let userId: number;

await e2e.major('Create user', {
  steps: [
    {
      action: async () => {
        const response = await request.post('/users', { ... });
        userId = await response.json().id;
      }
    }
  ]
});

await e2e.major('Verify user', {
  steps: [
    {
      action: async () => {
        await page.goto(`/users/${userId}`);
      }
    }
  ]
});
```

### 3. Handle Async Operations

```typescript
//  Good - Wait for async operations
{
  title: 'Wait for background job',
  success: 'Job completed',
  action: async () => {
    await page.waitForSelector('.job-complete', {
      timeout: 60000  // 1 minute for long operations
    });
  }
}
```

### 4. Comprehensive Error Context

```typescript
//  Good - Detailed failure messages
failure: 'Checkout failed: payment declined, network timeout, or cart expired'
```

## Next Steps

- [MCP Usage](/examples/mcp) - AI integration examples
- [API Reference](/api/) - Full documentation
- [Troubleshooting](/guide/troubleshooting) - Common issues
