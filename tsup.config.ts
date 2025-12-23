import { defineConfig } from 'tsup';

export default defineConfig([
  // Main library export
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    clean: true,
    outDir: 'dist',
    splitting: false,
    sourcemap: false,
  },
  // MCP CLI binary
  {
    entry: {
      'mcp-cli': 'src/mcp/cli.ts',
    },
    format: ['esm'],
    dts: false,
    outDir: 'dist',
    splitting: false,
    sourcemap: false,
    banner: {
      js: '#!/usr/bin/env node',
    },
  },
]);
