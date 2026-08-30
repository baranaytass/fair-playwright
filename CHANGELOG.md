# fair-playwright

## 1.2.1

### Patch Changes

- 1d51d61: Test the Playwright compatibility range that package.json promises.

  `peerDependencies` claims `@playwright/test >=1.40.0`, but integration tests only
  ever ran against one version. CI now runs them against the floor of that range
  (1.40.0), a recent stable (1.49.1) and `latest`.

  Deliberately failing demo specs moved to `*.failing.spec.ts` and are excluded
  from the default run, so the integration suite exits 0 and CI can actually go
  green. Run them on purpose with `npm run test:failing`.

- 1d51d61: Fix MCP server integration, which did not work as documented.

  **The documented install command was wrong.** Every example showed
  `npx fair-playwright-mcp`, but `fair-playwright-mcp` is a bin name, not a package
  name, so npm resolved it as a package and returned 404. All docs, the README and
  the CLI's own `--help` output now use `npx -p fair-playwright fair-playwright-mcp`.

  **The server served stale results.** Results were loaded only when nothing had
  been loaded yet, so the file was read once per process and never again. An AI
  assistant that ran tests, fixed code and re-ran them kept seeing the first run's
  results — breaking the exact loop the server exists for. Results are now re-read
  whenever the file's mtime or size changes.

  **Failures were silent.** A missing or malformed results file produced an empty
  result set with no explanation. Tools and resources now return a message saying
  what is wrong and how to fix it, including the `output: { json: true }` reporter
  setting that produces the file.

  **`results-path` accepts a directory.** The docs described
  `FAIR_PLAYWRIGHT_RESULTS` as a directory while the code used it as a file path.
  Both now work; a directory is resolved to `results.json` inside it.

  **JSON output turns itself on when MCP is wired up.** `output.json` defaults to
  `false`, but the MCP server needs that file. When `FAIR_PLAYWRIGHT_RESULTS` is
  set, the reporter now writes JSON to that path automatically.

  **The handshake reported the wrong version.** `serverInfo.version` was hard-coded
  to `0.1.0`; it is now read from package.json.

## 1.2.0

### Minor Changes

- **Quick Mode API** - NEW compact syntax for simple test workflows

  **New API: `e2e.quick()`**

  Addresses user feedback about verbose declarative API. Provides compact tuple syntax for simple tests while maintaining MAJOR/MINOR hierarchy.

  ```typescript
  // Before (Declarative Mode)
  await e2e.major('User login', {
    success: 'Logged in',
    failure: 'Failed',
    steps: [
      { title: 'Open page', success: 'Opened', action: async () => {} },
      { title: 'Fill form', success: 'Filled', action: async () => {} },
    ],
  });

  // After (Quick Mode - v1.2.0+)
  await e2e.quick('User login', [
    ['Open page', async () => {}],
    ['Fill form', async () => {}],
  ]);
  ```

  **Features:**
  - Compact tuple syntax: `[title, action]` or `[title, action, options]`
  - Optional success/failure messages
  - Full TypeScript support with `QuickStepDefinition` type
  - Same MAJOR/MINOR hierarchy as declarative mode
  - Internally uses existing `e2e.major()` implementation

  **When to Use:**
  - Simple, linear test flows (2-10 steps)
  - Minimal syntax preference
  - Quick prototyping

  **Documentation:**
  - Complete Quick Mode guide in API reference
  - 8 working examples in test-project
  - Comparison table with declarative/inline modes
  - Real-world e-commerce and registration examples
  - https://baranaytass.github.io/fair-playwright/api/e2e-helper#e2e-quick

## 1.1.0

### Minor Changes

- Professional documentation site and branding improvements

  **New Features:**
  - 📚 Comprehensive VitePress documentation site with professional structure
  - 🎨 Official project logo with horizontal and vertical variants
  - 🎨 Custom Alan Sans font and pastel color palette
  - 📖 Complete API reference with TypeScript examples
  - 🎯 Working examples for basic, advanced, and MCP usage
  - 📝 CONTRIBUTING.md with development guidelines
  - 🔍 Migration guide from standard Playwright
  - 🛠️ Troubleshooting guide for common issues

  **Documentation Structure:**
  - Guide pages: Getting Started, Configuration, Step Hierarchy, Progressive Output, MCP Integration, Migration, Troubleshooting
  - API Reference: FairReporter, E2E Helper, MCP Server, TypeScript Types
  - Examples: Basic Usage, Advanced Patterns, MCP Integration

  **Design Improvements:**
  - Professional landing page with minimal, clean design
  - Custom Alan Sans variable font (100-900 weights)
  - Logo-inspired pastel color palette (coral #E89891, green #6DB870)
  - Light and dark mode support
  - Removed all emojis for professional appearance
  - Real terminal output screenshot

  **Improvements:**
  - Minimized README with links to full documentation
  - GitHub Pages deployment workflow
  - Logo in README, documentation homepage, navbar, and favicon
  - Professional npm package structure following best practices

  **Documentation URL:**
  https://baranaytass.github.io/fair-playwright/

## 1.0.0

### Major Changes

- 7a61d62: # v1.0.0 - Production Release with Full MCP Integration

  ## 🎉 Major Features

  ### Full MCP (Model Context Protocol) Server
  - Complete MCP protocol implementation using @modelcontextprotocol/sdk
  - Standalone CLI binary: `npx fair-playwright-mcp`
  - 3 Resources: test-results, test-summary, failures
  - 5 Tools for AI assistants to query test results
  - Real-time test result streaming
  - Browser console error capture and reporting
  - MAJOR/MINOR step hierarchy support

  ### Progressive Terminal Output
  - Live terminal updates with smart compression
  - Completed MAJOR steps shown as single lines
  - Only active/failed steps expanded
  - CI environment auto-detection

  ### AI-Optimized Output
  - Structured markdown summaries for LLM consumption
  - JSON output for programmatic access
  - Hierarchical step reporting (MAJOR/MINOR)
  - Browser console error integration

  ## 🔧 Technical Improvements
  - TypeScript strict mode with zero errors
  - ESLint v9 flat config migration
  - Comprehensive test coverage (22 unit + 8 integration tests)
  - Bundle size: 80KB (target <100KB ✅)
  - Minimal dependencies (3 runtime deps)

  ## 📚 Documentation
  - Comprehensive README with examples
  - MCP integration guide for Claude Desktop
  - API documentation for all exports
  - Development guide in docs/ folder

  ## 🚀 Migration Guide

  ### From v0.x to v1.0.0

  No breaking changes! This is a feature-complete release.

  #### New: MCP Server Usage

  ```json
  // claude_desktop_config.json
  {
    "mcpServers": {
      "fair-playwright": {
        "command": "npx",
        "args": ["fair-playwright-mcp"]
      }
    }
  }
  ```

  #### New: MCP Server API

  ```typescript
  import { createMCPServer } from 'fair-playwright';

  const server = await createMCPServer({
    resultsPath: './test-results/results.json',
    verbose: true,
  });
  ```

  ## 📦 What's Included
  - ✅ Playwright reporter with MAJOR/MINOR step hierarchy
  - ✅ Progressive terminal output
  - ✅ AI-optimized markdown summaries
  - ✅ JSON output for tooling
  - ✅ MCP server for AI assistant integration
  - ✅ E2E helper API (inline + declarative modes)
  - ✅ Browser console error capture
  - ✅ TypeScript type definitions
  - ✅ CLI binary (fair-playwright-mcp)

  ## 🙏 Acknowledgments

  Built with ❤️ for the AI coding community. Special thanks to:
  - Anthropic for Claude Code and MCP protocol
  - Playwright team for the amazing testing framework
