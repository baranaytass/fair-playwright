/**
 * fair-playwright
 * AI-optimized Playwright test reporter with progressive terminal output and hierarchical step management
 */

// Export reporter
export { FairReporter } from './reporter/FairReporter.js';
export { FairReporter as default } from './reporter/FairReporter.js';

// Export E2E helper
export { e2e } from './e2e.js';

// Export MCP server (optional)
export { MCPServer, createMCPServer } from './mcp/server.js';
export type { MCPServerConfig } from './mcp/server.js';

// Export types
export type {
  // Reporter types
  FairReporterConfig,
  OutputMode,
  StepLevel,
  StepStatus,
  StepMetadata,
  TestMetadata,
  // E2E helper types
  E2EHelper,
  StepOptions,
  StepDefinition,
  MajorStepOptions,
  // Playwright types (re-exported for convenience)
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
  TestStep,
} from './types/index.js';
