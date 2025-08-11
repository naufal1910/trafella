import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as Sentry from '@sentry/vue'

export interface ItineraryRequest {
  destination: string
  start_date: string
  end_date: string
  interests: string[]
  budget?: string
  party_size: number
}

export interface DayPlan {
  day_number: number
  date: string
  title: string
  summary: string
  activities: {
    morning: string
    afternoon: string
    evening: string
  }
  tips?: string
}

export interface ItineraryResponse {
  destination: string
  duration_days: number
  itinerary: {
    days: DayPlan[]
  }
}

export const useItineraryStore = defineStore('itinerary', () => {
  const itinerary = ref<ItineraryResponse | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function generateItinerary(request: ItineraryRequest) {
    loading.value = true
    error.value = null
    const baseUrl = (import.meta as any).env?.VITE_API_BASE_URL || window.location.origin
    
    try {
      const response = await (typeof (Sentry as any).startSpan === 'function'
        ? (Sentry as any).startSpan(
            {
              name: 'generateItinerary',
              op: 'http.client',
              attributes: {
                'http.method': 'POST',
                'http.url': '/api/v1/generate-itinerary',
              },
            },
            async () => {
              const res = await fetch(`${baseUrl}/api/v1/generate-itinerary`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
              })
              // Set status on the active span if available
              try {
                // @ts-ignore - Sentry types may not expose getActiveSpan in all builds
                const span = Sentry.getActiveSpan && Sentry.getActiveSpan()
                if (span) {
                  // @ts-ignore
                  span.setAttribute && span.setAttribute('http.status_code', res.status)
                }
              } catch {}
              return res
            }
          )
        : fetch(`${baseUrl}/api/v1/generate-itinerary`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
          }))

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      itinerary.value = data
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred'
    } finally {
      loading.value = false
    }
  }

  function clearItinerary() {
    itinerary.value = null
    error.value = null
  }

  return {
    itinerary,
    loading,
    error,
    generateItinerary,
    clearItinerary,
  }
})
