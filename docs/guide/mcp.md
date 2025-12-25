# MCP Integration

Connect fair-playwright with AI assistants via the Model Context Protocol.

## What is MCP?

The **Model Context Protocol (MCP)** is an open protocol that lets AI assistants access external data sources and tools. fair-playwright includes a built-in MCP server that exposes test results to AI coding assistants like Claude Desktop.

## Why MCP?

MCP enables AI assistants to:
- Query test results in natural language
- Analyze failures and suggest fixes
- Understand test coverage and patterns
- Generate new tests based on existing ones
- Monitor test execution in real-time

## Quick Start

### 1. Install fair-playwright

```bash
npm install -D fair-playwright
```

### 2. Configure Claude Desktop

Add to your Claude Desktop config:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

**Linux**: `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "fair-playwright": {
      "command": "npx",
      "args": ["fair-playwright-mcp"],
      "env": {
        "FAIR_PLAYWRIGHT_RESULTS": "/absolute/path/to/your/test-results"
      }
    }
  }
}
```

### 3. Run Tests

```bash
npx playwright test --reporter=fair-playwright
```

### 4. Restart Claude Desktop

The MCP server will start automatically when Claude launches.

### 5. Query Tests

In Claude Desktop:
```
Show me all failed tests from the last run
```

Claude can now access your test results!

## MCP Server

### Starting the Server

The MCP server runs automatically when configured in Claude Desktop. For manual testing:

```bash
# With results path
npx fair-playwright-mcp --results-path ./test-results

# With environment variable
export FAIR_PLAYWRIGHT_RESULTS=/path/to/results
npx fair-playwright-mcp

# Verbose mode
npx fair-playwright-mcp --verbose
```

### Server Options

| Option | Description | Default |
|--------|-------------|---------|
| `--results-path` | Path to test results directory | `./test-results` |
| `--verbose` | Enable detailed logging | `false` |
| `--help` | Show help message | - |

### Environment Variables

- `FAIR_PLAYWRIGHT_RESULTS`: Test results directory path

## Resources

MCP servers expose **resources** - data that AI can read.

### 1. Test Results

**URI**: `fair-playwright://test-results`

Complete test execution results including:
- Test names and statuses
- MAJOR/MINOR step hierarchy
- Execution times
- Error messages
- Browser console logs

**Example Query**:
```
Show me the test results from the last run
```

### 2. Test Summary

**URI**: `fair-playwright://test-summary`

High-level test run summary:
- Total tests, passed, failed, skipped
- Execution duration
- Success rate
- Failed test names

**Example Query**:
```
Give me a summary of the test run
```

### 3. Failures

**URI**: `fair-playwright://failures`

Detailed failure information:
- Failed test names
- Error messages and stack traces
- Failed step context
- Screenshots/artifacts (if available)

**Example Query**:
```
What tests failed and why?
```

## Tools

MCP servers expose **tools** - actions AI can execute.

### 1. get_test_results

Get complete test results with filtering.

**Parameters**:
- `status` (optional): Filter by status (`passed`, `failed`, `skipped`)
- `testName` (optional): Filter by test name pattern

**Example**:
```
Get all failed tests related to login
```

### 2. get_failure_summary

Get a concise summary of test failures.

**Returns**:
- Failed test count
- Common error patterns
- Suggested fixes

**Example**:
```
Summarize test failures and suggest fixes
```

### 3. query_test

Query specific test details by name.

**Parameters**:
- `testName`: Full or partial test name

**Returns**:
- Complete test details
- Step-by-step execution
- Timing information

**Example**:
```
Show details for the "user can checkout" test
```

### 4. get_tests_by_status

Filter tests by execution status.

**Parameters**:
- `status`: `passed`, `failed`, `skipped`, or `flaky`

**Returns**:
- List of matching tests
- Basic execution info

**Example**:
```
Show all skipped tests
```

### 5. get_step_details

Get detailed information about a specific test step.

**Parameters**:
- `testName`: Test name
- `stepTitle`: Step title

**Returns**:
- Step execution details
- Timing
- Error if failed

**Example**:
```
Why did the "Submit form" step fail?
```

## AI-Optimized Output

fair-playwright generates markdown summaries optimized for LLM context:

```typescript
// playwright.config.ts
{
  reporter: [
    ['fair-playwright', {
      aiOptimized: true,
      output: {
        ai: './test-results/ai-summary.md'
      }
    }]
  ]
}
```

**Generated Summary**:

```markdown
# Test Run Summary

**Date**: 2024-12-23T10:30:00Z
**Duration**: 45.2s
**Status**:  FAILED

## Overview
- Total: 15 tests
- ✓ Passed: 12
- ✗ Failed: 3
-  Skipped: 0

## Failed Tests

###  user can checkout
**File**: tests/checkout.spec.ts:45

#### MAJOR: Complete checkout ✗
- ✓ Add items to cart
- ✓ Proceed to checkout
- ✗ Submit payment
  - Error: Payment button not found
  - Browser Console: [ERROR] 500 Internal Server Error
- Result: Checkout failed

**Suggested Fix**: Check payment API endpoint and button selector

---

###  user can update profile
...
```

This format is:
- Easy for humans to read
- Optimal for LLM parsing
- Includes context for debugging
- Suggests fixes when possible

## Example Queries

### Basic Queries

```
How many tests failed?
```

```
Show me all test results
```

```
What's the success rate?
```

### Detailed Analysis

```
Analyze the failed checkout test and suggest fixes
```

```
Show me the step-by-step execution of the login test
```

```
What browser errors occurred during test execution?
```

### Test Generation

```
Generate a new test similar to the successful login test
```

```
Create a test for the forgot password flow
```

### Debugging

```
Why is the payment step failing?
```

```
Show console errors from failed tests
```

```
Compare the failed test with the successful one
```

## Claude Desktop Integration

### Setup Verification

1. Open Claude Desktop
2. Look for the tools icon in the bottom-right
3. You should see "fair-playwright" listed
4. Click to verify connection

### Troubleshooting

**Issue**: MCP server not showing in Claude

**Solution**:
1. Check config file location
2. Verify JSON syntax is valid
3. Restart Claude Desktop
4. Check Claude logs: `~/Library/Logs/Claude/mcp.log`

**Issue**: "Results not found" error

**Solution**:
1. Verify `FAIR_PLAYWRIGHT_RESULTS` path is absolute
2. Run tests to generate results
3. Check directory exists and is readable

**Issue**: Server crashes on startup

**Solution**:
1. Run with `--verbose` flag
2. Check Node.js version >= 18
3. Verify fair-playwright is installed

## Advanced Configuration

### Custom Results Path

```json
{
  "mcpServers": {
    "fair-playwright": {
      "command": "node",
      "args": [
        "/absolute/path/to/node_modules/.bin/fair-playwright-mcp",
        "--results-path",
        "/custom/results/path"
      ]
    }
  }
}
```

### Multiple Projects

```json
{
  "mcpServers": {
    "fair-playwright-web": {
      "command": "npx",
      "args": ["fair-playwright-mcp"],
      "env": {
        "FAIR_PLAYWRIGHT_RESULTS": "/path/to/web/results"
      }
    },
    "fair-playwright-api": {
      "command": "npx",
      "args": ["fair-playwright-mcp"],
      "env": {
        "FAIR_PLAYWRIGHT_RESULTS": "/path/to/api/results"
      }
    }
  }
}
```

### With CI Integration

```json
{
  "mcpServers": {
    "fair-playwright": {
      "command": "npx",
      "args": ["fair-playwright-mcp"],
      "env": {
        "FAIR_PLAYWRIGHT_RESULTS": "${HOME}/ci-results/latest"
      }
    }
  }
}
```

## MCP Protocol Details

### Architecture

```
┌─────────────────┐
│  Claude Desktop │
└────────┬────────┘
         │ stdio
┌────────▼────────┐
│   MCP Server    │
│ (fair-playwright)│
└────────┬────────┘
         │
┌────────▼────────┐
│  Test Results   │
│  JSON Files     │
└─────────────────┘
```

### Communication

- **Transport**: stdio (stdin/stdout)
- **Format**: JSON-RPC 2.0
- **Encoding**: UTF-8

### Security

- Read-only access to test results
- No write operations
- No network access
- Sandboxed execution

## Best Practices

### 1. Absolute Paths

Always use absolute paths:

```json
{
  "env": {
    "FAIR_PLAYWRIGHT_RESULTS": "/Users/you/project/test-results"
  }
}
```

### 2. Results Directory Structure

Organize results for easy querying:

```
test-results/
├── latest.json          # Most recent run
├── ai-summary.md        # AI-optimized summary
├── 2024-12-23-10-30.json
└── screenshots/
```

### 3. Keep Recent Results

Retain recent test runs for comparison:

```typescript
{
  output: {
    json: `./test-results/${new Date().toISOString()}.json`
  }
}
```

### 4. Enable AI Output

Always generate AI summaries:

```typescript
{
  aiOptimized: true,
  output: {
    ai: './test-results/ai-summary.md'
  }
}
```

## Other MCP Clients

fair-playwright MCP server works with any MCP-compatible client:

- **Claude Desktop** (recommended)
- **VS Code with MCP extension**
- **Custom MCP clients**
- **Cursor IDE** (with MCP support)

See [MCP documentation](https://modelcontextprotocol.io) for details.

## Next Steps

- [Examples](/examples/mcp) - See MCP queries in action
- [API Reference](/api/mcp-server) - Server implementation details
- [Troubleshooting](/guide/troubleshooting) - Common MCP issues
