import { test as teardown } from '@playwright/test'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { unlink } from 'fs/promises'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const authFile = join(__dirname, '../.auth/user.json')

/**
 * Auth Teardown for Playwright E2E Tests
 * 
 * Cleans up the auth state file after all tests complete.
 */

teardown('cleanup', async () => {
  try {
    await unlink(authFile)
  } catch {
    // File might not exist, that's fine
  }
})
