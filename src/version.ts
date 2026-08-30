import { readFileSync } from 'fs';
import { dirname, join } from 'path';

/**
 * Package version, read from package.json at runtime.
 *
 * Kept in one place so the MCP handshake cannot drift from the published
 * package version (it used to report a hard-coded '0.1.0').
 *
 * Resolution is deliberately defensive because this module ships in both the
 * ESM and CJS bundles: it starts from whichever module-location primitive the
 * running format provides, then walks up to fair-playwright's own package.json.
 * That works from `src/` (tsx/vitest) as well as `dist/`.
 */
function candidateDirs(): string[] {
  const dirs: string[] = [];

  // CJS bundle.
  if (typeof __dirname !== 'undefined') {
    dirs.push(__dirname);
  }

  // ESM bundle. tsup rewrites import.meta.url in the CJS output, so guard it.
  try {
    const url = import.meta?.url;
    if (typeof url === 'string' && url.startsWith('file:')) {
      dirs.push(dirname(new URL(url).pathname));
    }
  } catch {
    // Not an ESM context.
  }

  return dirs;
}

function readPackageVersion(): string {
  for (const start of candidateDirs()) {
    let dir = start;

    for (let depth = 0; depth < 5; depth++) {
      try {
        const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf-8'));
        if (pkg.name === 'fair-playwright' && typeof pkg.version === 'string') {
          return pkg.version;
        }
      } catch {
        // No readable package.json at this level - keep walking up.
      }

      const parent = dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
  }

  return '0.0.0';
}

export const VERSION = readPackageVersion();
