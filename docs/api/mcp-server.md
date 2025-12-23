# MCP Server API

Model Context Protocol server for AI assistant integration.

## Overview

fair-playwright includes a built-in MCP server that exposes test results to AI assistants via the Model Context Protocol.

## CLI Usage

### Start Server

```bash
# With results path
npx fair-playwright-mcp --results-path ./test-results

# With environment variable
export FAIR_PLAYWRIGHT_RESULTS=/path/to/results
npx fair-playwright-mcp

# Verbose logging
npx fair-playwright-mcp --verbose

# Show help
npx fair-playwright-mcp --help
```

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--results-path <path>` | Path to test results directory | `./test-results` |
| `--verbose` | Enable detailed logging | `false` |
| `--help` | Show help message | - |

### Environment Variables

- `FAIR_PLAYWRIGHT_RESULTS`: Test results directory path
- `DEBUG`: Enable debug logging (`DEBUG=fair-playwright:mcp`)

## Claude Desktop Configuration

### macOS

```json
// ~/Library/Application Support/Claude/claude_desktop_config.json
{
  "mcpServers": {
    "fair-playwright": {
      "command": "npx",
      "args": ["fair-playwright-mcp"],
      "env": {
        "FAIR_PLAYWRIGHT_RESULTS": "/absolute/path/to/test-results"
      }
    }
  }
}
```

### Windows

```json
// %APPDATA%\Claude\claude_desktop_config.json
{
  "mcpServers": {
    "fair-playwright": {
      "command": "npx",
      "args": ["fair-playwright-mcp"],
      "env": {
        "FAIR_PLAYWRIGHT_RESULTS": "C:\\absolute\\path\\to\\test-results"
      }
    }
  }
}
```

### Linux

```json
// ~/.config/Claude/claude_desktop_config.json
{
  "mcpServers": {
    "fair-playwright": {
      "command": "npx",
      "args": ["fair-playwright-mcp"],
      "env": {
        "FAIR_PLAYWRIGHT_RESULTS": "/absolute/path/to/test-results"
      }
    }
  }
}
```

## Programmatic Usage

### Create Server

```typescript
import { createMCPServer } from 'fair-playwright';

const server = await createMCPServer({
  resultsPath: './test-results',
  verbose: false
});

// Server runs on stdio
```

### Configuration

```typescript
interface MCPServerConfig {
  resultsPath?: string;
  verbose?: boolean;
}
```

#### resultsPath

Path to test results directory.

- **Type**: `string`
- **Default**: `./test-results`

```typescript
{
  resultsPath: '/absolute/path/to/results'
}
```

#### verbose

Enable detailed logging.

- **Type**: `boolean`
- **Default**: `false`

```typescript
{
  verbose: true
}
```

## Resources

MCP resources are read-only data sources.

### 1. test-results

Complete test execution results.

**URI**: `fair-playwright://test-results`

**Format**: JSON

**Content:**
```json
{
  "summary": {
    "total": 15,
    "passed": 12,
    "failed": 3,
    "skipped": 0,
    "duration": 45200
  },
  "tests": [
    {
      "name": "user can login",
      "status": "passed",
      "duration": 2300,
      "steps": [...]
    }
  ]
}
```

**AI Query Example:**
```
Show me all test results from the last run
```

### 2. test-summary

High-level test run summary.

**URI**: `fair-playwright://test-summary`

**Format**: JSON

**Content:**
```json
{
  "total": 15,
  "passed": 12,
  "failed": 3,
  "skipped": 0,
  "successRate": 0.8,
  "duration": 45200,
  "startTime": "2024-12-23T10:30:00.000Z",
  "failedTests": [
    "user can checkout",
    "user can update profile",
    "user can delete account"
  ]
}
```

**AI Query Example:**
```
Give me a summary of the test run
```

### 3. failures

Detailed failure information.

**URI**: `fair-playwright://failures`

**Format**: JSON

**Content:**
```json
{
  "count": 3,
  "failures": [
    {
      "testName": "user can checkout",
      "file": "tests/checkout.spec.ts",
      "line": 45,
      "error": "Payment button not found",
      "stack": "Error: Payment button not found\n    at ...",
      "failedStep": {
        "type": "MAJOR",
        "title": "Complete checkout",
        "minorStep": "Submit payment"
      },
      "browserConsole": [
        "[ERROR] 500 Internal Server Error"
      ]
    }
  ]
}
```

**AI Query Example:**
```
What tests failed and why?
```

## Tools

MCP tools are executable actions.

### 1. get_test_results

Get complete test results with optional filtering.

**Parameters:**

```typescript
{
  status?: 'passed' | 'failed' | 'skipped';
  testName?: string;
}
```

**Returns:**

```json
{
  "tests": [
    {
      "name": "user can login",
      "status": "passed",
      "file": "tests/auth.spec.ts",
      "line": 10,
      "duration": 2300,
      "steps": [...]
    }
  ]
}
```

**AI Query Example:**
```
Get all failed tests related to login
```

**Implementation:**

```typescript
{
  name: 'get_test_results',
  description: 'Get complete test execution results with optional filtering',
  inputSchema: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['passed', 'failed', 'skipped'],
        description: 'Filter tests by status'
      },
      testName: {
        type: 'string',
        description: 'Filter by test name (partial match)'
      }
    }
  }
}
```

### 2. get_failure_summary

Get concise summary of test failures.

**Parameters:** None

**Returns:**

```json
{
  "failureCount": 3,
  "commonErrors": [
    {
      "error": "Element not found",
      "count": 2,
      "tests": ["test1", "test2"]
    }
  ],
  "suggestedFixes": [
    "Check element selectors for recent UI changes",
    "Verify network connectivity to API endpoints"
  ]
}
```

**AI Query Example:**
```
Summarize test failures and suggest fixes
```

**Implementation:**

```typescript
{
  name: 'get_failure_summary',
  description: 'Get a concise summary of test failures with suggested fixes',
  inputSchema: {
    type: 'object',
    properties: {}
  }
}
```

### 3. query_test

Query specific test details by name.

**Parameters:**

```typescript
{
  testName: string;
}
```

**Returns:**

```json
{
  "name": "user can checkout",
  "file": "tests/checkout.spec.ts",
  "line": 45,
  "status": "failed",
  "duration": 3200,
  "steps": [
    {
      "type": "MAJOR",
      "title": "Complete checkout",
      "status": "failed",
      "minorSteps": [
        {
          "title": "Add to cart",
          "status": "passed",
          "duration": 800
        },
        {
          "title": "Submit payment",
          "status": "failed",
          "duration": 1200,
          "error": "Payment button not found"
        }
      ]
    }
  ]
}
```

**AI Query Example:**
```
Show details for the "user can checkout" test
```

**Implementation:**

```typescript
{
  name: 'query_test',
  description: 'Query detailed information about a specific test',
  inputSchema: {
    type: 'object',
    properties: {
      testName: {
        type: 'string',
        description: 'Full or partial test name to query'
      }
    },
    required: ['testName']
  }
}
```

### 4. get_tests_by_status

Filter tests by execution status.

**Parameters:**

```typescript
{
  status: 'passed' | 'failed' | 'skipped' | 'flaky';
}
```

**Returns:**

```json
{
  "status": "failed",
  "count": 3,
  "tests": [
    {
      "name": "user can checkout",
      "file": "tests/checkout.spec.ts",
      "duration": 3200
    }
  ]
}
```

**AI Query Example:**
```
Show all skipped tests
```

**Implementation:**

```typescript
{
  name: 'get_tests_by_status',
  description: 'Get all tests matching a specific status',
  inputSchema: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['passed', 'failed', 'skipped', 'flaky'],
        description: 'Test status to filter by'
      }
    },
    required: ['status']
  }
}
```

### 5. get_step_details

Get detailed information about a specific test step.

**Parameters:**

```typescript
{
  testName: string;
  stepTitle: string;
}
```

**Returns:**

```json
{
  "test": "user can checkout",
  "step": {
    "type": "MAJOR",
    "title": "Complete checkout",
    "status": "failed",
    "duration": 2400,
    "minorStep": {
      "title": "Submit payment",
      "status": "failed",
      "duration": 1200,
      "error": "Payment button not found",
      "stack": "Error: Payment button not found\n    at ..."
    }
  }
}
```

**AI Query Example:**
```
Why did the "Submit payment" step fail?
```

**Implementation:**

```typescript
{
  name: 'get_step_details',
  description: 'Get detailed information about a specific test step',
  inputSchema: {
    type: 'object',
    properties: {
      testName: {
        type: 'string',
        description: 'Test name'
      },
      stepTitle: {
        type: 'string',
        description: 'Step title (MAJOR or MINOR)'
      }
    },
    required: ['testName', 'stepTitle']
  }
}
```

## Server Architecture

### Communication

```
┌──────────────┐
│ Claude Desktop│
└──────┬───────┘
       │ stdio (JSON-RPC 2.0)
┌──────▼───────┐
│  MCP Server  │
│ (Node.js)    │
└──────┬───────┘
       │ File I/O
┌──────▼───────┐
│ Test Results │
│ (JSON files) │
└──────────────┘
```

### Protocol

- **Transport**: stdio (stdin/stdout)
- **Format**: JSON-RPC 2.0
- **Encoding**: UTF-8
- **Security**: Read-only file access

### Lifecycle

1. **Initialization**
   - Server starts via Claude Desktop
   - Reads `FAIR_PLAYWRIGHT_RESULTS` path
   - Registers resources and tools

2. **Request Handling**
   - Receives JSON-RPC requests from Claude
   - Reads test result files
   - Returns formatted responses

3. **Shutdown**
   - Graceful cleanup on process exit
   - Closes file handles

## Error Handling

### File Not Found

```json
{
  "error": {
    "code": -32000,
    "message": "Test results not found at: /path/to/results"
  }
}
```

**Solution**: Run tests to generate results

### Invalid JSON

```json
{
  "error": {
    "code": -32001,
    "message": "Failed to parse test results: Invalid JSON"
  }
}
```

**Solution**: Check result file format

### Permission Denied

```json
{
  "error": {
    "code": -32002,
    "message": "Permission denied reading: /path/to/results"
  }
}
```

**Solution**: Check file permissions

## Logging

### Enable Debug Logging

```bash
DEBUG=fair-playwright:mcp npx fair-playwright-mcp
```

**Output:**
```
[fair-playwright:mcp] Starting MCP server
[fair-playwright:mcp] Results path: /path/to/results
[fair-playwright:mcp] Registered 3 resources
[fair-playwright:mcp] Registered 5 tools
[fair-playwright:mcp] Server ready
[fair-playwright:mcp] Received request: listResources
[fair-playwright:mcp] Returning 3 resources
```

### Verbose Mode

```bash
npx fair-playwright-mcp --verbose
```

**Output:**
```
fair-playwright MCP Server v1.1.0
Results path: /path/to/results
Capabilities:
  - 3 resources (test-results, test-summary, failures)
  - 5 tools (get_test_results, get_failure_summary, query_test, get_tests_by_status, get_step_details)
Server started on stdio
```

## Security

### Read-Only Access

MCP server has **read-only** access to test results:
- Cannot modify test files
- Cannot write to filesystem
- Cannot execute arbitrary commands
- No network access

### Sandboxing

- Runs in isolated Node.js process
- Limited to specified results directory
- No access to system resources

### Authentication

MCP protocol via stdio requires:
- Local machine access
- Parent process control (Claude Desktop)
- No remote access

## Testing

### Manual Testing

```bash
# Start server
npx fair-playwright-mcp --verbose

# In another terminal, send JSON-RPC request
echo '{"jsonrpc":"2.0","id":1,"method":"resources/list"}' | \
  npx fair-playwright-mcp
```

### Integration Testing

```typescript
import { createMCPServer } from 'fair-playwright';

async function testServer() {
  const server = await createMCPServer({
    resultsPath: './test-fixtures',
    verbose: true
  });

  // Server runs on stdio
}
```

## Next Steps

- [MCP Integration Guide](/guide/mcp) - Setup and usage
- [Examples](/examples/mcp) - Query examples
- [Troubleshooting](/guide/troubleshooting) - Common issues
- [MCP Protocol Docs](https://modelcontextprotocol.io) - Official docs
