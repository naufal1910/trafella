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

  function daysDiff(start: string, end: string) {
    try {
      const s = new Date(start)
      const e = new Date(end)
      const ms = e.getTime() - s.getTime()
      const d = Math.round(ms / (1000 * 60 * 60 * 24)) + 1
      return isFinite(d) && d > 0 ? d : 1
    } catch {
      return 1
    }
  }

  function normalizeResponse(data: any, request: ItineraryRequest): ItineraryResponse {
    // Accept multiple shapes from the backend and normalize to { itinerary: { days: [] } }
    let days: DayPlan[] = []
    if (Array.isArray(data?.itinerary?.days)) {
      days = data.itinerary.days
    } else if (Array.isArray(data?.itinerary)) {
      days = data.itinerary
    } else if (Array.isArray(data?.days)) {
      days = data.days
    } else if (Array.isArray(data?.itinerary?.itinerary?.days)) {
      days = data.itinerary.itinerary.days
    }

    const destination = data?.destination ?? request.destination
    const duration_days = Number(data?.duration_days) || days.length || daysDiff(request.start_date, request.end_date)

    return {
      destination,
      duration_days,
      itinerary: { days },
    }
  }

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
      itinerary.value = normalizeResponse(data, request)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred'
    } finally {
      loading.value = false
    }
  }

  function updateDay(dayNumber: number, patch: Partial<DayPlan>) {
    if (!itinerary.value) return
    const current = itinerary.value
    const updatedDays = current.itinerary.days.map((d) => {
      if (d.day_number !== dayNumber) return d
      const nextActivities = {
        ...d.activities,
        ...(patch.activities ?? {}),
      }
      return {
        ...d,
        ...patch,
        activities: nextActivities,
      }
    })
    itinerary.value = {
      ...current,
      itinerary: {
        ...current.itinerary,
        days: updatedDays,
      },
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
    updateDay,
    clearItinerary,
  }
})
