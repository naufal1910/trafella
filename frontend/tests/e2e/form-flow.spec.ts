import { test, expect } from '@playwright/test'

// Allow more time for live API (LLM) responses when mocks are disabled
test.setTimeout(120_000)

// Basic end-to-end test for form submission and result display.
// It stubs the backend API response so the test can run without the backend.

test('submits itinerary form and shows results', async ({ page }) => {
  // Conditionally mock the backend API call (default: mock; set E2E_USE_MOCKS='false' to hit real API)
  const useMocks = ((globalThis as any).process?.env?.E2E_USE_MOCKS ?? 'true') !== 'false'
  if (useMocks) {
    await page.route('**/api/v1/generate-itinerary', async route => {
      const json = {
        destination: 'Paris',
        duration_days: 2,
        itinerary: {
          days: [
            {
              day_number: 1,
              date: '2025-08-10',
              title: 'Arrival and Louvre',
              summary: 'Arrive and explore the Louvre Museum',
              activities: {
                morning: 'Arrive and check in',
                afternoon: 'Visit the Louvre and Tuileries',
                evening: 'Seine walk and cafe',
              },
              tips: 'Buy tickets online to skip the line',
            },
            {
              day_number: 2,
              date: '2025-08-11',
              title: 'Eiffel Tower and Montmartre',
              summary: 'Iconic sites and hilltop views',
              activities: {
                morning: 'Eiffel Tower and Champ de Mars',
                afternoon: 'Sacre-Coeur and Montmartre',
                evening: 'Moulin Rouge area stroll',
              },
            },
          ],
        },
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(json),
      })
    })
  }

  // Navigate to app
  await page.goto('/')

  // Fill the form
  await page.getByPlaceholder('e.g., Paris').fill('Paris')

  // The date inputs have type="date" with no placeholder; select by label text
  await page.getByLabel('Start Date').fill('2025-08-10')
  await page.getByLabel('End Date').fill('2025-08-11')

  await page.getByPlaceholder('art, food, culture').fill('art, food')

  // Submit
  await page.getByRole('button', { name: 'Generate Itinerary' }).click()

  // Assert results appear
  if (useMocks) {
    await expect(page.getByText('Itinerary for Paris (2 days)')).toBeVisible()
    await expect(page.getByText('Day 1 — Arrival and Louvre')).toBeVisible()
    await expect(page.getByText('Day 2 — Eiffel Tower and Montmartre')).toBeVisible()
  } else {
    // Wait for live backend call to complete and render
    await page.waitForResponse(
      (resp) => resp.url().includes('/api/v1/generate-itinerary') && resp.ok(),
      { timeout: 60_000 }
    )
    // Be flexible on assertions for live content (titles vary). Verify header and day headings.
    await expect(page.getByText(/Itinerary for Paris/i)).toBeVisible({ timeout: 60_000 })
    const dayHeadings = page.getByRole('heading', { name: /Day \d+/i })
    const count = await dayHeadings.count()
    expect(count).toBeGreaterThanOrEqual(2)

    const day1Heading = page.getByRole('heading', { name: /Day 1/i })
    await expect(day1Heading).toBeVisible({ timeout: 60_000 })
    // Scope checks within the Day 1 card
    const day1Card = day1Heading.locator('xpath=..')
    await expect(day1Card.getByText(/\d{4}-\d{2}-\d{2}/)).toBeVisible({ timeout: 60_000 })
    await expect(day1Card.getByText('Morning:')).toBeVisible({ timeout: 60_000 })
    await expect(day1Card.getByText('Afternoon:')).toBeVisible({ timeout: 60_000 })
    await expect(day1Card.getByText('Evening:')).toBeVisible({ timeout: 60_000 })
  }
})
