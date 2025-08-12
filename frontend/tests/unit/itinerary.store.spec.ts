import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useItineraryStore, type ItineraryResponse } from '@/stores/itinerary'

function sampleItinerary(): ItineraryResponse {
  return {
    destination: 'Tokyo',
    duration_days: 1,
    itinerary: {
      days: [
        {
          day_number: 1,
          date: '2025-01-01',
          title: 'Day 1',
          summary: 'Intro day',
          activities: {
            morning: 'Visit Senso-ji Temple',
            afternoon: 'Explore Akihabara',
            evening: 'Shibuya Crossing & dinner',
          },
          tips: '',
        },
      ],
    },
  }
}

describe('useItineraryStore (Planner M1)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('normalizes a day to items[] via getDayItems', () => {
    const store = useItineraryStore()
    const data = sampleItinerary()
    // seed store state
    store.itinerary = JSON.parse(JSON.stringify(data)) as any
    store.originalItinerary = JSON.parse(JSON.stringify(data)) as any

    const items = store.getDayItems(1)
    expect(items).toHaveLength(3)
    expect(items.map((i) => i.id)).toEqual(['morning', 'afternoon', 'evening'])
    expect(items.map((i) => i.label)).toEqual([
      'Visit Senso-ji Temple',
      'Explore Akihabara',
      'Shibuya Crossing & dinner',
    ])
  })

  it('reorderActivity updates activities and persists to localStorage', () => {
    const store = useItineraryStore()
    const data = sampleItinerary()
    store.itinerary = JSON.parse(JSON.stringify(data)) as any
    store.originalItinerary = JSON.parse(JSON.stringify(data)) as any

    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')

    // move index 0 (morning) to index 2 (end)
    store.reorderActivity(1, 0, 2)

    const day = store.itinerary!.itinerary.days[0]
    expect(day.activities).toEqual({
      morning: 'Explore Akihabara',
      afternoon: 'Shibuya Crossing & dinner',
      evening: 'Visit Senso-ji Temple',
    })

    // persisted
    expect(setItemSpy).toHaveBeenCalled()
  })
})
