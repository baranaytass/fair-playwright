/**
 * MCP (Model Context Protocol) Server for AI integration
 * Provides test results and progress to AI coding assistants
 *
 * NOTE: This is a basic implementation stub.
 * Full MCP protocol implementation requires:
 * - stdio/http transport layer
 * - JSON-RPC message handling
 * - Resource and tool definitions
 * - Capability negotiation
 *
 * For production use, integrate with @modelcontextprotocol/sdk
 */

import type { TestMetadata } from '../types/index.js';

export interface MCPServerConfig {
  /**
   * Transport mode: stdio (for CLI) or http (for web)
   */
  transport?: 'stdio' | 'http';

  /**
   * Port for HTTP transport
   */
  port?: number;

  /**
   * Enable verbose logging
   */
  verbose?: boolean;
}

export interface MCPTestResult {
  status: 'passed' | 'failed' | 'running';
  totalTests: number;
  passedTests: number;
  failedTests: number;
  duration: number;
  tests: TestMetadata[];
}

/**
 * MCP Server for exposing test results to AI assistants
 */
export class MCPServer {
  private config: MCPServerConfig;
  private testResults: TestMetadata[] = [];
  private isRunning: boolean = false;

  constructor(config: MCPServerConfig = {}) {
    this.config = {
      transport: config.transport ?? 'stdio',
      port: config.port ?? 3000,
      verbose: config.verbose ?? false,
    };
  }

  /**
   * Start the MCP server
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      throw new Error('MCP Server is already running');
    }

    this.isRunning = true;

    if (this.config.verbose) {
      console.log(`[MCP Server] Starting in ${this.config.transport} mode`);
    }

    // TODO: Implement actual MCP protocol
    // This would involve:
    // 1. Setting up transport (stdio or HTTP)
    // 2. Implementing JSON-RPC message handler
    // 3. Registering resources and tools
    // 4. Handling capability negotiation
  }

  /**
   * Stop the MCP server
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;

    if (this.config.verbose) {
      console.log('[MCP Server] Stopping');
    }
  }

  /**
   * Update test results
   * Called by the reporter as tests complete
   */
  updateTestResults(tests: TestMetadata[]): void {
    this.testResults = tests;

    if (this.config.verbose) {
      console.log(`[MCP Server] Updated with ${tests.length} test results`);
    }
  }

  /**
   * Get current test results
   * MCP resource: fair-playwright://test-results
   */
  getTestResults(): MCPTestResult {
    const passed = this.testResults.filter((t) => t.status === 'passed').length;
    const failed = this.testResults.filter((t) => t.status === 'failed').length;
    const totalDuration = this.testResults.reduce((sum, t) => sum + (t.duration || 0), 0);

    return {
      status: failed > 0 ? 'failed' : this.testResults.length > 0 ? 'passed' : 'running',
      totalTests: this.testResults.length,
      passedTests: passed,
      failedTests: failed,
      duration: totalDuration,
      tests: this.testResults,
    };
  }

  /**
   * Get AI-optimized summary of failures
   * MCP tool: get_failure_summary
   */
  getFailureSummary(): string {
    const failedTests = this.testResults.filter((t) => t.status === 'failed');

    if (failedTests.length === 0) {
      return 'No test failures';
    }

    let summary = `# Test Failures Summary\n\n`;
    summary += `${failedTests.length} test(s) failed:\n\n`;

    failedTests.forEach((test, index) => {
      summary += `## ${index + 1}. ${test.title}\n\n`;
      summary += `**File**: ${test.file}\n`;
      summary += `**Duration**: ${test.duration}ms\n\n`;

      if (test.error) {
        summary += `**Error**: ${test.error.message}\n\n`;
        if (test.error.location) {
          summary += `**Location**: ${test.error.location}\n\n`;
        }
      }

      const failedSteps = test.steps.filter((s) => s.status === 'failed');
      if (failedSteps.length > 0) {
        summary += `**Failed Steps**:\n`;
        failedSteps.forEach((step) => {
          const badge = step.level === 'major' ? '[MAJOR]' : '[minor]';
          summary += `- ${badge} ${step.title}\n`;
          if (step.error) {
            summary += `  Error: ${step.error.message}\n`;
          }
        });
        summary += `\n`;
      }

      summary += `---\n\n`;
    });

    return summary;
  }

  /**
   * Query specific test by title
   * MCP tool: query_test
   */
  queryTest(title: string): TestMetadata | null {
    const test = this.testResults.find((t) =>
      t.title.toLowerCase().includes(title.toLowerCase())
    );
    return test || null;
  }

  /**
   * Get tests by status
   * MCP tool: get_tests_by_status
   */
  getTestsByStatus(status: 'passed' | 'failed' | 'skipped'): TestMetadata[] {
    return this.testResults.filter((t) => t.status === status);
  }

  /**
   * Check if server is running
   */
  get running(): boolean {
    return this.isRunning;
  }
}

/**
 * Create and configure MCP server instance
 */
export function createMCPServer(config?: MCPServerConfig): MCPServer {
  return new MCPServer(config);
}

/**
 * Example usage for Claude Desktop integration:
 *
 * Add to claude_desktop_config.json:
 * {
 *   "mcpServers": {
 *     "fair-playwright": {
 *       "command": "npx",
 *       "args": ["fair-playwright-mcp"],
 *       "env": {
 *         "FAIR_PLAYWRIGHT_RESULTS": "./test-results/results.json"
 *       }
 *     }
 *   }
 * }
 */
