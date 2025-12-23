/**
 * MCP (Model Context Protocol) Server for AI integration
 * Provides test results and progress to AI coding assistants
 *
 * Full MCP protocol implementation using @modelcontextprotocol/sdk
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import type { TestMetadata } from '../types/index.js';

export interface MCPServerConfig {
  /**
   * Path to test results JSON file
   * Default: './test-results/results.json'
   */
  resultsPath?: string;

  /**
   * Server name
   */
  name?: string;

  /**
   * Server version
   */
  version?: string;

  /**
   * Enable verbose logging
   */
  verbose?: boolean;
}

/**
 * MCP Server for exposing test results to AI assistants
 */
export class MCPServer {
  private server: Server;
  private config: Required<MCPServerConfig>;
  private testResults: TestMetadata[] = [];

  constructor(config: MCPServerConfig = {}) {
    this.config = {
      resultsPath: config.resultsPath ?? './test-results/results.json',
      name: config.name ?? 'fair-playwright',
      version: config.version ?? '0.1.0',
      verbose: config.verbose ?? false,
    };

    // Initialize MCP server
    this.server = new Server(
      {
        name: this.config.name,
        version: this.config.version,
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  /**
   * Setup MCP protocol handlers
   */
  private setupHandlers(): void {
    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [
        {
          uri: 'fair-playwright://test-results',
          name: 'Test Results',
          description: 'Current Playwright test execution results',
          mimeType: 'application/json',
        },
        {
          uri: 'fair-playwright://test-summary',
          name: 'Test Summary',
          description: 'AI-optimized summary of test results',
          mimeType: 'text/markdown',
        },
        {
          uri: 'fair-playwright://failures',
          name: 'Failed Tests',
          description: 'Detailed information about failed tests',
          mimeType: 'text/markdown',
        },
      ],
    }));

    // Read resource content
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const uri = request.params.uri.toString();

      // Load test results if not already loaded
      if (this.testResults.length === 0) {
        await this.loadTestResults();
      }

      switch (uri) {
        case 'fair-playwright://test-results':
          return {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(this.getTestResults(), null, 2),
              },
            ],
          };

        case 'fair-playwright://test-summary':
          return {
            contents: [
              {
                uri,
                mimeType: 'text/markdown',
                text: this.getTestSummary(),
              },
            ],
          };

        case 'fair-playwright://failures':
          return {
            contents: [
              {
                uri,
                mimeType: 'text/markdown',
                text: this.getFailureSummary(),
              },
            ],
          };

        default:
          throw new Error(`Unknown resource: ${uri}`);
      }
    });

    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'get_test_results',
          description: 'Get complete test execution results with all details',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'get_failure_summary',
          description: 'Get AI-optimized summary of failed tests',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'query_test',
          description: 'Search for a specific test by title',
          inputSchema: {
            type: 'object',
            properties: {
              title: {
                type: 'string',
                description: 'Test title to search for (case-insensitive partial match)',
              },
            },
            required: ['title'],
          },
        },
        {
          name: 'get_tests_by_status',
          description: 'Get all tests filtered by status',
          inputSchema: {
            type: 'object',
            properties: {
              status: {
                type: 'string',
                enum: ['passed', 'failed', 'skipped'],
                description: 'Test status to filter by',
              },
            },
            required: ['status'],
          },
        },
        {
          name: 'get_step_details',
          description: 'Get detailed information about test steps',
          inputSchema: {
            type: 'object',
            properties: {
              testTitle: {
                type: 'string',
                description: 'Title of the test to get step details for',
              },
              level: {
                type: 'string',
                enum: ['major', 'minor', 'all'],
                description: 'Filter steps by level (default: all)',
              },
            },
            required: ['testTitle'],
          },
        },
      ],
    }));

    // Call tool
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      // Load test results if not already loaded
      if (this.testResults.length === 0) {
        await this.loadTestResults();
      }

      switch (name) {
        case 'get_test_results':
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(this.getTestResults(), null, 2),
              },
            ],
          };

        case 'get_failure_summary':
          return {
            content: [
              {
                type: 'text',
                text: this.getFailureSummary(),
              },
            ],
          };

        case 'query_test': {
          const title = (args as { title: string }).title;
          const test = this.queryTest(title);
          return {
            content: [
              {
                type: 'text',
                text: test
                  ? JSON.stringify(test, null, 2)
                  : `No test found matching: ${title}`,
              },
            ],
          };
        }

        case 'get_tests_by_status': {
          const status = (args as { status: 'passed' | 'failed' | 'skipped' }).status;
          const tests = this.getTestsByStatus(status);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(tests, null, 2),
              },
            ],
          };
        }

        case 'get_step_details': {
          const { testTitle, level } = args as { testTitle: string; level?: string };
          const test = this.queryTest(testTitle);
          if (!test) {
            return {
              content: [
                {
                  type: 'text',
                  text: `No test found matching: ${testTitle}`,
                },
              ],
            };
          }

          let steps = test.steps;
          if (level && level !== 'all') {
            steps = steps.filter((s) => s.level === level);
          }

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(steps, null, 2),
              },
            ],
          };
        }

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  /**
   * Load test results from JSON file
   */
  private async loadTestResults(): Promise<void> {
    try {
      if (!existsSync(this.config.resultsPath)) {
        if (this.config.verbose) {
          console.error(`[MCP] Results file not found: ${this.config.resultsPath}`);
        }
        return;
      }

      const content = await readFile(this.config.resultsPath, 'utf-8');
      const data = JSON.parse(content);

      // Handle both direct array and wrapped format
      this.testResults = Array.isArray(data) ? data : data.tests || [];

      if (this.config.verbose) {
        console.error(`[MCP] Loaded ${this.testResults.length} test results`);
      }
    } catch (error) {
      if (this.config.verbose) {
        console.error(`[MCP] Error loading test results:`, error);
      }
    }
  }

  /**
   * Start the MCP server with stdio transport
   */
  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    if (this.config.verbose) {
      console.error('[MCP] Server started and connected via stdio');
    }
  }

  /**
   * Get current test results
   */
  private getTestResults() {
    const passed = this.testResults.filter((t) => t.status === 'passed').length;
    const failed = this.testResults.filter((t) => t.status === 'failed').length;
    const skipped = this.testResults.filter((t) => t.status === 'skipped').length;
    const totalDuration = this.testResults.reduce((sum, t) => sum + (t.duration || 0), 0);

    return {
      status: failed > 0 ? 'failed' : this.testResults.length > 0 ? 'passed' : 'unknown',
      summary: {
        total: this.testResults.length,
        passed,
        failed,
        skipped,
        duration: totalDuration,
      },
      tests: this.testResults,
    };
  }

  /**
   * Get test summary in markdown format
   */
  private getTestSummary(): string {
    const results = this.getTestResults();
    const { summary } = results;

    let md = '# Playwright Test Results\n\n';
    md += `**Status**: ${results.status === 'failed' ? '❌ FAILED' : '✅ PASSED'}\n`;
    md += `**Total Tests**: ${summary.total}\n`;
    md += `**Duration**: ${(summary.duration / 1000).toFixed(2)}s\n\n`;

    md += '## Summary\n\n';
    md += `- ✅ Passed: ${summary.passed}\n`;
    md += `- ❌ Failed: ${summary.failed}\n`;
    md += `- ⊘ Skipped: ${summary.skipped}\n\n`;

    if (summary.failed > 0) {
      md += '## Failed Tests\n\n';
      const failedTests = this.testResults.filter((t) => t.status === 'failed');
      failedTests.forEach((test, index) => {
        md += `${index + 1}. **${test.title}** (${test.duration}ms)\n`;
        md += `   - File: \`${test.file}\`\n`;
        if (test.error) {
          md += `   - Error: ${test.error.message}\n`;
        }
      });
    }

    return md;
  }

  /**
   * Get AI-optimized summary of failures
   */
  private getFailureSummary(): string {
    const failedTests = this.testResults.filter((t) => t.status === 'failed');

    if (failedTests.length === 0) {
      return '# No Test Failures\n\nAll tests passed! ✅';
    }

    let summary = `# Test Failures Summary\n\n`;
    summary += `${failedTests.length} test(s) failed:\n\n`;

    failedTests.forEach((test, index) => {
      summary += `## ${index + 1}. ${test.title}\n\n`;
      summary += `**File**: \`${test.file}\`\n`;
      summary += `**Duration**: ${test.duration}ms\n\n`;

      if (test.error) {
        summary += `**Error**: ${test.error.message}\n\n`;
        if (test.error.location) {
          summary += `**Location**: \`${test.error.location}\`\n\n`;
        }
      }

      // MAJOR/MINOR steps
      const majorSteps = test.steps.filter((s) => s.level === 'major' && !s.parentId);
      if (majorSteps.length > 0) {
        summary += `**Test Flow**:\n\n`;
        majorSteps.forEach((majorStep, idx) => {
          const icon = majorStep.status === 'passed' ? '✅' : '❌';
          summary += `${idx + 1}. ${icon} [MAJOR] ${majorStep.title}\n`;

          // Show MINOR steps for failed MAJOR steps
          if (majorStep.status === 'failed') {
            const minorSteps = test.steps.filter((s) => s.parentId === majorStep.id);
            minorSteps.forEach((minorStep) => {
              const minorIcon = minorStep.status === 'passed' ? '✅' : '❌';
              summary += `   - ${minorIcon} [minor] ${minorStep.title}\n`;
              if (minorStep.error) {
                summary += `     Error: ${minorStep.error.message}\n`;
              }
            });
          }
        });
        summary += `\n`;
      }

      // Browser console errors
      if (test.consoleErrors && test.consoleErrors.length > 0) {
        summary += `**Browser Console Errors** (${test.consoleErrors.length}):\n\n`;
        test.consoleErrors.forEach((consoleError, idx) => {
          summary += `${idx + 1}. [${consoleError.type}] ${consoleError.message}\n`;
        });
        summary += `\n`;
      }

      summary += `---\n\n`;
    });

    return summary;
  }

  /**
   * Query specific test by title
   */
  private queryTest(title: string): TestMetadata | null {
    const test = this.testResults.find((t) =>
      t.title.toLowerCase().includes(title.toLowerCase())
    );
    return test || null;
  }

  /**
   * Get tests by status
   */
  private getTestsByStatus(status: 'passed' | 'failed' | 'skipped'): TestMetadata[] {
    return this.testResults.filter((t) => t.status === status);
  }
}

/**
 * Create and start MCP server
 */
export async function createMCPServer(config?: MCPServerConfig): Promise<MCPServer> {
  const server = new MCPServer(config);
  await server.start();
  return server;
}
