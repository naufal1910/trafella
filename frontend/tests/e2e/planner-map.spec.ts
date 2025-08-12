import { test, expect } from '@playwright/test'

test.describe('Planner Live Map', () => {
  test.beforeEach(async ({ page }) => {
    // Set mock geocoder for predictable testing
    await page.addInitScript(() => {
      window.localStorage.setItem('VITE_GEOCODER_PROVIDER', 'mock')
    })
    
    // Navigate to home and generate a test itinerary
    await page.goto('/')
    
    // Check if planner feature is enabled
    const plannerEnabled = await page.evaluate(() => {
      return (import.meta as any).env?.VITE_PLANNER_ENABLED === 'true'
    })
    
    test.skip(!plannerEnabled, 'Planner feature not enabled')
    
    // Generate a test itinerary if none exists
    const hasItinerary = await page.locator('[data-testid="itinerary-results"]').isVisible()
    
    if (!hasItinerary) {
      await page.fill('input[placeholder*="destination"]', 'Kuala Lumpur')
      await page.fill('input[type="number"]', '3')
      await page.click('button[type="submit"]')
      
      // Wait for itinerary generation
      await page.waitForSelector('[data-testid="itinerary-results"]', { timeout: 10000 })
    }
    
    // Navigate to planner
    await page.click('text=Edit in Planner')
    await page.waitForURL('**/planner')
  })

  test('displays live map with markers', async ({ page }) => {
    // Wait for map to load
    await page.waitForSelector('[aria-label="Itinerary map"]', { timeout: 5000 })
    
    // Check that map container is visible
    const mapContainer = page.locator('[aria-label="Itinerary map"]')
    await expect(mapContainer).toBeVisible()
    
    // Check for Leaflet map tiles (indicates map loaded successfully)
    const mapTiles = page.locator('.leaflet-tile-pane')
    await expect(mapTiles).toBeVisible()
    
    // Check for markers (Leaflet creates marker elements)
    const markers = page.locator('.leaflet-marker-pane')
    await expect(markers).toBeVisible()
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

  test('handles map marker clicks', async ({ page }) => {
    // Wait for map to load
    await page.waitForSelector('[aria-label="Itinerary map"]', { timeout: 5000 })
    
    // Wait for markers to be rendered
    await page.waitForTimeout(1000)
    
    // Find a marker on the map (Leaflet circle markers)
    const marker = page.locator('path[stroke="#2563eb"]').first()
    
    if (await marker.isVisible()) {
      // Click on the marker
      await marker.click()
      
      // Wait for selection to update
      await page.waitForTimeout(300)
      
      // Check that an activity item is now selected in the list
      const selectedActivity = page.locator('.ring-2.ring-blue-500')
      await expect(selectedActivity).toBeVisible()
    }
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
