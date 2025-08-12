import { ref, computed } from 'vue'

export interface GeocodingResult {
  lat: number
  lng: number
  display_name?: string
  confidence?: number
}

export interface GeocodingProvider {
  name: string
  geocode: (query: string) => Promise<GeocodingResult | null>
}

// Simple cache for geocoding results
const geocodeCache = new Map<string, GeocodingResult | null>()

// Nominatim (OpenStreetMap) provider - free, no API key required
const nominatimProvider: GeocodingProvider = {
  name: 'nominatim',
  async geocode(query: string): Promise<GeocodingResult | null> {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Trafella/1.0 (https://trafella.com)', // Required by Nominatim
        },
      })
      
      if (!response.ok) return null
      
      const data = await response.json()
      if (!data || data.length === 0) return null
      
      const result = data[0]
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        display_name: result.display_name,
        confidence: parseFloat(result.importance || '0'),
      }
    } catch (error) {
      console.warn('Geocoding failed:', error)
      return null
    }
  },
}

// Mock provider for testing/development
const mockProvider: GeocodingProvider = {
  name: 'mock',
  async geocode(query: string): Promise<GeocodingResult | null> {
    // Return deterministic mock coordinates based on query
    let hash = 0
    for (let i = 0; i < query.length; i++) {
      hash = (hash * 31 + query.charCodeAt(i)) >>> 0
    }
    
    // Generate coordinates around Kuala Lumpur area for demo
    const baseLat = 3.1390 // KL center
    const baseLng = 101.6869
    const lat = baseLat + ((hash % 200) - 100) * 0.001 // ±0.1 degree variation
    const lng = baseLng + (((hash >> 8) % 200) - 100) * 0.001
    
    return {
      lat,
      lng,
      display_name: `Mock location for "${query}"`,
      confidence: 0.8,
    }
  },
}

const providers: Record<string, GeocodingProvider> = {
  nominatim: nominatimProvider,
  mock: mockProvider,
}

export function useGeocoding() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  // Get provider from environment variable
  const providerName = computed(() => {
    const envProvider = (import.meta as any).env?.VITE_GEOCODER_PROVIDER || 'nominatim'
    return envProvider.toLowerCase()
  })
  
  const provider = computed(() => {
    return providers[providerName.value] || providers.nominatim
  })
  
  // Debounced geocoding with cache
  let debounceTimer: number | null = null
  
  async function geocode(query: string, debounceMs = 500): Promise<GeocodingResult | null> {
    if (!query.trim()) return null
    
    const cacheKey = `${providerName.value}:${query.toLowerCase().trim()}`
    
    // Check cache first
    if (geocodeCache.has(cacheKey)) {
      return geocodeCache.get(cacheKey) || null
    }
    
    return new Promise((resolve) => {
      // Clear existing timer
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
      
      // Set new debounced timer
      debounceTimer = window.setTimeout(async () => {
        isLoading.value = true
        error.value = null
        
        try {
          const result = await provider.value.geocode(query)
          
          // Cache the result (including null results to avoid repeated failed requests)
          geocodeCache.set(cacheKey, result)
          
          resolve(result)
        } catch (err) {
          error.value = err instanceof Error ? err.message : 'Geocoding failed'
          resolve(null)
        } finally {
          isLoading.value = false
        }
      }, debounceMs)
    })
  }
  
  function clearCache() {
    geocodeCache.clear()
  }
  
  return {
    geocode,
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    provider: computed(() => provider.value.name),
    clearCache,
  }
}
