# Step Hierarchy

Learn about fair-playwright's two-level MAJOR/MINOR step organization.

## The Concept

Traditional test output presents a flat list of actions. fair-playwright introduces a **two-level hierarchy**:

- **MAJOR steps**: High-level user flows and test phases
- **MINOR steps**: Detailed actions within those flows

This mirrors how humans think about tests and how AI models understand intent.

## MAJOR Steps

MAJOR steps represent complete user flows or test phases.

### Characteristics

- Typically 2-10 seconds duration
- Contains multiple related actions
- Represents a meaningful user goal
- Can contain MINOR steps

### Example Use Cases

- User authentication flow
- Checkout process
- Form submission workflow
- Data import/export operation
- Multi-step configuration

### API

```typescript
await e2e.major('Title', {
  success: 'Success message',
  failure: 'Failure message',
  steps: [
    // MINOR steps here
  ]
});
```

## MINOR Steps

MINOR steps represent individual actions within a MAJOR step.

### Characteristics

- Typically < 1 second duration
- Single, focused action
- Part of a larger flow
- Can be inline or declarative

### Example Use Cases

- Click a button
- Fill a form field
- Navigate to a page
- Verify an element
- Wait for a condition

### API

**Declarative (within MAJOR):**
```typescript
await e2e.major('User login', {
  success: 'Logged in',
  failure: 'Login failed',
  steps: [
    {
      title: 'Open login page',
      success: 'Page opened',
      action: async () => {
        await page.goto('/login');
      }
    }
  ]
});
```

**Inline (standalone):**
```typescript
await e2e.minor('Click submit', async () => {
  await page.click('[data-test="submit"]');
}, {
  success: 'Button clicked',
  failure: 'Button not found'
});
```

## Real-World Example

### E-commerce Checkout

```typescript
test('complete purchase', async ({ page }) => {
  // MAJOR: Add items to cart
  await e2e.major('Add items to cart', {
    success: 'Cart ready for checkout',
    failure: 'Failed to add items',
    steps: [
      {
        title: 'Search for product',
        success: 'Product found',
        action: async () => {
          await page.getByPlaceholder('Search').fill('laptop');
          await page.getByRole('button', { name: 'Search' }).click();
        }
      },
      {
        title: 'Select product',
        success: 'Product page loaded',
        action: async () => {
          await page.getByText('Gaming Laptop').click();
        }
      },
      {
        title: 'Add to cart',
        success: 'Item added to cart',
        action: async () => {
          await page.getByRole('button', { name: 'Add to cart' }).click();
          await expect(page.getByText('Added to cart')).toBeVisible();
        }
      }
    ]
  });

  // MAJOR: Complete checkout
  await e2e.major('Complete checkout', {
    success: 'Order placed successfully',
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
        title: 'Enter shipping info',
        success: 'Shipping info saved',
        action: async () => {
          await page.getByLabel('Address').fill('123 Main St');
          await page.getByLabel('City').fill('Springfield');
          await page.getByLabel('ZIP').fill('12345');
        }
      },
      {
        title: 'Enter payment info',
        success: 'Payment info saved',
        action: async () => {
          await page.getByLabel('Card number').fill('4111111111111111');
          await page.getByLabel('Expiry').fill('12/25');
          await page.getByLabel('CVV').fill('123');
        }
      },
      {
        title: 'Place order',
        success: 'Order confirmed',
        action: async () => {
          await page.getByRole('button', { name: 'Place order' }).click();
          await expect(page.getByText('Order confirmed')).toBeVisible();
        }
      }
    ]
  });
});
```

### Output

```
✓ MAJOR: Add items to cart
  ✓ Search for product
  ✓ Select product
  ✓ Add to cart
  → Cart ready for checkout

✓ MAJOR: Complete checkout
  ✓ Proceed to checkout
  ✓ Enter shipping info
  ✓ Enter payment info
  ✓ Place order
  → Order placed successfully
```

## Automatic Classification

fair-playwright can automatically classify steps:

```typescript
// playwright.config.ts
{
  stepClassification: {
    durationThreshold: 1000,  // Steps > 1s are MAJOR
    autoDetect: true
  }
}
```

**Rules:**
- Steps > `durationThreshold` → MAJOR
- Explicit `e2e.major()` → MAJOR
- Explicit `e2e.minor()` → MINOR
- Playwright's `test.step()` → MAJOR (by default)
- Individual actions → MINOR

## Nesting Guidelines

###  Good Nesting

**One level deep (recommended):**
```typescript
await e2e.major('User workflow', {
  steps: [
    { title: 'Step 1', action: async () => {} },
    { title: 'Step 2', action: async () => {} }
  ]
});
```

**Standalone MINOR steps:**
```typescript
await e2e.minor('Quick action', async () => {
  await page.click('button');
});
```

###  Avoid Deep Nesting

**Don't nest MAJOR inside MAJOR:**
```typescript
//  Avoid this
await e2e.major('Outer', {
  steps: [
    {
      title: 'Inner',
      action: async () => {
        await e2e.major('Another major', { ... });  // Too deep!
      }
    }
  ]
});
```

**Instead, use sequential MAJOR steps:**
```typescript
//  Do this
await e2e.major('First phase', { steps: [...] });
await e2e.major('Second phase', { steps: [...] });
```

## Progressive Output Behavior

### Completed Steps

MAJOR steps compress when complete:
```
✓ MAJOR: User login (3 steps) → User logged in successfully
```

MINOR steps within show on expand:
```
✓ MAJOR: User login
  ✓ Open login page
  ✓ Enter credentials
  ✓ Submit form
  → User logged in successfully
```

### Failed Steps

MAJOR steps with failures expand automatically:
```
✗ MAJOR: User login
  ✓ Open login page
  ✓ Enter credentials
  ✗ Submit form
    Error: Button not found
  → Login failed
```

## AI Integration

The hierarchy helps AI understand test structure:

**AI Summary Format:**
```markdown
## Test: complete purchase

### MAJOR: Add items to cart ✓
- Search for product ✓
- Select product ✓
- Add to cart ✓
Result: Cart ready for checkout

### MAJOR: Complete checkout ✓
- Proceed to checkout ✓
- Enter shipping info ✓
- Enter payment info ✓
- Place order ✓
Result: Order placed successfully
```

This structure is optimized for LLM context windows and reasoning.

## Best Practices

### 1. Meaningful Titles

```typescript
//  Good
await e2e.major('User authentication flow', ...)

//  Avoid
await e2e.major('Test 1', ...)
```

### 2. Clear Success Messages

```typescript
//  Good
success: 'User logged in and redirected to dashboard'

//  Avoid
success: 'Done'
```

### 3. Specific Failure Messages

```typescript
//  Good
failure: 'Login button not found or not clickable'

//  Avoid
failure: 'Failed'
```

### 4. Group Related Actions

```typescript
//  Good - Grouped related steps
await e2e.major('Fill registration form', {
  steps: [
    { title: 'Enter personal info', ... },
    { title: 'Enter address', ... },
    { title: 'Enter payment', ... }
  ]
});

//  Avoid - Too granular
await e2e.major('Enter first name', ...);
await e2e.major('Enter last name', ...);
await e2e.major('Enter email', ...);
```

### 5. Keep Steps Atomic

Each step should be independently verifiable and meaningful.

## Next Steps

- [Progressive Output](/guide/progressive-output) - See how output renders
- [Configuration](/guide/configuration) - Customize step classification
- [Examples](/examples/) - More hierarchy patterns
