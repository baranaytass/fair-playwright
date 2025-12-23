/**
 * MCP CLI entry point for fair-playwright
 *
 * Usage:
 *   npx fair-playwright-mcp [options]
 *
 * Options:
 *   --results-path <path>  Path to test results JSON file (default: ./test-results/results.json)
 *   --verbose              Enable verbose logging
 *   --help                 Show help message
 *
 * Example:
 *   npx fair-playwright-mcp --results-path ./custom-results.json --verbose
 */

import { createMCPServer } from './server.js';

async function main() {
  const args = process.argv.slice(2);

  // Parse command line arguments
  const config: {
    resultsPath?: string;
    verbose?: boolean;
  } = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--help':
      case '-h':
        console.log(`
fair-playwright MCP Server

Usage:
  npx fair-playwright-mcp [options]

Options:
  --results-path <path>  Path to test results JSON file
                         Default: ./test-results/results.json
  --verbose              Enable verbose logging
  --help                 Show this help message

Example:
  npx fair-playwright-mcp --results-path ./custom-results.json

For Claude Desktop integration, add to claude_desktop_config.json:
{
  "mcpServers": {
    "fair-playwright": {
      "command": "npx",
      "args": ["fair-playwright-mcp"]
    }
  }
}
        `);
        process.exit(0);
        break;

      case '--results-path':
        config.resultsPath = args[++i];
        break;

      case '--verbose':
        config.verbose = true;
        break;

      default:
        console.error(`Unknown option: ${arg}`);
        console.error(`Run with --help for usage information`);
        process.exit(1);
    }
  }

  // Check for environment variable override
  if (process.env.FAIR_PLAYWRIGHT_RESULTS && !config.resultsPath) {
    config.resultsPath = process.env.FAIR_PLAYWRIGHT_RESULTS;
  }

  try {
    // Create and start MCP server
    await createMCPServer(config);

    // Keep the process running
    // MCP server will handle stdio communication
    process.on('SIGINT', () => {
      if (config.verbose) {
        console.error('\n[MCP] Shutting down...');
      }
      process.exit(0);
    });
  } catch (error) {
    console.error('Failed to start MCP server:', error);
    process.exit(1);
  }
}

main();
