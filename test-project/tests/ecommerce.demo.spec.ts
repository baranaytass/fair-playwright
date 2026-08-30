/**
 * E-Commerce Demo Tests
 *
 * Bu test dosyası fair-playwright reporter'ın tüm özelliklerini gösterir:
 * - MAJOR/MINOR step hierarchy
 * - Declarative mode (steps array)
 * - Success/Failure scenarios
 * - Progressive terminal output
 * - AI-optimized markdown output
 */

import { test, expect } from '@playwright/test';
import { e2e } from '../../dist/index.js';

/**
 * TEST 1: ✅ BAŞARILI SENARYO
 * Kullanıcı başarıyla kayıt olur, ürün ekler ve satın alır
 */
test('successful user registration and purchase flow', async ({ page }) => {

  // MAJOR STEP 1: Kullanıcı Kaydı
  await e2e.major('User Registration', {
    success: '✅ User registered successfully',
    failure: '❌ Registration failed',
    steps: [
      {
        title: 'Navigate to registration page',
        success: 'Registration page loaded',
        failure: 'Failed to load registration page',
        action: async () => {
          await page.goto('https://demo.playwright.dev/todomvc');
          // Demo sitesinde registration yok, ama test akışını gösteriyoruz
          await expect(page).toHaveTitle(/TodoMVC/);
        }
      },
      {
        title: 'Fill user information',
        success: 'User info filled',
        failure: 'Failed to fill user info',
        action: async () => {
          // Simulated: Form filling
          await page.locator('.new-todo').fill('Test User');
          await page.locator('.new-todo').press('Enter');
        }
      },
      {
        title: 'Verify account created',
        success: 'Account verified',
        failure: 'Account verification failed',
        action: async () => {
          // Todo item eklendi mi kontrol et
          const todoCount = await page.locator('.todo-list li').count();
          expect(todoCount).toBeGreaterThan(0);
        }
      }
    ]
  });

  // MAJOR STEP 2: Ürün Seçimi ve Sepete Ekleme
  await e2e.major('Product Selection', {
    success: '✅ Products added to cart',
    failure: '❌ Failed to add products',
    steps: [
      {
        title: 'Browse product catalog',
        success: 'Catalog loaded successfully',
        failure: 'Catalog failed to load',
        action: async () => {
          // Yeni todo ekleyerek "ürün ekleme" simule ediyoruz
          await page.locator('.new-todo').fill('Product 1: Laptop');
          await page.locator('.new-todo').press('Enter');
        }
      },
      {
        title: 'Select product and add to cart',
        success: 'Product added to cart',
        failure: 'Failed to add product',
        action: async () => {
          await page.locator('.new-todo').fill('Product 2: Mouse');
          await page.locator('.new-todo').press('Enter');
        }
      },
      {
        title: 'Verify cart contents',
        success: 'Cart verified - 2 items',
        failure: 'Cart verification failed',
        action: async () => {
          const todoCount = await page.locator('.todo-list li').count();
          expect(todoCount).toBe(3); // Test User + 2 products
        }
      }
    ]
  });

  // MAJOR STEP 3: Checkout ve Ödeme
  await e2e.major('Checkout and Payment', {
    success: '✅ Order completed successfully',
    failure: '❌ Checkout failed',
    steps: [
      {
        title: 'Go to checkout',
        success: 'Checkout page loaded',
        failure: 'Failed to load checkout',
        action: async () => {
          // "Active" tab'a tıklayarak checkout simule ediyoruz
          await page.locator('.filters a').filter({ hasText: 'Active' }).click();
        }
      },
      {
        title: 'Fill shipping information',
        success: 'Shipping info saved',
        failure: 'Failed to save shipping info',
        action: async () => {
          // Form doldurma simülasyonu - sadece doğrulama
          const todoCount = await page.locator('.todo-list li').count();
          expect(todoCount).toBe(3);
        }
      },
      {
        title: 'Process payment',
        success: 'Payment successful',
        failure: 'Payment failed',
        action: async () => {
          // Ödeme işlemi simülasyonu
          await page.waitForTimeout(200);
          const todoCount = await page.locator('.todo-list li').count();
          expect(todoCount).toBe(3);
        }
      },
      {
        title: 'Send confirmation email',
        success: 'Confirmation email sent',
        failure: 'Failed to send email',
        action: async () => {
          // Email gönderimi simülasyonu - sadece success
          await page.waitForTimeout(100);
        }
      }
    ]
  });

  // Final doğrulama
  await test.step('Verify order completion', async () => {
    const completedCount = await page.locator('.todo-list li').count();
    expect(completedCount).toBeGreaterThan(0);
  });
});

/**
 * TEST 3: MIX - Inline ve Declarative mode birlikte
 * Inline mode ile hızlı steplar + Declarative mode ile karmaşık flow
 */
test('mixed mode: quick login and detailed checkout', async ({ page }) => {

  // Inline mode - Hızlı login
  await e2e.minor('Navigate to site', async () => {
    await page.goto('https://demo.playwright.dev/todomvc');
  }, {
    success: 'Site loaded',
    failure: 'Navigation failed'
  });

  await e2e.minor('Quick login', async () => {
    await page.locator('.new-todo').fill('Quick User');
    await page.locator('.new-todo').press('Enter');
  }, {
    success: 'Logged in',
    failure: 'Login failed'
  });

  // Declarative mode - Detaylı checkout
  await e2e.major('Detailed Checkout Process', {
    success: 'Checkout completed',
    failure: 'Checkout failed',
    steps: [
      {
        title: 'Add item to cart',
        success: 'Item added',
        failure: 'Failed to add item',
        action: async () => {
          await page.locator('.new-todo').fill('Quick Purchase Item');
          await page.locator('.new-todo').press('Enter');
        }
      },
      {
        title: 'Review order',
        success: 'Order reviewed',
        failure: 'Review failed',
        action: async () => {
          const count = await page.locator('.todo-list li').count();
          expect(count).toBe(2);
        }
      },
      {
        title: 'Complete purchase',
        success: 'Purchase completed',
        failure: 'Purchase failed',
        action: async () => {
          await page.waitForTimeout(100);
          const count = await page.locator('.todo-list li').count();
          expect(count).toBe(2);
        }
      }
    ]
  });

  // Son inline check
  await e2e.minor('Verify success', async () => {
    const total = await page.locator('.todo-list li').count();
    expect(total).toBe(2);
  }, {
    success: 'All verified ✓',
    failure: 'Verification failed'
  });
});
