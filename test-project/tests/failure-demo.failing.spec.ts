import { test, expect } from '@playwright/test';
import { e2e } from '../../dist/index.js';

/**
 * Deliberately failing tests.
 *
 * These exist to demonstrate the reporter's failure output - the MAJOR/MINOR
 * trail leading to the break, custom failure messages, and the AI summary.
 * They are expected to fail, so they are excluded from the default test run
 * (see `testIgnore` in playwright.config.ts) and CI stays green.
 *
 * Run them on purpose with:
 *   npx playwright test --grep-invert '' failing
 *   npm run test:failing
 */

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

/**
 * TEST 2: ❌ HATA SENARYOSU
 * Kullanıcı kayıt olur, ürün ekler ama ödeme aşamasında hata alır
 */
test('user registration with payment failure', async ({ page }) => {

  // MAJOR STEP 1: Kullanıcı Kaydı (Başarılı)
  await e2e.major('User Registration', {
    success: '✅ User registered',
    failure: '❌ Registration failed',
    steps: [
      {
        title: 'Open registration form',
        success: 'Form opened',
        failure: 'Failed to open form',
        action: async () => {
          await page.goto('https://demo.playwright.dev/todomvc');
          await expect(page).toHaveTitle(/TodoMVC/);
        }
      },
      {
        title: 'Fill registration details',
        success: 'Details filled',
        failure: 'Failed to fill details',
        action: async () => {
          await page.locator('.new-todo').fill('Failed Payment User');
          await page.locator('.new-todo').press('Enter');
        }
      },
      {
        title: 'Submit registration',
        success: 'Registration submitted',
        failure: 'Submit failed',
        action: async () => {
          const todoCount = await page.locator('.todo-list li').count();
          expect(todoCount).toBe(1);
        }
      }
    ]
  });

  // MAJOR STEP 2: Ürün Ekleme (Başarılı)
  await e2e.major('Add Products to Cart', {
    success: '✅ Cart ready for checkout',
    failure: '❌ Failed to prepare cart',
    steps: [
      {
        title: 'Search for products',
        success: 'Products found',
        failure: 'Search failed',
        action: async () => {
          await page.locator('.new-todo').fill('Expensive Laptop - $2000');
          await page.locator('.new-todo').press('Enter');
        }
      },
      {
        title: 'Add premium product',
        success: 'Premium product added',
        failure: 'Failed to add product',
        action: async () => {
          await page.locator('.new-todo').fill('Wireless Mouse - $50');
          await page.locator('.new-todo').press('Enter');
        }
      },
      {
        title: 'Apply discount code',
        success: 'Discount applied',
        failure: 'Invalid discount code',
        action: async () => {
          // Discount code simülasyonu
          await page.locator('.new-todo').fill('DISCOUNT10');
          await page.locator('.new-todo').press('Enter');
        }
      },
      {
        title: 'Calculate total',
        success: 'Total: $2045 (discount applied)',
        failure: 'Failed to calculate total',
        action: async () => {
          const todoCount = await page.locator('.todo-list li').count();
          expect(todoCount).toBe(4); // User + 2 products + discount code
        }
      }
    ]
  });

  // MAJOR STEP 3: Ödeme İşlemi (BAŞARISIZ - Intentional Failure)
  await e2e.major('Payment Processing', {
    success: '✅ Payment successful',
    failure: '❌ Payment declined - Insufficient funds',
    steps: [
      {
        title: 'Enter payment details',
        success: 'Payment details validated',
        failure: 'Invalid payment details',
        action: async () => {
          await page.locator('.filters a').filter({ hasText: 'Active' }).click();
        }
      },
      {
        title: 'Verify credit card',
        success: 'Card verified',
        failure: 'Card verification failed',
        action: async () => {
          // Kart doğrulama simülasyonu
          await page.waitForTimeout(150);
          const todoCount = await page.locator('.todo-list li').count();
          expect(todoCount).toBe(4);
        }
      },
      {
        title: 'Process payment transaction',
        success: 'Transaction approved',
        failure: 'Transaction declined by bank',
        action: async () => {
          // ⚠️ BURADA KASITLI HATA OLUŞTURUYORUZ
          // Varolmayan bir elementi bulmaya çalışıyoruz
          await page.locator('.non-existent-payment-button').click({ timeout: 2000 });

          // Bu satıra hiç gelmeyecek çünkü yukarıda hata olacak
          throw new Error('This should not be reached');
        }
      },
      {
        title: 'Generate receipt',
        success: 'Receipt generated',
        failure: 'Failed to generate receipt',
        action: async () => {
          // Bu step'e hiç gelmeyecek çünkü önceki step fail olacak
          await page.locator('.receipt-button').click();
        }
      }
    ]
  });

  // Bu step'e de gelmeyecek çünkü MAJOR step fail oldu
  await test.step('Send order confirmation', async () => {
    console.log('This will not execute due to payment failure');
  });
});
