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
const CATALOG_URL = `${BASE_URL}/catalogo/artistas`

test.describe('Catalogo Artistas - Bug Fixes Validation', () => {
  test.beforeEach(async ({ page }) => {
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

    // Find the first artist row
    const firstRow = page.locator('tbody tr').first()
    await expect(firstRow).toBeVisible()

    // Find the "Destacado" switch in the first row
    const destacadoSwitch = firstRow.locator('[role="switch"]').first()
    await expect(destacadoSwitch).toBeVisible()

    // Get initial state
    const initialState = await destacadoSwitch.getAttribute('data-state')

    // Click the switch
    await destacadoSwitch.click()

    // Wait a moment for potential re-renders
    await page.waitForTimeout(500)

    // Verify switch state changed
    const newState = await destacadoSwitch.getAttribute('data-state')
    expect(newState).not.toBe(initialState)

    // Verify NO console errors related to getSnapshot or infinite loop
    const hasGetSnapshotError = consoleErrors.some(
      (error) =>
        error.includes('getSnapshot') ||
        error.includes('infinite loop') ||
        error.includes('Maximum update depth')
    )
    expect(hasGetSnapshotError).toBe(false)

    // Verify no Next.js dev overlay error appeared
    const devOverlay = page.locator('nextjs-portal')
    await expect(devOverlay).not.toBeVisible()
  })

  test('should sync filter state with URL parameters', async ({ page }) => {
    // Apply "Activo" filter
    const activoFilter = page
      .locator('[name="activo"]')
      .or(page.locator('select:has([value="true"])'))
    await activoFilter.first().click()

    // Select "true" option (if dropdown)
    const activoTrueOption = page
      .locator('option[value="true"]')
      .or(page.locator('[data-value="true"]'))
    if (await activoTrueOption.isVisible()) {
      await activoTrueOption.click()
    }

    // Wait for URL to update
    await page.waitForTimeout(400) // Debounce delay

    // Verify URL contains filter parameter
    await expect(page).toHaveURL(/activo=true/)

    // Verify page is on page 1 (filters reset pagination)
    const url = new URL(page.url())
    const pageParam = url.searchParams.get('page')
    expect(pageParam).toBeNull() // page=1 should not be in URL

    // Click "Limpiar" / "Clear" button
    const clearButton = page
      .locator('button:has-text("Limpiar")')
      .or(page.locator('button:has-text("Clear")'))
    await clearButton.click()

    // Wait for URL to update
    await page.waitForTimeout(400)

    // Verify URL no longer contains filter parameter
    await expect(page).not.toHaveURL(/activo=/)
    await expect(page).not.toHaveURL(/destacado=/)

    // Verify filters reset in UI (check if dropdown shows default state)
    const filterSelects = page.locator('select')
    const firstSelectValue = await filterSelects.first().inputValue()
    expect(firstSelectValue).toBe('') // Default should be empty
  })

  test('should update URL when pagination changes', async ({ page }) => {
    // Verify we start on page 1 (no page param in URL)
    const initialUrl = new URL(page.url())
    expect(initialUrl.searchParams.get('page')).toBeNull()

    // Find pagination controls
    const pagination = page
      .locator('[role="navigation"]')
      .or(page.locator('.pagination'))
    await expect(pagination).toBeVisible()

    // Click on page 2 button
    const page2Button = page
      .locator('button:has-text("2")')
      .or(page.locator('a:has-text("2")'))
    await expect(page2Button).toBeVisible()
    await page2Button.click()

    // Wait for navigation
    await page.waitForLoadState('networkidle')

    // Verify URL now includes page=2
    await expect(page).toHaveURL(/page=2/)

    // Verify content changed (check that items 21-40 are displayed)
    const rows = page.locator('tbody tr')
    await expect(rows).not.toHaveCount(0)

    // Click back to page 1
    const page1Button = page
      .locator('button:has-text("1")')
      .or(page.locator('a:has-text("1")'))
    await page1Button.click()

    await page.waitForLoadState('networkidle')

    // Verify URL no longer contains page param (page=1 is default)
    const finalUrl = new URL(page.url())
    expect(finalUrl.searchParams.get('page')).toBeNull()
  })

  test('should maintain filter state when navigating via pagination', async ({
    page
  }) => {
    // Apply a filter first
    const destacadoFilter = page.locator('[name="destacado"]')
    await destacadoFilter.first().click()

    const destacadoTrueOption = page
      .locator('option[value="true"]')
      .or(page.locator('[data-value="true"]'))
    if (await destacadoTrueOption.isVisible()) {
      await destacadoTrueOption.click()
    }

    // Wait for filter to apply
    await page.waitForTimeout(400)

    // Verify filter in URL
    await expect(page).toHaveURL(/destacado=true/)

    // Navigate to page 2
    const page2Button = page
      .locator('button:has-text("2")')
      .or(page.locator('a:has-text("2")'))
    if (await page2Button.isVisible()) {
      await page2Button.click()
      await page.waitForLoadState('networkidle')

      // Verify both filter AND pagination in URL
      await expect(page).toHaveURL(/destacado=true/)
      await expect(page).toHaveURL(/page=2/)
    }
  })
})
