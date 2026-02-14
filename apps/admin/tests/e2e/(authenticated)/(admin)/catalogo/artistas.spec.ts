/**
 * E2E Tests for Catalogo Artistas Page
 *
 * Tests for three critical fixes:
 * 1. Toggle switch infinite render loop (getSnapshot warning)
 * 2. Filter state synchronization (URL params, UI, data)
 * 3. Pagination URL synchronization
 */

import { test, expect } from '@playwright/test'

// Configure test environment
const BASE_URL = process.env.BASE_URL || 'http://localhost:3001'
const CATALOG_URL = `${BASE_URL}/catalogo`

test.describe('Catalogo Artistas - Bug Fixes Validation', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the Better Auth session endpoint to maintain auth state
    await page.route('/api/auth/get-session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: 'test-user-id',
            email: 'test@frijolmagico.cl',
            name: 'Test User',
            emailVerified: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          session: {
            id: 'test-session-id',
            userId: 'test-user-id',
            expiresAt: new Date(Date.now() + 86400 * 1000).toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        })
      })
    })

    // Navigate to the catalog page
    await page.goto(CATALOG_URL)

    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle')
  })

  test('should toggle "Destacado" switch without infinite render loop', async ({
    page
  }) => {
    // Listen for console errors
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    // Wait for table to load with data from local.db
    const table = page.locator('table')
    await expect(table).toBeVisible({ timeout: 10000 })

    // Find the first artist row
    const firstRow = page.locator('tbody tr').first()
    await expect(firstRow).toBeVisible({ timeout: 5000 })

    // Find the "Destacado" switch in the first row (5th column based on table structure)
    const destacadoCell = firstRow.locator('td').nth(4)
    const destacadoSwitch = destacadoCell.locator('[role="switch"]')
    await expect(destacadoSwitch).toBeVisible()

    // Get initial state using data-checked attribute
    const initialChecked = await destacadoSwitch.getAttribute('data-checked')

    // Click the switch
    await destacadoSwitch.click()

    // Wait a moment for potential re-renders
    await page.waitForTimeout(500)

    // Verify switch state changed
    const newChecked = await destacadoSwitch.getAttribute('data-checked')
    expect(newChecked).not.toBe(initialChecked)

    // Verify NO console errors related to getSnapshot or infinite loop
    const hasGetSnapshotError = consoleErrors.some(
      (error) =>
        error.includes('getSnapshot') ||
        error.includes('infinite loop') ||
        error.includes('Maximum update depth')
    )
    expect(hasGetSnapshotError).toBe(false)
  })

  test('should sync filter state with URL parameters', async ({ page }) => {
    // Wait for filters to be visible
    const activoTrigger = page.locator('[data-slot="select-trigger"]').nth(0)
    await expect(activoTrigger).toBeVisible({ timeout: 10000 })

    // Open the Activo filter dropdown
    await activoTrigger.click()

    // Select "Activos" option
    const activosOption = page.getByRole('option').filter({ hasText: 'Activos' })
    await expect(activosOption).toBeVisible()
    await activosOption.click()

    // Wait for URL to update (debounce delay + navigation)
    await page.waitForTimeout(500)

    // Verify URL contains filter parameter
    await expect(page).toHaveURL(/activo=true/)

    // Click "Limpiar" button (only appears when filters are active)
    const clearButton = page.getByRole('button', { name: 'Limpiar' })
    await expect(clearButton).toBeVisible()
    await clearButton.click()

    // Wait for URL to update
    await page.waitForTimeout(500)

    // Verify URL no longer contains filter parameter
    await expect(page).not.toHaveURL(/activo=/)
    await expect(page).not.toHaveURL(/destacado=/)
  })

  test('should update URL when pagination changes', async ({ page }) => {
    // Wait for table to load
    await page.waitForSelector('table', { timeout: 10000 })

    // Verify we start on page 1 (no page param in URL)
    const initialUrl = new URL(page.url())
    expect(initialUrl.searchParams.get('page')).toBeNull()

    // Find page 2 button using exact text match
    const page2Button = page.getByRole('button', { name: '2', exact: true })

    // Check if page 2 button exists (might not exist if there's only 1 page)
    if (!(await page2Button.isVisible().catch(() => false))) {
      test.skip()
      return
    }

    await page2Button.click()

    // Wait for navigation
    await page.waitForLoadState('networkidle')

    // Verify URL now includes page=2
    await expect(page).toHaveURL(/page=2/)

    // Click back to page 1
    const page1Button = page.getByRole('button', { name: '1', exact: true })
    await page1Button.click()

    await page.waitForLoadState('networkidle')

    // Verify URL no longer contains page param (page=1 is default)
    const finalUrl = new URL(page.url())
    expect(finalUrl.searchParams.get('page')).toBeNull()
  })

  test('should maintain filter state when navigating via pagination', async ({
    page
  }) => {
    // Wait for filters to appear
    const destacadoTrigger = page.locator('[data-slot="select-trigger"]').nth(1)
    await expect(destacadoTrigger).toBeVisible({ timeout: 10000 })

    // Apply Destacado filter first
    await destacadoTrigger.click()

    const destacadosOption = page.getByRole('option').filter({ hasText: 'Destacados' })
    await expect(destacadosOption).toBeVisible()
    await destacadosOption.click()

    // Wait for filter to apply
    await page.waitForTimeout(500)

    // Verify filter in URL
    await expect(page).toHaveURL(/destacado=true/)

    // Navigate to page 2
    const page2Button = page.getByRole('button', { name: '2', exact: true })
    if (await page2Button.isVisible().catch(() => false)) {
      await page2Button.click()
      await page.waitForLoadState('networkidle')

      // Verify both filter AND pagination in URL
      await expect(page).toHaveURL(/destacado=true/)
      await expect(page).toHaveURL(/page=2/)
    }
  })
})
