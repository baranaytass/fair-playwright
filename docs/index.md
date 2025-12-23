---
layout: home

hero:
  name: fair-playwright
  text: AI-Optimized Test Reporter
  tagline: Progressive terminal output with hierarchical step management for Playwright
  image:
    src: /logo.svg
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
  - icon: 🤖
    title: AI-First Design
    details: Structured output optimized for LLM context and AI code assistants. Includes full MCP server for Claude Desktop and other AI tools.

  - icon: 📊
    title: MAJOR/MINOR Hierarchy
    details: Two-level step organization helps both humans and AI understand test structure at a glance. Clear separation of test flows.

  - icon: ⚡
    title: Progressive Output
    details: Live terminal updates with smart compression. See what's running now, hide completed steps, focus on failures.

  - icon: 🎯
    title: Zero Config
    details: Works out of the box with sensible defaults. Optional configuration for advanced use cases.

  - icon: 🔌
    title: MCP Integration
    details: Built-in Model Context Protocol server. Expose test results to AI assistants via 3 resources and 5 tools.

  - icon: 🪶
    title: Lightweight
    details: Only 3 runtime dependencies. Bundle size under 30KB compressed. Minimal performance overhead.
---

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
// tests/example.spec.ts
import { test } from '@playwright/test';
import { e2e } from 'fair-playwright';

test('user login', async ({ page }) => {
  await e2e.major('User login flow', {
    success: 'User logged in successfully',
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
});
```

## Why fair-playwright?

### For Developers
- **Tests read like documentation** - Self-documenting code with clear success/failure states
- **Focus on what matters** - Progressive output keeps you focused on current work
- **Better debugging** - Hierarchical steps make failure context crystal clear

### For AI Assistants
- **Structured output** - Markdown summaries optimized for LLM consumption
- **MCP protocol** - Native integration with Claude Desktop and other AI tools
- **Context-rich** - MAJOR/MINOR hierarchy helps AI understand test intent

### For Teams
- **Easier onboarding** - Declarative syntax lowers learning curve
- **Better collaboration** - Clear test structure improves code reviews
- **Maintainable tests** - Hierarchical organization scales with project size

## What's New in v1.1.0

- 📚 **Comprehensive documentation** with VitePress
- 📖 **Complete API reference** with TypeScript examples
- 🎯 **Working examples** for common use cases
- 🔍 **Migration guide** from standard Playwright
- 🛠️ **Troubleshooting guide** for common issues

[View Changelog](https://github.com/baranaytass/fair-playwright/blob/main/CHANGELOG.md)
