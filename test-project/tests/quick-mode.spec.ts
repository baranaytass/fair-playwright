import { test, expect } from '@playwright/test';
import { e2e } from '../../src/index.js';

test.describe('Quick Mode API (v1.1.0)', () => {
  test('basic quick mode - compact syntax', async ({ page }) => {
    await e2e.quick('User visits homepage', [
      ['Navigate to Example.com', async () => {
        await page.goto('https://example.com');
      }],
      ['Verify page title', async () => {
        await expect(page).toHaveTitle(/Example Domain/);
      }],
      ['Check heading is visible', async () => {
        const heading = page.locator('h1');
        await expect(heading).toBeVisible();
      }],
    ]);
  });

  test('quick mode with success/failure messages', async ({ page }) => {
    await e2e.quick(
      'User login flow',
      [
        [
          'Open login page',
          async () => {
            await page.goto('https://example.com');
          },
          {
            success: 'Login page loaded',
            failure: 'Failed to open login page',
          },
        ],
        [
          'Verify page content',
          async () => {
            await expect(page.locator('h1')).toContainText('Example');
          },
          {
            success: 'Content verified',
          },
        ],
      ],
      {
        success: 'User logged in successfully',
        failure: 'Login flow failed',
      }
    );
  });

  test('quick mode vs declarative mode - same output', async ({ page }) => {
    // These two should produce identical output

    // Declarative mode (verbose)
    await e2e.major('Declarative checkout', {
      success: 'Checkout completed',
      failure: 'Checkout failed',
      steps: [
        {
          title: 'Add to cart',
          success: 'Item added',
          action: async () => {
            await page.goto('https://example.com');
          },
        },
        {
          title: 'Proceed to payment',
          success: 'Payment page loaded',
          action: async () => {
            await expect(page).toHaveTitle(/Example/);
          },
        },
      ],
    });

    // Quick mode (compact) - same functionality
    await e2e.quick('Quick checkout', [
      ['Add to cart', async () => {
        await page.goto('https://example.com');
      }],
      ['Proceed to payment', async () => {
        await expect(page).toHaveTitle(/Example/);
      }],
    ]);
  });

  test('quick mode - minimal example', async ({ page }) => {
    // Absolute minimal syntax - no options
    await e2e.quick('Simple navigation', [
      ['Go to page', async () => await page.goto('https://example.com')],
      ['Check title', async () => await expect(page).toHaveTitle(/Example/)],
    ]);
  });

  test('quick mode - multiple workflows in one test', async ({ page }) => {
    await e2e.quick('Setup phase', [
      ['Navigate to site', async () => {
        await page.goto('https://example.com');
      }],
      ['Verify initial state', async () => {
        await expect(page.locator('h1')).toBeVisible();
      }],
    ]);

    await e2e.quick('Action phase', [
      ['Perform action', async () => {
        await expect(page).toHaveTitle(/Example/);
      }],
      ['Verify result', async () => {
        await expect(page.locator('p').first()).toBeVisible();
      }],
    ]);

    await e2e.quick('Cleanup phase', [
      ['Check final state', async () => {
        await expect(page.url()).toContain('example.com');
      }],
    ]);
  });
});

test.describe('Quick Mode - Real-world Examples', () => {
  test('e-commerce checkout flow', async ({ page }) => {
    await e2e.quick('Complete purchase', [
      ['Browse products', async () => {
        await page.goto('https://example.com');
      }],
      ['Add item to cart', async () => {
        await expect(page.locator('h1')).toBeVisible();
      }],
      ['Proceed to checkout', async () => {
        await expect(page).toHaveTitle(/Example/);
      }],
      ['Enter shipping info', async () => {
        // Simulated
      }],
      ['Enter payment details', async () => {
        // Simulated
      }],
      ['Place order', async () => {
        await expect(page.url()).toContain('example.com');
      }],
    ]);
  });

  test('user registration', async ({ page }) => {
    await e2e.quick(
      'New user registration',
      [
        ['Open registration page', async () => await page.goto('https://example.com')],
        ['Fill personal info', async () => await expect(page.locator('h1')).toBeVisible()],
        ['Accept terms', async () => {}],
        ['Submit form', async () => await expect(page).toHaveTitle(/Example/)],
        ['Verify confirmation', async () => await expect(page.url()).toContain('example.com')],
      ],
      {
        success: 'User registered successfully',
        failure: 'Registration failed',
      }
    );
  });

  test('search functionality', async ({ page }) => {
    await e2e.quick('Search for product', [
      ['Navigate to homepage', async () => await page.goto('https://example.com')],
      ['Enter search query', async () => {}],
      ['Click search button', async () => {}],
      ['Verify results displayed', async () => await expect(page.locator('h1')).toBeVisible()],
      ['Filter results', async () => {}],
      ['Sort by relevance', async () => {}],
    ]);
  });
});
