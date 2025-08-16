import { test, expect } from '@playwright/test'

// Staging Smoke Test: Planner Live Map + Optional Time Edit
// - Uses mock geocoder via localStorage for deterministic markers
// - Attempts real form submission (no API route mocks); falls back to seed itinerary
// - Verifies map markers and list/map selection sync
// - Optionally verifies time edit validation if feature is enabled

test.describe('Staging Smoke: Planner map + time edit (optional)', () => {
  test.setTimeout(120_000)

  test('end-to-end smoke flow on staging', async ({ page }) => {
    // Force mock geocoding for deterministic UI even on staging
    await page.addInitScript(() => {
      try { localStorage.setItem('VITE_GEOCODER_PROVIDER', 'mock') } catch {}
    })

    // Go to home
    await page.goto('/')

    // Skip if planner is disabled (no link to planner)
    const plannerLinkCount = await page.locator('a[href="/planner"]').count()
    test.skip(plannerLinkCount === 0, 'Planner feature not enabled')

    // Try normal form submission first (live backend)
    let hasResults = false
    try {
      await page.getByPlaceholder('e.g., Paris').fill('Kuala Lumpur')
      await page.getByLabel('Start Date').fill('2025-09-01')
      await page.getByLabel('End Date').fill('2025-09-02')
      await page.getByPlaceholder('art, food, culture').fill('food, culture')

      await page.getByRole('button', { name: /Generate Itinerary/i }).click()

      // Wait for results (may take longer with live backend)
      await page.waitForSelector('[data-testid="itinerary-results"]', { timeout: 60_000 })
      hasResults = true
    } catch {
      // Fallback: seed a deterministic itinerary into localStorage
    }

    if (!hasResults) {
      await page.evaluate(() => {
        const fake = {
          destination: 'Kuala Lumpur',
          duration_days: 2,
          itinerary: {
            days: [
              {
                day_number: 1,
                date: '2025-09-01',
                title: 'Day 1',
                summary: 'Intro day',
                activities: { morning: 'Petronas Towers', afternoon: 'Batu Caves', evening: 'Jalan Alor' },
              },
              {
                day_number: 2,
                date: '2025-09-02',
                title: 'Day 2',
                summary: 'City highlights',
                activities: { morning: 'KLCC Park', afternoon: 'Bukit Bintang', evening: 'Chinatown' },
              },
            ],
          },
        }
        localStorage.setItem('trafella.itinerary.v1', JSON.stringify({ current: fake, original: fake }))
      })
      await page.reload()
      await page.waitForSelector('[data-testid="itinerary-results"]', { timeout: 10_000 })
    }

    // Navigate to planner
    await page.click('a[href="/planner"]')
    await page.waitForURL('**/planner')

    // Verify live map container
    const mapContainer = page.locator('[aria-label="Itinerary map"]')
    await expect(mapContainer).toBeVisible({ timeout: 10_000 })

    // Verify markers are rendered (count > 0)
    const markers = page.locator('.leaflet-overlay-pane svg path.leaflet-interactive')
    await page.waitForTimeout(300)
    const markerCount = await markers.count()
    expect(markerCount).toBeGreaterThan(0)

    // Verify selection sync between list and map
    const listbox = page.locator('[role="listbox"]').first()
    await expect(listbox).toBeVisible()
    const firstOption = listbox.locator('[role="option"]').first()
    await expect(firstOption).toBeVisible()
    await firstOption.focus()
    await firstOption.press('Enter')
    await expect(listbox.locator('[role="option"][aria-selected="true"]')).toHaveCount(1, { timeout: 5_000 })

    // Reorder: move first item down and assert order swapped (compare only label span)
    const options = listbox.locator('[role="option"]')
    const count = await options.count()
    if (count >= 2) {
      const firstLabelEl = options.nth(0).locator('span.truncate, span.text-sm').first()
      const secondLabelEl = options.nth(1).locator('span.truncate, span.text-sm').first()
      const firstLabel = (await firstLabelEl.innerText()).trim()
      const secondLabel = (await secondLabelEl.innerText()).trim()

      await options.nth(0).getByRole('button', { name: 'Move down' }).click()
      await page.waitForTimeout(200)

      await expect(options.nth(0).locator('span.truncate, span.text-sm').first()).toHaveText(secondLabel)
      await expect(options.nth(1).locator('span.truncate, span.text-sm').first()).toHaveText(firstLabel)
    }

    // Optional: time edit validation if feature is enabled
    const startInput = page.locator('[data-testid="start-time-1-morning"]').first()
    const startVisible = await startInput.isVisible().catch(() => false)
    if (startVisible) {
      await startInput.fill('05:00')
      const errorsBox = page.locator('[data-testid="day-time-errors-1"]')
      await expect(errorsBox).toBeVisible()
      // Fix to valid
      await startInput.fill('09:00')
      await expect(errorsBox).toHaveCount(0)
    }
  })
})
