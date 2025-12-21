import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ['../dist/index.js', {
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
        updateInterval: 100
      }
    }]
  ],

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
