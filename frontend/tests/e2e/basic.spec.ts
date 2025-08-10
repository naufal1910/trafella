import { test, expect } from '@playwright/test'

test('loads home page', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Trafella/i)
  await expect(page.getByRole('button', { name: /Generate Itinerary/i })).toBeVisible()
})
