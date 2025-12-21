import { test, expect } from '@playwright/test';

// This is a placeholder test file
// Once the fair-playwright package is built, we can import and use the e2e helper

test.describe('Authentication Flow', () => {
  test('should login successfully', async ({ page }) => {
    // TODO: Replace with e2e.major() once implemented
    await test.step('Navigate to login page', async () => {
      await page.goto('/login');
      expect(page.url()).toContain('/login');
    });

    await test.step('Fill login credentials', async () => {
      await page.getByLabel('Email').fill('test@example.com');
      await page.getByLabel('Password').fill('password123');
    });

    await test.step('Submit login form', async () => {
      await page.getByRole('button', { name: 'Login' }).click();
      await expect(page).toHaveURL('/dashboard');
    });
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await test.step('Navigate to login page', async () => {
      await page.goto('/login');
    });

    await test.step('Fill invalid credentials', async () => {
      await page.getByLabel('Email').fill('invalid@example.com');
      await page.getByLabel('Password').fill('wrongpassword');
    });

    await test.step('Submit and verify error', async () => {
      await page.getByRole('button', { name: 'Login' }).click();
      await expect(page.getByText('Invalid credentials')).toBeVisible();
    });
  });
});

test.describe('Shopping Cart', () => {
  test('should add item to cart', async ({ page }) => {
    await test.step('Navigate to products', async () => {
      await page.goto('/products');
    });

    await test.step('Add product to cart', async () => {
      await page.getByRole('button', { name: 'Add to Cart' }).first().click();
      await expect(page.getByText('Item added to cart')).toBeVisible();
    });

    await test.step('Verify cart count', async () => {
      const cartBadge = page.locator('[data-testid="cart-count"]');
      await expect(cartBadge).toHaveText('1');
    });
  });

  test('should remove item from cart', async ({ page }) => {
    // Setup: Add item first
    await test.step('Setup: Add item to cart', async () => {
      await page.goto('/products');
      await page.getByRole('button', { name: 'Add to Cart' }).first().click();
    });

    await test.step('Navigate to cart', async () => {
      await page.goto('/cart');
    });

    await test.step('Remove item from cart', async () => {
      await page.getByRole('button', { name: 'Remove' }).click();
      await expect(page.getByText('Cart is empty')).toBeVisible();
    });
  });
});

test.describe('Performance Tests', () => {
  test('should load products page quickly', async ({ page }) => {
    const startTime = Date.now();

    await test.step('Load products page', async () => {
      await page.goto('/products');
      await page.waitForLoadState('networkidle');
    });

    const loadTime = Date.now() - startTime;

    await test.step('Verify load time', async () => {
      expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds
    });
  });
});
