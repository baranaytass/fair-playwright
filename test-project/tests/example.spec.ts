import { test, expect } from '@playwright/test';

test.describe('Reporter Testing - Native Steps', () => {
  test('should execute test with multiple steps', async ({ page }) => {
    await test.step('Navigate to Example.com', async () => {
      await page.goto('https://example.com');
      expect(page.url()).toContain('example.com');
    });

    await test.step('Verify title', async () => {
      await expect(page).toHaveTitle(/Example Domain/);
    });

    await test.step('Check heading exists', async () => {
      const heading = page.locator('h1');
      await expect(heading).toBeVisible();
    });
  });

  test('should handle nested steps', async ({ page }) => {
    await test.step('User login flow', async () => {
      await test.step('Navigate to site', async () => {
        await page.goto('https://example.com');
      });

      await test.step('Verify page title', async () => {
        await expect(page).toHaveTitle(/Example Domain/);
      });
    });
  });
});

test.describe('MAJOR/MINOR Classification', () => {
  test('should classify steps with keywords', async ({ page }) => {
    // 'login' keyword should auto-classify as MAJOR
    await test.step('User login flow', async () => {
      await page.goto('https://example.com');
    });

    // 'checkout' keyword should auto-classify as MAJOR
    await test.step('Checkout process', async () => {
      await page.goto('https://example.com');
    });

    // No keyword, should be MINOR
    await test.step('Click button', async () => {
      await page.goto('https://example.com');
    });
  });
});

test.describe('Error Handling', () => {
  test('should handle failed steps gracefully', async ({ page }) => {
    await test.step('Step that will pass', async () => {
      await page.goto('https://example.com');
    });

    await test.step('Step that will fail', async () => {
      // This will fail intentionally
      await expect(page).toHaveTitle(/This Title Does Not Exist/);
    });
  });
});

test.describe('Multiple Tests', () => {
  test('first test should pass', async ({ page }) => {
    await test.step('Navigate', async () => {
      await page.goto('https://example.com');
    });

    await test.step('Verify', async () => {
      await expect(page).toHaveTitle(/Example Domain/);
    });
  });

  test('second test should also pass', async ({ page }) => {
    await test.step('Navigate again', async () => {
      await page.goto('https://example.com');
    });

    await test.step('Check heading', async () => {
      const heading = page.locator('h1');
      await expect(heading).toBeVisible();
    });
  });

  test('third test has payment keyword (MAJOR)', async ({ page }) => {
    await test.step('Payment processing', async () => {
      await page.goto('https://example.com');
    });
  });
});
