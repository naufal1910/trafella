import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useGeocoding } from '@/composables/useGeocoding'

// Mock fetch
global.fetch = vi.fn()

describe('useGeocoding', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Clear cache between tests
    const { clearCache } = useGeocoding()
    clearCache()
  })

  it('handles geocoding gracefully', async () => {
    // Mock fetch to fail for this test
    ;(global.fetch as any).mockRejectedValueOnce(new Error('Network error'))
    
    const { geocode } = useGeocoding()
    
    const result = await geocode('KLCC Tower', 0) // No debounce for test
    
    // Should return null when geocoding fails (component will handle fallback)
    expect(result).toBeNull()
  })

  it('uses nominatim provider by default', async () => {
    const { provider } = useGeocoding()
    expect(provider.value).toBe('nominatim')
  })

  it('handles nominatim API success', async () => {
    const mockResponse = [{
      lat: '3.1578',
      lon: '101.7123',
      display_name: 'Petronas Twin Towers, Kuala Lumpur',
      importance: 0.8
    }]
    
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    })

    const { geocode } = useGeocoding()
    const result = await geocode('KLCC Tower', 0) // No debounce for test
    
    expect(result).toEqual({
      lat: 3.1578,
      lng: 101.7123,
      display_name: 'Petronas Twin Towers, Kuala Lumpur',
      confidence: 0.8
    })
  })

  it('handles nominatim API failure gracefully', async () => {
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500
    })

    const { geocode } = useGeocoding()
    const result = await geocode('Invalid Location', 0)
    
    expect(result).toBeNull()
  })

  it('caches results to avoid duplicate requests', async () => {
    const mockResponse = [{
      lat: '3.1578',
      lon: '101.7123',
      display_name: 'Test Location'
    }]
    
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    })

    const { geocode } = useGeocoding()
    
    // First call should make API request
    const result1 = await geocode('Test Location', 0)
    expect(result1?.lat).toBe(3.1578)
    
    // Second call should use cache
    const result2 = await geocode('Test Location', 0)
    expect(result2?.lat).toBe(3.1578)
    
    // Should only have made one API call
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })

  it('returns null for empty query', async () => {
    const { geocode } = useGeocoding()
    
    const result = await geocode('', 0)
    expect(result).toBeNull()
    
    const result2 = await geocode('   ', 0)
    expect(result2).toBeNull()
  })
})
