import { test, expect } from '@playwright/test'

// E2E: Manual Time Editing (M3)
// Skips automatically if planner or time-edit features are disabled via Vite flags

test.describe('Planner Manual Time Editing (M3)', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure predictable geocoding behavior in case map/geocoding is invoked
    await page.addInitScript(() => {
      window.localStorage.setItem('VITE_GEOCODER_PROVIDER', 'mock')
    })

    await page.goto('/')

    // Skip if planner link is not present (planner flag off)
    const plannerLinkCount = await page.locator('a[href="/planner"]').count()
    test.skip(plannerLinkCount === 0, 'Planner feature not enabled')

    // Ensure a test itinerary exists (seed localStorage if needed)
    const hasItinerary = await page.locator('[data-testid="itinerary-results"]').isVisible()
    if (!hasItinerary) {
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
      await page.waitForSelector('[data-testid="itinerary-results"]', { timeout: 10000 })
    }

    // Navigate to Planner
    await page.click('a[href="/planner"]')
    await page.waitForURL('**/planner')
    // Skip if time input not present (time-edit flag off)
    const startInputVisible = await page.locator('[data-testid="start-time-1-morning"]').first().isVisible().catch(() => false)
    test.skip(!startInputVisible, 'Time Edit feature not enabled')
  })

  test('shows time inputs and validates invalid times', async ({ page }) => {
    // Try editing Day 1 Morning start to an invalid time (before 06:00)
    const startInput = page.locator('[data-testid="start-time-1-morning"]')
    await expect(startInput).toBeVisible()
    await startInput.fill('05:00')

    // Expect aggregated error to appear for day 1
    const errorsBox = page.locator('[data-testid="day-time-errors-1"]')
    await expect(errorsBox).toBeVisible()
    await expect(errorsBox).toContainText('starts before 6:00 AM')

    // Fix time to a valid value and expect errors to disappear
    await startInput.fill('09:00')
    await expect(errorsBox).toHaveCount(0)
  })

  test('reflows subsequent activity times when extending an activity', async ({ page }) => {
    // Extend Day 1 Morning end time and verify Afternoon start shifts to be contiguous
    const endMorning = page.locator('[data-testid="end-time-1-morning"]')
    const startAfternoon = page.locator('[data-testid="start-time-1-afternoon"]')

    await expect(endMorning).toBeVisible()
    await expect(startAfternoon).toBeVisible()

    // Set morning end to 12:00
    await endMorning.fill('12:00')

    // Afternoon should reflow to start at 12:00 (contiguous)
    await expect(startAfternoon).toHaveValue('12:00')
  })
})
