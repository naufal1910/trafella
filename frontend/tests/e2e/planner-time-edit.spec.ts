import { test, expect } from '@playwright/test'

// Happy path M3 manual time editing, behind feature flag
// Skips if planner or time-edit flags are disabled

test.describe('Planner Time Edit (M3)', () => {
  test.beforeEach(async ({ page }) => {
    // Use mock geocoder for determinism
    await page.addInitScript(() => {
      window.localStorage.setItem('VITE_GEOCODER_PROVIDER', 'mock')
    })

    await page.goto('/')

    const flags = await page.evaluate(() => ({
      planner: (import.meta as any).env?.VITE_PLANNER_ENABLED === 'true',
      timeEdit: (import.meta as any).env?.VITE_TIME_EDIT_ENABLED === 'true',
    }))

    test.skip(!flags.planner, 'Planner feature not enabled')
    test.skip(!flags.timeEdit, 'Time edit feature not enabled')

    // Generate a test itinerary if none exists
    const hasItinerary = await page.locator('[data-testid="itinerary-results"]').isVisible()
    if (!hasItinerary) {
      await page.fill('input[placeholder*="destination"]', 'Kuala Lumpur')
      await page.fill('input[type="number"]', '3')
      await page.click('button[type="submit"]')
      await page.waitForSelector('[data-testid="itinerary-results"]', { timeout: 10000 })
    }

    // Navigate to planner
    await page.click('text=Edit in Planner')
    await page.waitForURL('**/planner')
  })

  test('edits morning end time and reflows next activity', async ({ page }) => {
    // First list item (morning)
    const firstRow = page.locator('.rounded.border.bg-white').first()
    await expect(firstRow).toBeVisible()

    const morningEnd = firstRow.locator('[data-testid="time-end"]')
    await morningEnd.fill('11:30')
    await morningEnd.blur()

    // Second item should start at 11:30 and keep its duration (90m -> 13:00)
    const secondRow = page.locator('.rounded.border.bg-white').nth(1)
    const secondStart = secondRow.locator('[data-testid="time-start"]')
    const secondEnd = secondRow.locator('[data-testid="time-end"]')

    await expect(secondStart).toHaveValue('11:30')
    await expect(secondEnd).toHaveValue('13:00')
  })

  test('shortening afternoon pulls only evening earlier', async ({ page }) => {
    const secondRow = page.locator('.rounded.border.bg-white').nth(1)
    await expect(secondRow).toBeVisible()

    const afternoonEnd = secondRow.locator('[data-testid="time-end"]')
    await afternoonEnd.fill('12:00')
    await afternoonEnd.blur()

    // Evening should start at 12:00 and keep its duration
    const thirdRow = page.locator('.rounded.border.bg-white').nth(2)
    const eveningStart = thirdRow.locator('[data-testid="time-start"]')
    const eveningEnd = thirdRow.locator('[data-testid="time-end"]')

    await expect(eveningStart).toHaveValue('12:00')
    await expect(eveningEnd).toHaveValue('14:00')
  })
})
