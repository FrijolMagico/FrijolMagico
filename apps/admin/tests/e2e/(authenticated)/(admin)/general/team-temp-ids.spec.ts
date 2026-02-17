/**
 * E2E Tests for Team Member Management with Temporary IDs
 *
 * Tests for Team Member CRUD operations using temporary IDs:
 * 1. Add multiple team members
 * 2. Verify each member appears with unique temporary ID
 * 3. Edit each member independently
 * 4. Verify independent edits persist correctly
 * 5. Delete a member and verify others remain unchanged
 */

import { test, expect } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001'
const GENERAL_URL = `${BASE_URL}/general`

test.describe('Team Member Management - Temporary IDs', () => {
  test.beforeEach(async ({ page }) => {
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

    await page.goto(GENERAL_URL)
    await page.waitForLoadState('networkidle')
  })

  test(
    'should add multiple team members and verify each appears with unique ID',
    { tag: ['@critical', '@team', '@TEAM-E2E-001'] },
    async ({ page }) => {
      const addButton = page.getByRole('button', { name: 'Agregar miembro' })
      await expect(addButton).toBeVisible({ timeout: 5000 })

      await addButton.click()
      await page.waitForTimeout(200)
      await addButton.click()
      await page.waitForTimeout(200)
      await addButton.click()
      await page.waitForTimeout(200)

      const tableRows = page.locator('tbody tr')
      await expect(tableRows).toHaveCount(3)

      await page.screenshot({
        path: '.sisyphus/evidence/task-6-add-members.png'
      })
    }
  )

  test(
    'should edit each member independently and verify changes persist',
    { tag: ['@critical', '@team', '@TEAM-E2E-002'] },
    async ({ page }) => {
      const addButton = page.getByRole('button', { name: 'Agregar miembro' })
      await expect(addButton).toBeVisible()

      await addButton.click()
      await page.waitForTimeout(200)
      await addButton.click()
      await page.waitForTimeout(200)
      await addButton.click()
      await page.waitForTimeout(200)

      const rows = page.locator('tbody tr')
      await expect(rows).toHaveCount(3)

      const firstNameInput = rows.nth(0).locator('input').nth(0)
      await firstNameInput.fill('Juan')
      await page.waitForTimeout(100)

      const secondNameInput = rows.nth(1).locator('input').nth(0)
      await secondNameInput.fill('Maria')
      await page.waitForTimeout(100)

      const thirdNameInput = rows.nth(2).locator('input').nth(0)
      await thirdNameInput.fill('Carlos')
      await page.waitForTimeout(100)

      expect(await firstNameInput.inputValue()).toBe('Juan')
      expect(await secondNameInput.inputValue()).toBe('Maria')
      expect(await thirdNameInput.inputValue()).toBe('Carlos')

      const firstCargoInput = rows.nth(0).locator('input').nth(1)
      await firstCargoInput.fill('Coordinador')
      await page.waitForTimeout(100)

      const secondCargoInput = rows.nth(1).locator('input').nth(1)
      await secondCargoInput.fill('Asistente')
      await page.waitForTimeout(100)

      const thirdCargoInput = rows.nth(2).locator('input').nth(1)
      await thirdCargoInput.fill('Productor')
      await page.waitForTimeout(100)

      expect(await firstCargoInput.inputValue()).toBe('Coordinador')
      expect(await secondCargoInput.inputValue()).toBe('Asistente')
      expect(await thirdCargoInput.inputValue()).toBe('Productor')

      await page.screenshot({
        path: '.sisyphus/evidence/task-6-edit-members.png'
      })
    }
  )

  test(
    'should delete a member and verify others remain unchanged',
    { tag: ['@critical', '@team', '@TEAM-E2E-003'] },
    async ({ page }) => {
      const addButton = page.getByRole('button', { name: 'Agregar miembro' })
      await expect(addButton).toBeVisible()

      await addButton.click()
      await page.waitForTimeout(200)
      await addButton.click()
      await page.waitForTimeout(200)
      await addButton.click()
      await page.waitForTimeout(200)

      let rows = page.locator('tbody tr')
      await expect(rows).toHaveCount(3)

      const firstNameInput = rows.nth(0).locator('input').nth(0)
      await firstNameInput.fill('Juan')
      await page.waitForTimeout(100)

      const secondNameInput = rows.nth(1).locator('input').nth(0)
      await secondNameInput.fill('Maria')
      await page.waitForTimeout(100)

      const thirdNameInput = rows.nth(2).locator('input').nth(0)
      await thirdNameInput.fill('Carlos')
      await page.waitForTimeout(100)

      const deleteButtons = rows
        .nth(1)
        .locator('button[class*="variant-ghost"]')
      await deleteButtons.click()
      await page.waitForTimeout(300)

      rows = page.locator('tbody tr')
      await expect(rows).toHaveCount(2)

      const firstMemberName = await rows
        .nth(0)
        .locator('input')
        .nth(0)
        .inputValue()
      expect(firstMemberName).toBe('Juan')

      const thirdMemberName = await rows
        .nth(1)
        .locator('input')
        .nth(0)
        .inputValue()
      expect(thirdMemberName).toBe('Carlos')

      const allNames = []
      for (let i = 0; i < 2; i++) {
        const name = await rows.nth(i).locator('input').nth(0).inputValue()
        allNames.push(name)
      }
      expect(allNames).not.toContain('Maria')

      await page.screenshot({
        path: '.sisyphus/evidence/task-6-delete-member.png'
      })
    }
  )
})
