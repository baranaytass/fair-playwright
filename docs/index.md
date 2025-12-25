---
layout: home

hero:
  name: ""
  text: ""
  tagline: AI-optimized Playwright test reporter with progressive terminal output and hierarchical step management
  image:
    src: /logo.png
    alt: fair-playwright
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/baranaytass/fair-playwright
    - theme: alt
      text: API Reference
      link: /api/

features:
  - icon: 📊
    title: MAJOR/MINOR Hierarchy
    details: Two-level step organization. MAJOR steps for workflows, MINOR steps for actions. Clear, structured test output.

  - icon: ⚡
    title: Progressive Output
    details: Live terminal updates with smart compression. Completed steps collapse, current step expands, failures stay visible.

  - icon: 🤖
    title: AI-First Design
    details: Structured output optimized for AI assistants. Built-in MCP server for Claude Desktop integration.

  - icon: 🎯
    title: Zero Config
    details: Works out of the box. Add to playwright.config.ts and start writing better tests immediately.
---

## What is fair-playwright?

A Playwright test reporter that makes test output **readable for humans** and **parseable for AI**. Organize tests into hierarchical steps, see progressive terminal updates, and integrate with AI coding assistants.

## See It in Action

<img src="/terminal-output.png" alt="fair-playwright terminal output" style="border-radius: 8px; margin: 20px 0; box-shadow: 0 4px 12px rgba(0,0,0,0.15);" />

Progressive output shows:
- ✅ Completed MAJOR steps (collapsed)
- ⏳ Current step with live updates
- ❌ Failed steps with full context
- 📊 Hierarchical structure at a glance

## Quick Start

::: code-group

```bash [npm]
npm install -D fair-playwright
```

```bash [pnpm]
pnpm add -D fair-playwright
```

```bash [yarn]
yarn add -D fair-playwright
```

:::

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [['fair-playwright']]
});
```

```typescript
// Write tests with hierarchical steps
import { test } from '@playwright/test';
import { e2e } from 'fair-playwright';

test('user checkout', async ({ page }) => {
  await e2e.major('Complete purchase', {
    success: 'Order placed successfully',
    failure: 'Checkout failed',
    steps: [
      {
        title: 'Add to cart',
        success: 'Item added',
        action: async () => {
          await page.click('[data-test="add-to-cart"]');
        }
      },
      {
        title: 'Checkout',
        success: 'Order confirmed',
        action: async () => {
          await page.click('[data-test="checkout"]');
          await page.fill('[name="card"]', '4111111111111111');
          await page.click('[data-test="submit"]');
        }
      }
    ]
  });
});
```

## Why fair-playwright?

**For Developers**
- Self-documenting tests with clear success/failure messages
- Focus on what's happening now, not scrolling through logs
- Hierarchical context makes debugging faster

**For AI Assistants**
- Structured markdown summaries optimized for LLM consumption
- Native MCP protocol support for Claude Desktop
- Clear step hierarchy helps AI understand test intent

**For Teams**
- Easier onboarding with declarative test structure
- Better code reviews with readable test organization
- Scales from simple tests to complex workflows

[Get Started →](/guide/getting-started){.vp-button}
