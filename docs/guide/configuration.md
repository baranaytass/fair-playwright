# Configuration

Customize fair-playwright behavior to match your needs.

## Basic Configuration

Configure the reporter in `playwright.config.ts`:

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [
    ['fair-playwright', {
      // Configuration options here
    }]
  ]
});
```

## Configuration Options

### mode

Output rendering mode.

- **Type**: `'progressive' | 'full' | 'minimal'`
- **Default**: `'progressive'`

```typescript
{
  mode: 'progressive'
}
```

**Values:**
- `progressive` - Smart compression, live updates (recommended)
- `full` - Always show all steps, no compression
- `minimal` - Test names and results only

### aiOptimized

Enable AI-optimized output formats.

- **Type**: `boolean`
- **Default**: `true`

```typescript
{
  aiOptimized: true
}
```

When enabled:
- Generates structured markdown summaries
- Optimizes for LLM context windows
- Enables MCP server integration

### output

Configure output destinations.

- **Type**: `object`

```typescript
{
  output: {
    console: true,
    ai: './test-results/ai-summary.md',
    json: './test-results/results.json'
  }
}
```

**Properties:**
- `console` (boolean) - Write to terminal (default: `true`)
- `ai` (string | false) - AI-optimized markdown output path
- `json` (string | false) - JSON output path

### stepClassification

Control how steps are classified as MAJOR or MINOR.

- **Type**: `object`

```typescript
{
  stepClassification: {
    durationThreshold: 1000,
    autoDetect: true
  }
}
```

**Properties:**
- `durationThreshold` (number) - Steps longer than this (ms) are MAJOR (default: `1000`)
- `autoDetect` (boolean) - Auto-classify steps (default: `true`)

### progressive

Fine-tune progressive mode behavior.

- **Type**: `object`

```typescript
{
  progressive: {
    clearCompleted: true,
    updateInterval: 100,
    showTimings: false
  }
}
```

**Properties:**
- `clearCompleted` (boolean) - Compress completed steps (default: `true`)
- `updateInterval` (number) - Terminal update frequency in ms (default: `100`)
- `showTimings` (boolean) - Show step durations (default: `false`)

## Complete Example

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [
    ['fair-playwright', {
      mode: 'progressive',
      aiOptimized: true,
      output: {
        console: true,
        ai: './test-results/ai-summary.md',
        json: './test-results/results.json'
      },
      stepClassification: {
        durationThreshold: 1000,
        autoDetect: true
      },
      progressive: {
        clearCompleted: true,
        updateInterval: 100,
        showTimings: true
      }
    }]
  ]
});
```

## Multiple Reporters

Combine fair-playwright with other reporters:

```typescript
export default defineConfig({
  reporter: [
    ['fair-playwright', { mode: 'progressive' }],
    ['html'],
    ['json', { outputFile: 'test-results.json' }]
  ]
});
```

## Environment-Specific Configuration

Use different configs for local vs CI:

```typescript
export default defineConfig({
  reporter: process.env.CI
    ? [
        ['fair-playwright', { mode: 'minimal' }],
        ['github']
      ]
    : [
        ['fair-playwright', { mode: 'progressive' }],
        ['html']
      ]
});
```

## CI Environment Detection

fair-playwright automatically detects CI environments and adjusts:

- Disables progressive mode if no TTY
- Uses simpler ANSI codes
- Reduces update frequency

**Detected CI environments:**
- GitHub Actions
- GitLab CI
- CircleCI
- Travis CI
- Jenkins
- Buildkite

## MCP Server Configuration

Configure the MCP server separately:

```bash
# Via environment variable
export FAIR_PLAYWRIGHT_RESULTS=/path/to/results

# Via command line
npx fair-playwright-mcp --results-path ./test-results --verbose
```

See [MCP Integration](/guide/mcp) for details.

## TypeScript Types

All configuration options are fully typed:

```typescript
import type { FairReporterConfig } from 'fair-playwright';

const config: FairReporterConfig = {
  mode: 'progressive',
  aiOptimized: true
};
```

## Default Values

```typescript
{
  mode: 'progressive',
  aiOptimized: true,
  output: {
    console: true,
    ai: false,
    json: false
  },
  stepClassification: {
    durationThreshold: 1000,
    autoDetect: true
  },
  progressive: {
    clearCompleted: true,
    updateInterval: 100,
    showTimings: false
  }
}
```

## Troubleshooting

**Issue**: Progressive mode not working in terminal

**Solution**: Check if your terminal supports TTY:
```bash
node -e "console.log(process.stdout.isTTY)"
```

**Issue**: Output files not generated

**Solution**: Ensure output directory exists or use absolute paths:
```typescript
{
  output: {
    json: path.join(__dirname, 'test-results', 'results.json')
  }
}
```

See [Troubleshooting Guide](/guide/troubleshooting) for more.

## Next Steps

- [Step Hierarchy](/guide/step-hierarchy) - Learn MAJOR/MINOR classification
- [Progressive Output](/guide/progressive-output) - Understand terminal rendering
- [Migration Guide](/guide/migration) - Migrate existing tests
