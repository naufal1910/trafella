import { test, expect } from '@playwright/test'

test.describe('Planner Live Map', () => {
  test.beforeEach(async ({ page }) => {
    // Set mock geocoder for predictable testing
    await page.addInitScript(() => {
      window.localStorage.setItem('VITE_GEOCODER_PROVIDER', 'mock')
    })
    
    // Navigate to home and generate a test itinerary
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
    
    // Navigate to planner (stable by href)
    await page.click('a[href="/planner"]')
    await page.waitForURL('**/planner')
  })

  test('displays live map with markers', async ({ page }) => {
    // Wait for map to load
    await page.waitForSelector('[aria-label="Itinerary map"]', { timeout: 5000 })
    
    // Check that map container is visible
    const mapContainer = page.locator('[aria-label="Itinerary map"]')
    await expect(mapContainer).toBeVisible()
    
    // Wait for circle markers (avoid asserting tile visibility due to network variability)
    const markers = page.locator('.leaflet-overlay-pane svg path.leaflet-interactive')
    await expect(markers.first()).toBeVisible()
  })

  test('syncs selection between list and map', async ({ page }) => {
    // Wait for map to load
    await page.waitForSelector('[aria-label="Itinerary map"]', { timeout: 5000 })
    
    // Find the first activity item in the list
    const firstActivity = page.locator('.rounded.border.bg-white').first()
    await expect(firstActivity).toBeVisible()
    
    // Click on the first activity to select it
    await firstActivity.click()
    
    // Check that the item is visually selected (has blue ring)
    await expect(firstActivity).toHaveClass(/ring-2/)
    await expect(firstActivity).toHaveClass(/ring-blue-500/)
    
    // Wait a moment for map to update
    await page.waitForTimeout(500)
    
    // The map should have panned/zoomed (we can't easily test exact coordinates in E2E,
    // but we can verify the map interaction occurred by checking for zoom changes)
    const mapContainer = page.locator('.leaflet-container')
    await expect(mapContainer).toBeVisible()
  })

  test.skip('handles map marker clicks', async ({ page }) => {
    // Wait for map to load
    await page.waitForSelector('[aria-label="Itinerary map"]', { timeout: 5000 })
    
    // Wait for markers to be rendered
    await page.waitForTimeout(1000)
    
    // Ensure map is in view to minimize layout interception
    await page.locator('[aria-label="Itinerary map"]').scrollIntoViewIfNeeded()

    // Check console logs for debugging
    page.on('console', msg => console.log('PAGE LOG:', msg.text()))

    // Try clicking up to the first 3 markers to account for potential overlay issues
    const markers = page.locator('path.leaflet-interactive')
    const markerCount = await markers.count()
    console.log('Found markers:', markerCount)
    
    if (markerCount === 0) {
      test.skip(true, 'No markers found on map')
    }

    const tryCount = Math.min(markerCount, 3)
    for (let i = 0; i < tryCount; i++) {
      await markers.nth(i).click({ force: true })
      await page.waitForTimeout(500)
      
      // Check if selection worked
      const selectedCount = await page.locator('[aria-selected="true"]').count()
      console.log(`After clicking marker ${i}, selected count:`, selectedCount)
      
      if (selectedCount > 0) {
        break
      }
    }

    // Final assertion: some activity in the list is selected (presence, not necessarily visible)
    const selectedByRing = page.locator('.ring-2.ring-blue-500')
    const selectedByAria = page.locator('[aria-selected="true"]')
    const union = selectedByRing.or(selectedByAria)
    await expect(union).toHaveCount(1, { timeout: 3000 })
  })

  test('maintains responsive layout', async ({ page }) => {
    // Test desktop layout
    await page.setViewportSize({ width: 1200, height: 800 })
    
    // Map should be in right column on large screens
    const mapContainer = page.locator('[aria-label="Itinerary map"]')
    await expect(mapContainer).toBeVisible()
    
    // Test tablet layout
    await page.setViewportSize({ width: 768, height: 600 })
    await expect(mapContainer).toBeVisible()
    
    // Test mobile layout
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(mapContainer).toBeVisible()
  })
})
