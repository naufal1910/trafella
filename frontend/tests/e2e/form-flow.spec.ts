import { test, expect } from '@playwright/test'

// Basic end-to-end test for form submission and result display.
// It stubs the backend API response so the test can run without the backend.

test('submits itinerary form and shows results', async ({ page }) => {
  // Mock the backend API call
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
  await expect(page.getByText('Itinerary for Paris (2 days)')).toBeVisible()
  await expect(page.getByText('Day 1 — Arrival and Louvre')).toBeVisible()
  await expect(page.getByText('Day 2 — Eiffel Tower and Montmartre')).toBeVisible()
})
