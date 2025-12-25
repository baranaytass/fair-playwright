# fair-playwright

## 1.1.0

### Minor Changes

- Professional documentation site and branding improvements

  **New Features:**
  - 📚 Comprehensive VitePress documentation site with professional structure
  - 🎨 Official project logo added to branding
  - 📖 Complete API reference with TypeScript examples
  - 🎯 Working examples for basic, advanced, and MCP usage
  - 📝 CONTRIBUTING.md with development guidelines
  - 🔍 Migration guide from standard Playwright
  - 🛠️ Troubleshooting guide for common issues

  **Documentation Structure:**
  - Guide pages: Getting Started, Configuration, Step Hierarchy, Progressive Output, MCP Integration, Migration, Troubleshooting
  - API Reference: FairReporter, E2E Helper, MCP Server, TypeScript Types
  - Examples: Basic Usage, Advanced Patterns, MCP Integration

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
