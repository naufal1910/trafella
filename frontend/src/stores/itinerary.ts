import { defineStore } from 'pinia'
import { ref } from 'vue'

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
    
    try {
      const response = await fetch('http://localhost:8000/api/v1/generate-itinerary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

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
