# What is fair-playwright?

fair-playwright is an AI-optimized test reporter for Playwright that brings structure, clarity, and intelligence to your E2E testing workflow.

## The Problem

Traditional test output is optimized for machines, not humans or AI assistants:

- **Unstructured logs** make it hard to understand test flow
- **Flat step lists** don't show relationships between actions
- **Dense output** overwhelms developers during test runs
- **AI assistants struggle** to parse and understand test results

## The Solution

fair-playwright introduces a **two-level step hierarchy** (MAJOR/MINOR) with progressive terminal output:

```typescript
test('user checkout', async ({ page }) => {
  await e2e.major('Complete purchase', {
    success: 'Order placed successfully',
    failure: 'Checkout failed',
    steps: [
      {
        title: 'Add item to cart',
        success: 'Item added',
        action: async () => {
          await page.click('[data-test="add-to-cart"]');
        }
      },
      {
        title: 'Proceed to checkout',
        success: 'Checkout page loaded',
        action: async () => {
          await page.click('[data-test="checkout"]');
        }
      }
    ]
  });
});
```

## Key Features

### 🤖 AI-First Design

Output is structured and parseable, optimized for LLM context windows. Includes built-in MCP (Model Context Protocol) server for Claude Desktop and other AI tools.

### 📊 MAJOR/MINOR Hierarchy

Tests are organized in two levels:
- **MAJOR steps**: High-level user flows (e.g., "User login", "Checkout process")
- **MINOR steps**: Detailed actions within flows (e.g., "Fill email", "Click submit")

### ⚡ Progressive Output

Terminal updates in real-time:
- ✅ **Completed steps** are compressed to a single line
- 🔄 **Current step** shows detailed progress
- ❌ **Failed steps** preserve full context

### 🎯 Zero Config

Works out of the box with sensible defaults. Optional configuration for advanced use cases.

### 🔌 MCP Integration

Built-in Model Context Protocol server exposes test results to AI assistants via:
- 3 resources (test-results, test-summary, failures)
- 5 tools (query, filter, analyze)

### 🪶 Lightweight

Only 3 runtime dependencies. Bundle size under 30KB compressed. Minimal performance overhead.

## Use Cases

### For Developers
- Tests read like documentation
- Progressive output keeps you focused
- Better debugging with hierarchical context

### For AI Assistants
- Structured markdown summaries
- Native MCP protocol integration
- Context-rich step hierarchy

### For Teams
- Easier onboarding with declarative syntax
- Better collaboration through clear structure
- Maintainable tests that scale

## How It Works

fair-playwright is a **custom Playwright reporter** that:

1. Hooks into Playwright's test lifecycle
2. Tracks MAJOR/MINOR step hierarchy
3. Renders progressive terminal output with smart compression
4. Generates AI-optimized summaries
5. Exposes results via MCP server for AI tools

It doesn't modify test execution—it just makes the output better for both humans and AI.

## Next Steps

- [Getting Started](/guide/getting-started) - Install and write your first test
- [Configuration](/guide/configuration) - Customize behavior and output
- [Step Hierarchy](/guide/step-hierarchy) - Learn the MAJOR/MINOR concept
- [MCP Integration](/guide/mcp) - Connect with AI assistants
