import { defineConfig, devices } from '@playwright/test'
import { resolve } from 'path'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: './tests/e2e/_reports/playwright-report' }]
  ],
  outputDir: './tests/e2e/_reports/test-results',

  // Global setup that runs before all tests
  globalSetup: resolve(__dirname, 'tests/e2e/global.setup.ts'),

  projects: [
    // Authenticated tests use the saved auth state from global setup
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: resolve(__dirname, 'tests/e2e/.auth/user.json')
      }
    }
  ],

  webServer: {
    command: 'bun run dev',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    env: {
      // Use local SQLite database with absolute path
      TURSO_DATABASE_URL: `file:${resolve(__dirname, '../../packages/database/local.db')}`,
      TURSO_AUTH_TOKEN: ''
    }
  }
})
