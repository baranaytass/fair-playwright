import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { MCPServer } from './server.js';
import { VERSION } from '../version.js';

/**
 * Build a minimal results payload in the shape JSONFormatter writes.
 */
function resultsPayload(titles: string[], status: 'passed' | 'failed' = 'passed') {
  return {
    status,
    summary: {
      total: titles.length,
      passed: status === 'passed' ? titles.length : 0,
      failed: status === 'failed' ? titles.length : 0,
      skipped: 0,
      duration: 100,
    },
    timestamp: new Date().toISOString(),
    tests: titles.map((title, i) => ({
      id: `spec.ts::${title}`,
      title,
      file: 'spec.ts',
      status,
      duration: 10 + i,
      startTime: 0,
      endTime: 10,
      steps: [],
      attachments: [],
    })),
  };
}

describe('MCPServer', () => {
  let dir: string;
  let resultsPath: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'fp-mcp-'));
    resultsPath = join(dir, 'results.json');
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  describe('result freshness', () => {
    it('picks up results written after the server started', async () => {
      const server = new MCPServer({ resultsPath });

      // Nothing on disk yet.
      const first = await server.readResults();
      expect(first.tests).toEqual([]);
      expect(first.problem).toContain('No test results found');

      writeFileSync(resultsPath, JSON.stringify(resultsPayload(['login works'])));

      const second = await server.readResults();
      expect(second.problem).toBeUndefined();
      expect(second.tests.map((t) => t.title)).toEqual(['login works']);
    });

    it('re-reads the file when a later run overwrites it', async () => {
      writeFileSync(resultsPath, JSON.stringify(resultsPayload(['first run'])));
      const server = new MCPServer({ resultsPath });

      expect((await server.readResults()).tests.map((t) => t.title)).toEqual(['first run']);

      // A second test run rewrites the same path with different content.
      writeFileSync(
        resultsPath,
        JSON.stringify(resultsPayload(['second run', 'and another'], 'failed'))
      );

      const after = await server.readResults();
      expect(after.tests.map((t) => t.title)).toEqual(['second run', 'and another']);
      expect(after.tests.every((t) => t.status === 'failed')).toBe(true);
    });

    it('does not go stale when a run produces zero tests', async () => {
      writeFileSync(resultsPath, JSON.stringify(resultsPayload([])));
      const server = new MCPServer({ resultsPath });

      expect((await server.readResults()).tests).toEqual([]);

      writeFileSync(resultsPath, JSON.stringify(resultsPayload(['now there is one'])));

      // An empty first read must not be mistaken for "nothing loaded yet".
      expect((await server.readResults()).tests.map((t) => t.title)).toEqual(['now there is one']);
    });
  });

  describe('error reporting', () => {
    it('explains a missing results file instead of returning silence', async () => {
      const server = new MCPServer({ resultsPath: join(dir, 'absent.json') });
      const { tests, problem } = await server.readResults();

      expect(tests).toEqual([]);
      expect(problem).toContain('No test results found');
      // Points the user at the setting that produces the file.
      expect(problem).toContain('output: { json: true }');
    });

    it('explains malformed JSON instead of throwing', async () => {
      writeFileSync(resultsPath, '{ this is not json');
      const server = new MCPServer({ resultsPath });

      const { tests, problem } = await server.readResults();
      expect(tests).toEqual([]);
      expect(problem).toContain('Could not read test results');
    });

    it('accepts a bare array of tests', async () => {
      writeFileSync(resultsPath, JSON.stringify(resultsPayload(['bare']).tests));
      const server = new MCPServer({ resultsPath });

      const { tests, problem } = await server.readResults();
      expect(problem).toBeUndefined();
      expect(tests.map((t) => t.title)).toEqual(['bare']);
    });
  });

  describe('results path', () => {
    it('accepts a directory and looks for results.json inside it', async () => {
      writeFileSync(resultsPath, JSON.stringify(resultsPayload(['from dir'])));

      // Docs have long described this setting as a directory.
      const server = new MCPServer({ resultsPath: dir });

      const { tests, problem } = await server.readResults();
      expect(problem).toBeUndefined();
      expect(tests.map((t) => t.title)).toEqual(['from dir']);
    });
  });

  describe('version', () => {
    it('reports the package version, not a hard-coded one', () => {
      expect(VERSION).toMatch(/^\d+\.\d+\.\d+/);
      expect(VERSION).not.toBe('0.0.0');
      expect(VERSION).not.toBe('0.1.0');
    });
  });
});
