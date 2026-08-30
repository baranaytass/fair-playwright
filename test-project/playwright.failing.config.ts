import base from './playwright.config.js';

/**
 * Runs only the deliberately failing demo specs, which the default config
 * ignores. Useful for eyeballing the reporter's failure output.
 */
export default {
  ...base,
  testIgnore: undefined,
  testMatch: '**/*.failing.spec.ts',
  retries: 0,
};
